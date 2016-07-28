;(function() {
  $(document).ready(function() {

    var spinnerService = SpinnerService();
    var validator = Validator();
    var urlService = UrlService(window)('http://kenchreai.org/kaa/');
    var typeConverter = TypeService();
    var dbService = DbService(spinnerService, typeConverter);
    var utils = Utils(dbService, validator);
    var authService = AuthService(spinnerService);
    var view = $('#view');
    var currentUser = $('#current-user');
    vex.defaultOptions.className = 'vex-theme-os';

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

    function loadChangePasswordView() {
      view.load('templates/change-password.html', function() {
        ChangePasswordView(authService);
      });
    }

    function displayCurrentUser() {
      if (!!authService.currentUser()) {
        currentUser.text('Logged in as: ' + authService.currentUser());
      } else currentUser.text('');
    }

    $(window).on('hashchange', function(e) {
      e.preventDefault();
      route();  
    });

    function route() {
      displayCurrentUser();
      var hash = location.hash ? location.hash.slice(1) : null;

      if (hash && hash.indexOf('/detail/') >= 0) {
        loadDetailPage(hash);
      } else if (hash === '/register') {
        loadRegisterView();
      } else if (hash === '/login') {
        loadLoginView();
      } else if (hash === '/changepassword') {
        loadChangePasswordView();
      } else if (hash === '/logout') {
        authService.logout();
      } else
          loadListView();
    }

    route();
  });
})();
