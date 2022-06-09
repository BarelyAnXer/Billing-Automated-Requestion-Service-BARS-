const express = require(`express`)
const app = express()
const upload = require('./uploads/upload')
const bars_db = require('./bars_db')

app.use(express.json())
const port = `3000`

app.listen(3000, () => {
  console.log(`Server is up on port ${port}`)
})

app.use(upload)
