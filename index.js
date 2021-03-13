const express = require('express')
const fetch = require('node-fetch')
const app = express()
const port = 8080
const fs = require('fs')

const apiKeys = require('./.config/apiKeys')
app.set('view engine', 'ejs')
app.set('trust proxy', true)
app.use(express.static(__dirname + '/public'))

app.get('/', async (req, res) => {
	try {
		const trak4Data = await getTrak4Data()
		const googleData = await getGoogleData(trak4Data)
		res.render('index', {data:{trak4Data,googleData}, googleAPIKey: apiKeys.googleAPIKey})
		log(req, 'success')
	} catch(e){
		console.log(e)
		res.render('error')
		log(req, 'error')
	}
})

app.listen(port, () => {
	console.log(`App listening at port: ${port}`)
})


function getTrak4Data(){
	return new Promise((resolve,reject) => {

		const now = new Date()
		const yesterday = new Date(now.getTime() - (86400000*2) )
		now.setTime(now.getTime() + 86400000)

		try {
			fetch('https://gps.trak-4.com/api/v2/',{
				method: 'POST',
				body: JSON.stringify({
					'commandstring': 'get_reports_single_device',
					'identifier': '015058000115437',
					'datetime_start':  dateToTrak4Date(yesterday),
					'datetime_end': dateToTrak4Date(now),
					'coredataonly': true,
					'token': apiKeys.trak4Key
				}),
				headers: { 'Content-Type': 'application/json' }
			})
				.then(response => response.json())
				.then(data => {
					if(!data.data || !data.data[0]){
						return reject('no logs found...', data)
					}
					resolve(data.data[0])
				})
		} catch (e) {
			reject(e)
		}
	})
}

function getGoogleData(trak4Data){
	return new Promise((resolve,reject) => {
		try {
			let query = 'https://maps.googleapis.com/maps/api/geocode/json?latlng='
			query += trak4Data.latitude + ','
			query += trak4Data.longitude
			query += `&key=${apiKeys.googleAPIKey}`
			fetch(query,{
				method: 'GET',
				headers: { 'Content-Type': 'application/json' }
			})
				.then(response => response.json())
				.then(data => {
					if(!data.results){
						console.log('something went wrong with google fetch:', data)
						return reject(data)
					}
					resolve(data.results[0])
				})
		} catch(e){
			reject('google fetch error')
		}
	})
}

function dateToTrak4Date(d){
	return`${('0' + (d.getMonth() + 1)).slice(-2)}/` +
    `${('0' + (d.getDate())).slice(-2)}/` +
    `${d.getFullYear()} ` +
    `${('0' + (d.getHours())).slice(-2)}:` +
    `${('0' + (d.getMinutes())).slice(-2)}:` +
    `${('0' + (d.getSeconds())).slice(-2)}`
}

function log(req, msg){
	const d = new Date()
	let line = `${req.ip},${msg},${d.getTime()},${d.toTimeString()}\n`
	fs.appendFile('access_log.csv', line, function (err) {
		if (err) throw err
	})
}
