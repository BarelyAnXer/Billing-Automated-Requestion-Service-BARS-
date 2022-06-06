const mongoose = require('mongoose')

const billingSchema = new mongoose.Schema({
  billing_cycle: {
    type: Number,
  },
  billing_month: {
    type: String,
  },
  amount: {
    type: Number,
  },
  start_date: {
    type: String,
  },
  end_date: {
    type: String,
  },
  last_edited: {
    type: String,
  },
  account: {
    account_name: {
      type: String,
    },
    date_created: {
      type: Date,
    },
    is_active: {
      type: String,
    },
    last_edited: {
      type: String,
    },
    customer: {
      first_name: {
        type: String,
      },
      last_name: {
        type: String,
      },
      address: {
        type: String,
      },
      status: {
        type: String,
      },
      date_created: {
        type: Date,
      },
      last_edited: {
        type: String,
      },
    },
  },
})

const Billing = mongoose.model('Billing', billingSchema)

module.exports = Billing


