const express = require('express')
const fetch = require('node-fetch')
const app = express()
const port = 3000

const apiKeys = require('./.config/apiKeys')
console.log(apiKeys)
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.get('/', async (req, res) => {
  const data = await getData();
  res.render('index', {data})
})

//app.use(express.static('views'))

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

function getData(){
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
      resolve(data.data[0])
    });
  })

}
