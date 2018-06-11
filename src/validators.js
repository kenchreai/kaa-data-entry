const validators = {
  'string': x => !(x.includes('"') || x.includes("'")),
  'integer': x => x.indexOf('.') !== -1 ? false : x >= 0,
  'float': x => parseFloat(x) >= 0,
  'bool': x => x.toLowerCase() === 'true' || x.toLowerCase() === 'false',
  'uri': (x, uris) => Boolean(uris.find(u => u === x))
}

export default validators
