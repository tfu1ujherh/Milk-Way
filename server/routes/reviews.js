import express from 'express'
import Review from '../models/Review.js'
import Farm from '../models/Farm.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { validateReviewCreation, validateObjectId } from '../middleware/validation.js'

const router = express.Router()

// @route   GET /api/reviews/farm/:farmId
// @desc    Get all reviews for a farm
// @access  Public
router.get('/farm/:farmId', validateObjectId('farmId'), async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'newest' } = req.query
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    // Build sort options
    let sortOptions = {}
    switch (sortBy) {
      case 'rating_high':
        sortOptions = { rating: -1, createdAt: -1 }
        break
      case 'rating_low':
        sortOptions = { rating: 1, createdAt: -1 }
        break
      case 'helpful':
        sortOptions = { 'helpful.length': -1, createdAt: -1 }
        break
      case 'oldest':
        sortOptions = { createdAt: 1 }
        break
      default: // newest
        sortOptions = { createdAt: -1 }
    }

    const reviews = await Review.find({ 
      farm: req.params.farmId, 
      isActive: true 
    })
      .populate('buyer', 'name')
      .populate('response.responder', 'name')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean()

    const total = await Review.countDocuments({ 
      farm: req.params.farmId, 
      isActive: true 
    })

    // Get rating statistics
    const ratingStats = await Review.getFarmReviewStats(req.params.farmId)
    const averageData = await Review.getAverageRating(req.params.farmId)

    res.json({
      reviews,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalReviews: total,
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1
      },
      statistics: {
        averageRating: averageData.averageRating,
        totalReviews: averageData.totalReviews,
        ratingDistribution: ratingStats
      }
    })
  } catch (error) {
    console.error('Get farm reviews error:', error)
    res.status(500).json({
      message: 'Server error while fetching reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// @route   GET /api/reviews/my-reviews
// @desc    Get current user's reviews
// @access  Private (Buyers only)
router.get('/my-reviews', authenticate, authorize('buyer'), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    const reviews = await Review.find({ 
      buyer: req.user._id, 
      isActive: true 
    })
      .populate('farm', 'name images location')
      .populate('response.responder', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean()

    const total = await Review.countDocuments({ 
      buyer: req.user._id, 
      isActive: true 
    })

    res.json({
      reviews,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalReviews: total,
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1
      }
    })
  } catch (error) {
    console.error('Get my reviews error:', error)
    res.status(500).json({
      message: 'Server error while fetching your reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// @route   POST /api/reviews
// @desc    Create a new review
// @access  Private (Buyers only)
router.post('/', authenticate, authorize('buyer'), validateReviewCreation, async (req, res) => {
  try {
    const { farm: farmId, rating, comment, aspects } = req.body

    // Check if farm exists
    const farm = await Farm.findById(farmId)
    if (!farm) {
      return res.status(404).json({
        message: 'Farm not found'
      })
    }

    // Check if user already reviewed this farm
    const existingReview = await Review.findOne({
      buyer: req.user._id,
      farm: farmId
    })

    if (existingReview) {
      return res.status(400).json({
        message: 'You have already reviewed this farm'
      })
    }

    // Create review
    const review = new Review({
      buyer: req.user._id,
      farm: farmId,
      rating,
      comment,
      aspects
    })

    await review.save()

    const populatedReview = await Review.findById(review._id)
      .populate('buyer', 'name')
      .populate('farm', 'name')
      .lean()

    res.status(201).json({
      message: 'Review created successfully',
      review: populatedReview
    })
  } catch (error) {
    console.error('Create review error:', error)
    res.status(500).json({
      message: 'Server error while creating review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// @route   PUT /api/reviews/:id
// @desc    Update a review
// @access  Private (Review owner only)
router.put('/:id', authenticate, authorize('buyer'), validateObjectId(), async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)

    if (!review) {
      return res.status(404).json({
        message: 'Review not found'
      })
    }

    // Check if user owns the review
    if (review.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Access denied. You can only update your own reviews.'
      })
    }

    const { rating, comment, aspects } = req.body

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      { rating, comment, aspects },
      { new: true, runValidators: true }
    )
      .populate('buyer', 'name')
      .populate('farm', 'name')

    res.json({
      message: 'Review updated successfully',
      review: updatedReview
    })
  } catch (error) {
    console.error('Update review error:', error)
    res.status(500).json({
      message: 'Server error while updating review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private (Review owner only)
router.delete('/:id', authenticate, authorize('buyer'), validateObjectId(), async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)

    if (!review) {
      return res.status(404).json({
        message: 'Review not found'
      })
    }

    // Check if user owns the review
    if (review.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Access denied. You can only delete your own reviews.'
      })
    }

    await Review.findByIdAndDelete(req.params.id)

    res.json({
      message: 'Review deleted successfully'
    })
  } catch (error) {
    console.error('Delete review error:', error)
    res.status(500).json({
      message: 'Server error while deleting review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// @route   POST /api/reviews/:id/helpful
// @desc    Mark review as helpful/not helpful
// @access  Private
router.post('/:id/helpful', authenticate, validateObjectId(), async (req, res) => {
  try {
    const { isHelpful = true } = req.body
    const review = await Review.findById(req.params.id)

    if (!review) {
      return res.status(404).json({
        message: 'Review not found'
      })
    }

    await review.markHelpful(req.user._id, isHelpful)

    res.json({
      message: `Review marked as ${isHelpful ? 'helpful' : 'not helpful'}`,
      helpfulCount: review.helpfulCount
    })
  } catch (error) {
    console.error('Mark helpful error:', error)
    res.status(500).json({
      message: 'Server error while updating helpful status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// @route   POST /api/reviews/:id/response
// @desc    Add response to review (Farm owner only)
// @access  Private (Farmers only)
router.post('/:id/response', authenticate, authorize('farmer'), validateObjectId(), async (req, res) => {
  try {
    const { text } = req.body

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        message: 'Response text is required'
      })
    }

    const review = await Review.findById(req.params.id).populate('farm')

    if (!review) {
      return res.status(404).json({
        message: 'Review not found'
      })
    }

    // Check if user owns the farm being reviewed
    if (review.farm.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Access denied. You can only respond to reviews of your farms.'
      })
    }

    await review.addResponse(text.trim(), req.user._id)

    const updatedReview = await Review.findById(req.params.id)
      .populate('buyer', 'name')
      .populate('response.responder', 'name')

    res.json({
      message: 'Response added successfully',
      review: updatedReview
    })
  } catch (error) {
    console.error('Add response error:', error)
    res.status(500).json({
      message: 'Server error while adding response',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

export default router