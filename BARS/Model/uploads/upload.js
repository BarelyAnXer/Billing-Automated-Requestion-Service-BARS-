const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Billing = require('../billingmodel')
const e = require('express')

const router = express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads')
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
})

const upload = multer({
  storage: storage,
  fileFilter (req, file, cb) {
    let ext = path.extname(file.originalname)
    if (ext !== '.txt' && ext !== '.csv') {
      // TODO xlsx
      return cb(new Error('File not supported for processing.'))
    }
    cb(undefined, true)
  },
})

router.post('/upload', upload.single(`upload`), async (req, res) => {

    let fileName = req.file.originalname
    if (fileName.includes('.csv')) {

      console.log('=====> Filepath: ' + req.file.originalname)
      console.log('==> INSIDE TXT PROCESSING <==')
      console.log('==> Processing Request with three parameters')

      let data = fs.readFileSync(`./uploads/${fileName}`,
        { encoding: 'utf-8' })

      if (data.trim().length === 0) {
        console.log({ ERROR: 'No request(s) to read from the input file.' })
        res.status(400).
        send({ ERROR: 'No request(s) to read from the input file.' })
      } else {
        let records = []

        let filtered = data.split('\r\n').filter(item => item)

        for (let i = 0; i < filtered.length; i++) {

          let billingCycle = filtered[i].split(',')[0]
          let startDate = filtered[i].split(',')[1]
          let endDate = filtered[i].split(',')[2]

          console.log([billingCycle, startDate, endDate])

          if (parseInt(billingCycle) < 1 || parseInt(billingCycle) > 12) {
            console.log({
              ERROR: 'Billing Cycle not on range at row ' + (i + 1) + '.',
            })
            return res.send({
              ERROR: 'Billing Cycle not on range at row ' + (i + 1) + '.',
            })
          }

          if (!Date.parse(startDate)) {
            console.log({
              ERROR: 'Invalid Start Date format at row ' + (i + 1) + '.',
            })
            return res.send({
              ERROR: 'Invalid Start Date format at row ' + (i + 1) + '.',
            })
          }

          if (!Date.parse(endDate)) {
            console.log({
              ERROR: 'Invalid End Date format at row ' + (i + 1) + '.',
            })
            return res.send({
              ERROR: 'Invalid End Date format at row ' + (i + 1) + '.',
            })
          }

          let startMM = parseInt(startDate.split('/')[0])
          let startDD = parseInt(startDate.split('/')[1])
          let startYYYY = parseInt(startDate.split('/')[2])

          let endMM = parseInt(endDate.split('/')[0])
          let endDD = parseInt(endDate.split('/')[1])
          let endYYYY = parseInt(endDate.split('/')[2])

          let temp = await Billing.findOne({
            billing_cycle: billingCycle,
            start_date: new Date(startYYYY, startMM, startDD,
              8).toString(),
            end_date: new Date(endYYYY, endMM, endDD, 8).toString(),
          })

          if (temp === null) {
          } else {
            let output = {
              '_id': temp._id,
              'billing_cycle': temp.billing_cycle,
              'start_date': temp.start_date,
              'end_date': temp.end_date,
              'amount': temp.amount,
              'account_name': temp.account.account_name,
              'first_name': temp.account.customer.first_name,
              'last_name': temp.account.customer.last_name,
            }
            records.push(output)
          }
        }
        if (records.length === 0) {
          console.log({ MESSAGE: 'No Record Found' })
          return res.status(400).send({ MESSAGE: 'No Record Found' })
        } else {
          res.send(records)
        }

      }

      // return res.status(200).send(data)

    } else if (fileName.includes('.txt')) {

      console.log('=====> Filepath: ' + req.file.originalname)
      console.log('==> INSIDE TXT PROCESSING <==')
      console.log('==> Processing Request with three parameters')

      let data = fs.readFileSync(`./uploads/${fileName}`,
        { encoding: 'utf-8' })

      console.log(data)

      if (data === '') {
        console.log({ ERROR: 'No request(s) to read from the input file.' })
        res.status(400).
        send({ ERROR: 'No request(s) to read from the input file.' })
      } else {

        let records = []

        for (let i = 0; i < data.split("\r\n").length; i++) {
          const line = data.split('\r\n')[i]
          let billingCycle = line.substring(0, 2)
          let startDate = line.substring(2, 10)
          let endDate = line.substring(10, 18)

          console.log([billingCycle, startDate, endDate])

          if (startDate.replace(/ +/g, '').length !== 8) {
            console.log(
              { ERROR: 'Invalid Start Date format at row ' + (i + 1) + '.' })
            return res.send({
              ERROR: 'Invalid Start Date format at row ' + (i + 1) + '.',
            })
          }
          if (endDate.replace(/ +/g, '').length !== 8) {
            console.log({
              ERROR: 'Invalid End Date format at row ' + (i + 1) + '.',
            })
            return res.send({
              ERROR: 'Invalid End Date format at row ' + (i + 1) + '.',
            })
          }

          if (billingCycle < 1 || billingCycle > 12) {
            console.log({
              ERROR: 'Billing Cycle not on range at row ' + (i + 1) + '.',
            })
            return res.send({
              ERROR: 'Billing Cycle not on range at row ' + (i + 1) + '.',
            })
          }

          let startMM = parseInt(startDate.substring(0, 2))
          let startDD = parseInt(startDate.substring(2, 4))
          let startYYYY = parseInt(startDate.substring(4, 8))

          let endMM = parseInt(endDate.substring(0, 2))
          let endDD = parseInt(endDate.substring(2, 4))
          let endYYYY = parseInt(endDate.substring(4, 8))

          let temp = await Billing.findOne({
            billing_cycle: billingCycle,
            start_date: new Date(startYYYY, startMM, startDD,
              8).toString(),
            end_date: new Date(endYYYY, endMM, endDD, 8).toString(),
          })

          if (temp === null) {
          } else {
            let output = {
              '_id': temp._id,
              'billing_cycle': temp.billing_cycle,
              'start_date': temp.start_date,
              'end_date': temp.end_date,
              'amount': temp.amount,
              'account_name': temp.account.account_name,
              'first_name': temp.account.customer.first_name,
              'last_name': temp.account.customer.last_name,
            }
            records.push(output)
          }
        }
        if (records.length === 0) {
          console.log({ MESSAGE: 'No Record Found' })
          return res.status(400).send({ MESSAGE: 'No Record Found' })
        } else {
          res.send(records)
        }
      }
    }
  }
  , (error, req, res, next) => {
    console.log({ ERROR: error.message })
    res.status(400).send({ ERROR: error.message })
  },
)

module.exports = router
