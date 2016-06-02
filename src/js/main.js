;(function() {
  var ListView = (function() {
    return function(urlService, dbService) {
      $(document).ready(function() {

        var resultsList = $('#results-list');
        var cachedObj = location.hash ? location.hash.slice(1) : null;

        if (cachedObj) { loadCachedObj(cachedObj); }

        $('#search').on('click', function(e) {
          loadResults(e);
        });

        function loadCachedObj(cachedObj) {
          var response = JSON.parse(sessionStorage.getItem(cachedObj));
          if (response) {
            printResults(response);
            $('#entity-field').val(cachedObj);
          } else {
            sessionStorage.removeItem(cachedObj);
            $('#results-list').children().remove();
          }
        }

        function loadResults(e, entity) {
          e.preventDefault();
          if (!entity) var entity = $('#entity-field').val()
          $('#no-results').remove();
          $('#results-list').children().remove();
          dbService.query({ entity: entity }, function(response) {
            var results = response.results.bindings;
            if (results.length === 0) {
              $('#results-list').append($('<p id="no-results">No results found for query "' +
                                            entity + '".</p>'));
            } else printResults(results, entity);
          });
        }

        function printResults(results, entity) {
          results.forEach(function(result) {
            var descriptors = [];
            for (var key in result) {
              descriptors.push(result[key].value);
            }
            var elem = $('<li><a href="/detail/' +  urlService.shortenUrl(descriptors.join())
                        + '">' + descriptors.join(' ') + '</a></li>');
            resultsList.append(elem);
          });
          var encodedResults = JSON.stringify(results);
          if (entity) {
            sessionStorage.setItem(entity, encodedResults);
            location.hash = entity;
          }
          $('a').click(function(e) {
            e.preventDefault();
            window.location.hash = e.target.attributes['0'].nodeValue;
          });
        }
      });
    };
  })();

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = ListView;
  else
    window.ListView = ListView;
})();
