import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../server/app';
let should = chai.should();
let assert = chai.assert;

chai.use(chaiHttp);

import mongoose from 'mongoose';
import User from '../server/api/user/user.controller'

describe('Test user API', () => {
  it('Testing Failed Authentication', (done) => {
    chai.request(server)
        .get('/api/user')
        .end((err, res) => {
          res.should.have.status(403);
          done();
        });
  });
});
