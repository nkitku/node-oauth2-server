import { OAuthError } from './oauth-error';

export class InvalidArgumentError extends OAuthError {
  constructor(message?: string | Error, properties?: object) {
    super(message, { code: 500, name: 'invalid_argument', ...properties });
  }
}
