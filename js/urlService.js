;(function() {
  var UrlService = (function() {
    return function(baseUrl, window) {

      function setHash(url) {
        var shortUrl = url.replace(baseUrl, '');
        window.location.hash = shortUrl;
      }

      function getHash() {
        return baseUrl + window.location.hash.slice(1);
      }

      return {
        get baseUrl() {
          return baseUrl;
        },
        setHash: setHash,
        getHash: getHash
      };
    };
  })();

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = UrlService;
  else
    window.UrlService = UrlService;
})();
