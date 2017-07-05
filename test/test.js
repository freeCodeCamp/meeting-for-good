import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../server/app';
const should = chai.should();

chai.use(chaiHttp);
/*
import mongoose from 'mongoose';
import User from '../server/api/user/user.controller'
*/
describe('Test user API', () => {
  it('it should authenticate', (done) => {
    chai.request(server)
        .get('/api/user')
        .end((err, res) => {
          //console.log("The res body is "+ res.body)
          res.should.have.status(403);
          //assert.equal(res.body.isAuthenticated, 'Authentiation required.');
          done();
        });
  });
});
