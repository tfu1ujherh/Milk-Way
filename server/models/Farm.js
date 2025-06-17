import mongoose from 'mongoose'

const farmSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Farm name is required'],
    trim: true,
    minlength: [2, 'Farm name must be at least 2 characters'],
    maxlength: [100, 'Farm name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Farm owner is required']
  },
  location: {
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    country: {
      type: String,
      default: 'India',
      trim: true
    },
    pincode: {
      type: String,
      trim: true
    },
    coordinates: {
      lat: {
        type: Number,
        default: 0
      },
      lng: {
        type: Number,
        default: 0
      }
    }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  availability: [{
    type: String,
    enum: ['morning', 'evening', 'both'],
    required: true
  }],
  price: {
    type: Number,
    required: [true, 'Price per liter is required'],
    min: [1, 'Price must be at least ₹1'],
    max: [1000, 'Price cannot exceed ₹1000']
  },
  contact: {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    whatsapp: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    }
  },
  features: [{
    type: String,
    enum: [
      'organic',
      'grass-fed',
      'a2-milk',
      'home-delivery',
      'bulk-orders',
      'pasteurized',
      'raw-milk',
      'eco-friendly'
    ]
  }],
  capacity: {
    dailyProduction: {
      type: Number,
      min: [1, 'Daily production must be at least 1 liter']
    },
    availableQuantity: {
      type: Number,
      min: [0, 'Available quantity cannot be negative']
    }
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes
farmSchema.index({ 'location.coordinates': '2dsphere' })
farmSchema.index({ owner: 1 })
farmSchema.index({ isActive: 1 })
farmSchema.index({ featured: 1 })
farmSchema.index({ 'ratings.average': -1 })
farmSchema.index({ price: 1 })
farmSchema.index({ createdAt: -1 })

// Text search index
farmSchema.index({
  name: 'text',
  description: 'text',
  'location.address': 'text',
  'location.city': 'text',
  'location.state': 'text'
})

// Virtual fields
farmSchema.virtual('averageRating').get(function() {
  return this.ratings.average
})

farmSchema.virtual('totalReviews').get(function() {
  return this.ratings.count
})

farmSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary)
  return primary ? primary.url : (this.images.length > 0 ? this.images[0].url : null)
})

// Pre-save middleware
farmSchema.pre('save', function(next) {
  this.lastUpdated = new Date()
  next()
})

// Methods
farmSchema.methods.updateRating = function(newRating) {
  const currentTotal = this.ratings.average * this.ratings.count
  this.ratings.count += 1
  this.ratings.average = (currentTotal + newRating) / this.ratings.count
  return this.save()
}

farmSchema.methods.incrementViews = function() {
  this.views += 1
  return this.save()
}

// Static methods
farmSchema.statics.findNearby = function(coordinates, maxDistance = 10000) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [coordinates.lng, coordinates.lat]
        },
        $maxDistance: maxDistance
      }
    },
    isActive: true
  })
}

farmSchema.statics.findByAvailability = function(availability) {
  return this.find({
    availability: { $in: [availability] },
    isActive: true
  })
}

const Farm = mongoose.model('Farm', farmSchema)

export default Farm