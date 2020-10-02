const fs = require('fs')
const path = require('path')
const shortid = require('shortid')

const button = require('./button')
const util = require('./util')

// file path for the entryRequest.json and personal.json files
const exitRequestTablePath = path.join(__dirname, '..', 'dev_data', 'exitRequest.json')
const personalTablePath = path.join(__dirname, '..', 'dev_data', 'personal.json')

module.exports = class ExitController {
	constructor(bot) {
		this.bot = bot
	}

	exitCommand = function () {
		this.bot.command('exit', async ctx => {
			try {
				const sender = await util.senderInfo(ctx)
				const time = util.parseTime(ctx)
				const description = util.parseDescription(ctx)
				if (time) {
					// record a request exit in the request exit table
					const exitRequestNo = await createExitRequest(sender, time, false, description)
					// send an exit request to the sender hod
					// await this.bot.telegram.sendMessage(
					// 	sender.hodId,
					// 	'Exit request from  ' + sender.name + '\nExit request No: ' + exitRequestNo,
					// 	{
					// 		reply_markup: {
					// 			inline_keyboard: button.exit_request_button,
					// 		},
					// 	}
					// )
					//--------------------------------------
					const message =
						'Exit request from  ' +
						sender.name +
						'\nReason: ' +
						description +
						'\nExit request No: ' +
						exitRequestNo
					const image = sender.image
					if (image.includes('jpg'))
						util.sendMessageWithPhoto(
							this.bot,
							sender.hodId,
							image,
							message,
							button.exit_request_button
						)
					else util.sendMessage(this.bot, sender.hodId, message, button.exit_request_button)
					//--------------------------------------
					// send an exit request confirmation to the sender
					ctx.reply(
						'Exit request has been sent to ' +
							sender.hodName +
							'\nExit request No: ' +
							exitRequestNo
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

	exitTransportCommand = function () {
		this.bot.command('exitT', async ctx => {
			try {
				const sender = await util.senderInfo(ctx)
				const time = util.parseTime(ctx)
				const description = util.parseDescription(ctx)
				if (time) {
					// record a request exit in the request exit table
					const exitRequestNo = await createExitRequest(sender, time, true, description)
					// send an exit request to the sender hod
					// await this.bot.telegram.sendMessage(
					// 	sender.hodId,
					// 	'Exit request from  ' + sender.name + '\nExit request No: ' + exitRequestNo,
					// 	{
					// 		reply_markup: {
					// 			inline_keyboard: button.exit_request_button,
					// 		},
					// 	}
					// )
					//-----------------------------------------------------
					const message =
						'Exit request from  ' +
						sender.name +
						'\nReason: ' +
						description +
						'\nExit request No: ' +
						exitRequestNo
					const image = sender.image
					if (image.includes('jpg'))
						util.sendMessageWithPhoto(
							this.bot,
							sender.hodId,
							image,
							message,
							button.exit_request_button
						)
					else util.sendMessage(this.bot, sender.hodId, message, button.exit_request_button)
					//-----------------------------------------------------
					// send an exit request confirmation to the sender
					ctx.reply(
						'Exit request has been sent to ' +
							sender.hodName +
							'\nExit request No: ' +
							exitRequestNo
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

	rejectExitRequest = function () {
		this.bot.action('reject_exit_request', async ctx => {
			try {
				//1) delete the request exit record from entryRequest.json
				let exitRequestTable = JSON.parse(await util.readFilePro(exitRequestTablePath))
				const exitRequestNo = util.parseForRequestNo(ctx)
				const exitRequestIndex = exitRequestTable.findIndex(exit => exit.requestNo == exitRequestNo)
				const record = exitRequestTable[exitRequestIndex]
				//2)send a rejection message to the person who made the request
				await this.bot.telegram.sendMessage(
					record.requestedById,
					'Exit Request No:' + record.requestNo + ' is NOT Approved'
				)
				//3) delete the message to signal completion
				ctx.deleteMessage()
			} catch (err) {
				console.log(err)
			}
		})
	}
	forwardExitRequestToGM = function () {
		this.bot.action('forward_exit_request_toGM', async ctx => {
			try {
				// get sender info to get the id of the GM
				const sender = await util.senderInfo(ctx)
				const gmId = sender.gmId
				// parse the txt to get the exit request number
				const exitRequestNo = util.parseForRequestNo(ctx)
				// find the name of the requester
				let exitRequestTable = JSON.parse(await util.readFilePro(exitRequestTablePath))
				const exitRequestIndex = exitRequestTable.findIndex(exit => exit.requestNo == exitRequestNo)
				if (exitRequestIndex != -1) {
					const requester = exitRequestTable[exitRequestIndex].requestedBy
					const description = exitRequestTable[exitRequestIndex].description
					// send the request to the general manager
					// await this.bot.telegram.sendMessage(
					// 	gmId,
					// 	'Exit request from  ' + requester + '\nExit request No: ' + exitRequestNo,
					// 	{
					// 		reply_markup: {
					// 			inline_keyboard: button.exit_request_button_to_GM,
					// 		},
					// 	}
					// )
					//----------------------------------------------------
					const message =
						'Exit request from  ' +
						requester +
						'\nReason: ' +
						description +
						'\nExit request No: ' +
						exitRequestNo
					const image = exitRequestTable[exitRequestIndex].image
					if (image.includes('jpg'))
						util.sendMessageWithPhoto(
							this.bot,
							gmId,
							image,
							message,
							button.exit_request_button_to_GM
						)
					else util.sendMessage(this.bot, gmId, message, button.exit_request_button_to_GM)
					//----------------------------------------------------
					// signaling successful completion
					ctx.deleteMessage()
				}
			} catch (err) {
				console.log(err)
			}
		})
	}

	approveExitRequest = function () {
		this.bot.action('approve_exit_request', async ctx => {
			try {
				//1) update the entryRequest.json approved and approvedBy column
				let exitRequestTable = JSON.parse(await util.readFilePro(exitRequestTablePath))
				const exitRequestNo = util.parseForRequestNo(ctx)
				const exitRequestIndex = exitRequestTable.findIndex(exit => exit.requestNo == exitRequestNo)
				if (exitRequestIndex != -1) {
					const sender = await util.senderInfo(ctx)
					const record = exitRequestTable[exitRequestIndex]
					exitRequestTable[exitRequestIndex].approved = true
					exitRequestTable[exitRequestIndex].approvedBy = sender.name
					exitRequestTable[exitRequestIndex].approvedById = sender.id
					fs.writeFileSync(exitRequestTablePath, JSON.stringify(exitRequestTable))
					//2) send an approval message to the person who made the request
					await this.bot.telegram.sendMessage(
						record.requestedById,
						'Exit Request No:' + record.requestNo + ' has been Approved'
					)
					//3) delete the message to signal successful approval
					ctx.deleteMessage()
					//4) forward a succesful exit pass to a security or capitain
					if (record.transport) forwardToSecurity(this.bot, sender.capitainId, exitRequestNo)
					else forwardToSecurity(this.bot, sender.securityId, exitRequestNo)
				}
			} catch (err) {
				console.log(err)
			}
		})
	}

	exitedSuccessfuly = function () {
		this.bot.action('exited_successfuly', async ctx => {
			try {
				// find out the time this request is made
				let [hour, minute] = new Date().toLocaleTimeString().slice(0, 7).split(':')
				hour = hour * 1 + 4
				const time = `${hour}:${minute}`
				// read exit request table
				const exitRequestTable = JSON.parse(await util.readFilePro(exitRequestTablePath))
				// update the request record by adding arrivalTime
				const exitRequestNo = util.parseForRequestNo(ctx)
				const exitRequestIndex = exitRequestTable.findIndex(
					record => record.requestNo == exitRequestNo
				)
				exitRequestTable[exitRequestIndex].exitedTime = time
				// write the new updated table
				fs.writeFileSync(exitRequestTablePath, JSON.stringify(exitRequestTable))
				ctx.deleteMessage()
			} catch (err) {
				console.log(err)
			}
		})
	}
}

async function createExitRequest(sender, time, transport, description) {
	try {
		return new Promise(async (resolve, reject) => {
			// create a new exit request record
			requestNo = shortid.generate()
			const record = {
				requestNo,
				requestedBy: sender.name,
				requestedById: sender.id,
				time,
				transport,
				reported: false,
				description,
				image: sender.image,
			}
			// open the exit request record table
			const exitRequestTable = JSON.parse(await util.readFilePro(exitRequestTablePath))
			// add the new request record
			exitRequestTable.push(record)
			// save the the updated table
			fs.writeFileSync(exitRequestTablePath, JSON.stringify(exitRequestTable))
			resolve(requestNo)
		})
	} catch (err) {
		console.log(err)
	}
}
async function forwardToSecurity(bot, security_id, exitRequestNo) {
	try {
		// read the entryRequest.json file to get the exit request record
		const exitRequestTable = JSON.parse(await util.readFilePro(exitRequestTablePath))
		const exitRequestIndex = exitRequestTable.findIndex(exit => exit.requestNo == exitRequestNo)
		const record = exitRequestTable[exitRequestIndex]

		// get the photo of the personal
		const personalTable = JSON.parse(await util.readFilePro(personalTablePath))
		const personal = personalTable[personalTable.findIndex(p => p.id == record.requestedById)]
		const image = personal.image
		const name = 'Name: ' + personal.name + '\nRequest : Exit' + '\nRequest No: ' + exitRequestNo
		// send exit pass to security
		if (image.includes('jpg'))
			util.sendMessageWithPhoto(bot, security_id, image, name, button.security_exit_button)
		else util.sendMessage(bot, security_id, name, button.security_exit_button)
	} catch (err) {
		console.log(err)
	}
}
