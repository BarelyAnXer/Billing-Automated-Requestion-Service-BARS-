const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Billing = require('../billingmodel')

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

      let data = fs.readFileSync(`./uploads/${fileName}`,
        { encoding: 'utf-8' })

      if (data.trim().length === 0) {
        return res.status(400).send('No request(s) to read from the input file')
      } else {
        let records = []

        let filtered = data.split('\r\n').filter(item => item)
        console.log(filtered)
        console.log(filtered.length)

        for (let i = 0; i < filtered.length; i++) {

          let billingCycle = filtered[i].split(',')[0]
          let startDate = filtered[i].split(',')[1]
          let endDate = filtered[i].split(',')[2]

          console.log(billingCycle, startDate, endDate, 'asd')

          if (parseInt(billingCycle) < 1 || parseInt(billingCycle) > 12) {
            return res.status(400).
            send(('ERROR: Billing Cycle not on range at row ' + (i + 1)))
          }

          if (!Date.parse(startDate)) {
            return res.status(400).
            send(('ERROR: Invalid Start Date format at row ' + (i + 1)))
          }

          if (!Date.parse(endDate)) {
            return res.status(400).
            send(('ERROR: Invalid End Date format at row ' + (i + 1)))
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
            records.push(temp)
          }
        }
        if (records.length === 0) {
          res.send('No Record Found!')
        } else {
          res.send(records)
        }

      }

      // return res.status(200).send(data)

    } else if (fileName.includes('.txt')) {

      let data = fs.readFileSync(`./uploads/${fileName}`,
        { encoding: 'utf-8' })

      console.log(data)

      if (data === '') {
        return res.status(400).send('No request(s) to read from the input file')
      } else {

        let records = []

        for (let i = 0; i < data.split("\r\n").length; i++) {
          const line = data.split('\r\n')[i]
          let billingCycle = line.substring(0, 2)
          let startDate = line.substring(2, 10)
          let endDate = line.substring(10, 18)

          if (startDate.replace(/ +/g, '').length !== 8) {
            return res.status(400).
            send(('ERROR: Invalid Start Date format at row ' + (i + 1)))
          }
          if (endDate.replace(/ +/g, '').length !== 8) {
            return res.status(400).
            send(('ERROR: Invalid End Date format at row ' + (i + 1)))
          }

          if (billingCycle < 1 || billingCycle > 12) {
            return res.status(400).
            send(('ERROR: Billing Cycle not on range at row ' + (i + 1)))
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
            records.push(temp)
          }
        }
        if (records.length === 0) {
          res.send('No Record Found!')
        } else {
          res.send(records)
        }
      }
    }
  }
  , (error, req, res, next) => {
    res.status(400).send({ error: error.message })
  },
)

//
// const readCSV = () => {
//   // fs.readFile(`./uploads/${fileName}`)
// }
//
// const readTXT = () => {
//
// }
//
// const readCSV = (fileName, cb) => {
//   fs.readFile(`./uploads/${fileName}`, `utf8`, async (error, data) => {
//     console.log(data)
// const words = data.split(",");
// console.log(words);
// let message = "";
// for (let i=0; <words.length; i++){
//  message = message + " " + words[i];
// }
//
//     await wordsninja.loadDictionary()
//     const message = wordsninja.splitSentence(data, { joinWords: true })
//     console.log(message)
//     cb(undefined, message.trim())
//   })
// }
// //
// // const words = []
// // const readTXT = (fileName, cb) => {
// //   fs.readfile(`./uploads/${fileName}`, `utf8`, async (error, data) => {
// //     console.log(data)
// //     // words.push (data.slice(0, 5));
// //     // words.push (data.slice(5, 11));
// //     // words.push (data.slice(11, 15));
// //     // words.push (data.slice(15, 20));
// //     // words.push (data.slice(20, 30));
// //     // const message = `${words[0]} ${words[1]} ${words[2]} ${words[3]} ${words[4]}.`;
// //     // }
// //
// //     await wordsninja.loadDictionary()
// //     const message = wordsninja.splitSentence(data, { joinWords: true })
// //     console.log(message)
// //     cb(undefined, message)
// //   })
// // }

module.exports = router
