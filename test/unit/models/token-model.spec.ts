import { TokenModel } from '../../../lib/models';

/**
 * Test `Server`.
 */

describe('Model', () => {
  describe('constructor()', () => {
    it('should calculate `accessTokenLifetime` if `accessTokenExpiresAt` is set', () => {
      const atExpiresAt = new Date();
      atExpiresAt.setHours(new Date().getHours() + 1);

      const data = {
        accessToken: 'foo',
        client: 'bar',
        user: 'tar',
        accessTokenExpiresAt: atExpiresAt,
      };

      const model = new TokenModel(data);
      const lifetime = model.accessTokenLifetime;
      if (!lifetime) {
        throw new Error('failure');
      }
      lifetime.should.be.Number();
      lifetime.should.be.approximately(3600, 2);
    });
  });
});
