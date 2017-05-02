const path = require('path')
const express = require('express')
const query = require('./queries.js')
const app = express()
const bodyParser = require('body-parser')

const port = process.env.PORT || 8111
const staticFilesPath = path.join(__dirname, '../public')

app.use(express.static(staticFilesPath))
app.use(bodyParser.json())
app.use(express.json())

app.get('/all-nuggets', function (req, res) {
  query.getAll((err, result) => {
    if (err) {
      console.log(err)
      return res.send('DATABASE ERROR')
    }
    res.json(result.rows)
  })
})

app.post('/add-nugget', function (req, res) {
  // get the data from the request
  const data = req.body
  // add to the database
  query.addNugget(data, (err) => {
    if (err) {
      return res.send('error adding nugget')
    }
    // send back a response message
    res.send('nugget added successfully')
  })
})

app.listen(port, function () {
  console.log(`The magic happens on port ${port}!`)
})
