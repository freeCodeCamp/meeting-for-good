import { expect } from 'chai';
import chaiHttp from 'chai-http';

describe('Test User API', () => {
  describe('Server Response', () => {
    it('status', () => {
      request('/', (error, response) => {
        expect(response.statusCode).to.equal(200);
      });
    });
  });
});
