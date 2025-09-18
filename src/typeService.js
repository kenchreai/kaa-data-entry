const types = {
  'string': val => `"${val}"`,
  'float': val => {
    const num = parseFloat(val).toString()
    if (num.indexOf('.') === -1) {
      return `${num}.0`
    }
    return num
  },
  'integer': val => parseInt(val),
  'positiveInteger': val => parseInt(val),
  'nonNegativeInteger': val => parseInt(val),
  'boolean': val => val.toLowerCase(),
  'uri': val => `<${val}>`
}

export default types
