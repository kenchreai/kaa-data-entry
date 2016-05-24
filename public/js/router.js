;(function() {
  $(document).ready(function() {

    var spinnerService = SpinnerService();
    var urlService = UrlService(window)('http://kenchreai.org/kaa/');
    var dbService = DbService(spinnerService);

    var descriptors;
    var dataTypes = [];
    var objectTypes = [];

    var constants = {
      descriptors: function(cb) {
        if (descriptors === undefined) {
          dbService.getDescriptors(function(response) {
            var _descriptors = response.results.bindings.filter(function(descriptor) {
              return descriptor.label;
            });
            descriptors = _descriptors;
            splitDescriptors();
            cb(descriptors);
          });
        } else
            cb(descriptors);
      },
      dataTypes: dataTypes,
      objectTypes: objectTypes
    };

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
    
    function loadDetailPage(hash) {
      $('#view').load('templates/detail.html', function() {
        DetailPage(urlService, dbService, constants);
      });
    }

    function loadListView() {
      $('#view').load('templates/list-view.html', function() {
        ListView(urlService, dbService);
      });
    }

    $(window).on('hashchange', function(e) {
      e.preventDefault();
      route();  
    });

    function route() {
      var hash = location.hash ? location.hash.slice(1) : null;
      if (hash && hash.indexOf('/detail/') >= 0) {
        loadDetailPage(hash);
      } else
          loadListView();
    }

    route();
  });
})();
