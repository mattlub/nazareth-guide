/* global L XMLHttpRequest */

(function () { // eslint-disable-line

  var TAB_ANIMATION_DURATION = 300

  // bounds for leaflet in format: [south-west, north-east]
  var nazarethBounds = [
    [32.683154, 35.278158],
    [32.723174, 35.341721]
  ]

  var bigIconsMap = {
    food: L.icon({
      iconUrl: './assets/icons/food.png',
      iconSize: [24, 24]
    }),
    'fun-fact': L.icon({
      iconUrl: './assets/icons/fun-fact.png',
      iconSize: [24, 24]
    }),
    history: L.icon({
      iconUrl: './assets/icons/history.png',
      iconSize: [24, 24]
    }),
    information: L.icon({
      iconUrl: './assets/icons/information.png',
      iconSize: [24, 24]
    }),
    nature: L.icon({
      iconUrl: './assets/icons/nature.png',
      iconSize: [24, 24]
    }),
    viewpoint: L.icon({
      iconUrl: './assets/icons/viewpoint.png',
      iconSize: [24, 24]
    })
  }

  var smallIconsMap = {
    food: L.icon({
      iconUrl: './assets/icons-small/food-small.png',
      iconSize: [8, 8]
    }),
    'fun-fact': L.icon({
      iconUrl: './assets/icons-small/fun-fact-small.png',
      iconSize: [8, 8]
    }),
    history: L.icon({
      iconUrl: './assets/icons-small/history-small.png',
      iconSize: [8, 8]
    }),
    information: L.icon({
      iconUrl: './assets/icons-small/information-small.png',
      iconSize: [8, 8]
    }),
    nature: L.icon({
      iconUrl: './assets/icons-small/nature-small.png',
      iconSize: [8, 8]
    }),
    viewpoint: L.icon({
      iconUrl: './assets/icons-small/viewpoint-small.png',
      iconSize: [8, 8]
    })
  }

  function makeRequest (method, url, data, callback) {
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
    if (data) {
      xhr.setRequestHeader('content-type', 'application/json')
      return (xhr.send(JSON.stringify(data)))
    }
    xhr.send()
  }

  // function to close an info tab- currently only works for the x button on the tab, needs to be changed to work for e.g. a drag down action or a click on the map.
  function closeTab (e) {
    // the button's parent node is the slide-up-tab
    e.target.parentNode.classList.remove('visible')
    // timeout to allow animation to happen...
    setTimeout(function () {
      document.body.removeChild(e.target.parentNode)
    }, TAB_ANIMATION_DURATION)
    state.currentView = 'map'
  }

  function createNuggetInfoTab (info) {
    var nuggetInfoTab = document.createElement('div')
    nuggetInfoTab.setAttribute('class', 'slide-up-tab nugget-info-tab info-tab-' + info.category)

    var xButton = document.createElement('i')
    xButton.setAttribute('class', 'slide-up-tab-x-button fa fa-times')
    xButton.setAttribute('aria-hidden', 'true')
    xButton.addEventListener('click', closeTab, {once: true})
    nuggetInfoTab.appendChild(xButton)

    var title = document.createElement('h3')
    title.setAttribute('class', 'nugget-title')
    title.textContent = info.title
    nuggetInfoTab.appendChild(title)

    var author = document.createElement('p')
    author.setAttribute('class', 'nugget-author')
    author.textContent = 'submitted by ' + info.author
    nuggetInfoTab.appendChild(author)

    if (info.img_url) {
      var image = document.createElement('img')
      image.setAttribute('class', 'nugget-image')
      image.setAttribute('src', info.img_url)
      image.setAttribute('alt', info.title)
      nuggetInfoTab.appendChild(image)
    }

    var description = document.createElement('p')
    description.setAttribute('class', 'nugget-description')
    // changed this to innerHTML from textContent, which allows html tags to be rendered. This is only ok because there is no user-submitted content, otherwise this would be a vulnerability.
    description.innerHTML = info.description
    nuggetInfoTab.appendChild(description)

    return nuggetInfoTab
  }

  function displayNuggetInfo (e) {
    if (state.currentView !== 'map') {
      return
    }
    var nuggetInfo = e.target.options
    var infoTab = createNuggetInfoTab(nuggetInfo)
    document.body.appendChild(infoTab)
    // this setTimeout is kind of ridiculous but it is a way to make the scroll up animation happen
    setTimeout(function () {
      infoTab.classList.add('visible')
    }, 50)
    state.currentView = 'infoTab'
  }

  function createMarker (nugget, iconsMap) {
    return L.marker([nugget.lat, nugget.long], {
      id: nugget.id,
      category: nugget.category,
      title: nugget.title,
      description: nugget.description,
      img_url: nugget.img_url,
      author: nugget.author,
      icon: iconsMap[nugget.category]
    })
    .on('click', displayNuggetInfo)
  }

  function createIconsLayer (nuggets, iconsMap) {
  // nuggets is an array of objects which holds the data from the db
    var markers = nuggets.map(function (nugget) {
      return createMarker(nugget, iconsMap)
    })
    return L.layerGroup(markers)
  }

  var mymap = L.map('map', {
    center: [32.699, 35.303],
    zoomControl: false,
    attributionControl: false,
    zoom: 15,
    maxBounds: nazarethBounds,
    minZoom: 13
  })

  L.tileLayer(
    // 'https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic3V1dXVoYSIsImEiOiJjajI2N3QwZm0wMDE1MnFwb3NnYnhwaG55In0.sZgdmc9B4GG9X4Bx5o3NWg',
    'https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}',
    {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      id: 'mapbox.light',
      accessToken: 'pk.eyJ1Ijoia2FyeXVtIiwiYSI6ImNqMjAzNGU4ZjAxa3EycW4xazFxcHZ6a2QifQ.m_dNO1l1sMkM7r4d5nlRRQ'
    }).addTo(mymap)

  // USER LOCATION
  // don't really want to set coordinates here and add to map but I think I have to
  var userLocationMarker
  var userLocationRadius

  var state = {
    hasCreatedLocationMarker: false,
    // currentView has : map, infoTab, formTab, locationSelect
    currentView: 'map'
  }

  function createLocationMarker (latlng) {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: './assets/user-location-icon.png',
        iconSize: [12, 12]
      })
    })
  }

  function onLocationFound (e) {
    var radius = e.accuracy / 2
    var location = e.latlng
    // creates location marker and radius if hasn't already
    if (!state.hasCreatedLocationMarker) {
      userLocationMarker = createLocationMarker(location).addTo(mymap)
      userLocationRadius = L.circle(location, radius).addTo(mymap)
      state.hasCreatedLocationMarker = true
    }
    userLocationMarker.setLatLng(location)
    userLocationRadius.setLatLng(location)
    userLocationRadius.setRadius(radius)
  }

  mymap.on('locationfound', onLocationFound)
  // center on the user's location on initial load
  mymap.locate({setView: true})

  // these variables are undefined until the db results come back
  var smallIconsLayer
  var bigIconsLayer

  makeRequest('GET', '/all-nuggets', null, function (err, nuggets) {
    if (err) {
      // need to improve this
      return err
    }
    smallIconsLayer = createIconsLayer(nuggets, smallIconsMap)
    smallIconsLayer.addTo(mymap)
    bigIconsLayer = createIconsLayer(nuggets, bigIconsMap)
  })

  var displayCorrectIcons = function (e) {
    // small icons if zoomed less than level 15, big icons otherwise
    if (mymap.getZoom() < 15) {
      smallIconsLayer.addTo(mymap)
      bigIconsLayer.removeFrom(mymap)
    } else {
      smallIconsLayer.removeFrom(mymap)
      bigIconsLayer.addTo(mymap)
    }
  }

  // on zoomend is good but not perfect, because can zoom multiple levels before this function will re-run
  mymap.on('zoomend', displayCorrectIcons)

  var centerButton = document.querySelector('.center-button')
  centerButton.addEventListener('click', function (e) {
    // probably want some indication that it's trying to locate in here, because it does take time.
    mymap.locate({setView: true})
  })
})()
