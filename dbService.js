;(function() {
  var Stardog = require('stardog');
  var DbService = (function() {
    return function(baseUrl, username, password) { 
      
      var conn = new Stardog.Connection();
      conn.setEndpoint("http://kenchreai.org:5820/");
      conn.setReasoning(false);
      conn.setCredentials(username, password);
      
      var dbConfig = {
        database: 'kenchreai'
      };

      function query(params, cb) {
        var options = Object.assign({}, dbConfig);
        //options.query = 'describe <http://kenchreai.org/kaa/test/test01>';
        //options.query = 'select ?p ?o where { <http://kenchreai.org/kaa/harbor/ke1221> ?p ?o }';
        options.query = 'select ?s ?p where { ' +
                          '?s a kaaont:inventory-number . ' +
                          '?s kaaont:is-logical-part-of ' +
                          '<' + baseUrl + 'kth/inventoried-objects> ' +
                        '} order by ?s';
        //options.query = 'select ?s ?p where { ?s a kaaont:inventory-number . ?s kaaont:is-logical-part-of+/kaa:' + params.entity + ' } order by ?s';
        conn.query(options, function(response) {
          cb(response);
        });
      }

      function getDetail(detailUrl, cb) {
        var options = Object.assign({}, dbConfig);
        options.query = 'select ?p ?o ?label where { ' +
                          '<' + detailUrl + '> ?p ?o . ' +
                          'optional {' +
                            'graph <urn:kenchreai:schema> { ' +
                              '?p rdfs:label ?label ' +
                            '} ' +
                          '} ' +
                        '}';
        conn.query(options, function(response) {
          cb(response);
        });
      }

      function getDescriptors(cb) {
        var options = Object.assign({}, dbConfig);
        options.query = 'SELECT ?s ?p ?o ?type ?domain ?range ?label WHERE {' +
                          'graph <urn:kenchreai:schema> {' +
                            '{ ?s rdf:type owl:ObjectProperty . ?s rdf:type ?type . }' +
                            'UNION { ?s rdf:type owl:DatatypeProperty . ?s rdf:type ?type . }' +
                            'OPTIONAL { ?s rdfs:label ?label . }' +
                            'OPTIONAL { ?s rdfs:domain ?domain . }' +
                            'OPTIONAL { ?s rdfs:range ?range . }' +
                            'FILTER ( ?type = owl:ObjectProperty || ?type = owl:DatatypeProperty )' +
                          '}' +
                        '}';
        conn.query(options, function(response) {
          cb(response);
        });
      }

      function updateDetail(re, cb) {
        var options = Object.assign({}, dbConfig);
        options.query = 'delete { ' +
                          '<http://kenchreai.org/kaa/' + re.subject + '> ' + re.predicate + ' ' + re.oldObject + ' ' +
                        '} insert {' +
                          '<http://kenchreai.org/kaa/' + re.subject + '> ' + re.predicate + ' ' + re.newObject + ' ' +
                        '} where { ' +
                          '<http://kenchreai.org/kaa/' + re.subject + '> ' + re.predicate + ' ' + re.oldObject + ' ' +
                        '}';
        conn.query(options, function(response) {
          cb(response);
        });
      }

      return {
        query: query,
        getDetail: getDetail,
        getDescriptors: getDescriptors,
        updateDetail: updateDetail
      };
    };
  })();

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = DbService;
  else
    window.DbService = DbService;
})();
