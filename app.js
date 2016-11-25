import _ from 'lodash'
import express from 'express'
import compress from 'compression'

var stationDataByMoment = null
const app = express()
const request = require("request")
const strftime = require('strftime')
const port = process.env.PORT || 3001

app.disable('x-powered-by')
app.use(compress())
app.use(express.static('./public', {maxAge: 10 * 60 * 1000}))

/*
* Define response for frontend request "get('/api/station')"
*/
app.get('/api/stations', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=10')
  res.send(stationDataByMoment)
})

/**
* Get data of stations by datetime
*
* Fetches json containing data from all the stations at given datetime
* Converts json format
* Saves results to global varible "stationDataByMoment"
*
* params: datetime "2016-07-04T08:15:01"
*/
function getStationDataFromServer(date) {
  var urlDate = strftime('%Y%m%dT%H%M01Z', date);
  var url = "http://juhapekm.users.cs.helsinki.fi/citybikes/stations_"+urlDate
  console.log(url)
  request({
      url: url,
      json: true
  }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
          var stationIndexArray = numberOfRecordsInJson(body, 'result');
          var stationObjectArray = [];
          stationIndexArray.forEach(function(value) {
            stationObjectArray.push(body['result'][value]);
          });
          var stationObjectQueryTypeArray = [];
          stationObjectArray.forEach(function(stationObject) {
            stationObjectQueryTypeArray.push(reformatStationJson(stationObject))
          });
          var result = {bikeRentalStations: stationObjectQueryTypeArray}
          stationDataByMoment = result;
      }
  })
}
/**
* Get number of records in a json
*
* For example this json:
* {"employees":[
*   {"firstName":"John", "lastName":"Doe"},
*   {"firstName":"Anna", "lastName":"Smith"},
*   {"firstName":"Peter", "lastName":"Jones"}
* ]}
* has key "employees" and 3 records
*/
function numberOfRecordsInJson(jsonObject, key) {
  return Object.keys(jsonObject[key]);
}

/**
* Reformat stationData json because live data is different than history data
*/
function reformatStationJson(stationObject) {
  var stationObjectQueryType =(
    {id: stationObject['name'],
    name: stationObject['name'].substring(4),
    lat: parseFloat(stationObject['coordinates'].split(",")[0]),
    lon: parseFloat(stationObject['coordinates'].split(",")[1]),
    bikesAvailable: stationObject['avl_bikes'],
    spacesAvailable: stationObject['free_slots']}
  );
  return stationObjectQueryType;
}

/* Gets data of stations repeatedly
* Increments datetime by 10 minutes between function calls
*/
var i = 1;
function repeatedStationInfoGetter() {
  var initDate = new Date("2016-07-04T08:15:01")
  var deltaMillisec = 10*60*1000;
  getStationDataFromServer(new Date(initDate.getTime() + deltaMillisec*i));
  i = i+1;
}

app.listen(port, () => {
  console.log(`Kaupunkifillarit.fi listening on *:${port}`)
  setInterval(repeatedStationInfoGetter, 2 * 1000);
  console.log('App running! Check http://localhost:3001/');
})
