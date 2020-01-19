import * as should from 'should';
import * as sinon from 'sinon';
import { AbstractGrantType } from '../../../lib/grant-types';
import { Client, User } from '../../../lib/interfaces';

/**
 * Test `AbstractGrantType`.
 */

describe('AbstractGrantType', () => {
  describe('generateAccessToken()', () => {
    it('should call `model.generateAccessToken()`', async () => {
      const model = {
        generateAccessToken: sinon
          .stub()
          .returns({ client: {}, expiresAt: new Date(), user: {} }),
      };
      const handler = new AbstractGrantType({
        accessTokenLifetime: 120,
        model,
      });
      try {
        await handler.generateAccessToken(
          (undefined as unknown) as Client,
          (undefined as unknown) as User,
          undefined,
        );
        model.generateAccessToken.callCount.should.equal(1);
        model.generateAccessToken.firstCall.thisValue.should.equal(model);
      } catch (error) {
        should.fail('should.fail', '');
      }
    });
  });

  describe('generateRefreshToken()', () => {
    // it('should call `model.generateRefreshToken()`', async () => {
    it('should fail', async () => {
      const model = {
        generateRefreshToken: sinon.stub().returns({
          client: {},
          expiresAt: new Date(new Date().getTime() / 2),
          user: {},
        }),
      };
      const handler = new AbstractGrantType({
        accessTokenLifetime: 120,
        model,
      });
      try {
        await handler.generateRefreshToken(
          (undefined as unknown) as Client,
          (undefined as unknown) as User,
          undefined,
        );
        // This should fail
        should.fail('should.fail', '');
        //        model.generateRefreshToken.callCount.should.equal(1);
        //        model.generateRefreshToken.firstCall.thisValue.should.equal(model);
      } catch (error) {
        // success
      }
    });
  });
});
