import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { farmService } from '../../services/farmService'
import { 
  MapPin, 
  Camera, 
  Phone, 
  DollarSign, 
  Clock, 
  FileText,
  Save,
  ArrowLeft
} from 'lucide-react'
import toast from 'react-hot-toast'

const AddFarm = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [selectedImages, setSelectedImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm()

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 5) {
      toast.error('Maximum 5 images allowed')
      return
    }

    setSelectedImages(files)
    
    // Create previews
    const previews = files.map(file => {
      const reader = new FileReader()
      return new Promise((resolve) => {
        reader.onload = () => resolve(reader.result)
        reader.readAsDataURL(file)
      })
    })

    Promise.all(previews).then(setImagePreviews)
  }

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setSelectedImages(newImages)
    setImagePreviews(newPreviews)
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const formData = new FormData()
      
      // Add form fields
      formData.append('name', data.name)
      formData.append('description', data.description || '')
      formData.append('price', data.price)
      
      // Add location data
      formData.append('location', JSON.stringify({
        address: data.address,
        city: data.city,
        state: data.state,
        coordinates: {
          lat: parseFloat(data.latitude) || 0,
          lng: parseFloat(data.longitude) || 0
        }
      }))
      
      // Add contact data
      formData.append('contact', JSON.stringify({
        phone: data.phone,
        whatsapp: data.whatsapp || '',
        email: data.email || ''
      }))
      
      // Add availability - ensure at least one is selected
      const availability = []
      if (data.morning) availability.push('morning')
      if (data.evening) availability.push('evening')
      if (data.both) availability.push('both')
      
      if (availability.length === 0) {
        toast.error('Please select at least one availability option')
        setLoading(false)
        return
      }
      
      formData.append('availability', JSON.stringify(availability))
      
      // Add features if any
      const features = []
      if (data.organic) features.push('organic')
      if (data.grassFed) features.push('grass-fed')
      if (data.a2Milk) features.push('a2-milk')
      if (data.homeDelivery) features.push('home-delivery')
      if (data.bulkOrders) features.push('bulk-orders')
      if (data.pasteurized) features.push('pasteurized')
      if (data.rawMilk) features.push('raw-milk')
      if (data.ecoFriendly) features.push('eco-friendly')
      
      if (features.length > 0) {
        formData.append('features', JSON.stringify(features))
      }
      
      // Add images
      selectedImages.forEach((image) => {
        formData.append('farmImages', image)
      })

      await farmService.createFarm(formData)
      toast.success('Farm added successfully!')
      navigate('/farmer/dashboard')
    } catch (error) {
      console.error('Error creating farm:', error)
      toast.error(error.response?.data?.message || 'Failed to create farm')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Add New Farm
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          List your dairy farm to connect with milk buyers in your area
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="form-label">
                <FileText className="h-4 w-4 inline mr-2" />
                Farm Name *
              </label>
              <input
                {...register('name', {
                  required: 'Farm name is required',
                  minLength: {
                    value: 2,
                    message: 'Farm name must be at least 2 characters'
                  }
                })}
                type="text"
                className="form-input"
                placeholder="Enter your farm name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="form-label">Description</label>
              <textarea
                {...register('description')}
                className="form-input"
                rows="3"
                placeholder="Describe your farm, milk quality, and any special features..."
              />
            </div>

            <div>
              <label className="form-label">
                <DollarSign className="h-4 w-4 inline mr-2" />
                Price per Liter (₹) *
              </label>
              <input
                {...register('price', {
                  required: 'Price is required',
                  min: {
                    value: 1,
                    message: 'Price must be at least ₹1'
                  },
                  max: {
                    value: 1000,
                    message: 'Price cannot exceed ₹1000'
                  }
                })}
                type="number"
                step="0.01"
                className="form-input"
                placeholder="50"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.price.message}
                </p>
              )}
            </div>

            <div>
              <label className="form-label">
                <Clock className="h-4 w-4 inline mr-2" />
                Availability *
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    {...register('morning')}
                    type="checkbox"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Morning (6 AM - 12 PM)</span>
                </label>
                <label className="flex items-center">
                  <input
                    {...register('evening')}
                    type="checkbox"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Evening (4 PM - 8 PM)</span>
                </label>
                <label className="flex items-center">
                  <input
                    {...register('both')}
                    type="checkbox"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Both Morning & Evening</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Farm Features (Optional)
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <label className="flex items-center">
              <input
                {...register('organic')}
                type="checkbox"
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">🌱 Organic</span>
            </label>
            <label className="flex items-center">
              <input
                {...register('grassFed')}
                type="checkbox"
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">🌿 Grass Fed</span>
            </label>
            <label className="flex items-center">
              <input
                {...register('a2Milk')}
                type="checkbox"
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">🥛 A2 Milk</span>
            </label>
            <label className="flex items-center">
              <input
                {...register('homeDelivery')}
                type="checkbox"
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">🚚 Home Delivery</span>
            </label>
            <label className="flex items-center">
              <input
                {...register('bulkOrders')}
                type="checkbox"
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">📦 Bulk Orders</span>
            </label>
            <label className="flex items-center">
              <input
                {...register('pasteurized')}
                type="checkbox"
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">🔥 Pasteurized</span>
            </label>
            <label className="flex items-center">
              <input
                {...register('rawMilk')}
                type="checkbox"
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">🥛 Raw Milk</span>
            </label>
            <label className="flex items-center">
              <input
                {...register('ecoFriendly')}
                type="checkbox"
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">♻️ Eco Friendly</span>
            </label>
          </div>
        </div>

        {/* Location Information */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            <MapPin className="h-5 w-5 inline mr-2" />
            Location Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="form-label">Address *</label>
              <input
                {...register('address', {
                  required: 'Address is required'
                })}
                type="text"
                className="form-input"
                placeholder="Enter your farm address"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.address.message}
                </p>
              )}
            </div>

            <div>
              <label className="form-label">City *</label>
              <input
                {...register('city', {
                  required: 'City is required'
                })}
                type="text"
                className="form-input"
                placeholder="Enter city"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.city.message}
                </p>
              )}
            </div>

            <div>
              <label className="form-label">State *</label>
              <input
                {...register('state', {
                  required: 'State is required'
                })}
                type="text"
                className="form-input"
                placeholder="Enter state"
              />
              {errors.state && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.state.message}
                </p>
              )}
            </div>

            <div>
              <label className="form-label">Latitude</label>
              <input
                {...register('latitude')}
                type="number"
                step="any"
                className="form-input"
                placeholder="e.g., 28.6139"
              />
            </div>

            <div>
              <label className="form-label">Longitude</label>
              <input
                {...register('longitude')}
                type="number"
                step="any"
                className="form-input"
                placeholder="e.g., 77.2090"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            <Phone className="h-5 w-5 inline mr-2" />
            Contact Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Phone Number *</label>
              <input
                {...register('phone', {
                  required: 'Phone number is required'
                })}
                type="tel"
                className="form-input"
                placeholder="Enter your phone number"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <label className="form-label">WhatsApp Number</label>
              <input
                {...register('whatsapp')}
                type="tel"
                className="form-input"
                placeholder="Enter WhatsApp number (optional)"
              />
            </div>

            <div className="md:col-span-2">
              <label className="form-label">Email Address</label>
              <input
                {...register('email')}
                type="email"
                className="form-input"
                placeholder="Enter email address (optional)"
              />
            </div>
          </div>
        </div>

        {/* Farm Images */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            <Camera className="h-5 w-5 inline mr-2" />
            Farm Images
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="form-label">Upload Images (Max 5)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="form-input"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Upload high-quality images of your farm, facilities, and cattle.
              </p>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="loading-spinner h-5 w-5"></div>
            ) : (
              <Save className="h-5 w-5" />
            )}
            <span>{loading ? 'Creating...' : 'Create Farm'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddFarm