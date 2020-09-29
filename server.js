require('dotenv').config({
	path: './config.env',
})

const bot = require('./bot')

bot.launch()
