'use strict';

var assert = require('chai').assert;
var Validator = require('./../public/js/validator.js');

describe('Instantiating the module', function() {
  
  it('should not be null', function() {
    var val = Validator();
    assert.isOk(val);
  });
});

describe('Passing in strings to be evaluates', function() {

  var val = Validator();

  describe('Validating strings', function() {

    it('should basically accept most things', function() {
      assert.isTrue(val.validate('string', 'Koutsongilas Ridge'));
      assert.isTrue(val.validate('string', 'Chloe loves Gavin'));
      assert.isTrue(val.validate('string', 'We aren\'t really concerned with limiting the length of strings because we assume people won\'t be idiots'));
    });

    it('should not accept empty inputs', function() {
      assert.isFalse(val.validate('string'));
      assert.isFalse(val.validate('string', ''));
      assert.isFalse(val.validate('string', false));
      assert.isFalse(val.validate('string', null));
    });

  });

  describe('Validating integers', function() {

    it('should validate only positive integers', function() {
      assert.isTrue(val.validate('integer', '1'));
      assert.isTrue(val.validate('integer', '0'));
      assert.isTrue(val.validate('integer', '1234567890'));
      assert.isTrue(val.validate('integer', '10e2345'));
      assert.isFalse(val.validate('integer', 'arstdhneio'));
    });

    it('should reject negative numbers', function() {
      assert.isFalse(val.validate('integer', '-1'));
      assert.isFalse(val.validate('integer', '-1,000'));
      assert.isFalse(val.validate('integer', ''));
    });

    it('should reject floats', function() {
      assert.isFalse(val.validate('integer', '.1'));
      assert.isFalse(val.validate('integer', '-4.5'));
      assert.isFalse(val.validate('integer', '400.5'));
    });
    
  });

  describe('Validating floats', function() {

    it('should accept valid positive floats', function() {
      assert.isTrue(val.validate('float', '.1'));
      assert.isTrue(val.validate('float', '10.2'));
      assert.isTrue(val.validate('float', '0.0'));
      assert.isTrue(val.validate('float', '0.8'));
      assert.isTrue(val.validate('float', '1234.5678'));
      assert.isFalse(val.validate('float', 'oienwtf.5678'));
      assert.isTrue(val.validate('float', '1.'));
    });

    it('should also accept standard integers', function() {
      assert.isTrue(val.validate('float', '10'));
      assert.isTrue(val.validate('float', '0'));
      assert.isTrue(val.validate('float', '10e38'));
    });

    it('should reject negative numbers', function() {
      assert.isFalse(val.validate('float', '-10.3'));
      assert.isTrue(val.validate('float', '-0.0'));
    });

  });

  describe('Validating booleans', function() {

    it('should only accept the strings "true" or "false"', function() {
      assert.isFalse(val.validate('boolean', 'hello'));
      assert.isTrue(val.validate('boolean', 'true'));
      assert.isFalse(val.validate('boolean', false));
      assert.isTrue(val.validate('boolean', 'false'));
    });

    it('should maybe also allow capitalized versions', function() {
      assert.isTrue(val.validate('boolean', 'True'));
      assert.isTrue(val.validate('boolean', 'False'));
      assert.isFalse(val.validate('boolean', 'Truth'));
    });

  });

  describe('Validating URIs', function() {

    it('should');

  });
});
