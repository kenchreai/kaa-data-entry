const SimpleClient = require('sparql-http-client/SimpleClient')

const DbService = (function () {
  return (baseUrl, username, password, frontDoorKey) => {
    const client = new SimpleClient({
      endpointUrl: `${baseUrl}/sparql`,
      updateUrl: `${baseUrl}/update`,
      user: username,
      password: password,
      headers: {
        'x-front-door-key': frontDoorKey,
      },
    })

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

    service.queryByString = async (searchTerm, cb) => {
      const searchTerms = searchTerm.split(' ')

      const queryString = `
      ${prefixes}
      select distinct ?entity ?label where {
        ?entity ?p ?o .filter(${searchTerms
          .map((q) => `contains(lcase(str(?entity)), '${q}')`)
          .join(' && ')}) .
        ?entity rdfs:label ?label
      } order by ?label
      `
      const response = await client.query.select(queryString)
      try {
        cb(await response.json())
      } catch (e) {
        console.log(e)
        cb(e.message)
      }
    }

    service.getAllUris = async (cb) => {
      const queryString =
        'select distinct ?s where { ?s ?p ?o filter isURI(?s) }'
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
      const response = await client.query.select(queryString)
      cb(await response.json())
    }

    service.getTypologies = async (cb) => {
      const query = `
      ${prefixes}
      select distinct ?typology ?label ?parent where {
        ?typology a kaaont:typology-item .
        optional { ?typology kaaont:broader ?parent . } 
        { ?typology rdfs:label ?label }
      } order by ?s
      `
      const response = await client.query.select(query)
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
        } ORDER BY ?label
      `
      const response = await client.query.select(queryString)
      cb(await response.json())
    }

    service.insert = async (re, cb) => {
      if (re.object.replace) {
        re.object = re.object.replace(/\r/g, '\\r')
        re.object = re.object.replace(/\n/g, '\\n')
      }
      const queryString = `
        insert data { <${kaaBaseUrl + re.subject}> <${re.predicate}> ${
        re.object
      } }
      `
      const response = await client.query.update(queryString)
      cb(await response.json())
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
        delete data { <${kaaBaseUrl + re.subject}> <${re.predicate}> ${
        re.oldObject
      } };
        insert data { <${kaaBaseUrl + re.subject}> <${re.predicate}> ${
        re.newObject
      } }
      `
      const response = await client.query.update(queryString)
      cb(await response.json())
    }

    service.updateMap = async (re, cb) => {
      const queryString = `
        delete where { <${kaaBaseUrl + re.subject}> <${
        re.predicate
      }> ?anyObject };
        insert data { <${kaaBaseUrl + re.subject}> <${re.predicate}> ${
        re.data
      } }
      `
      const response = await client.query.update(queryString)
      cb(await response.json())
    }

    service.deleteDetail = async (re, cb) => {
      if (re.object.replace) {
        re.object = re.object.replace(/\n/g, '\\n')
      }
      const queryString = `
        delete data { <${kaaBaseUrl + re.subject}> <${re.predicate}> ${
        re.object
      } }
      `
      const response = await client.query.update(queryString)
      cb(await response.json())
    }

    service.getNextNamespaceItem = async (domain, cb) => {
      let queryString = ''

      queryString = `
        ${prefixes}
        select ?s where {
          ?s ?p ?o .filter contains(str(?s), "${domain}")
        }
        order by desc(?s)
        limit 1
      `

      if (domain.includes('kcp')) {
        queryString = `
          ${prefixes}
          select ?s where {
            ?s ?p ?o .filter (contains(str(?s), "${domain}") && regex(str(?s), "${domain}(?!.*[0-9]{4}).*$"))
          }
          order by desc(?s)
          limit 1
        `
      }

      const response = await client.query.select(queryString)
      cb(await response.json())
    }

    service.createEntity = async (entityURI, entityType, entityLabel, cb) => {
      let triples = ''

      if (entityType === 'ke/co') {
        triples = `
          insert data {
            <${entityURI}>
            kaaont:is-logical-part-of
            kaake:inventoried-coins
          };
          insert data {
            <${entityURI}>
            kaaont:typological-identification
            kaatyp:coin
          };
          insert data {
            <${entityURI}>
            rdf:type
            kaaont:inventoried-coin
          };
          insert data {
            <${entityURI}>
            rdfs:label
            "co${entityLabel}"
          };
        `
      }

      if (entityType === 'ke/ke') {
        triples = `
          insert data {
            <${entityURI}>
            kaaont:is-logical-part-of
            kaake:inventoried-objects
          };
          insert data {
            <${entityURI}>
            rdf:type
            kaaont:inventoried-object
          };
          insert data {
            <${entityURI}>
            rdfs:label
            "ke${entityLabel}"
          };
        `
      }

      if (entityType === 'kth/kth') {
        triples = `
          insert data {
            <${entityURI}>
            kaaont:is-logical-part-of
            kaakth:inventoried-objects
          };
          insert data {
            <${entityURI}>
            rdf:type
            kaaont:inventoried-object
          };
          insert data {
            <${entityURI}>
            rdfs:label
            "kth${entityLabel}"
          };
        `
      }

      if (entityType === 'kcp/ka') {
        triples = `
          insert data {
            <${entityURI}>
            kaaont:is-logical-part-of
            kaakcp:inventoried-objects
          };
          insert data {
            <${entityURI}>
            rdf:type
            kaaont:inventoried-object
          };
          insert data {
            <${entityURI}>
            rdfs:label
            "ka${entityLabel}"
          };
        `
      }

      if (entityType === 'kcp/ki') {
        triples = `
          insert data {
            <${entityURI}>
            kaaont:is-logical-part-of
            kaakcp:inventoried-objects
          };
          insert data {
            <${entityURI}>
            rdf:type
            kaaont:inventoried-object
          };
          insert data {
            <${entityURI}>
            rdfs:label
            "ki${entityLabel}"
          };
        `
      }

      if (entityType === 'kcp/kl') {
        triples = `
          insert data {
            <${entityURI}>
            kaaont:is-logical-part-of
            kaakcp:inventoried-objects
          };
          insert data {
            <${entityURI}>
            rdf:type
            kaaont:inventoried-object
          };
          insert data {
            <${entityURI}>
            rdfs:label
            "kl${entityLabel}"
          };
        `
      }

      if (entityType === 'kcp/km') {
        triples = `
          insert data {
            <${entityURI}>
            kaaont:is-logical-part-of
            kaakcp:inventoried-objects
          };
          insert data {
            <${entityURI}>
            rdf:type
            kaaont:inventoried-object
          };
          insert data {
            <${entityURI}>
            rdfs:label
            "km${entityLabel}"
          };
        `
      }

      if (entityType === 'kcp/kp') {
        triples = `
          insert data {
            <${entityURI}>
            kaaont:is-logical-part-of
            kaakcp:inventoried-objects
          };
          insert data {
            <${entityURI}>
            rdf:type
            kaaont:inventoried-object
          };
          insert data {
            <${entityURI}>
            rdfs:label
            "kp${entityLabel}"
          };
        `
      }

      if (entityType === 'kcp/ks') {
        triples = `
          insert data {
            <${entityURI}>
            kaaont:is-logical-part-of
            kaakcp:inventoried-objects
          };
          insert data {
            <${entityURI}>
            rdf:type
            kaaont:inventoried-object
          };
          insert data {
            <${entityURI}>
            rdfs:label
            "ks${entityLabel}"
          };
        `
      }

      if (entityType === 'any') {
        triples = `
          insert data {
            <${entityURI}>
            rdfs:label
            "${entityLabel}"
          }
        `
      }

      const queryString = `
        ${prefixes}
        ${triples}
      `

      const response = await client.query.update(queryString)
      cb(await response.json())
    }

    return service
  }
})()

module.exports = DbService
