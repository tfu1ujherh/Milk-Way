import express from 'express'
import Farm from '../models/Farm.js'
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js'
import { validateFarmCreation, validateFarmUpdate, validateFarmQuery, validateObjectId } from '../middleware/validation.js'
import upload, { handleUploadError, getFileUrl, deleteFile } from '../middleware/upload.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// @route   GET /api/farms
// @desc    Get all farms with filtering and pagination
// @access  Public
router.get('/', validateFarmQuery, optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      availability,
      minRating,
      maxDistance,
      sortBy = 'newest',
      lat,
      lng,
      features
    } = req.query

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    // Build query
    let query = { isActive: true }

    // Text search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.state': { $regex: search, $options: 'i' } }
      ]
    }

    // Availability filter
    if (availability) {
      query.availability = { $in: [availability] }
    }

    // Rating filter
    if (minRating) {
      query['ratings.average'] = { $gte: parseFloat(minRating) }
    }

    // Features filter
    if (features) {
      const featuresArray = Array.isArray(features) ? features : [features]
      query.features = { $in: featuresArray }
    }

    // Location-based filtering
    if (lat && lng && maxDistance) {
      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseFloat(maxDistance) * 1000 // Convert km to meters
        }
      }
    }

    // Build sort options
    let sortOptions = {}
    switch (sortBy) {
      case 'rating':
        sortOptions = { 'ratings.average': -1, 'ratings.count': -1 }
        break
      case 'price_low':
        sortOptions = { price: 1 }
        break
      case 'price_high':
        sortOptions = { price: -1 }
        break
      case 'newest':
        sortOptions = { createdAt: -1 }
        break
      case 'nearest':
        // Sorting by distance is handled by $near in the query
        sortOptions = { createdAt: -1 }
        break
      default:
        sortOptions = { createdAt: -1 }
    }

    // Execute query
    const farms = await Farm.find(query)
      .populate('owner', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean()

    // Get total count for pagination
    const total = await Farm.countDocuments(query)

    // Add full image URLs and check if user can edit
    const farmsWithUrls = farms.map(farm => ({
      ...farm,
      images: farm.images.map(img => ({
        ...img,
        url: img.url.startsWith('http') ? img.url : getFileUrl(req, path.basename(img.url), 'farms')
      })),
      canEdit: req.user && req.user._id.toString() === farm.owner._id.toString(),
      isInWishlist: false // Will be updated by client if needed
    }))

    res.json({
      farms: farmsWithUrls,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalFarms: total,
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1
      }
    })
  } catch (error) {
    console.error('Get farms error:', error)
    res.status(500).json({
      message: 'Server error while fetching farms',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// @route   GET /api/farms/search
// @desc    Search farms
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        message: 'Search query must be at least 2 characters long'
      })
    }

    const farms = await Farm.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { 'location.address': { $regex: q, $options: 'i' } },
            { 'location.city': { $regex: q, $options: 'i' } },
            { 'location.state': { $regex: q, $options: 'i' } }
          ]
        }
      ]
    })
      .populate('owner', 'name email')
      .sort({ 'ratings.average': -1, createdAt: -1 })
      .limit(20)
      .lean()

    // Add full image URLs
    const farmsWithUrls = farms.map(farm => ({
      ...farm,
      images: farm.images.map(img => ({
        ...img,
        url: img.url.startsWith('http') ? img.url : getFileUrl(req, path.basename(img.url), 'farms')
      }))
    }))

    res.json({
      farms: farmsWithUrls,
      total: farmsWithUrls.length
    })
  } catch (error) {
    console.error('Search farms error:', error)
    res.status(500).json({
      message: 'Server error during search',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// @route   GET /api/farms/my-farms
// @desc    Get current farmer's farms
// @access  Private (Farmers only)
router.get('/my-farms', authenticate, authorize('farmer'), async (req, res) => {
  try {
    const farms = await Farm.find({ owner: req.user._id })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .lean()

    // Add full image URLs
    const farmsWithUrls = farms.map(farm => ({
      ...farm,
      images: farm.images.map(img => ({
        ...img,
        url: img.url.startsWith('http') ? img.url : getFileUrl(req, path.basename(img.url), 'farms')
      })),
      canEdit: true // Owner can always edit their own farms
    }))

    res.json({
      farms: farmsWithUrls,
      total: farmsWithUrls.length
    })
  } catch (error) {
    console.error('Get my farms error:', error)
    res.status(500).json({
      message: 'Server error while fetching your farms',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// @route   GET /api/farms/:id
// @desc    Get single farm by ID
// @access  Public
router.get('/:id', validateObjectId(), optionalAuth, async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id)
      .populate('owner', 'name email phone')
      .lean()

    if (!farm) {
      return res.status(404).json({
        message: 'Farm not found'
      })
    }

    if (!farm.isActive) {
      return res.status(404).json({
        message: 'Farm is not available'
      })
    }

    // Increment view count
    await Farm.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } })

    // Add full image URLs and edit permissions
    const farmWithUrls = {
      ...farm,
      images: farm.images.map(img => ({
        ...img,
        url: img.url.startsWith('http') ? img.url : getFileUrl(req, path.basename(img.url), 'farms')
      })),
      canEdit: req.user && req.user._id.toString() === farm.owner._id.toString()
    }

    res.json(farmWithUrls)
  } catch (error) {
    console.error('Get farm error:', error)
    res.status(500).json({
      message: 'Server error while fetching farm',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// @route   POST /api/farms
// @desc    Create a new farm
// @access  Private (Farmers only)
router.post('/', 
  authenticate, 
  authorize('farmer'), 
  upload.array('farmImages', 5),
  handleUploadError,
  async (req, res) => {
    try {
      // Parse JSON fields from FormData
      let farmData = { ...req.body }
      
      // Parse JSON strings
      if (typeof farmData.location === 'string') {
        try {
          farmData.location = JSON.parse(farmData.location)
        } catch (e) {
          return res.status(400).json({ message: 'Invalid location data' })
        }
      }
      
      if (typeof farmData.contact === 'string') {
        try {
          farmData.contact = JSON.parse(farmData.contact)
        } catch (e) {
          return res.status(400).json({ message: 'Invalid contact data' })
        }
      }
      
      if (typeof farmData.availability === 'string') {
        try {
          farmData.availability = JSON.parse(farmData.availability)
        } catch (e) {
          return res.status(400).json({ message: 'Invalid availability data' })
        }
      }

      if (typeof farmData.features === 'string') {
        try {
          farmData.features = JSON.parse(farmData.features)
        } catch (e) {
          farmData.features = []
        }
      }

      // Validation
      if (!farmData.name || farmData.name.trim().length < 2) {
        return res.status(400).json({ message: 'Farm name is required and must be at least 2 characters' })
      }

      if (!farmData.price || farmData.price < 1 || farmData.price > 1000) {
        return res.status(400).json({ message: 'Price must be between ₹1 and ₹1000' })
      }

      if (!farmData.location || !farmData.location.address || !farmData.location.city || !farmData.location.state) {
        return res.status(400).json({ message: 'Address, city, and state are required' })
      }

      if (!farmData.contact || !farmData.contact.phone) {
        return res.status(400).json({ message: 'Phone number is required' })
      }

      if (!farmData.availability || !Array.isArray(farmData.availability) || farmData.availability.length === 0) {
        return res.status(400).json({ message: 'At least one availability option is required' })
      }

      // Set default coordinates if not provided
      if (!farmData.location.coordinates) {
        farmData.location.coordinates = { lat: 0, lng: 0 }
      }

      // Add owner
      farmData.owner = req.user._id

      // Process uploaded images
      if (req.files && req.files.length > 0) {
        farmData.images = req.files.map((file, index) => ({
          url: getFileUrl(req, file.filename, 'farms'),
          alt: `${farmData.name} - Image ${index + 1}`,
          isPrimary: index === 0
        }))
      } else {
        farmData.images = []
      }

      const farm = new Farm(farmData)
      await farm.save()

      const populatedFarm = await Farm.findById(farm._id)
        .populate('owner', 'name email')
        .lean()

      res.status(201).json({
        message: 'Farm created successfully',
        farm: {
          ...populatedFarm,
          images: populatedFarm.images.map(img => ({
            ...img,
            url: img.url.startsWith('http') ? img.url : getFileUrl(req, path.basename(img.url), 'farms')
          }))
        }
      })
    } catch (error) {
      // Clean up uploaded files if farm creation fails
      if (req.files) {
        req.files.forEach(file => {
          deleteFile(file.path)
        })
      }

      console.error('Create farm error:', error)
      res.status(500).json({
        message: 'Server error while creating farm',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
)

// @route   PUT /api/farms/:id
// @desc    Update a farm
// @access  Private (Farm owner only)
router.put('/:id',
  authenticate,
  authorize('farmer'),
  validateObjectId(),
  upload.array('farmImages', 5),
  handleUploadError,
  async (req, res) => {
    try {
      const farm = await Farm.findById(req.params.id)

      if (!farm) {
        return res.status(404).json({
          message: 'Farm not found'
        })
      }

      // Check if user owns the farm
      if (farm.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          message: 'Access denied. You can only update your own farms.'
        })
      }

      let updateData = { ...req.body }

      // Parse JSON fields
      if (typeof updateData.location === 'string') {
        try {
          updateData.location = JSON.parse(updateData.location)
        } catch (e) {
          return res.status(400).json({ message: 'Invalid location data' })
        }
      }
      
      if (typeof updateData.contact === 'string') {
        try {
          updateData.contact = JSON.parse(updateData.contact)
        } catch (e) {
          return res.status(400).json({ message: 'Invalid contact data' })
        }
      }
      
      if (typeof updateData.availability === 'string') {
        try {
          updateData.availability = JSON.parse(updateData.availability)
        } catch (e) {
          return res.status(400).json({ message: 'Invalid availability data' })
        }
      }

      if (typeof updateData.features === 'string') {
        try {
          updateData.features = JSON.parse(updateData.features)
        } catch (e) {
          updateData.features = []
        }
      }

      // Process new uploaded images
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map((file, index) => ({
          url: getFileUrl(req, file.filename, 'farms'),
          alt: `${updateData.name || farm.name} - Image ${index + 1}`,
          isPrimary: index === 0 && farm.images.length === 0
        }))

        updateData.images = [...farm.images, ...newImages]
      }

      const updatedFarm = await Farm.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).populate('owner', 'name email')

      res.json({
        message: 'Farm updated successfully',
        farm: {
          ...updatedFarm.toObject(),
          images: updatedFarm.images.map(img => ({
            ...img,
            url: img.url.startsWith('http') ? img.url : getFileUrl(req, path.basename(img.url), 'farms')
          }))
        }
      })
    } catch (error) {
      // Clean up uploaded files if update fails
      if (req.files) {
        req.files.forEach(file => {
          deleteFile(file.path)
        })
      }

      console.error('Update farm error:', error)
      res.status(500).json({
        message: 'Server error while updating farm',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
)

// @route   DELETE /api/farms/:id
// @desc    Delete a farm
// @access  Private (Farm owner only)
router.delete('/:id', authenticate, authorize('farmer'), validateObjectId(), async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id)

    if (!farm) {
      return res.status(404).json({
        message: 'Farm not found'
      })
    }

    // Check if user owns the farm
    if (farm.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Access denied. You can only delete your own farms.'
      })
    }

    // Delete associated images
    farm.images.forEach(image => {
      const filename = path.basename(image.url)
      const filePath = path.join(__dirname, '../uploads/farms', filename)
      deleteFile(filePath)
    })

    await Farm.findByIdAndDelete(req.params.id)

    res.json({
      message: 'Farm deleted successfully'
    })
  } catch (error) {
    console.error('Delete farm error:', error)
    res.status(500).json({
      message: 'Server error while deleting farm',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

export default router