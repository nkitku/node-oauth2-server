# oauth2-server

[![npm Version][npm-image]][npm-url]
[![npm Downloads][downloads-image]][downloads-url]
[![Test Status][travis-image]][travis-url]
[![MIT Licensed][license-image]][license-url]
[![oauthjs Slack][slack-image]][slack-url]
[![Git commit with emojis!](https://img.shields.io/badge/gitmoji-git%20commit%20with%20emojis!-brightgreen.svg)](https://gitmoji.js.org/en-US/)

Complete, compliant and well tested module for implementing an OAuth2 server in [Node.js](https://nodejs.org).

## Installation

```bash
npm install oauth2-server
```

The _oauth2-server_ module is framework-agnostic but there are several officially supported wrappers available for popular HTTP server frameworks such as [Express](https://npmjs.org/package/express-oauth-server) and [Koa](https://npmjs.org/package/koa-oauth-server). If you're using one of those frameworks it is strongly recommended to use the respective wrapper module instead of rolling your own.

## Features

- Supports `authorization_code`, `client_credentials`, `refresh_token`, `implicit` and `password` grant, as well as _extension grants_, with scopes.
- Can be used with _promises_, _Node-style callbacks_, _ES6 generators_ and _async_/_await_ (using [Babel](https://babeljs.io)).
- Fully [RFC 6749](https://tools.ietf.org/html/rfc6749.html) and [RFC 6750](https://tools.ietf.org/html/rfc6750.html) compliant.
- Implicitly supports any form of storage, e.g. _PostgreSQL_, _MySQL_, _MongoDB_, _Redis_, etc.
- Complete [test suite](https://github.com/oauthjs/node-oauth2-server/tree/master/test).

## Documentation

[Documentation](https://oauth2-server.readthedocs.io) is hosted on Read the Docs.

## Examples

Most users should refer to our [Express](https://github.com/oauthjs/express-oauth-server/tree/master/examples) or [Koa](https://github.com/oauthjs/koa-oauth-server/tree/master/examples) examples.

Examples for v3 are yet to be made.

## Upgrading from 2.x

This module has been rewritten using a promise-based approach, introducing changes to the API and model specification. v2.x is no longer supported.

Please refer to our [3.0 migration guide](https://oauth2-server.readthedocs.io/en/latest/misc/migrating-v2-to-v3.html) for more information.

## Tests

To run the test suite, install dependencies, then run `npm test`:

```bash
npm install
npm test
```

[npm-image]: https://img.shields.io/npm/v/oauth2-server.svg
[npm-url]: https://npmjs.org/package/oauth2-server
[downloads-image]: https://img.shields.io/npm/dm/oauth2-server.svg
[downloads-url]: https://npmjs.org/package/oauth2-server
[travis-image]: https://img.shields.io/travis/oauthjs/node-oauth2-server/master.svg
[travis-url]: https://travis-ci.org/oauthjs/node-oauth2-server
[license-image]: https://img.shields.io/badge/license-MIT-blue.svg
[license-url]: https://raw.githubusercontent.com/oauthjs/node-oauth2-server/master/LICENSE
[slack-image]: https://slack.oauthjs.org/badge.svg
[slack-url]: https://slack.oauthjs.org
