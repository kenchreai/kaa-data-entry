'use strict';

var assert = require('chai').assert;
var UrlService = require('./../js/urlService.js');

describe('Importing the module', function() {

  it('should not be null', function() {
    assert.isOk(UrlService());
  });

  it('should initialise the service with a base url', function() {
    var service = UrlService('http://kenchreai.org/');
    assert.equal(service.baseUrl, 'http://kenchreai.org/');
  });

});

describe('Parsing the URL hash', function(){

  var urlService = UrlService('http://kenchreai.org/kaa/');

  it('should remove the base string when setting the hash', function() {
    var windowHash = urlService.setHash('http://kenchreai.org/kaa/threpsiades/kth0001');
    assert.equal('threpsiades/kth0001', windowHash);
  });

  it('should inject the base string into requests based from the hash', function() {
    var windowHash = '#' + urlService.setHash('http://kenchreai.org/kaa/threpsiades/kth0681');
    var fullHash = urlService.getWindowHash(windowHash);
    assert.equal('http://kenchreai.org/kaa/threpsiades/kth0681', fullHash);
  }); 
});
