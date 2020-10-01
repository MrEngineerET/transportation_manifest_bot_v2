const fs = require('fs')
const path = require('path')
const shortid = require('shortid')

const { Telegraf } = require('telegraf')
const bot = new Telegraf(process.env.BOT_TOKEN)

const EntryController = require('./controller/entryController')

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
entryController.enteredSuccessfuly()
entryController.rejectEntryRequest()
entryController.approveEntryRequest()
entryController.forwardEntryRequestToGM()
entryController.enterCommand()

module.exports = bot
