;(function() {
  var TypeService = (function() {
    return function() {

      var convertType = {
        'string': function(val) {
          return '"' + val + '"';
        },
        'float': function(val) {
          var num = parseFloat(val).toString();
          if (num.indexOf('.') === -1)
            num += '.0';
          return num;
        },
        'integer': function(val) {
          return val;
        },
        'boolean': function(val) {
          return val.toLowerCase();
        }
      };

      function type(type, value) {
        return convertType[type](value);
      }

      return {
        type: type
      };
    };
  })();

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = TypeService;
  else
    window.TypeService = TypeService;
})();
