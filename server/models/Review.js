import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Buyer is required']
  },
  farm: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: [true, 'Farm is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  aspects: {
    quality: {
      type: Number,
      min: 1,
      max: 5
    },
    service: {
      type: Number,
      min: 1,
      max: 5
    },
    value: {
      type: Number,
      min: 1,
      max: 5
    },
    cleanliness: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  helpful: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isHelpful: {
      type: Boolean,
      default: true
    }
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  response: {
    text: String,
    responder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes
reviewSchema.index({ farm: 1, buyer: 1 }, { unique: true }) // One review per buyer per farm
reviewSchema.index({ farm: 1 })
reviewSchema.index({ buyer: 1 })
reviewSchema.index({ rating: -1 })
reviewSchema.index({ createdAt: -1 })

// Virtual fields
reviewSchema.virtual('helpfulCount').get(function() {
  return this.helpful.filter(h => h.isHelpful).length
})

reviewSchema.virtual('overallRating').get(function() {
  if (!this.aspects) return this.rating
  
  const aspects = this.aspects
  const aspectRatings = [
    aspects.quality,
    aspects.service,
    aspects.value,
    aspects.cleanliness
  ].filter(rating => rating)
  
  if (aspectRatings.length === 0) return this.rating
  
  const sum = aspectRatings.reduce((total, rating) => total + rating, 0)
  return Math.round((sum / aspectRatings.length) * 10) / 10
})

// Pre-save middleware to update farm rating
reviewSchema.post('save', async function() {
  const Farm = mongoose.model('Farm')
  const farm = await Farm.findById(this.farm)
  
  if (farm) {
    const reviews = await this.constructor.find({ farm: this.farm, isActive: true })
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0
    
    farm.ratings.average = Math.round(averageRating * 10) / 10
    farm.ratings.count = reviews.length
    await farm.save()
  }
})

// Pre-remove middleware to update farm rating
reviewSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    const Farm = mongoose.model('Farm')
    const farm = await Farm.findById(doc.farm)
    
    if (farm) {
      const reviews = await this.constructor.find({ farm: doc.farm, isActive: true })
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
      const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0
      
      farm.ratings.average = Math.round(averageRating * 10) / 10
      farm.ratings.count = reviews.length
      await farm.save()
    }
  }
})

// Methods
reviewSchema.methods.markHelpful = function(userId, isHelpful = true) {
  const existingIndex = this.helpful.findIndex(h => h.user.toString() === userId.toString())
  
  if (existingIndex > -1) {
    this.helpful[existingIndex].isHelpful = isHelpful
  } else {
    this.helpful.push({ user: userId, isHelpful })
  }
  
  return this.save()
}

reviewSchema.methods.addResponse = function(responseText, responderId) {
  this.response = {
    text: responseText,
    responder: responderId,
    respondedAt: new Date()
  }
  return this.save()
}

// Static methods
reviewSchema.statics.getAverageRating = async function(farmId) {
  const result = await this.aggregate([
    { $match: { farm: farmId, isActive: true } },
    {
      $group: {
        _id: '$farm',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ])
  
  return result.length > 0 ? result[0] : { averageRating: 0, totalReviews: 0 }
}

reviewSchema.statics.getFarmReviewStats = async function(farmId) {
  const stats = await this.aggregate([
    { $match: { farm: farmId, isActive: true } },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: -1 } }
  ])
  
  const ratingDistribution = {
    5: 0, 4: 0, 3: 0, 2: 0, 1: 0
  }
  
  stats.forEach(stat => {
    ratingDistribution[stat._id] = stat.count
  })
  
  return ratingDistribution
}

const Review = mongoose.model('Review', reviewSchema)

export default Review