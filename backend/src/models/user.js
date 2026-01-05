const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  role: {
  type: String,
  enum: ['organizator', 'voditelj', 'sudac', 'admin'],
  required: false,
    },

  ime: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  oauthProvider: {
    type: {
      type: String,
      required: true
    },
    providerId: {
      type: String,
      required: true
    }
  },
  klubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Klub',
    required: false
  },
  stripePayment: {
    stripeCustomerId: {
      type: String,
      default: null,
    },
    subscription: {
      active: {
        type: Boolean,
        default: false, 
      },
      subscriptionId: {
        type: String,
        default: null,
      },
      vrijediDo: { 
        type: Date,
        default: null,
      },
    }
  },
});

module.exports = mongoose.model('User', userSchema, 'user');