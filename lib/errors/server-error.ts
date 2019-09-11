import { OAuthError } from './oauth-error';

/**
 * ServerError
 *
 * "The authorization server encountered an unexpected condition that prevented it from fulfilling the request."
 *
 * @see https://tools.ietf.org/html/rfc6749#section-4.1.2.1
 */

export class ServerError extends OAuthError {
  constructor(message?: string | Error, properties?: object) {
    super(message, { code: 503, name: 'server_error', ...properties });
  }
}
