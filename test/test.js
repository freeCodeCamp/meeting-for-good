import { expect } from 'chai';
import request from 'request';
import mocha from 'mocha';

describe('Test Server Response', () => {
  describe('Server Response', () => {
    it('status', () => {
      request('http://localhost:8080/', (error, response) => {
        expect(response.statusCode).to.equal(200);
      });
    });
  });
});
