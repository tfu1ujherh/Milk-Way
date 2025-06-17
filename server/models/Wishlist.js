import mongoose from 'mongoose'

const wishlistSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Buyer is required'],
    unique: true
  },
  farms: [{
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [200, 'Notes cannot exceed 200 characters']
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes
wishlistSchema.index({ buyer: 1 }, { unique: true })
wishlistSchema.index({ 'farms.farm': 1 })
wishlistSchema.index({ 'farms.addedAt': -1 })

// Virtual fields
wishlistSchema.virtual('totalFarms').get(function() {
  return this.farms.length
})

// Methods
wishlistSchema.methods.addFarm = function(farmId, notes = '') {
  const existingFarm = this.farms.find(item => item.farm.toString() === farmId.toString())
  
  if (existingFarm) {
    throw new Error('Farm already in wishlist')
  }
  
  this.farms.push({
    farm: farmId,
    notes,
    addedAt: new Date()
  })
  
  return this.save()
}

wishlistSchema.methods.removeFarm = function(farmId) {
  this.farms = this.farms.filter(item => item.farm.toString() !== farmId.toString())
  return this.save()
}

wishlistSchema.methods.hasFarm = function(farmId) {
  return this.farms.some(item => item.farm.toString() === farmId.toString())
}

wishlistSchema.methods.updateNotes = function(farmId, notes) {
  const farmItem = this.farms.find(item => item.farm.toString() === farmId.toString())
  
  if (!farmItem) {
    throw new Error('Farm not found in wishlist')
  }
  
  farmItem.notes = notes
  return this.save()
}

// Static methods
wishlistSchema.statics.findOrCreate = async function(buyerId) {
  let wishlist = await this.findOne({ buyer: buyerId })
  
  if (!wishlist) {
    wishlist = new this({ buyer: buyerId, farms: [] })
    await wishlist.save()
  }
  
  return wishlist
}

wishlistSchema.statics.getFarmWishlistCount = async function(farmId) {
  const result = await this.aggregate([
    { $unwind: '$farms' },
    { $match: { 'farms.farm': farmId, isActive: true } },
    { $count: 'total' }
  ])
  
  return result.length > 0 ? result[0].total : 0
}

const Wishlist = mongoose.model('Wishlist', wishlistSchema)

export default Wishlist