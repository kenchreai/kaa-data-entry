;(function() {
  var Utils = (function() {
    return function(dbService, validator) {

      function getDescriptors(cb) {
        if (descriptors === undefined) {
          dbService.getDescriptors(function(response) {
            var _descriptors = response.results.bindings.filter(function(descriptor) {
              return descriptor.label;
            });
            descriptors = _descriptors;
            splitDescriptors();
            cb(descriptors);
          });
        } else cb(descriptors);
      }
      
      var descriptors;
      var dataTypes = [];
      var objectTypes = []

      function splitDescriptors() {
        descriptors.forEach(function(desc) {
          try {
            desc.range.value;
            dataTypes.push(desc);
          } catch(e) {
            objectTypes.push(desc);
          }
        });
      }

      function getType(label) {
        var descriptor, type, typeValue;
        dataTypes.filter(function(desc) {
          if (desc.s.value === label) {
            descriptor = desc;
            type = 'data';
          }
        });
        objectTypes.filter(function(desc) {
          if (desc.s.value === label) {
            descriptor = desc;
            type = 'object';
            typeValue = 'uri';
          }
        });

        if (type === 'data') {
          typeValue = descriptor.range.value.slice(descriptor.range.value.indexOf('#') + 1);
        }
        return typeValue;
      }

      function debounce(func, wait, immediate) {
        var timeout;
        return function() {
          var context = this, args = arguments;
          var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
          };
          var callNow = immediate && !timeout;
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
          if (callNow) func.apply(context, args);
        };
      };

      function validate(type, val) {
        return validator.validate(type, val);
      }

      return {
        getDescriptors: getDescriptors,
        dataTypes: dataTypes,
        objectTypes: objectTypes,
        getType: getType,
        debounce: debounce,
        validate: validate
      };
    };
  })();

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Utils;
  else
    window.Utils = Utils;
})();
