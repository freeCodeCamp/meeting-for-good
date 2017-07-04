import chaiHttp from 'chai-http';
import { chai, assert } from 'chai';
import server from '../server';

chai.use(chaiHttp);


describe('Test User API', () => {
  describe('Server Response', () => {
    it('status', () => {
      request('/', (error, response) => {
        expect(response.statusCode).to.equal(200);
      });
    });
  });
});
