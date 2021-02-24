const express = require('express')
const fetch = require('node-fetch')
const app = express()
const port = 3000

const apiKeys = require('./.config/apiKeys')
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.get('/', async (req, res) => {
  const trak4Data = await getTrak4Data()
  const googleData = await getGoogleData(trak4Data)
  res.render('index', {data:{trak4Data,googleData}})
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

function getTrak4Data(){
  console.log("getting data")
  return new Promise((resolve,reject) => {

    fetch('https://gps.trak-4.com/api/v2/',{
      method: 'POST',
      body: JSON.stringify({
        "commandstring": "get_reports_single_device",
        "identifier": "015058000115437",
        "datetime_start": "10/21/2020 00:00:00",
        "datetime_end": "10/21/2021 00:00:00",
        "coredataonly": true,
        "token": apiKeys.trak4Key
    }),
      headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
      if(!data.data[0]){
        console.log("no logs found... :(")
        reject("no logs found... :(")
      }
      console.log(data.data)
      resolve(data.data[data.data.length-269])
    });
  })

}

function getGoogleData(trak4Data){
  return new Promise((resolve,reject) => {
    let query = 'https://maps.googleapis.com/maps/api/geocode/json?latlng='
    query += trak4Data.latitude + ','
    query += trak4Data.longitude
    query += '&key=AIzaSyBXVrtJ0syZ3iGnVBaoVj4PJPFsc7HJbPQ'

    fetch(query,{
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
      console.log("google Data: ", data)
      resolve(data.results[0])
    })
  })
}
