import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

// Get __dirname and __filename in ES Module
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Define upload directories
const uploadsDir = path.join(__dirname, '../uploads')
const farmImagesDir = path.join(uploadsDir, 'farms')
const avatarsDir = path.join(uploadsDir, 'avatars')

const dirsToCreate = [uploadsDir, farmImagesDir, avatarsDir]

dirsToCreate.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
})


// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath

    if (file.fieldname === 'farmImages') {
      uploadPath = farmImagesDir
    } else if (file.fieldname === 'avatar') {
      uploadPath = avatarsDir
    } else {
      return cb(new Error('Unknown field name for file upload'), null)
    }

    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const ext = path.extname(file.originalname)
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`)
  }
})

// Allowed file types
const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

// File filter
const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false)
  }
}

// Safe parse max file size
const maxFileSize = Number(process.env.MAX_FILE_SIZE)
  ? Number(process.env.MAX_FILE_SIZE)
  : 5 * 1024 * 1024 // 5MB default

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSize,
    files: 10
  }
})

// Upload error handler middleware
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({ message: 'File too large. Max 5MB allowed.' })
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({ message: 'Too many files. Max 10 allowed.' })
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({ message: 'Unexpected field in file upload.' })
      default:
        return res.status(400).json({ message: error.message })
    }
  }

  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({ message: error.message })
  }

  if (error.message.includes('Unknown field name')) {
    return res.status(400).json({ message: error.message })
  }

  // Fallback
  next(error)
}

// Helper to delete a file
export const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  } catch (err) {
    console.error('Error deleting file:', err)
  }
}

// Helper to get file URL
export const getFileUrl = (req, filename, type = 'farms') => {
  const baseUrl = `${req.protocol}://${req.get('host')}`
  return `${baseUrl}/uploads/${type}/${filename}`
}

// Export multer instance
export default upload
