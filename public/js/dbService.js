;(function() {
  var DbService = (function() {
    return function(spinnerService) {

      function query(params, cb) {
        spinnerService.start();
        $.get('/api/entitylist?domain=' + params).done(function(response) {
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

      function getDescriptors(cb) {
        $.get('/api/descriptors').done(function(response) {
          cb(response);
        });
      }

      return {
        query: query,
        getDetail: getDetail,
        getDescriptors: getDescriptors
      };
    };
  })();

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = DbService;
  else
    window.DbService = DbService;
})();
