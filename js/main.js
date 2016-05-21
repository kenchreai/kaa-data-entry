;(function() {
  $(document).ready(function() {

    var dbService = DbService('http://kenchreai.org/kaa/');
    var urlService = UrlService(window)('http://kenchreai.org/kaa/');
    var resultsList = $('#results-list');

    var cachedObj = location.hash ? location.hash.slice(1) : null;

    if (cachedObj) {
      loadCachedObj(cachedObj);
    }

    $('#search').on('click', function(e) {
      loadResults();
    });

    function loadCachedObj(cachedObj) {
      var response = JSON.parse(sessionStorage.getItem(cachedObj));
      if (response) {
        printResults(response);
      }
    }

    function loadResults(entity) {
      if (!entity)
        var entity = $('#entity-field').val()
      $('#no-results').remove();
      $('#results-list').children().remove();

      dbService.query({ entity: entity }, function(response) {
        var results = response.results.bindings;
        if (results.length === 0) {
          $('#results-list').append($('<p id="no-results">No results found for query "' +
                                        params.entity + '".</p>'));
        } else {
          printResults(results);
        }
      });
      e.preventDefault();
    }

    function printResults(results) {
      results.forEach(function(result) {
        var descriptors = [];
        for (var key in result) {
          descriptors.push(result[key].value);
        }
        var elem = $('<li><a href="/detail/#' +  urlService.shortenUrl(descriptors.join()) + '">' + 
                        descriptors.join(' ') + '</a></li>');

        resultsList.append(elem);
      });
      var encodedResults = JSON.stringify(results);
      sessionStorage.setItem('cats', encodedResults);
      location.hash = 'cats';
    }

    $(window).on('hashchange', function() {
      cachedObj = location.hash ? location.hash.slice(1) : null;
      if (cachedObj)
        loadCachedObj(cachedObj);
      else
        $('#results-list').children().remove();
    });
  });
})(jQuery, DbService, UrlService);
