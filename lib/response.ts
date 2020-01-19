import { hasOwnProperty } from './utils/fn';

// eslint-disable-next-line import/prefer-default-export
export class Response implements Record<string, any> {
  body: any;

  headers: Record<string, any>;

  status: number;

  constructor(options: any = {}) {
    this.body = options.body || {};
    this.headers = {};
    this.status = 200; // OK

    // Store the headers in lower case.
    for (const field of Object.keys(options.headers || {})) {
      if (hasOwnProperty(options.headers, field)) {
        this.headers[field.toLowerCase()] = options.headers[field];
      }
    }

    // Store additional properties of the response object passed in.
    const me: Record<string, any> = this;
    for (const property of Object.keys(options)) {
      if (hasOwnProperty(options, property) && !me[property]) {
        me[property] = options[property];
      }
    }
  }

  /**
   * Get a response header.
   */

  get(field: string) {
    return this.headers[field.toLowerCase()];
  }

  /**
   * Redirect response.
   */

  redirect(url: string) {
    this.set('Location', url);
    this.status = 302; // Found
  }

  /**
   * Set a response header.
   */

  set(field: string, value: string) {
    this.headers[field.toLowerCase()] = value;
  }
}
