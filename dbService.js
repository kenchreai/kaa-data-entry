const { Connection, query } = require('stardog')
const sparqlClient = require('sparql-http-client')
const SimpleClient = require('sparql-http-client/SimpleClient')

const DbService = (function() {
  return (baseUrl, username, password) => {

    const client = new SimpleClient({
      endpointUrl: `${baseUrl}sparql`,
      updateUrl: `${baseUrl}update`,
      user: username,
      password: password
    })


    /*
    const CONN = new Connection({
      endpoint: 'http://kenchreai.org:5820/',
      username,
      password
    })
    */
    const DATABASE = 'kenchreai'
    const kaaBaseUrl = 'http://kenchreai.org/kaa/'

    const prefixes = `
      PREFIX kaa: <http://kenchreai.org/kaa/>
      PREFIX kaachron: <http://kenchreai.org/kaa/historical-chronology/>
      PREFIX kaaont: <http://kenchreai.org/kaa/ontology/>
      PREFIX kaatyp: <http://kenchreai.org/kaa/typology/>
      PREFIX kaake: <http://kenchreai.org/kaa/ke/>
      PREFIX kaakcp: <http://kenchreai.org/kaa/kcp/>
      PREFIX kaakth: <http://kenchreai.org/kaa/kth/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX owl: <http://www.w3.org/2002/07/owl#>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    `

    const service = {}

    service.queryByDomain = async (domain, cb) => {
      /*
      const queryString = `
        ${kaaontPrefix}
        select ?s ?p where {
          ?s a kaaont:inventory-number .
          ?s kaaont:is-logical-part-of <${kaaBaseUrl + domain}/inventoried-objects> 
        } order by ?s
      `
      */
      const queryString = `
        ${prefixes}
        select ?s ?p where {
          ?s a kaaont:inventory-number .
        } order by ?s
      `
      // query.execute(CONN, DATABASE, queryString).then(response => cb(response.body))
      const response = await client.query.select(queryString)
      cb(await response.json())
    }



    service.getAllUris = async (cb) => {
      const queryString = 'select distinct ?s where { ?s ?p ?o filter isURI(?s) }'
      // query.execute(CONN, DATABASE, queryString).then(response => cb(response.body))
      const response = await client.query.select(queryString)
      cb(await response.json())
    }



    service.getURIProperties = async (cb) => {
      /*
      const queryString = `
        SELECT * WHERE {
          graph <urn:kenchreai:schema> {
            ?subject rdf:type owl:ObjectProperty .
          }
        }
      `
      */
      const queryString = `
        ${prefixes}
        SELECT * WHERE {
          ?subject rdf:type owl:ObjectProperty .
        }
      `
      // query.execute(CONN, DATABASE, queryString).then(response => cb(response.body))
      const response = await client.query.select(queryString)
      cb(await response.json())
    }



    service.getDetail = async (detailUrl, cb) => {
      const queryString = `
        ${prefixes}
        select ?p ?o ?label where { 
          <${kaaBaseUrl + detailUrl}> ?p ?o . 
          optional { ?p rdfs:label ?label }
        }`
      // query.execute(CONN, DATABASE, queryString).then(response => cb(response.body))
      const response = await client.query.select(queryString)
      cb(await response.json())
    }



    service.getDescriptors = async (cb) => {
      const queryString = `
        ${prefixes}
        SELECT ?s ?p ?o ?ptype ?domain ?range ?label ?longtext WHERE {
          { ?s rdf:type owl:ObjectProperty . ?s rdf:type ?ptype . }
          UNION { ?s rdf:type owl:DatatypeProperty . ?s rdf:type ?ptype . }
          OPTIONAL { ?s rdfs:label ?label . }
          OPTIONAL { ?s rdfs:domain ?domain . }
          OPTIONAL { ?s rdfs:range ?range . }
          OPTIONAL { ?s kaaont:x-long-text ?longtext . }
          ?s <http://kenchreai.org/kaa/ontology/x-display-in-editor> true .
          FILTER ( ?ptype = owl:ObjectProperty || ?ptype = owl:DatatypeProperty )
        } ORDER BY ?label`
      // query.execute(CONN, DATABASE, queryString).then(response => cb(response.body))
      const response = await client.query.select(queryString)
      cb(await response.json())
    }



    service.insert = async (re, cb) => {
      if (re.object.replace) {
        re.object = re.object.replace(/\r/g, '\\r')
        re.object = re.object.replace(/\n/g, '\\n')
      }
      const queryString = `
        insert data { <${kaaBaseUrl + re.subject}> <${re.predicate}> ${re.object} }
      `
      // query.execute(CONN, DATABASE, queryString).then(response => cb(response.body))
      const response = await client.query.update(queryString)
      cb(await response.text())
    }



    service.updateDetail = async (re, cb) => {
      if (re.oldObject.replace) {
        re.oldObject = re.oldObject.replace(/\n/g, '\\n')
        re.newObject = re.newObject.replace(/\n/g, '\\n')
        re.newObject = re.newObject.replace(/\r/g, '\\r')
      }
      /*
      const queryString = `
        delete data { <${kaaBaseUrl + re.subject}> <${re.predicate}> ${re.oldObject} };
        insert data { <${kaaBaseUrl + re.subject}> <${re.predicate}> ${re.newObject} }
      `
      */
      const queryString = `
        delete data { <${kaaBaseUrl + re.subject}> <${re.predicate}> ${re.oldObject} };
        insert data { <${kaaBaseUrl + re.subject}> <${re.predicate}> ${re.newObject} }
      `
      // query.execute(CONN, DATABASE, queryString).then(response => cb(response.body))
      const response = await client.query.update(queryString)
      cb(await response.text())
    }



    service.updateMap = async (re, cb) => {
      const queryString = `
        delete where { <${kaaBaseUrl + re.subject}> <${re.predicate}> ?anyObject };
        insert data { <${kaaBaseUrl + re.subject}> <${re.predicate}> ${re.data} }
      `
      // query.execute(CONN, DATABASE, queryString).then(response => cb(response.body))
      const response = await client.query.update(queryString)
      cb(await response.text())
    }



    service.deleteDetail = async (re, cb) => {
      if (re.object.replace) {
        re.object = re.object.replace(/\n/g, '\\n');
      }
      const queryString = `
        delete data { <${kaaBaseUrl + re.subject}> <${re.predicate}> ${re.object} }
      `
      // query.execute(CONN, DATABASE, queryString).then(response => cb(response.body))
      const response = await client.query.update(queryString)
      cb(await response.text())
    }

    return service
  }
})()

module.exports = DbService
