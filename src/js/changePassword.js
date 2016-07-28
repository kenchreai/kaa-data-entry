;(function() {
  var ChangePasswordView = (function() {
    return function(auth) {
      $(document).ready(function() {

        var oldPasswordField = $('input[name="old-password"]');
        var newPasswordField = $('input[name="new-password"]');
        var confirmNewPasswordField = $('input[name="confirm-password"]');

        $('button').click(function(e) {
          e.preventDefault();
          var oldPassword = oldPasswordField.val();
          var newPassword = newPasswordField.val();
          var confirmNewPassword = confirmNewPasswordField.val();
          if (newPassword != confirmNewPassword) return toastr.warning('New passwords do not match');
          if (!!newPassword && !!oldPassword) {
            auth.changePassword(oldPassword, newPassword, function(success) {
              if (!!success) {
                toastr.success(success);
                window.location.hash = '';
              } else {
                toastr.error("Error changing password");
              }
            });
          }
        });
      });
    }
  })();

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = ChangePasswordView;
  else
    window.ChangePasswordView = ChangePasswordView;
})();
