;(function() {
  var RegisterView = (function() {
    return function(auth) {
      $(document).ready(function() {

        var usernameField = $('input[name="username"]');
        var passwordField = $('input[name="password"]');
        var confirmField = $('input[name="confirm-password"]');

        $('button').click(function(e) {
          e.preventDefault();
          var username = usernameField.val();
          var password = passwordField.val();
          var confirmPw = confirmField.val();
          if (password != confirmPw) return alert('passwords do not match');
          if (!!username && !!password) {
            auth.register(username, password, function(success) {
              if (!!success)
                window.location.hash = '';
            });
          }
        });
      });
    }
  })();

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = RegisterView;
  else
    window.RegisterView = RegisterView;
})();
