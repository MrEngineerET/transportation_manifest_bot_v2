const fs = require('fs')
const path = require('path')
const shortid = require('shortid')

const button = require('./button')
const util = require('./util')

// file path for the entryRequest.json and personal.json files
const entryRequestTablePath = path.join(__dirname, '..', 'dev_data', 'entryRequest.json')
const personalTablePath = path.join(__dirname, '..', 'dev_data', 'personal.json')

module.exports = class EntryContoller {
	constructor(bot) {
		this.bot = bot
	}
	entryCommand = function () {
		this.bot.command('entry', async ctx => {
			try {
				const sender = await util.senderInfo(ctx)
				const time = util.parseTime(ctx)
				const description = util.parseDescription(ctx)
				if (time && description) {
					// record a request entry in the request entry table
					const entryRequestNo = await createEntryRequest(sender, time, description)
					// send an entry request to the sender hod
					const message =
						'Entry request from  ' +
						sender.name +
						'\nReason: ' +
						description +
						'\nEntry request No: ' +
						entryRequestNo
					const image = sender.image
					if (image.includes('jpg'))
						util.sendMessageWithPhoto(
							this.bot,
							sender.hodId,
							image,
							message,
							button.entry_request_button
						)
					else util.sendMessage(this.bot, sender.hodId, message, button.entry_request_button)
					// send an entry request confirmation to the sender
					ctx.reply(
						'Entry request has been sent to ' +
							sender.hodName +
							'\nEntry request No: ' +
							entryRequestNo
					)
				} else {
					const helpMessage = `
*Entry/Exit pass Requesting Bot*
/entry \`yyyy-mm-dd hh:mm am/pm  description of reason\` - to get an entry pass
/exit \`yyyy-mm-dd hh:mm am/pm  description of reason\` - 	to get an exit pass
`
					this.bot.telegram.sendMessage(ctx.message.chat.id, helpMessage, {
						parse_mode: 'markdown',
					})
				}
			} catch (err) {
				console.log(err)
			}
		})
	}

	rejectEntryRequest = function () {
		this.bot.action('reject_entry_request', async ctx => {
			try {
				//1) delete the request entry record from entryRequest.json
				let entryRequestTable = JSON.parse(await util.readFilePro(entryRequestTablePath))
				const entryRequestNo = util.parseForRequestNo(ctx)
				const entryrequestIndex = entryRequestTable.findIndex(
					entry => entry.requestNo == entryRequestNo
				)
				const record = entryRequestTable[entryrequestIndex]
				//2)send a rejection message to the person who made the request
				await this.bot.telegram.sendMessage(
					record.requestedById,
					'Entry Request No:' + record.requestNo + ' is NOT Approved'
				)
				//3) delete the message to signal completion
				ctx.deleteMessage()
			} catch (err) {
				console.log(err)
			}
		})
	}
	forwardEntryRequestToGM = function () {
		this.bot.action('forward_entry_request_toGM', async ctx => {
			try {
				// get sender info to get the id of the GM
				const sender = await util.senderInfo(ctx)
				const gmId = sender.gmId
				// parse the txt to get the entry request number
				const entryRequestNo = util.parseForRequestNo(ctx)
				// find the name of the requester
				let entryRequestTable = JSON.parse(await util.readFilePro(entryRequestTablePath))
				const entryrequestIndex = entryRequestTable.findIndex(
					entry => entry.requestNo == entryRequestNo
				)
				if (entryrequestIndex != -1) {
					const requester = entryRequestTable[entryrequestIndex].requestedBy
					const description = entryRequestTable[entryrequestIndex].description
					// send the request to the general manager
					// await this.bot.telegram.sendMessage(
					// 	gmId,
					// 	'Entry request from  ' + requester + '\nEntry request No: ' + entryRequestNo,
					// 	{
					// 		reply_markup: {
					// 			inline_keyboard: button.entry_request_button_to_GM,
					// 		},
					// 	}
					// )
					//--------------------------------------
					const message =
						'Entry request from  ' +
						requester +
						'\nReason: ' +
						description +
						'\nEntry request No: ' +
						entryRequestNo
					const image = entryRequestTable[entryrequestIndex].image
					if (image.includes('jpg'))
						util.sendMessageWithPhoto(
							this.bot,
							gmId,
							image,
							message,
							button.entry_request_button_to_GM
						)
					else util.sendMessage(this.bot, gmId, message, button.entry_request_button_to_GM)
					//--------------------------------------

					// signaling successful completion
					ctx.deleteMessage()
				}
			} catch (err) {
				console.log(err)
			}
		})
	}

	approveEntryRequest = function () {
		this.bot.action('approve_entry_request', async ctx => {
			try {
				//1) update the entryRequest.json approved and approvedBy column
				let entryRequestTable = JSON.parse(await util.readFilePro(entryRequestTablePath))
				const entryRequestNo = util.parseForRequestNo(ctx)
				const entryrequestIndex = entryRequestTable.findIndex(
					entry => entry.requestNo == entryRequestNo
				)
				if (entryrequestIndex != -1) {
					const sender = await util.senderInfo(ctx)
					const record = entryRequestTable[entryrequestIndex]
					entryRequestTable[entryrequestIndex].approved = true
					entryRequestTable[entryrequestIndex].approvedBy = sender.name
					entryRequestTable[entryrequestIndex].approvedById = sender.id
					fs.writeFileSync(entryRequestTablePath, JSON.stringify(entryRequestTable))
					//2) send an approval message to the person who made the request
					await this.bot.telegram.sendMessage(
						record.requestedById,
						'Entry Request No:' + record.requestNo + ' has been Approved'
					)
					//3) delete the message to signal successful approval
					ctx.deleteMessage()
					//4) forward a succesful entry pass
					forwardToSecurity(this.bot, sender.securityId, entryRequestNo)
				}
			} catch (err) {
				console.log(err)
			}
		})
	}

	enteredSuccessfuly = function () {
		this.bot.action('entred_successfuly', async ctx => {
			try {
				// find out the time this request is made
				let [hour, minute] = new Date().toLocaleTimeString().slice(0, 7).split(':')
				hour = hour * 1 + 4
				const time = `${hour}:${minute}`
				// read entry request table
				const entryRequestTable = JSON.parse(await util.readFilePro(entryRequestTablePath))
				// update the request record by adding arrivalTime
				const entryRequestNo = util.parseForRequestNo(ctx)
				const entryrequestIndex = entryRequestTable.findIndex(
					record => record.requestNo == entryRequestNo
				)
				entryRequestTable[entryrequestIndex].arrivalTime = time
				// write the new updated table
				fs.writeFileSync(entryRequestTablePath, JSON.stringify(entryRequestTable))
				ctx.deleteMessage()
			} catch (err) {
				console.log(err)
			}
		})
	}
}

async function createEntryRequest(sender, time, description) {
	try {
		return new Promise(async (resolve, reject) => {
			// create a new entry request record
			if (!sender) reject(new Error('outside of staff'))
			requestNo = shortid.generate()
			const record = {
				requestNo,
				requestedBy: sender.name,
				requestedById: sender.id,
				time,
				reported: false,
				description,
				image: sender.image,
			}
			// open the entry request record table
			const entryRequestTable = JSON.parse(await util.readFilePro(entryRequestTablePath))
			// add the new request record
			entryRequestTable.push(record)
			// save the the updated table
			fs.writeFileSync(entryRequestTablePath, JSON.stringify(entryRequestTable))
			resolve(requestNo)
		})
	} catch (err) {
		console.log(err)
	}
}
async function forwardToSecurity(bot, security_id, entryRequestNo) {
	try {
		// read the entryRequest.json file to get the entry request record
		const entryRequestTable = JSON.parse(await util.readFilePro(entryRequestTablePath))
		const entryrequestIndex = entryRequestTable.findIndex(
			entry => entry.requestNo == entryRequestNo
		)
		const record = entryRequestTable[entryrequestIndex]

		// get the photo of the personal
		const personalTable = JSON.parse(await util.readFilePro(personalTablePath))
		const personal = personalTable[personalTable.findIndex(p => p.id == record.requestedById)]
		const image = personal.image
		const name = 'Name: ' + personal.name + '\nRequest : Entry' + '\nRequest No: ' + entryRequestNo
		// send entry pass to security
		if (image.includes('jpg'))
			util.sendMessageWithPhoto(bot, security_id, image, name, button.security_enter_button)
		else util.sendMessage(bot, security_id, name, button.security_enter_button)
	} catch (err) {
		console.log(err)
	}
}
