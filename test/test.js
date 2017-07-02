var expect  = require('chai').expect;
var request = require('request');

describe('Test Server Response', function() {
    describe ('Server Response', function() {
        it('status', function(){
            request('http://localhost:8080/', function(error, response, body) {
                expect(response.statusCode).to.equal(200);
            });
        });
    });
});