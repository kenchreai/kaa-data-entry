;(function() {
  $(document).ready(function() {

    var dbService = DbService('http://kenchreai.org/kaa/');
    var urlService = UrlService(window)('http://kenchreai.org/kaa/');
    var resultsList = $('#results-list');

    dbService.getDetail(urlService.getResourceFromHash(), function(response) {
      var results = response.results.bindings;
      results.forEach(function(result) {
        var descriptors = [];
        for (var key in result) {
          descriptors.push(result[key].value);
        }
        var elem = $('<li>' + descriptors.join(' ') + '</li>');
        resultsList.append(elem);
      });
    });
  });
})(jQuery, DbService, UrlService);
