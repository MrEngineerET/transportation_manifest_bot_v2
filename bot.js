const fs = require('fs')
const path = require('path')
const shortid = require('shortid')

const { Telegraf } = require('telegraf')
const bot = new Telegraf(process.env.BOT_TOKEN)

const EntryController = require('./controller/entryController')
const ExitController = require('./controller/ExitController')

// debbuging and to get the users chatID
// bot.use(ctx => {
// 	console.log('-----------------------------')
// 	console.log(ctx.message.chat)
// 	console.log('-----------------------------')
// })
// debbuging end

const helpMessage = `
*Entry/Exit pass Requesting Bot*
/entry \`yyyy-mm-dd hh:mm am/pm  description of reason\` - to get an entry pass
/exit \`yyyy-mm-dd hh:mm am/pm  description of reason\` - 	to get an exit pass
`

bot.help(ctx => {
	bot.telegram.sendMessage(ctx.message.chat.id, helpMessage, {
		parse_mode: 'markdown',
	})
})
bot.start(ctx => {
	bot.telegram.sendMessage(ctx.message.chat.id, helpMessage, {
		parse_mode: 'markdown',
	})
})

entryController = new EntryController(bot)
entryController.entryCommand()
entryController.rejectEntryRequest()
entryController.forwardEntryRequestToGM()
entryController.approveEntryRequest()
entryController.enteredSuccessfuly()

exitController = new ExitController(bot)
exitController.exitCommand()
exitController.exitTransportCommand()
exitController.rejectExitRequest()
exitController.forwardExitRequestToGM()
exitController.approveExitRequest()
exitController.exitedSuccessfuly()

module.exports = bot
