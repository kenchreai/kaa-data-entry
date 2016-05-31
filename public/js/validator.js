;(function() {
  var Validator = (function(){
    return function() {

      function str(input) {
        return (!!input);
      }

      function integer(input) {
        if (input.indexOf('.') !== -1) return false;
        return input >= 0;
      }

      function float(input) {
        return parseFloat(input) >= 0;
      }

      function bool(input) {
        return input.toLowerCase() === 'true' || input.toLowerCase() === 'false';
      }

      function validate(type, input) {
        if (!input) return false;

        switch(type) {
          case 'string':
            return str(input);
            break;
          case 'integer':
            return integer(input);
            break;
          case 'float':
            return float(input);
            break;
          case 'boolean':
            return bool(input);
            break;
          default:
            return false;
        }
      }

      return {
        validate: validate
      };
    };
  })();

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Validator;
  else
    window.Validator = Validator;
})();
