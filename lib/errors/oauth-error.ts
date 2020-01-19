import * as statuses from 'statuses';

// eslint-disable-next-line import/prefer-default-export
export class OAuthError extends Error implements Record<string, any> {
  code: any;

  status: any;

  statusCode: any;

  constructor(messageOrError: string | Error, properties: any = {}) {
    super();
    let message =
      messageOrError instanceof Error ? messageOrError.message : messageOrError;
    const error = messageOrError instanceof Error ? messageOrError : undefined;
    let props: any = {};
    props = properties;
    props.code = props.code || 500; // default code 500

    if (error) {
      props.inner = error;
    }
    const statusMessage = statuses[props.code];
    if (!message && statusMessage) {
      message = statusMessage;
    }
    // eslint-disable-next-line no-multi-assign
    this.code = this.status = this.statusCode = props.code;
    this.message = message;

    const ignoreAttr = ['code', 'message'];
    const me: Record<string, any> = this;
    Object.keys(props)
      .filter(key => !ignoreAttr.includes(key))
      .forEach(key => {
        me[key] = props[key];
      });

    Error.captureStackTrace(this, OAuthError);
  }
}
