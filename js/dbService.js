;(function() {
  var DbService = (function() {
    return function(baseUrl, spinnerService) { 
      
      var conn = new Stardog.Connection();
      conn.setEndpoint("http://kenchreai.org:5820/");
      conn.setReasoning(false);
      conn.setCredentials("kenchreai", "Greece1963");
      
      var dbConfig = {
        database: 'kenchreai'
      };

      function query(params, cb) {
        spinnerService.start();
        var options = Object.assign({}, dbConfig);
        //options.query = 'describe <http://kenchreai.org/kaa/test/test01>';
        //options.query = 'select ?p ?o where { <http://kenchreai.org/kaa/harbor/ke1221> ?p ?o }';
        options.query = 'select ?s ?p where { ?s a kaaont:inventory-number . ?s kaaont:is-logical-part-of <' + baseUrl + 'threpsiades/inventoried-objects> } order by ?s';
        //options.query = 'select ?s ?p where { ?s a kaaont:inventory-number . ?s kaaont:is-logical-part-of+/kaa:' + params.entity + ' } order by ?s';
        conn.query(options, function(response) {
          cb(response);
          spinnerService.stop();
        });
      }

      function getDetail(detailUrl, cb) {
        spinnerService.start()
        var options = Object.assign({}, dbConfig);
        options.query = 'select ?p ?o ?label where { <' + detailUrl + '> ?p ?o . optional { graph <urn:kenchreai:schema> { ?p rdfs:label ?label } } }';
        conn.query(options, function(response) {
          cb(response);
          spinnerService.stop();
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
