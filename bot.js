const fs = require('fs')
const path = require('path')
const shortid = require('shortid')

const { Telegraf } = require('telegraf')
const bot = new Telegraf(process.env.BOT_TOKEN)

//debbuging and to get the users chatID
// bot.use(ctx => {
// 	console.log(ctx.message)
// 	console.log('-----------------------------')
// 	console.log(ctx)
// })
//debbuging end

// file path for the entryRequest.json and personal.json files
const entryRequestTablePath = path.join(__dirname, 'dev_data', 'entryRequest.json')
const personalTablePath = path.join(__dirname, 'dev_data', 'personal.json')
// button format for HOD
const entry_request_button = [
	[
		{
			text: 'Reject Request',
			callback_data: 'reject_request',
		},
		{
			text: 'Approve Request',
			callback_data: 'approve_request',
		},
	],
	[
		{
			text: 'Forward Request to GM',
			callback_data: 'forward_request_toGM',
		},
	],
]

const entry_request_button_to_GM = [
	[
		{
			text: 'Reject Request',
			callback_data: 'reject_request',
		},
		{
			text: 'Approve Request',
			callback_data: 'approve_request',
		},
	],
]
bot.action('reject_request', async ctx => {
	//1) delete the request entry record from entryRequest.json
	let entryRequestTable = JSON.parse(await readFilePro(entryRequestTablePath))
	const entryrequestNumber = FindEntryRequestNumber(ctx)
	const entryrequestIndex = entryRequestTable.findIndex(
		entry => entry.requestNo == entryrequestNumber
	)
	if (entryrequestIndex != -1) {
		const record = entryRequestTable[entryrequestIndex]
		entryRequestTable.splice(entryrequestIndex, 1)
		fs.writeFileSync(entryRequestTablePath, JSON.stringify(entryRequestTable))
		//2)send a rejection message to the person who made the request
		bot.telegram.sendMessage(
			record.requestedById,
			'Entry Request No:' + record.requestNo + ' is NOT Approved'
		)
	}
	//3) delete the message to signal successful rejection
	ctx.deleteMessage()
})

bot.action('approve_request', async ctx => {
	//1) update the entryRequest.json approved and approvedBy column
	const sender = await senderInfo(ctx)
	let entryRequestTable = JSON.parse(await readFilePro(entryRequestTablePath))
	const entryrequestNumber = FindEntryRequestNumber(ctx)
	const entryrequestIndex = entryRequestTable.findIndex(
		entry => entry.requestNo == entryrequestNumber
	)
	if (entryrequestIndex != -1) {
		const record = entryRequestTable[entryrequestIndex]
		entryRequestTable[entryrequestIndex].approved = true
		entryRequestTable[entryrequestIndex].approvedBy = sender.name
		entryRequestTable[entryrequestIndex].approvedById = sender.id
		fs.writeFileSync(entryRequestTablePath, JSON.stringify(entryRequestTable))
		//2) send an aproval message to teh person who made the request
		bot.telegram.sendMessage(
			record.requestedById,
			'Entry Request No:' + record.requestNo + ' has been Approved'
		)
	}
	//3) delete the message to signal successful approval
	ctx.deleteMessage()
})

bot.action('forward_request_toGM', async ctx => {
	// get sender info to get the id of the GM
	const sender = await senderInfo(ctx)
	const gmId = sender.gmId
	// parse the txt to get the entry request number
	const entryRequestNo = FindEntryRequestNumber(ctx)
	// find the name of the requester
	let entryRequestTable = JSON.parse(await readFilePro(entryRequestTablePath))
	const entryrequestIndex = entryRequestTable.findIndex(entry => entry.requestNo == entryRequestNo)
	if (entryrequestIndex != -1) {
		const requester = entryRequestTable[entryrequestIndex].requestedBy
		// send the request to the general manager
		await bot.telegram.sendMessage(
			gmId,
			'Entry request from  ' + requester + '\nEntry request No: ' + entryRequestNo,
			{
				reply_markup: {
					inline_keyboard: entry_request_button_to_GM,
				},
			}
		)
		ctx.deleteMessage()
	}
})

bot.command('exit', exitRequest)
async function exitRequest(ctx) {}

bot.command('enter', entryRequest)
async function entryRequest(ctx) {
	const sender = await senderInfo(ctx)
	const time = parseTime(ctx)
	if (time) {
		// record a request entry in the request entry table
		const entryRequestNo = await createEntryRequest(sender, time)
		// send an entry request to the sender hod
		await bot.telegram.sendMessage(
			sender.hodId,
			'Entry request from  ' + sender.name + '\nEntry request No: ' + entryRequestNo,
			{
				reply_markup: {
					inline_keyboard: entry_request_button,
				},
			}
		)
		// send an entry request confirmation to the sender
		ctx.reply(
			'Entry request has been sent to ' + sender.hodName + '\nEntry request No: ' + entryRequestNo
		)
	} else ctx.reply('Error: wrong time format\nExample: /enter 08:00am')
}

async function senderInfo(context) {
	let senderId = ''
	if (context.updateType == 'message') {
		senderId = context.update.message.chat.id
	} else if (context.updateType == 'callback_query') {
		senderId = context.update.callback_query.message.chat.id
	}
	const personals = JSON.parse(await readFilePro(personalTablePath))
	const senderIndex = personals.findIndex(p => p.id == senderId)
	const sender = personals[senderIndex]
	return sender
}

async function createEntryRequest(sender, time) {
	return new Promise(async (resolve, reject) => {
		// create a new entry request record
		requestNo = shortid.generate()
		const record = {
			requestNo,
			requestedBy: sender.name,
			requestedById: sender.id,
			time,
		}
		// open the entry request record table
		const entryRequestTable = JSON.parse(await readFilePro(entryRequestTablePath))
		// add the new request record
		entryRequestTable.push(record)
		// save the the updated table
		fs.writeFileSync(entryRequestTablePath, JSON.stringify(entryRequestTable))
		resolve(requestNo)
	})
}
// promise version implementation of readFile fs module function
function readFilePro(path) {
	return new Promise((resolve, reject) => {
		fs.readFile(path, 'utf8', (err, data) => {
			if (err) reject(err)
			resolve(data)
		})
	})
}

function parseTime(context) {
	const input = context.message.text
	let time = input.match(/\d{1,2}:\d{1,2} ?(am|pm)/g)
	if (time) {
		time = time[0]
		return time
	} else {
		return undefined
	}
}

function FindEntryRequestNumber(context) {
	const text = context.update.callback_query.message.text
	const requestNo = /No: ?([\w\d-_]+)/g.exec(text)[1]
	return requestNo
}

module.exports = bot
