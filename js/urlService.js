;(function() {
  var UrlService = (function() {
    return function(baseUrl) { 
      return {
        baseUrl: baseUrl,
        buildUrl: function(params) {
          return "www.test.com";
        }
      };
    };
  })();

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = UrlService;
  else
    window.UrlService = UrlService;
})();
