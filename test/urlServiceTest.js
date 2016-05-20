'use strict';

var assert = require('chai').assert;
var UrlService = require('./../urlService.js');

describe('Importing the module', function() {

  it('should not be null', function() {
    assert.isOk(UrlService());
  });

  it('should initialise the service with a base url', function() {
    var service = UrlService('http://kenchreai.org/');
    assert.equal(service.baseUrl, 'http://kenchreai.org/');
  });

});

describe('Building URLs', function(){

  describe('issuing GET requests', function() {

    it('constructs them properly (1)');
    
    it('constructs them properly (2)');

    it('constructs them properly (3)');
  });


  describe('issuing POST requests', function() {

    it('constructs them properly (1)');
    
    it('constructs them properly (2)');

    it('constructs them properly (3)');
  });
});
