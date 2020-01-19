import typeis from 'type-is';
import { InvalidArgumentError } from './errors';
import { hasOwnProperty } from './utils/fn';

// eslint-disable-next-line import/prefer-default-export
export class Request implements Record<string, any> {
  body: any;

  headers: Record<string, any>;

  method: string;

  query: any;

  constructor(
    options: {
      body: any;
      headers: any;
      method: string;
      query: any;
      [key: string]: any;
    } = {} as any,
  ) {
    if (!options.headers) {
      throw new InvalidArgumentError('Missing parameter: `headers`');
    }

    if (!options.method) {
      throw new InvalidArgumentError('Missing parameter: `method`');
    }

    if (typeof options.method !== 'string') {
      throw new InvalidArgumentError('Invalid parameter: `method`');
    }

    if (!options.query) {
      throw new InvalidArgumentError('Missing parameter: `query`');
    }

    this.body = options.body || {};
    this.headers = {};
    this.method = options.method.toUpperCase();
    this.query = options.query;

    // Store the headers in lower case.
    for (const field of Object.keys(options.headers)) {
      if (hasOwnProperty(options.headers, field)) {
        this.headers[field.toLowerCase()] = options.headers[field];
      }
    }

    // Store additional properties of the request object passed in
    const me: Record<string, any> = this;
    for (const property of Object.keys(options)) {
      if (hasOwnProperty(options, property) && !me[property]) {
        me[property] = options[property];
      }
    }
  }

  /**
   * Get a request header.
   */

  get(field: string) {
    return this.headers[field.toLowerCase()];
  }

  /**
   * Check if the content-type matches any of the given mime type.
   */
  public is(...args: string[] | [string[]]): string | false {
    const types: string[] = Array.isArray(args[0])
      ? ((args[0] as unknown) as string[])
      : ((args as unknown) as string[]);

    return typeis(this as any, types) || false;
  }
}
