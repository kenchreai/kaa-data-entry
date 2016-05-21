;(function() {
  var DbService = (function() {
    return function(baseUrl) { 
      
      var conn = new Stardog.Connection();
      conn.setEndpoint("http://kenchreai.org:5820/");
      conn.setReasoning(false);
      conn.setCredentials("kenchreai", "Greece1963");
      
      var dbConfig = {
        database: 'kenchreai'
      };

      function query(params, cb) {
        var options = Object.assign({}, dbConfig);
        //options.query = 'describe <http://kenchreai.org/kaa/test/test01>';
        //options.query = 'select ?p ?o where { <http://kenchreai.org/kaa/harbor/ke1221> ?p ?o }';
        options.query = 'select ?s ?p where { ?s a kaaont:inventory-number . ?s kaaont:is-logical-part-of <' + baseUrl + 'threpsiades/inventoried-objects> } order by ?s';
        //options.query = 'select ?s ?p where { ?s a kaaont:inventory-number . ?s kaaont:is-logical-part-of+/kaa:' + params.entity + ' } order by ?s';
        conn.query(options, function(response) {
          cb(response);
        });
      }

      function getDetail(detailUrl, cb) {
        var options = Object.assign({}, dbConfig);
        options.query = 'select ?p ?o where { <' + detailUrl + '> ?p ?o }';
        conn.query(options, function(response) {
          cb(response);
        });
      }

      return {
        query: query,
        getDetail: getDetail
      };
    };
  })();

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = DbService;
  else
    window.DbService = DbService;
})();
