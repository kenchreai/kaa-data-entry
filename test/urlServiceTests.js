'use strict';

var assert = require('chai').assert;

// bunch of setup to mock window object
var MockBrowser = require('mock-browser').mocks.MockBrowser;
var mock = new MockBrowser();
var AbstractBrowser = require('mock-browser').delegates.AbstractBrowser;
var opts = {};
if (typeof window === 'object') {
  opts.window = window;
} else {
  opts.window =  MockBrowser.createWindow();
}
var browser = new AbstractBrowser(opts);
var window = browser.getWindow();

//pass window object to service
var UrlService = require('./../public/js/urlService.js')(window);


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
    var shortUrl = urlService.shortenUrl('http://kenchreai.org/kaa/threpsiades/kth0001');
    assert.equal('threpsiades/kth0001', shortUrl);
  });

  it('should return the resource without an octothorpe', function() {
    window.location.hash = 'omgMyAwesomeHash';
    assert.equal('#omgMyAwesomeHash', window.location.hash);
    assert.equal('omgMyAwesomeHash', urlService.getHash());
  });

  it('should remove any routing prefix passed in', function() {
    window.location.hash = '#/detail/threpsiades/kth0008';
    var resource = urlService.getHash('/detail/');
    assert.equal('threpsiades/kth0008', resource);
  });

  it('should inject the base string into requests based from the hash', function() {
    window.location.hash = '#threpsiades/kth0681';
    var resourceUrl = urlService.getResourceFromHash();
    assert.equal('http://kenchreai.org/kaa/threpsiades/kth0681', resourceUrl);
  }); 
});
