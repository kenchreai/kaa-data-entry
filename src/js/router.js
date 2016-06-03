;(function() {
  $(document).ready(function() {

    var spinnerService = SpinnerService();
    var validator = Validator();
    var urlService = UrlService(window)('http://kenchreai.org/kaa/');
    var typeConverter = TypeService();
    var dbService = DbService(spinnerService, typeConverter);
    var utils = Utils(dbService, validator);
    var authService = AuthService();
    var view = $('#view');
    
    function loadDetailPage(hash) {
      view.load('templates/detail.html', function() {
        DetailPage(urlService, dbService, utils);
      });
    }

    function loadListView() {
      view.load('templates/list-view.html', function() {
        ListView(urlService, dbService);
      });
    }

    function loadRegisterView() {
      view.load('templates/register.html', function() {
        RegisterView(authService);
      });
    }

    function loadLoginView() {
      view.load('templates/login.html', function() {
        LoginView(authService);
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
      } else if (hash === '/register') {
        loadRegisterView();
      } else if (hash === '/login') {
        loadLoginView();
      } else
          loadListView();
    }

    route();
  });
})();
