;(function() {
  var DbService = (function() {

    jQuery.each( ["put", "delete"], function(i, method) {
      jQuery[method] = function(url, data, callback, type) {
        if (jQuery.isFunction(data)) {
          type = type || callback;
          callback = data;
          data = undefined;
        }

        return jQuery.ajax({
          url: url,
          type: method,
          dataType: type,
          data: data,
          success: callback
        });
      };
    });

    return function(spinnerService, converter) {

      function query(params, cb) {
        spinnerService.start();
        $.get('/api/entitylist?domain=' + params.entity).done(function(response) {
          spinnerService.stop();
          cb(response);
        });
      }

      function getDetail(resource, cb) {
        spinnerService.start();
        $.get('/api/entities?resourceName=' + resource).done(function(response) {
          spinnerService.stop();
          cb(response);
        });
      }

      function insert(resource, properties, cb) {
        spinnerService.start();
        $.post('/api/entities?resourceName=' + resource, properties).done(function(response) {
          spinnerService.stop();
          cb(response);
        });
      }

      function deleteAttribute(resource, properties, cb) {
        spinnerService.start();
        $.delete('/api/entities?resourceName=' + resource, properties).done(function(response) {
          spinnerService.stop();
          cb(response);
        });
      }

      function getDescriptors(cb) {
        $.get('/api/descriptors').done(function(response) {
          cb(response);
        });
      }

      return {
        query: query,
        getDetail: getDetail,
        insert: insert,
        getDescriptors: getDescriptors,
        deleteAttribute: deleteAttribute
      };
    };
  })();

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = DbService;
  else
    window.DbService = DbService;
})();
