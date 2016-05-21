;(function() {
  var SpinnerService = (function() {
    return function() {

      var target = $('#spinner-target');
      
      var options = {
        lines: 13,
        length: 28,
        width: 14,
        radius: 42,
        scale: 1,
        corners: 1,
        color: '#000',
        opacity: 0.25,
        rotate: 0,
        direction: 1,
        speed: 1,
        trail: 60,
        fps: 20,
        zIndex: 2e9,
        className: 'spinner',
        top: '100%',
        right: '-50%',
        shadow: false,
        hwaccel: false,
        position: 'relative'
      };

      var spinner = new Spinner(options);

      function start() {
        target.append(spinner.spin().el);
      }

      function stop() {
        spinner.stop();
      }

      return {
        start: start,
        stop: stop
      };
    };
  })();
  
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = SpinnerService;
  else
    window.SpinnerService = SpinnerService;
})(jQuery);
