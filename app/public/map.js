/* global L XMLHttpRequest */

var nazarethNuggets = (function () { // eslint-disable-line

  function generateMockNuggets (quantity, categories, latBounds, lngBounds) {
    var nuggets = []
    for (var i = 0; i < quantity; i++) {
      nuggets.push({
        id: i,
        category: categories[Math.floor(Math.random() * categories.length)],
        lat: latBounds[0] + (Math.random() * (latBounds[1] - latBounds[0])),
        long: lngBounds[0] + (Math.random() * (lngBounds[1] - lngBounds[0]))
      })
    }
    return nuggets
  }

  function requestNuggets (method, url, callback) {
    var xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var response = JSON.parse(xhr.responseText)
        callback(null, response)
      }
      if (xhr.status === 500) {
        callback(new Error('Status code:' + xhr.status))
      }
    }
    xhr.open(method, url)
    xhr.send()
  }

  var icons = {
    food: L.icon({
      iconUrl: './assets/food.png',
      iconSize: [24, 24]
    }),
    nature: L.icon({
      iconUrl: './assets/leaf.png',
      iconSize: [24, 24]
    })
  }

  function addIconsToMap (nuggets) {
  // nuggets is an array of objects which holds the data from the db
    nuggets.forEach(function (nugget) {
      // for each nugget we want to make a marker and put it on the map

      L.marker([nugget.lat, nugget.long], {
        id: nugget.id,
        category: nugget.category,
        title: nugget.title,
        description: nugget.description,
        img_url: nugget.img_url,
        author: nugget.author,
        icon: icons[nugget.category]
      })
      .on('click', function (e) {
        // to be implemented
        console.log(e.target.options)
      })
      .addTo(mymap)
    })
  }

  var mymap = L.map('map', {
    center: [32.699, 35.303],
    zoomControl: false,
    attributionControl: false,
    zoom: 15,
    maxBounds: [
      // bounds for nazareth
      [32.683154, 35.278158],
      [32.723174, 35.341721]
    ],
    minZoom: 13
  })

  L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic3V1dXVoYSIsImEiOiJjajI2N3QwZm0wMDE1MnFwb3NnYnhwaG55In0.sZgdmc9B4GG9X4Bx5o3NWg', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.light',
    accessToken: 'pk.eyJ1Ijoia2FyeXVtIiwiYSI6ImNqMjAzNGU4ZjAxa3EycW4xazFxcHZ6a2QifQ.m_dNO1l1sMkM7r4d5nlRRQ'
  }).addTo(mymap)

  // mymap.locate({setView: true})

  function onLocationFound (e) {
    var radius = e.accuracy / 2
    L.marker(e.latlng).addTo(mymap)
    L.circle(e.latlng, radius).addTo(mymap)
  }

  mymap.on('locationfound', onLocationFound)

  var nuggets = generateMockNuggets(
    100,
    ['food', 'nature'],
    [32.683154, 32.723174],
    [35.278158, 35.341721]
  )

  console.log(nuggets)

  requestNuggets('GET', '/all-nuggets', function (err, res) {
    if (err) {
      return err
    }
    console.log(res)
  })

  var zoomLevel = 13

  mymap.on('zoomstart', function () {
    console.log('zoomstart event')

    zoomLevel = mymap.getZoom()
    console.log('zoom variable: ' + zoomLevel)
  })

  addIconsToMap(nuggets)

  var centerButton = document.querySelector('.center-button')
  centerButton.addEventListener('click', function (e) {
    mymap.locate({setView: true})
  })
})()
