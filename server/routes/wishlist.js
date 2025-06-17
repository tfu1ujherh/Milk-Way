import express from 'express'
import Wishlist from '../models/Wishlist.js'
import Farm from '../models/Farm.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { validateObjectId } from '../middleware/validation.js'

const router = express.Router()

// @route   GET /api/wishlist
// @desc    Get user's wishlist
// @access  Private (Buyers only)
router.get('/', authenticate, authorize('buyer'), async (req, res) => {
  try {
    const wishlist = await Wishlist.findOrCreate(req.user._id)
    
    await wishlist.populate({
      path: 'farms.farm',
      populate: {
        path: 'owner',
        select: 'name email'
      }
    })

    // Filter out any farms that might have been deleted
    const activeFarms = wishlist.farms.filter(item => item.farm && item.farm.isActive)
    
    if (activeFarms.length !== wishlist.farms.length) {
      wishlist.farms = activeFarms
      await wishlist.save()
    }

    res.json({
      wishlist: {
        ...wishlist.toObject(),
        farms: activeFarms
      }
    })
  } catch (error) {
    console.error('Get wishlist error:', error)
    res.status(500).json({
      message: 'Server error while fetching wishlist',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// @route   POST /api/wishlist
// @desc    Add farm to wishlist
// @access  Private (Buyers only)
router.post('/', authenticate, authorize('buyer'), async (req, res) => {
  try {
    const { farmId, notes = '' } = req.body

    if (!farmId) {
      return res.status(400).json({
        message: 'Farm ID is required'
      })
    }

    // Check if farm exists and is active
    const farm = await Farm.findById(farmId)
    if (!farm || !farm.isActive) {
      return res.status(404).json({
        message: 'Farm not found or not available'
      })
    }

    const wishlist = await Wishlist.findOrCreate(req.user._id)

    // Check if farm is already in wishlist
    if (wishlist.hasFarm(farmId)) {
      return res.status(400).json({
        message: 'Farm is already in your wishlist'
      })
    }

    await wishlist.addFarm(farmId, notes)

    await wishlist.populate({
      path: 'farms.farm',
      populate: {
        path: 'owner',
        select: 'name email'
      }
    })

    res.status(201).json({
      message: 'Farm added to wishlist successfully',
      wishlist
    })
  } catch (error) {
    console.error('Add to wishlist error:', error)
    
    if (error.message === 'Farm already in wishlist') {
      return res.status(400).json({ message: error.message })
    }

    res.status(500).json({
      message: 'Server error while adding to wishlist',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// @route   DELETE /api/wishlist/:farmId
// @desc    Remove farm from wishlist
// @access  Private (Buyers only)
router.delete('/:farmId', authenticate, authorize('buyer'), validateObjectId('farmId'), async (req, res) => {
  try {
    const wishlist = await Wishlist.findOrCreate(req.user._id)

    if (!wishlist.hasFarm(req.params.farmId)) {
      return res.status(404).json({
        message: 'Farm not found in wishlist'
      })
    }

    await wishlist.removeFarm(req.params.farmId)

    res.json({
      message: 'Farm removed from wishlist successfully'
    })
  } catch (error) {
    console.error('Remove from wishlist error:', error)
    res.status(500).json({
      message: 'Server error while removing from wishlist',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// @route   PUT /api/wishlist/:farmId/notes
// @desc    Update notes for a farm in wishlist
// @access  Private (Buyers only)
router.put('/:farmId/notes', authenticate, authorize('buyer'), validateObjectId('farmId'), async (req, res) => {
  try {
    const { notes = '' } = req.body

    if (notes.length > 200) {
      return res.status(400).json({
        message: 'Notes cannot exceed 200 characters'
      })
    }

    const wishlist = await Wishlist.findOrCreate(req.user._id)

    if (!wishlist.hasFarm(req.params.farmId)) {
      return res.status(404).json({
        message: 'Farm not found in wishlist'
      })
    }

    await wishlist.updateNotes(req.params.farmId, notes)

    res.json({
      message: 'Notes updated successfully'
    })
  } catch (error) {
    console.error('Update wishlist notes error:', error)
    
    if (error.message === 'Farm not found in wishlist') {
      return res.status(404).json({ message: error.message })
    }

    res.status(500).json({
      message: 'Server error while updating notes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// @route   GET /api/wishlist/check/:farmId
// @desc    Check if farm is in user's wishlist
// @access  Private (Buyers only)
router.get('/check/:farmId', authenticate, authorize('buyer'), validateObjectId('farmId'), async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ buyer: req.user._id })
    
    const isInWishlist = wishlist ? wishlist.hasFarm(req.params.farmId) : false

    res.json({
      isInWishlist,
      farmId: req.params.farmId
    })
  } catch (error) {
    console.error('Check wishlist error:', error)
    res.status(500).json({
      message: 'Server error while checking wishlist',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// @route   GET /api/wishlist/stats
// @desc    Get wishlist statistics
// @access  Private (Buyers only)
router.get('/stats', authenticate, authorize('buyer'), async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ buyer: req.user._id })
    
    if (!wishlist) {
      return res.json({
        totalFarms: 0,
        recentlyAdded: 0,
        averageRating: 0
      })
    }

    await wishlist.populate('farms.farm')

    const activeFarms = wishlist.farms.filter(item => item.farm && item.farm.isActive)
    const recentlyAdded = activeFarms.filter(item => {
      const daysDiff = (new Date() - new Date(item.addedAt)) / (1000 * 60 * 60 * 24)
      return daysDiff <= 7
    }).length

    const averageRating = activeFarms.length > 0
      ? activeFarms.reduce((sum, item) => sum + (item.farm.ratings.average || 0), 0) / activeFarms.length
      : 0

    res.json({
      totalFarms: activeFarms.length,
      recentlyAdded,
      averageRating: Math.round(averageRating * 10) / 10
    })
  } catch (error) {
    console.error('Get wishlist stats error:', error)
    res.status(500).json({
      message: 'Server error while fetching wishlist statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

export default router