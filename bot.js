const fs = require('fs')
const path = require('path')
const shortid = require('shortid')

const { Telegraf } = require('telegraf')
const bot = new Telegraf(process.env.BOT_TOKEN)

const EntryController = require('./controller/EntryController')
const ExitController = require('./controller/ExitController')

// debbuging and to get the users chatID
// bot.use(ctx => {
// 	console.log(ctx.message)
// 	console.log('-----------------------------')
// 	console.log(ctx)
// })
// debbuging end

const helpMessage = `
*Entry/Exit pass Requesting Bot*
/entry \`yyyy/mm/dd hh:mm am/pm\` - to get an entry pass
/exit \`yyyy/mm/dd hh:mm am/pm\` - 	to get an exit pass
`

bot.help(ctx => {
	bot.telegram.sendMessage(ctx.from.id, helpMessage, {
		parse_mode: 'markdown',
	})
})
bot.start(ctx => {
	bot.telegram.sendMessage(ctx.from.id, helpMessage, {
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
exitController.rejectExitRequest()
exitController.forwardExitRequestToGM()
exitController.approveExitRequest()
exitController.exitedSuccessfuly()

module.exports = bot
