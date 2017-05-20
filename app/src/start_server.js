const app = require('./server.js')

const port = process.env.PORT || 2000

app.listen(port, function () {
  console.log(`The magic happens on port ${port}!`)
})
