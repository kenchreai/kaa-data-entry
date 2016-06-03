;(function() {
  var AuthService = (function() {
    return function(spinnerService) {

      function getToken(username, password, func) {
        spinnerService.start();
        $.post('/api/token', { username: username, password: password }).done(function(response) {
          if (response) {
            localStorage.setItem('access-token', response);
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
          func();
        }).always(function() { spinnerService.stop(); });
      }
      
      function logout(func) {
        localStorage.removeItem('access-token');
        location.hash = '/login';
      }

      return {
        login: login,
        logout: logout,
        register: register,
        changePassword: changePassword
      };
    };
  })();

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = AuthService;
  else
    window.AuthService = AuthService;
})();
