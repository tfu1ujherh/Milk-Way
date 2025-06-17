import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MapPin, Phone, Clock, Star, Edit, Trash2, MessageCircle, Eye } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { wishlistService } from '../../services/wishlistService'
import { farmService } from '../../services/farmService'
import Rating from '../common/Rating'
import toast from 'react-hot-toast'

const FarmCard = ({ farm, onFarmDeleted = null, showActions = false }) => {
  const { user, isBuyer, isFarmer } = useAuth()
  const [isInWishlist, setIsInWishlist] = useState(farm.isInWishlist || false)
  const [loading, setLoading] = useState(false)

  const handleWishlistToggle = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isBuyer) return

    setLoading(true)
    try {
      if (isInWishlist) {
        await wishlistService.removeFromWishlist(farm._id)
        setIsInWishlist(false)
        toast.success('Removed from wishlist')
      } else {
        await wishlistService.addToWishlist(farm._id)
        setIsInWishlist(true)
        toast.success('Added to wishlist')
      }
    } catch (error) {
      toast.error('Failed to update wishlist')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteFarm = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!window.confirm('Are you sure you want to delete this farm? This action cannot be undone.')) {
      return
    }

    try {
      await farmService.deleteFarm(farm._id)
      toast.success('Farm deleted successfully')
      if (onFarmDeleted) {
        onFarmDeleted(farm._id)
      }
    } catch (error) {
      console.error('Delete farm error:', error)
      toast.error(error.response?.data?.message || 'Failed to delete farm')
    }
  }

  const handlePhoneCall = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (farm.contact?.phone) {
      window.open(`tel:${farm.contact.phone}`)
    }
  }

  const handleWhatsApp = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (farm.contact?.whatsapp || farm.contact?.phone) {
      const number = farm.contact.whatsapp || farm.contact.phone
      const message = `Hi! I'm interested in your dairy farm "${farm.name}" listed on MilkWay.`
      window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`)
    }
  }

  const getAvailabilityText = (availability) => {
    if (Array.isArray(availability)) {
      return availability.join(', ')
    }
    return availability || 'Not specified'
  }

  // Check if current user can edit this farm
  const canEdit = isFarmer && user?._id === farm.owner?._id

  return (
    <div className="card group relative overflow-hidden hover:shadow-lg transition-all duration-300">
      <Link to={`/farm/${farm._id}`} className="block">
        {/* Farm Image */}
        <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
          {farm.images && farm.images.length > 0 ? (
            <img
              src={farm.images[0].url}
              alt={farm.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.src = 'https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg?auto=compress&cs=tinysrgb&w=400'
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900">
              <div className="text-4xl">🏡</div>
            </div>
          )}
          
          {/* Action Buttons Overlay */}
          <div className="absolute top-3 right-3 flex flex-col space-y-2">
            {/* Wishlist Button */}
            {isBuyer && (
              <button
                onClick={handleWishlistToggle}
                disabled={loading}
                className={`
                  p-2 rounded-full transition-all duration-200 backdrop-blur-sm
                  ${isInWishlist 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
                  }
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
              </button>
            )}

            {/* Farm Actions for Farmers */}
            {canEdit && showActions && (
              <>
                <Link
                  to={`/farmer/edit-farm/${farm._id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 bg-white/80 hover:bg-white text-blue-600 rounded-full transition-colors backdrop-blur-sm"
                  title="Edit farm"
                >
                  <Edit className="h-4 w-4" />
                </Link>
                <button
                  onClick={handleDeleteFarm}
                  className="p-2 bg-white/80 hover:bg-white text-red-600 rounded-full transition-colors backdrop-blur-sm"
                  title="Delete farm"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          {/* Quick Contact Buttons for Buyers */}
          {isBuyer && (
            <div className="absolute bottom-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {farm.contact?.phone && (
                <button
                  onClick={handlePhoneCall}
                  className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors backdrop-blur-sm"
                  title="Call Now"
                >
                  <Phone className="h-4 w-4" />
                </button>
              )}
              {(farm.contact?.whatsapp || farm.contact?.phone) && (
                <button
                  onClick={handleWhatsApp}
                  className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors backdrop-blur-sm"
                  title="WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {/* View Count */}
          <div className="absolute bottom-3 left-3 flex items-center space-x-1 bg-black/50 text-white px-2 py-1 rounded-full text-xs backdrop-blur-sm">
            <Eye className="h-3 w-3" />
            <span>{farm.views || 0}</span>
          </div>
        </div>

        {/* Farm Details */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
              {farm.name}
            </h3>
            <div className="text-lg font-bold text-dairy-600 dark:text-dairy-400">
              ₹{farm.price}/L
            </div>
          </div>

          {/* Rating */}
          {farm.averageRating > 0 && (
            <div className="mb-2">
              <Rating 
                rating={farm.averageRating} 
                totalReviews={farm.totalReviews}
                size="small"
              />
            </div>
          )}

          {/* Location */}
          <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="text-sm truncate">
              {farm.location?.address}, {farm.location?.city}
            </span>
          </div>

          {/* Availability */}
          <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
            <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="text-sm capitalize">
              {getAvailabilityText(farm.availability)}
            </span>
          </div>

          {/* Contact */}
          <div className="flex items-center text-gray-600 dark:text-gray-400 mb-3">
            <Phone className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="text-sm">{farm.contact?.phone}</span>
          </div>

          {/* Features */}
          {farm.features && farm.features.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {farm.features.slice(0, 3).map((feature, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full"
                >
                  {feature.replace('-', ' ')}
                </span>
              ))}
              {farm.features.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                  +{farm.features.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Owner Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-primary-700 dark:text-primary-300">
                  {farm.owner?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {farm.owner?.name}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {farm.isVerified && (
                <div className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                  ✓ Verified
                </div>
              )}
              {farm.featured && (
                <div className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full">
                  ⭐ Featured
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default FarmCard