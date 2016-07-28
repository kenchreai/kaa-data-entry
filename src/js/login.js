;(function() {
  var LoginView = (function() {
    return function(auth) {
      $(document).ready(function() {

        var usernameField = $('input[name="username"]');
        var passwordField = $('input[name="password"]');

        $('#change-password').click(function(e) {
          e.preventDefault();
          window.location.hash = "/changepassword";
        });

        $('#login').click(function(e) {
          e.preventDefault();
          var username = usernameField.val();
          var password = passwordField.val();
          if (!!username && !!password) {
            auth.login(username, password, function(success) {
              if (!!success) {
                toastr.success('Logged in');
                window.location.hash = '';
              }
            });
          }
        });
      });
    }
  })();

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = LoginView;
  else
    window.LoginView = LoginView;
})();
