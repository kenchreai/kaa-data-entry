const validators = {
  'stringError': x => !(x.includes('"') || x.includes("'")) ?
    null : 'Value cannot contain straight quotes (use alt + [ or alt + ])',
  'integerError': x => x >= 0 && x.indexOf('.') === -1 ?
    null : 'Value must be a positive integer',
  'floatError': x => parseFloat(x) >= 0 ?
    null : 'Value must be an integer or decimal',
  'boolError': x => x.toLowerCase() === 'true' || x.toLowerCase() === 'false' ?
    null : 'Value must be "True" or "False"',
  'uriError': (x, uris) => Boolean(uris.find(u => u === x)) ?
    null : 'Select a valid URI'
}

export default validators
