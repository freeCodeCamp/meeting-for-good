import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../server/app';
const should = chai.should()

chai.use(chaiHttp);

describe('Test user API', () => {
  it('it should authenticate', (done) => {
    chai.request(server)
        .get('/')
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
  });
});
