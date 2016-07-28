;(function() {
  var AuthService = (function() {
    return function(spinnerService) {

      var currentUser = null;

      function getToken(username, password, func) {
        spinnerService.start();
        $.post('/api/token', { username: username, password: password }).done(function(response) {
          if (response) {
            localStorage.setItem('access-token', response);
            _getUser(response);
            func(true);
          } else {
            localStorage.removeItem('access-token');
            func(false);
          }
        }).always(function() { spinnerService.stop(); });
      }

      function login(username, password, func) {
        getToken(username, password, function(success) {
          func(success);
        });
      }

      function register(username, password, func) {
        spinnerService.start();
        $.post('/api/users', { username: username, password: password }).done(function(response) {
          localStorage.setItem('access-token', response);
          func(response);
        }).fail(function(response) {

        }).always(function() { spinnerService.stop(); });
      }

      function changePassword(old, newPw, func) {
        spinnerService.start();
        $.post('/api/users/password', { oldPassword: old, newPassword: newPw }).done(function(response) {
          func(response);
        }).always(function() { spinnerService.stop(); });
      }
      
      function logout(func) {
        localStorage.removeItem('access-token');
        currentUser = null;
        toastr.success('Logged out');
        location.hash = '/login';
      }

      function _getUser(jwt) {
        if (jwt == "" || !jwt) {
          jwt = localStorage.getItem('access-token');
          if (!jwt) return null;
        }
        var segments = jwt.split('.');

        currentUser = JSON.parse(atob(segments[1])).username;
      }

      _getUser();

      return {
        login: login,
        logout: logout,
        register: register,
        currentUser: function() { return currentUser; },
        changePassword: changePassword
      };
    };
  })();

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = AuthService;
  else
    window.AuthService = AuthService;
})();
