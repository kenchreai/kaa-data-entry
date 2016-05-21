'use strict';

var assert = require('chai').assert;
var MockBrowser = require('mock-browser').mocks.MockBrowser;
var mock = new MockBrowser();
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

  var AbstractBrowser = require('mock-browser').delegates.AbstractBrowser;

  // configure in some factory
  var opts = {};
  
  if (typeof window === 'object') {
    // assign the browser window if it exists
    opts.window = window;
  } else {
    // create a mock window object for testing
    opts.window =  MockBrowser.createWindow();
  }
  
  var browser = new AbstractBrowser(opts);
  var window = browser.getWindow();

  var urlService = UrlService('http://kenchreai.org/kaa/', window);

  it('should remove the base string when setting the hash', function() {
    urlService.setHash('http://kenchreai.org/kaa/threpsiades/kth0001');
    assert.equal('#threpsiades/kth0001', window.location.hash);
  });

  it('should inject the base string into requests based from the hash', function() {
    urlService.setHash('http://kenchreai.org/kaa/threpsiades/kth0681');
    var url = urlService.getHash();
    assert.equal('http://kenchreai.org/kaa/threpsiades/kth0681', url);
  }); 
});
