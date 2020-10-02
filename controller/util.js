// promise version implementation of readFile fs module function
const fs = require('fs')
const path = require('path')
const personalTablePath = path.join(__dirname, '..', 'dev_data', 'personal.json')

function readFilePro(path) {
	try {
		return new Promise((resolve, reject) => {
			fs.readFile(path, 'utf8', (err, data) => {
				if (err) reject(err)
				resolve(data)
			})
		})
	} catch (err) {
		console.log(err)
	}
}
function parseForRequestNo(context) {
	let text = context.update.callback_query.message.text
	if (!text) text = context.update.callback_query.message.caption
	const requestNo = /No: ?([\w\d-_]+)/g.exec(text)[1]
	return requestNo
}

async function senderInfo(context) {
	try {
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
	} catch (err) {
		console.log(err)
	}
}

async function sendMessage(bot, chat_id, message, btn) {
	try {
		if (!btn) bot.telegram.sendMessage(chat_id, message)
		else
			await bot.telegram.sendMessage(chat_id, message, {
				reply_markup: {
					inline_keyboard: btn,
				},
			})
	} catch (err) {
		console.log(err)
	}
}
async function sendMessageWithPhoto(bot, chat_id, photo, caption, btn) {
	try {
		if (!btn)
			await bot.telegram.sendPhoto(
				chat_id,
				{ source: photo },
				{
					caption: caption,
				}
			)
		else
			await bot.telegram.sendPhoto(
				chat_id,
				{ source: photo },
				{
					caption: caption,
					reply_markup: {
						inline_keyboard: btn,
					},
				}
			)
	} catch (err) {
		console.log(err)
	}
}

function parseTime(context) {
	const input = context.message.text
	let time = input.match(/\d{4}-\d{1,2}-\d{1,2}\s+\d{1,2}:\d{1,2} ?(am|pm)/g)
	if (time) {
		time = time[0]
		return time
	} else {
		return undefined
	}
}
function parseDescription(context) {
	const input = context.message.text
	let match = /\d{4}-\d{1,2}-\d{1,2}\s+\d{1,2}:\d{1,2} ?(am|pm)\s+(.*)/.exec(input)
	if (match[2]) {
		return match[2]
	} else {
		return undefined
	}
}

module.exports = {
	readFilePro,
	senderInfo,
	parseTime,
	sendMessageWithPhoto,
	sendMessage,
	parseForRequestNo,
	readFilePro,
	parseDescription,
}
