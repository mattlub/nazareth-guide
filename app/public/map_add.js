/* global L XMLHttpRequest */

(function () { // eslint-disable-line

  var TAB_ANIMATION_DURATION = 300

  var state = {
    hasCreatedLocationMarker: false,
    // currentView has : map, infoTab
    currentView: 'map'
  }

  // bounds for leaflet in format: [south-west, north-east]
  var nazarethBounds = [
    [32.683154, 35.278158],
    [32.723174, 35.341721]
  ]

  var categories = [
    'cafe',
    'food',
    'guesthouse',
    'history',
    'information',
    'nature',
    'parking',
    'shopping',
    'viewpoint'
  ]

  var userLocationMarker
  var userLocationRadius

  // icons map are used to create icons for markers
  var bigIconsMap = {}
  var smallIconsMap = {}

  var bigIconsLayer, smallIconsLayer

  categories.forEach(function (category) {
    var bigIconPath = './assets/icons/' + category + '.png'
    var smallIconPath = './assets/icons-small/' + category + '-small.png'
    bigIconsMap[category] = L.icon({
      iconUrl: bigIconPath,
      iconSize: [24, 24]
    })
    smallIconsMap[category] = L.icon({
      iconUrl: smallIconPath,
      iconSize: [8, 8]
    })
  })

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

  // USER LOCATION
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

  function displayCorrectIcons (e) {
    // small icons if zoomed less than level 15, big icons otherwise
    if (mymap.getZoom() < 15) {
      smallIconsLayer.addTo(mymap)
      bigIconsLayer.removeFrom(mymap)
    } else {
      smallIconsLayer.removeFrom(mymap)
      bigIconsLayer.addTo(mymap)
    }
  }

  // INITIALISE MAP
  var mymap = L.map('map', {
    center: [32.699, 35.303],
    zoomControl: false,
    attributionControl: false,
    zoom: 15,
    maxBounds: nazarethBounds,
    minZoom: 13
  })

  mymap.on('click', function(e) {
    console.log(e.latlng.lat, e.latlng.lng);
  })

  L.tileLayer(
    // 'https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic3V1dXVoYSIsImEiOiJjajI2N3QwZm0wMDE1MnFwb3NnYnhwaG55In0.sZgdmc9B4GG9X4Bx5o3NWg',
    'https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}',
    {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      id: 'mapbox.light',
      accessToken: 'pk.eyJ1Ijoia2FyeXVtIiwiYSI6ImNqMjAzNGU4ZjAxa3EycW4xazFxcHZ6a2QifQ.m_dNO1l1sMkM7r4d5nlRRQ'
    }).addTo(mymap)

  // center on the user's location on initial load
  mymap.on('locationfound', onLocationFound)
  // on zoomend is good but not perfect, because can zoom multiple levels before this function will re-run
  mymap.on('zoomend', displayCorrectIcons)

  // get nuggets and locate user
  makeRequest('GET', '/all-nuggets', null, function (err, nuggets) {
    if (err) {
      // need to improve this
      return err
    }
    smallIconsLayer = createIconsLayer(nuggets, smallIconsMap)
    smallIconsLayer.addTo(mymap)
    bigIconsLayer = createIconsLayer(nuggets, bigIconsMap)
  })
  mymap.locate({setView: true})

  // add listeners to buttons
  var centerButton = document.querySelector('.center-button')
  centerButton.addEventListener('click', function (e) {
    // probably want some indication that it's trying to locate in here, because it does take time.
    mymap.locate({setView: true})
  })

  var form = document.querySelector('.add-nugget-form')

  // to be able to add pins
  var addNuggetButton = document.querySelector('.add-nugget-button')

  var locationSelectDisplay = document.querySelector('.location-select-display')
  var locationSelectTick = document.querySelector('.location-select-tick')
  var locationSelectCross = document.querySelector('.location-select-cross')

  function displayForm (e) {
    if (state.currentView !== 'locationSelect') {
      return
    }
    locationSelectDisplay.classList.remove('visible')

    var clickedLocation = mymap.getCenter()

    form.querySelector('input[name="lat"]').value = clickedLocation.lat
    form.querySelector('input[name="long"]').value = clickedLocation.lng
    setTimeout(function () {
      form.parentNode.classList.add('visible')
    }, 50)

    document.querySelector('.add-nugget-button').style.display = 'none'

    state.currentView = 'formTab'
  }

  function submitForm (e) {
    // get data from form fields
    var form = e.target.parentNode.parentNode
    var inputs = form.querySelectorAll('.add-form-input')
    var formData = {}
    inputs.forEach(function (input) {
      formData[input.name] = input.value
    })
    // validate data
    function validateData (formData) {
      if (formData.title.trim() === '') return false
      if (formData.description.trim() === '') return false
      if (formData.author.trim() === '') return false
      return true
    }
    if (!validateData(formData)) {
      // display message
      var errorMessage = document.querySelector('.err-message')
      errorMessage.textContent = '*Please fill in the form'
      return
    }

    // send data to server
    document.querySelector('.add-nugget-button').style.display = 'block'
    makeRequest('POST', '/add-nugget', formData, function (err) {
      if (err) {
        // pop up error message suggesting try to submit the orm again
        return
      }
      // should empty the form
      // put pin on map (currently commented out awaiting implementation)
      // addNuggetToMap(formData)
      createMarker(formData, smallIconsMap).addTo(smallIconsLayer)
      createMarker(formData, bigIconsMap).addTo(bigIconsLayer)
      // remove form from page
      form.parentNode.classList.remove('visible')
      state.currentView = 'map'
    })
  }

  // close form
  document.querySelector('.add-form-times').addEventListener('click', function (e) {
      document.querySelector('.add-nugget-button').style.display = 'block'
      state.currentView = 'locationSelect'
      form.parentNode.classList.toggle('visible')
      locationSelectDisplay.classList.toggle('visible')
    })

  document.querySelector('.add-form-check').addEventListener('click', submitForm)

  addNuggetButton.addEventListener('click', function (e) {
    if (state.currentView !== 'map') {
      return
    }
    locationSelectDisplay.classList.toggle('visible')
    state.currentView = 'locationSelect'
  })

  locationSelectTick.addEventListener('click', displayForm)

  locationSelectCross.addEventListener('click', function (e) {
    locationSelectDisplay.classList.toggle('visible')
    state.currentView = 'map'
  })


})()
