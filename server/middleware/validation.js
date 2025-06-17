import { body, param, query, validationResult } from 'express-validator'

// Helper function to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }))
    
    return res.status(400).json({
      message: 'Validation failed',
      errors: errorMessages
    })
  }
  
  next()
}

// User validation rules
export const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('role')
    .isIn(['farmer', 'buyer'])
    .withMessage('Role must be either farmer or buyer'),
  
  handleValidationErrors
]

export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
]

// Farm validation rules - Simplified for FormData handling
export const validateFarmCreation = [
  // Basic validation will be handled in the route handler
  // since FormData parsing is complex with express-validator
  handleValidationErrors
]

export const validateFarmUpdate = [
  param('id')
    .isMongoId()
    .withMessage('Invalid farm ID'),
  
  handleValidationErrors
]

// Review validation rules
export const validateReviewCreation = [
  body('farm')
    .isMongoId()
    .withMessage('Invalid farm ID'),
  
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters'),
  
  body('aspects.quality')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Quality rating must be between 1 and 5'),
  
  body('aspects.service')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Service rating must be between 1 and 5'),
  
  body('aspects.value')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Value rating must be between 1 and 5'),
  
  body('aspects.cleanliness')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Cleanliness rating must be between 1 and 5'),
  
  handleValidationErrors
]

// Query validation rules
export const validateFarmQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('minRating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Minimum rating must be between 0 and 5'),
  
  query('maxDistance')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum distance must be a positive number'),
  
  query('availability')
    .optional()
    .isIn(['morning', 'evening', 'both'])
    .withMessage('Availability must be morning, evening, or both'),
  
  query('sortBy')
    .optional()
    .isIn(['nearest', 'rating', 'price_low', 'price_high', 'newest'])
    .withMessage('Invalid sort option'),
  
  handleValidationErrors
]

// MongoDB ObjectId validation
export const validateObjectId = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName}`),
  
  handleValidationErrors
]