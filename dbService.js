(function() {
  const Stardog = require('stardog')
  const DbService = (function() {
    return (baseUrl, username, password) => { 
      
      const conn = new Stardog.Connection()
      conn.setEndpoint("http://kenchreai.org:5820/")
      conn.setReasoning(false)
      conn.setCredentials(username, password)
      
      const dbConfig = {
        database: 'kenchreai'
      }

      function query(domain, cb) {
        const options = Object.assign({}, dbConfig)
        options.query = 'select ?s ?p where { ' +
                          '?s a kaaont:inventory-number . ' +
                          '?s kaaont:is-logical-part-of ' +
                          '<' + baseUrl + domain + '/inventoried-objects> ' +
                        '} order by ?s'
        conn.query(options, response => cb(response))
      }

      function getAllUris(cb) {
        const options = Object.assign({}, dbConfig)
        options.query = 'select distinct ?s where { ?s ?p ?o filter isURI(?s) }'
        conn.query(options, response => cb(response))
      }

      function getURIProperties(cb) {
        const options = Object.assign({}, dbConfig)
        options.query = `
          SELECT * WHERE {
            graph <urn:kenchreai:schema> {
              ?subject rdf:type owl:ObjectProperty .
            }
          }
        `
        conn.query(options, response => cb(response))
      }

      function getDetail(detailUrl, cb) {
        const options = Object.assign({}, dbConfig)
        options.query = 'select ?p ?o ?label where { ' +
                          '<' + baseUrl + detailUrl + '> ?p ?o . ' +
                          'optional {' +
                            'graph <urn:kenchreai:schema> { ' +
                              '?p rdfs:label ?label ' +
                            '} ' +
                          '} ' +
                        '}'
        conn.query(options, response => cb(response))
      }

      function getDescriptors(cb) {
        const options = Object.assign({}, dbConfig)
        options.query = 'SELECT ?s ?p ?o ?ptype ?domain ?range ?label ?longtext WHERE {' +
                          'graph <urn:kenchreai:schema> {' +
                            '{ ?s rdf:type owl:ObjectProperty . ?s rdf:type ?ptype . }' +
                            'UNION { ?s rdf:type owl:DatatypeProperty . ?s rdf:type ?ptype . }' +
                            'OPTIONAL { ?s rdfs:label ?label . }' +
                            'OPTIONAL { ?s rdfs:domain ?domain . }' +
                            'OPTIONAL { ?s rdfs:range ?range . }' +
                            'OPTIONAL { ?s kaaont:x-long-text ?longtext . }' +
                            '?s <http://kenchreai.org/kaa/ontology/x-display-in-editor> true .' +
                            'FILTER ( ?ptype = owl:ObjectProperty || ?ptype = owl:DatatypeProperty )' +
                          '}' +
                        '} ORDER BY ?label'
        conn.query(options, response => cb(response))
      }

      function insert(re, cb) {
        const options = Object.assign({}, dbConfig)
        if (re.object.replace) {
          re.object = re.object.replace(/\r/g, '\\r')
          re.object = re.object.replace(/\n/g, '\\n')
        }
        options.query = 'insert data { ' +
                          '<' + baseUrl + re.subject + '> <' + re.predicate + '> ' + re.object + ' ' +
                        '}'
        conn.query(options, response => cb(response))
      }

      function updateDetail(re, cb) {
        const options = Object.assign({}, dbConfig)
        if (re.oldObject.replace) {
          re.oldObject = re.oldObject.replace(/\n/g, '\\n')
          re.newObject = re.newObject.replace(/\n/g, '\\n')
          re.newObject = re.newObject.replace(/\r/g, '\\r')
        }
        options.query = `
          delete data { <${baseUrl + re.subject}> <${re.predicate}> ${re.oldObject} };
          insert data { <${baseUrl + re.subject}> <${re.predicate}> ${re.newObject} }
        `
        conn.query(options, response => cb(response))
      }

      function deleteDetail(re, cb) {
        const options = Object.assign({}, dbConfig);
        if (re.object.replace) {
          re.object = re.object.replace(/\n/g, '\\n');
        }
        options.query = `
          delete data { <${baseUrl + re.subject}> <${re.predicate}> ${re.object} }
        `
        conn.query(options, response => cb(response))
      }

      return {
        query,
        getAllUris,
        getURIProperties,
        getDetail,
        getDescriptors,
        insert,
        updateDetail,
        deleteDetail
      }
    }
  })()

  module.exports = DbService
})()
