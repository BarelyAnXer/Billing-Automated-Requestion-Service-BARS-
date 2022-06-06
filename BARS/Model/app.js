const express = require(`express`)
const app = express()
const upload = require(`../../BARS/Model/uploads/upload`)
const bars_db = require('../Model/bars_db')

app.use(express.json())
const port = `3000`

app.listen(3000, () => {
  console.log(`Server is up on port ${port}`)
})

app.use(upload)
