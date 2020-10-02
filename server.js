require('dotenv').config({
	path: './config.env',
})
var schedule = require('node-schedule')

const bot = require('./bot')
const sendReport = require('./reporter')

// one a day at 07:00pm an entry exit report will be emailed
var j = schedule.scheduleJob('* 17 * * *', sendReport)

bot.launch()
