const fs = require('fs')
const path = require('path')

const ObjectsToCsv = require('objects-to-csv')

const entryRequests = JSON.parse(
	fs.readFileSync(path.join(__dirname, 'dev_data', 'entryRequest.json'))
)
const exitRequests = JSON.parse(
	fs.readFileSync(path.join(__dirname, 'dev_data', 'exitRequest.json'))
)

let rejected = []
let entered = []
let exited = []

let obj = {}

entryRequests.forEach(record => {
	if (!record.reported) {
		if (!record.approved) {
			// put id, name, requestType and time in obj
			obj.id = record.requestedById
			obj.name = record.requestedBy
			obj.requestType = 'Entry'
			obj.time = record.time
			// add the constructed object to rejected array and clear obj
			rejected.push(obj)
			obj = {}
			// update the entry reported property
			record.reported = true
		} else {
			//
			obj.id = record.requestedById
			obj.name = record.requestedBy
			obj.requestedTime = record.time
			obj.actualTime = record.arrivalTime
			//
			entered.push(obj)
			obj = {}
			record.reported = true
		}
	}
})

fs.writeFileSync(
	path.join(__dirname, 'dev_data', 'entryRequest.json'),
	JSON.stringify(entryRequests)
)

exitRequests.forEach(record => {
	if (!record.reported) {
		if (!record.approved) {
			// put id, name, requestType and time in obj
			obj.id = record.requestedById
			obj.name = record.requestedBy
			obj.requestType = 'Exit'
			obj.time = record.time
			// add the constructed object to rejected array and clear obj
			rejected.push(obj)
			obj = {}
			// update the exit reported property
			record.reported = true
		} else {
			// put id, name, requestType and time in obj
			obj.id = record.requestedById
			obj.name = record.requestedBy
			obj.requestedTime = record.time
			//obj.actualTime = record.exitedTime
			obj.actualTime = record.arrivalTime
			if (record.transport) obj.transport = 'yes'
			else obj.transport = '-'
			//
			exited.push(obj)
			obj = {}
			record.reported = true
		}
	}
})

fs.writeFileSync(path.join(__dirname, 'dev_data', 'exitRequest.json'), JSON.stringify(exitRequests))
;(async () => {
	// reject Table
	const rejectcsv = new ObjectsToCsv(rejected)
	await rejectcsv.toDisk('./dailyReport/rejected.csv')

	// entered Table
	const entercsv = new ObjectsToCsv(entered)
	await entercsv.toDisk('./dailyReport/entered.csv')

	// Exit Table
	const exitcsv = new ObjectsToCsv(exited)
	await exitcsv.toDisk('./dailyReport/exited.csv')
})()