
// many fine csv datasets on https://www.kaggle.com/datasets

// https://www.npmjs.com/package/convert-csv-to-json
const csvToJson = require('convert-csv-to-json')

const input = './data.csv'
const output = 'data.json'

csvToJson.fieldDelimiter(',').formatValueByType().generateJsonFileFromCsv(input, output)