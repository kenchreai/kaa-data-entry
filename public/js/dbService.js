;(function() {
  var DbService = (function() {
    return function(spinnerService, converter) {

      function query(params, cb) {
        spinnerService.start();
        $.post('/api/query', params).done(function(response) {
          spinnerService.stop();
          cb(response);
        });
      }

      function getDetail(resource, cb) {
        spinnerService.start();
        $.post('/api/getdetail', { resource: resource }).done(function(response) {
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
