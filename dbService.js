const { Connection, query } = require('stardog')

const DbService = (function () {
  return (baseUrl, username, password) => { 
    const CONN = new Connection({
      endpoint: 'http://kenchreai.org:5820/',
      username,
      password
    })
    const DATABASE = 'kenchreai'
    const service = {}

    service.queryByDomain = (domain, cb) => {
      const queryString = `
        select ?s ?p where { 
          ?s a kaaont:inventory-number .
          ?s kaaont:is-logical-part-of <${baseUrl + domain}/inventoried-objects> 
        } order by ?s
      `
      query.execute(CONN, DATABASE, queryString).then(response => cb(response.body))
    }

    service.getAllUris = (cb) => {
      const queryString = 'select distinct ?s where { ?s ?p ?o filter isURI(?s) }'
      query.execute(CONN, DATABASE, queryString).then(response => cb(response.body))
    }

    service.getURIProperties = (cb) => {
      const queryString = `
        SELECT * WHERE {
          graph <urn:kenchreai:schema> {
            ?subject rdf:type owl:ObjectProperty .
          }
        }
      `
      query.execute(CONN, DATABASE, queryString).then(response => cb(response.body))
    }

    service.getDetail = (detailUrl, cb) => {
      const queryString = `
        select ?p ?o ?label where { 
          <${baseUrl + detailUrl}> ?p ?o . 
          optional {
            graph <urn:kenchreai:schema> {
              ?p rdfs:label ?label
            }
          }
        }
      `
      query.execute(CONN, DATABASE, queryString).then(response => cb(response.body))
    }

    service.getDescriptors = (cb) => {
      const queryString = `
        SELECT ?s ?p ?o ?ptype ?domain ?range ?label ?longtext WHERE {
          graph <urn:kenchreai:schema> {
            { ?s rdf:type owl:ObjectProperty . ?s rdf:type ?ptype . }
            UNION { ?s rdf:type owl:DatatypeProperty . ?s rdf:type ?ptype . }
            OPTIONAL { ?s rdfs:label ?label . }
            OPTIONAL { ?s rdfs:domain ?domain . }
            OPTIONAL { ?s rdfs:range ?range . }
            OPTIONAL { ?s kaaont:x-long-text ?longtext . }
            ?s <http://kenchreai.org/kaa/ontology/x-display-in-editor> true .
            FILTER ( ?ptype = owl:ObjectProperty || ?ptype = owl:DatatypeProperty )
          }
        } ORDER BY ?label
      `
      query.execute(CONN, DATABASE, queryString).then(response => cb(response.body))
    }

    service.insert = (re, cb) => {
      if (re.object.replace) {
        re.object = re.object.replace(/\r/g, '\\r')
        re.object = re.object.replace(/\n/g, '\\n')
      }
      const queryString = `
        insert data { <${baseUrl + re.subject}> <${re.predicate}> ${re.object} }
      `
      query.execute(CONN, DATABASE, queryString).then(response => cb(response.body))
    }

    service.updateDetail = (re, cb) => {
      if (re.oldObject.replace) {
        re.oldObject = re.oldObject.replace(/\n/g, '\\n')
        re.newObject = re.newObject.replace(/\n/g, '\\n')
        re.newObject = re.newObject.replace(/\r/g, '\\r')
      }
      const queryString = `
        delete data { <${baseUrl + re.subject}> <${re.predicate}> ${re.oldObject} };
        insert data { <${baseUrl + re.subject}> <${re.predicate}> ${re.newObject} }
      `
      query.execute(CONN, DATABASE, queryString).then(response => cb(response.body))
    }

    service.updateMap = (re, cb) => {
      const queryString = `
        delete where { <${baseUrl + re.subject}> <${re.predicate}> ?anyObject };
        insert data { <${baseUrl + re.subject}> <${re.predicate}> ${re.data} }
      `
      query.execute(CONN, DATABASE, queryString).then(response => cb(response.body))
    }

    service.deleteDetail = (re, cb) => {
      if (re.object.replace) {
        re.object = re.object.replace(/\n/g, '\\n');
      }
      const queryString = `
        delete data { <${baseUrl + re.subject}> <${re.predicate}> ${re.object} }
      `
      query.execute(CONN, DATABASE, queryString).then(response => cb(response.body))
    }

    return service
  }
})()

module.exports = DbService
