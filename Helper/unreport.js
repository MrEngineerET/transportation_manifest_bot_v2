const fs = require('fs')
const path = require('path')

const ObjectsToCsv = require('objects-to-csv')

const entryRequests = JSON.parse(
	fs.readFileSync(path.join(__dirname, '..', 'dev_data', 'entryRequest.json'))
)
const exitRequests = JSON.parse(
	fs.readFileSync(path.join(__dirname, '..', 'dev_data', 'exitRequest.json'))
)

entryRequests.forEach(record => {
	record.reported = false
})
exitRequests.forEach(record => {
	record.reported = false
})

fs.writeFileSync(
	path.join(__dirname, '..', 'dev_data', 'entryRequest.json'),
	JSON.stringify(entryRequests)
)

fs.writeFileSync(
	path.join(__dirname, '..', 'dev_data', 'exitRequest.json'),
	JSON.stringify(exitRequests)
)
