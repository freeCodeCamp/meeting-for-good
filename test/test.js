import { expect } from 'chai';
import request from 'request';

describe('Test Server Response', () => {
  describe('Server Response', () => {
    it('status', () => {
      request('http://localhost:8080', (error, response) => {
        console.log(response)
        expect(response.statusCode).to.equal(200);
      });
    });
  });
});
