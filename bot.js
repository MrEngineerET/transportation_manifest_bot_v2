const { TIMEOUT } = require('dns')
const fs = require('fs')
const path = require('path')
const shortid = require('shortid')

const { Telegraf } = require('telegraf')

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

const bot = new Telegraf(process.env.BOT_TOKEN)

bot.command('enter', entryRequest)

bot.command('exit', exitRequest)

async function exitRequest(ctx) {}

async function entryRequest(ctx) {
	const sender = await senderInfo(ctx)
	// debug
	console.log(sender)
	// debug end
	const time = parseTime(ctx)
	if (time) {
		// record a request entry in the request entry table
		const entryRequestNo = await createEntryRequest(sender, time)
		// send an entry request to the sender hod
		await bot.telegram.sendMessage(
			sender.hodId,
			'Entry request from Name: ' + sender.name + '\nEntry request No: ' + entryRequestNo,
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
	const senderId = context.update.message.chat.id
	const personals = JSON.parse(await readFilePro(path.join(__dirname, 'dev_data', 'personal.json')))
	const senderIndex = personals.findIndex(p => p.id == senderId)
	const sender = personals[senderIndex]
	return sender
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
		const entryRequestTable = JSON.parse(
			await readFilePro(path.join(__dirname, 'dev_data', 'entryRequest.json'))
		)
		// add the new request record
		entryRequestTable.push(record)
		// save the the updated table
		fs.writeFileSync(
			path.join(__dirname, 'dev_data', 'entryRequest.json'),
			JSON.stringify(entryRequestTable)
		)
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

function parseIDandName(text) {
	const staffId = /ID:(-?\d+)/g.exec(text)[1]
	const staffName = /Name: ?(\w+) (\w+)/g.exec(text).slice(1, 3).join(' ')
	return { staffId, staffName }
}

module.exports = bot
