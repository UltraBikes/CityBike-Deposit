function updateStation(stationData) {
  console.log(stationData)
  markers.set(stationData.id, setStationMarkerContent(markers.get(stationData.id), stationData.bikesAvailable, stationData.spacesAvailable+stationData.bikesAvailable));
}

function setStationMarkerContent(marker, bikesAvailable, totalSpaces) {
  var labelContent = '<div class="count">' + bikesAvailable + ' / ' + totalSpaces + '</div>'
  var labelColor = setLabelColorThreeTone(bikesAvailable, totalSpaces)

  marker.icon.fillColor = labelColor
  marker.icon.fillOpacity = 0.3
  marker.labelContent = labelContent

  return marker
}

function setLabelColorThreeTone(bikesAvailable, totalSpaces) {
  var fillRate = (Math.floor(((1-(totalSpaces-bikesAvailable)/totalSpaces))*10))*10
  if (fillRate > 80) {
    var labelColor = '#ff704d'
  } else if (fillRate < 10 || bikesAvailable < 3) {
    var labelColor = '#80ccff'
  } else {
    labelColor = '#ccffcc'
  }
  return labelColor;
}

function getJSON(url, callback) {
  var request = new XMLHttpRequest()
  request.open('GET', url, true)

  request.onreadystatechange = function() {
    if (this.readyState === 4) {
      if (this.status >= 200 && this.status < 400) {
        var data = JSON.parse(this.responseText)
        callback(data)
      }
    }
  }

  request.send()
  request = null
}

function updateMarkers() {
  getJSON('/api/stations', function(data) {
    data.bikeRentalStations.map(updateStation)
  })
}

function ready(fn) {
  if (document.readyState != 'loading'){
    fn()
  } else {
    document.addEventListener('DOMContentLoaded', fn)
  }
}

//ready(updateMarkers)
