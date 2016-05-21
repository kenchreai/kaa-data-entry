;(function() {
  $(document).ready(function() {

    var dbService = DbService('http://kenchreai.org/kaa/');
    var detailUrl = window.location.hash.slice(1);
    var resultsList = $('#results-list');

    dbService.getDetail(detailUrl, function(response) {
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
