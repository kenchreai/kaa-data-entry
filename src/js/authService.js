;(function() {
  var AuthService = (function() {
    return function() {

      function getToken(username, password, func) {
        $.post('/api/token', { username: username, password: password }).done(function(response) {
          debugger
          localStorage.setItem('access-token', response);
          func(true);
        });
      }

      function login(username, password, func) {
        getToken(username, password, function(success) {
          debugger
          func(success);
        });
      }

      function register(username, password, func) {
        $.post('/api/users', { username: username, password: password }).done(function(response) {
          debugger
          localStorage.setItem('access-token', response);
          func(true);
        });
      }

      function changePassword(old, newPw, func) {
        $.post('/api/users/password', { oldPassword: old, newPassword: newPw }).done(function(response) {
          debugger
          func();
        });
      }
      
      function logout() {
        localStorage.removeItem('access-token');
      }

      return {
        login: login
      };
    };
  })();

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = AuthService;
  else
    window.AuthService = AuthService;
})();
