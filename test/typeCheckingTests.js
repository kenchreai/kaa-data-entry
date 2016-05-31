'use strict';

var assert = require('chai').assert;
var TypeService = require('./../public/js/typeService.js');


describe('Ensuring types are properly rendered for a db query', function() {
  beforeEach(function() {
    setTimeout(function() {}, 200);
  });

  var typeService = TypeService();

  describe('Strings:', function() {
    
    it('should wrap it in additional quotes', function() {
      assert.equal('"KTH0008"', typeService.type('string', 'KTH0008')); 
      assert.equal('"Contains sherds from CIII-2"', typeService.type('string', 'Contains sherds from CIII-2'));
    });

  });

  describe('Booleans:', function() {

    it('should not put quotes around them', function() {
      assert.equal('true', typeService.type('boolean', 'true'));
      assert.equal('false', typeService.type('boolean', 'false'));
    });

    it('should convert to lowercase if necessary', function() {
      assert.equal('true', typeService.type('boolean', 'TruE'));
      assert.equal('false', typeService.type('boolean', 'FALSe'));
    });

  });

  describe('Integers:', function() {

    it('should leave validated integers alone', function() {
      assert.equal('22', typeService.type('integer', '22'));
      assert.equal('0', typeService.type('integer', '0'));
    });

  });

  describe('Floats:', function() {

    it('should convert all valid floats into strings with decimals', function() {
      assert.equal('0.0', typeService.type('float', '0'));
      assert.equal('1.0', typeService.type('float', '1'));
      assert.equal('1.0', typeService.type('float', '1.'));
      assert.equal('1.0', typeService.type('float', '1.0'));
      assert.equal('1.0', typeService.type('float', '1.0'));
    });

  });

});
