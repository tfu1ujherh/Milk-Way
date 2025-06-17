import express from 'express'
import User from '../models/User.js'
import { authenticate } from '../middleware/auth.js'
import upload, { handleUploadError, getFileUrl, deleteFile } from '../middleware/upload.js'
import { body, validationResult } from 'express-validator'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Validation middleware
const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('phone')
    .optional()
    .trim()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('location.address')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Address must be between 5 and 200 characters'),
  
  body('location.city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  
  body('location.state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
  
  body('location.coordinates.lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  
  body('location.coordinates.lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }
    next()
  }
]

// @route   GET /api/users/profile
// @desc    Get current user's profile
// @access  Private
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    // Add full avatar URL if exists
    const userProfile = user.toObject()
    if (userProfile.avatar) {
      userProfile.avatar = userProfile.avatar.startsWith('http') 
        ? userProfile.avatar 
        : getFileUrl(req, path.basename(userProfile.avatar), 'avatars')
    }

    res.json(userProfile)
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({
      message: 'Server error while fetching profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// @route   PUT /api/users/profile
// @desc    Update current user's profile
// @access  Private
router.put('/profile', 
  authenticate, 
  upload.single('avatar'),
  handleUploadError,
  validateProfileUpdate,
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id)
      
      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        })
      }

      const updateData = { ...req.body }

      // Parse JSON fields if they exist
      if (typeof updateData.location === 'string') {
        updateData.location = JSON.parse(updateData.location)
      }
      if (typeof updateData.preferences === 'string') {
        updateData.preferences = JSON.parse(updateData.preferences)
      }

      // Handle avatar upload
      if (req.file) {
        // Delete old avatar if exists
        if (user.avatar) {
          const oldAvatarPath = path.join(__dirname, '../uploads/avatars', path.basename(user.avatar))
          deleteFile(oldAvatarPath)
        }
        
        updateData.avatar = getFileUrl(req, req.file.filename, 'avatars')
      }

      // Update user
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password')

      res.json({
        message: 'Profile updated successfully',
        user: updatedUser.getPublicProfile()
      })
    } catch (error) {
      // Clean up uploaded file if update fails
      if (req.file) {
        deleteFile(req.file.path)
      }

      console.error('Update profile error:', error)
      res.status(500).json({
        message: 'Server error while updating profile',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
)

// @route   PUT /api/users/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', authenticate, async (req, res) => {
  try {
    const { notifications, privacy } = req.body

    const updateData = {}
    if (notifications) updateData['preferences.notifications'] = notifications
    if (privacy) updateData['preferences.privacy'] = privacy

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password')

    res.json({
      message: 'Preferences updated successfully',
      preferences: updatedUser.preferences
    })
  } catch (error) {
    console.error('Update preferences error:', error)
    res.status(500).json({
      message: 'Server error while updating preferences',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// @route   DELETE /api/users/avatar
// @desc    Delete user's avatar
// @access  Private
router.delete('/avatar', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    if (!user.avatar) {
      return res.status(400).json({
        message: 'No avatar to delete'
      })
    }

    // Delete avatar file
    const avatarPath = path.join(__dirname, '../uploads/avatars', path.basename(user.avatar))
    deleteFile(avatarPath)

    // Update user
    user.avatar = null
    await user.save()

    res.json({
      message: 'Avatar deleted successfully'
    })
  } catch (error) {
    console.error('Delete avatar error:', error)
    res.status(500).json({
      message: 'Server error while deleting avatar',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', authenticate, async (req, res) => {
  try {
    const stats = {
      accountAge: Math.floor((new Date() - new Date(req.user.createdAt)) / (1000 * 60 * 60 * 24)),
      lastLogin: req.user.lastLogin,
      isVerified: req.user.isVerified
    }

    if (req.user.role === 'farmer') {
      const Farm = (await import('../models/Farm.js')).default
      const farms = await Farm.find({ owner: req.user._id })
      
      stats.totalFarms = farms.length
      stats.activeFarms = farms.filter(farm => farm.isActive).length
      stats.totalViews = farms.reduce((sum, farm) => sum + farm.views, 0)
      stats.averageRating = farms.length > 0
        ? farms.reduce((sum, farm) => sum + farm.ratings.average, 0) / farms.length
        : 0
    } else if (req.user.role === 'buyer') {
      const Review = (await import('../models/Review.js')).default
      const Wishlist = (await import('../models/Wishlist.js')).default
      
      const reviews = await Review.find({ buyer: req.user._id })
      const wishlist = await Wishlist.findOne({ buyer: req.user._id })
      
      stats.totalReviews = reviews.length
      stats.averageRatingGiven = reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0
      stats.wishlistItems = wishlist ? wishlist.farms.length : 0
    }

    res.json(stats)
  } catch (error) {
    console.error('Get user stats error:', error)
    res.status(500).json({
      message: 'Server error while fetching statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// @route   POST /api/users/deactivate
// @desc    Deactivate user account
// @access  Private
router.post('/deactivate', authenticate, async (req, res) => {
  try {
    const { reason } = req.body

    await User.findByIdAndUpdate(req.user._id, {
      isActive: false,
      deactivatedAt: new Date(),
      deactivationReason: reason
    })

    res.json({
      message: 'Account deactivated successfully'
    })
  } catch (error) {
    console.error('Deactivate account error:', error)
    res.status(500).json({
      message: 'Server error while deactivating account',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

export default router