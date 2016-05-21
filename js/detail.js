;(function() {
  $(document).ready(function() {

    var dbService = DbService('http://kenchreai.org/kaa/');
    var urlService = UrlService(window)('http://kenchreai.org/kaa/');
    var attributeList = $('#attribute-list tbody');
    var resourceTitle = urlService.getHash();
    var newData = [];

    $('#add-btn').click(addEntry);

    $('#resource-title').text('Details for ' + resourceTitle);
    $('title').text('Details - ' + resourceTitle);

    dbService.getDetail(urlService.getResourceFromHash(), function(response) {
      var results = response.results.bindings;
      results.forEach(function(result) {
        var descriptors = [];
        for (var key in result) {
          descriptors.push(result[key].value);
        }
        var elem = $('<tr><td>' + descriptors[0] + '</td><td>' + descriptors[1] + '</td></tr>');
        attributeList.append(elem);
      });
    });

    function addEntry(e) {
      e.preventDefault();
      var key = $('input[name="key"]').val();
      var value = $('input[name="value"]').val();
      if (key && value) {
        var elem = $('<tr><td>' + key + '</td><td>' + value + '</td></tr>');
        attributeList.append(elem);
        newData.append({ key: key, value: value });
        $('input[name="key"]').val('');
        $('input[name="value"]').val('');
      }
    }

  });
})(jQuery, DbService, UrlService);
