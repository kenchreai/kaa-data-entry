;(function() {
  var UrlService = (function() {
    return function(baseUrl) {

      function setHash(url) {
        return url.replace(baseUrl, '');
      }

      function getWindowHash(url) {
        return baseUrl + url.slice(1);
      }

      return {
        get baseUrl() {
          return baseUrl;
        },
        setHash: setHash,
        getWindowHash: getWindowHash
      };
    };
  })();

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = UrlService;
  else
    window.UrlService = UrlService;
})();
