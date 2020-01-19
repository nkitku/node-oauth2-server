import * as url from 'url';
import { AuthenticateHandler } from '.';
import {
  AccessDeniedError,
  InvalidArgumentError,
  InvalidClientError,
  InvalidRequestError,
  InvalidScopeError,
  OAuthError,
  ServerError,
  UnauthorizedClientError,
  UnsupportedResponseTypeError,
} from '../errors';
import { Request } from '../request';
import { Response } from '../response';
import { Client, User, Model } from '../interfaces';
import { CodeResponseType, TokenResponseType } from '../response-types';
import { hasOwnProperty } from '../utils/fn';
import * as is from '../validator/is';

/**
 * Response types.
 */

const responseTypes = {
  code: CodeResponseType,
  token: TokenResponseType,
};

/**
 * Constructor.
 */

// eslint-disable-next-line import/prefer-default-export
export class AuthorizeHandler {
  options: any;

  allowEmptyState: boolean;

  authenticateHandler: any;

  model: Model;

  constructor(options: any = {}) {
    if (options.authenticateHandler && !options.authenticateHandler.handle) {
      throw new InvalidArgumentError(
        'Invalid argument: authenticateHandler does not implement `handle()`',
      );
    }

    if (!options.model) {
      throw new InvalidArgumentError('Missing parameter: `model`');
    }

    if (!options.model.getClient) {
      throw new InvalidArgumentError(
        'Invalid argument: model does not implement `getClient()`',
      );
    }

    this.options = options;
    this.allowEmptyState = options.allowEmptyState;
    this.authenticateHandler =
      options.authenticateHandler || new AuthenticateHandler(options);
    this.model = options.model;
  }

  /**
   * Authorize Handler.
   */

  async handle(request: Request, response: Response) {
    if (!(request instanceof Request)) {
      throw new InvalidArgumentError(
        'Invalid argument: `request` must be an instance of Request',
      );
    }

    if (!(response instanceof Response)) {
      throw new InvalidArgumentError(
        'Invalid argument: `response` must be an instance of Response',
      );
    }

    if (request.query.allowed === 'false') {
      throw new AccessDeniedError(
        'Access denied: user denied access to application',
      );
    }

    // Extend model object with request
    this.model.request = request;

    const client = await this.getClient(request);
    const user = await this.getUser(request, response);

    let scope: string;
    let state: string | undefined;
    let RequestedResponseType: any;
    let responseType: any;
    const uri = AuthorizeHandler.getRedirectUri(request, client);
    try {
      const requestedScope = AuthorizeHandler.getScope(request);

      const validScope = await this.validateScope(user, client, requestedScope);
      scope = validScope;
      state = this.getState(request);
      RequestedResponseType = AuthorizeHandler.getResponseType(request, client);
      responseType = new RequestedResponseType(this.options);
      const codeOrAccessToken = await responseType.handle(
        request,
        client,
        user,
        uri,
        scope,
      );
      const redirectUri = AuthorizeHandler.buildSuccessRedirectUri(uri, responseType);
      AuthorizeHandler.updateResponse(response, redirectUri, responseType, state);

      return codeOrAccessToken;
    } catch (e) {
      const rethrow = e instanceof OAuthError ? e : new ServerError(e);

      const redirectUri = AuthorizeHandler.buildErrorRedirectUri(
        uri,
        responseType,
        rethrow,
      );

      AuthorizeHandler.updateResponse(
        response,
        redirectUri,
        responseType,
        state,
      );

      throw rethrow;
    }
  }

  /**
   * Get the client from the model.
   */

  async getClient(request: Request) {
    const clientId = request.body.client_id || request.query.client_id;

    if (!clientId) {
      throw new InvalidRequestError('Missing parameter: `client_id`');
    }

    if (!is.vschar(clientId)) {
      throw new InvalidRequestError('Invalid parameter: `client_id`');
    }

    const redirectUri = request.body.redirect_uri || request.query.redirect_uri;

    if (redirectUri && !is.uri(redirectUri)) {
      throw new InvalidRequestError(
        'Invalid request: `redirect_uri` is not a valid URI',
      );
    }

    const client = await this.model.getClient(clientId);
    if (!client) {
      throw new InvalidClientError(
        'Invalid client: client credentials are invalid',
      );
    }

    if (!client.grants) {
      throw new InvalidClientError('Invalid client: missing client `grants`');
    }

    const responseType =
      request.body.response_type || request.query.response_type;
    const requestedGrantType =
      responseType === 'token' ? 'implicit' : 'authorization_code';

    if (!client.grants.includes(requestedGrantType)) {
      throw new UnauthorizedClientError(
        'Unauthorized client: `grant_type` is invalid',
      );
    }

    if (!client.redirectUris || client.redirectUris.length === 0) {
      throw new InvalidClientError(
        'Invalid client: missing client `redirectUri`',
      );
    }

    if (redirectUri && !client.redirectUris.includes(redirectUri)) {
      throw new InvalidClientError(
        'Invalid client: `redirect_uri` does not match client value',
      );
    }

    return client;
  }

  /**
   * Validate requested scope.
   */
  async validateScope(user: User, client: Client, scope: string) {
    if (this.model.validateScope) {
      const validatedScope = await this.model.validateScope(
        user,
        client,
        scope,
      );
      if (!validatedScope) {
        throw new InvalidScopeError(
          'Invalid scope: Requested scope is invalid',
        );
      }

      return validatedScope;
    }

    return scope;
  }

  /**
   * Get scope from the request.
   */

  static getScope(request: Request) {
    const scope = request.body.scope || request.query.scope;

    if (!is.nqschar(scope)) {
      throw new InvalidScopeError('Invalid parameter: `scope`');
    }

    return scope;
  }

  /**
   * Get state from the request.
   */

  getState(request: Request) {
    const state = request.body.state || request.query.state;

    if (!this.allowEmptyState && !state) {
      throw new InvalidRequestError('Missing parameter: `state`');
    }

    if (!is.vschar(state)) {
      throw new InvalidRequestError('Invalid parameter: `state`');
    }

    return state;
  }

  /**
   * Get user by calling the authenticate middleware.
   */

  async getUser(request: Request, response: Response) {
    if (this.authenticateHandler instanceof AuthenticateHandler) {
      const data = await this.authenticateHandler.handle(request, response);

      return data.user;
    }

    const user = await this.authenticateHandler.handle(request, response);
    if (!user) {
      throw new ServerError(
        'Server error: `handle()` did not return a `user` object',
      );
    }

    return user;
  }

  /**
   * Get redirect URI.
   */

  static getRedirectUri(request: Request, client: Client) {
    return (
      request.body.redirect_uri ||
      request.query.redirect_uri ||
      (client.redirectUris && client.redirectUris[0])
    );
  }

  /**
   * Get response type.
   */

  static getResponseType(request: Request, client: Client) {
    const responseType: 'code' | 'token' =
      request.body.response_type || request.query.response_type;

    if (!responseType) {
      throw new InvalidRequestError('Missing parameter: `response_type`');
    }

    if (!hasOwnProperty(responseTypes, responseType)) {
      throw new UnsupportedResponseTypeError(
        'Unsupported response type: `response_type` is not supported',
      );
    }

    if (
      responseType === 'token' &&
      (!client || !client.grants.includes('implicit'))
    ) {
      throw new UnauthorizedClientError(
        'Unauthorized client: `grant_type` is invalid',
      );
    }

    return responseTypes[responseType];
  }

  /**
   * Build a successful response that redirects the user-agent to the client-provided url.
   */

  static buildSuccessRedirectUri(
    redirectUri: string,
    responseType: CodeResponseType | TokenResponseType,
  ) {
    const uri = url.parse(redirectUri);

    return responseType.buildRedirectUri(uri);
  }

  /**
   * Build an error response that redirects the user-agent to the client-provided url.
   */

  static buildErrorRedirectUri(
    redirectUri: any,
    responseType: CodeResponseType | TokenResponseType,
    error: Error,
  ) {
    let uri = url.parse(redirectUri, true);

    if (responseType) {
      uri = responseType.setRedirectUriParam(uri, 'error', error.name);

      if (error.message) {
        uri = responseType.setRedirectUriParam(
          uri,
          'error_description',
          error.message,
        );
      }
    } else {
      uri.query = {
        error: error.name,
      };

      if (error.message) {
        uri.query.error_description = error.message;
      }
    }

    return uri;
  }

  /**
   * Update response with the redirect uri and the state parameter, if available.
   */

  static updateResponse(
    response: Response,
    redirectUri: any,
    responseType: CodeResponseType | TokenResponseType,
    state: any,
  ) {
    let newRedirectUri = redirectUri;
    if (responseType && state) {
      // tslint:disable-next-line:no-parameter-reassignment
      newRedirectUri = responseType.setRedirectUriParam(
        redirectUri,
        'state',
        state,
      );
    } else if (state) {
      newRedirectUri.query = newRedirectUri.query || {};
      newRedirectUri.query.state = state;
    }

    response.redirect(url.format(newRedirectUri));
  }
}
