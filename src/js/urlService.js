;(function(window) {
  if (!window) window = this.window;
  var UrlService = (function(window) {
    return function(baseUrl) {

      function shortenUrl(url) {
        return url.replace(baseUrl, '');
      }

      function getHash(view) {
        if (!view) view = '';
        return window.location.hash.slice(view.length + 1);
      }

      function getResourceFromHash(view) {
        if (!view) view = '';
        return baseUrl + window.location.hash.slice(view.length + 1);
      }

      return {
        get baseUrl() {
          return baseUrl;
        },
        shortenUrl: shortenUrl,
        getHash: getHash,
        getResourceFromHash: getResourceFromHash
      };
    };
  });

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = UrlService;
  else
    window.UrlService = UrlService;
})();
