import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { farmService } from '../services/farmService'
import { reviewService } from '../services/reviewService'
import { wishlistService } from '../services/wishlistService'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import Rating from '../components/common/Rating'
import { 
  MapPin, 
  Phone, 
  Clock, 
  DollarSign, 
  Heart, 
  Star, 
  User,
  MessageCircle,
  Share2,
  ArrowLeft,
  Eye,
  Calendar,
  Shield,
  Award,
  Truck,
  Leaf
} from 'lucide-react'
import toast from 'react-hot-toast'

const FarmDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isBuyer } = useAuth()
  
  const [farm, setFarm] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  })

  useEffect(() => {
    fetchFarmDetails()
    if (isBuyer) {
      checkWishlistStatus()
    }
  }, [id, isBuyer])

  useEffect(() => {
    if (farm) {
      fetchReviews()
    }
  }, [farm])

  const fetchFarmDetails = async () => {
    try {
      setLoading(true)
      const data = await farmService.getFarmById(id)
      setFarm(data)
      setError(null)
    } catch (error) {
      console.error('Error fetching farm details:', error)
      setError('Failed to load farm details')
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true)
      const data = await reviewService.getFarmReviews(id)
      setReviews(data.reviews || [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setReviewsLoading(false)
    }
  }

  const checkWishlistStatus = async () => {
    try {
      const data = await wishlistService.isInWishlist(id)
      setIsInWishlist(data.isInWishlist)
    } catch (error) {
      console.error('Error checking wishlist status:', error)
    }
  }

  const handleWishlistToggle = async () => {
    if (!isBuyer) return

    try {
      if (isInWishlist) {
        await wishlistService.removeFromWishlist(id)
        setIsInWishlist(false)
        toast.success('Removed from wishlist')
      } else {
        await wishlistService.addToWishlist(id)
        setIsInWishlist(true)
        toast.success('Added to wishlist')
      }
    } catch (error) {
      toast.error('Failed to update wishlist')
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!isBuyer) return

    try {
      await reviewService.addReview({
        farm: id,
        rating: newReview.rating,
        comment: newReview.comment
      })
      
      toast.success('Review submitted successfully')
      setShowReviewForm(false)
      setNewReview({ rating: 5, comment: '' })
      fetchReviews()
      fetchFarmDetails() // Refresh farm data to update rating
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review')
    }
  }

  const handlePhoneCall = () => {
    if (farm?.contact?.phone) {
      window.open(`tel:${farm.contact.phone}`)
    }
  }

  const handleWhatsApp = () => {
    if (farm?.contact?.whatsapp || farm?.contact?.phone) {
      const number = farm.contact.whatsapp || farm.contact.phone
      const message = `Hi! I'm interested in your dairy farm "${farm.name}" listed on MilkWay.`
      window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: farm.name,
          text: `Check out ${farm.name} on MilkWay - Fresh milk from local dairy farmers`,
          url: window.location.href
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  const getAvailabilityText = (availability) => {
    if (Array.isArray(availability)) {
      return availability.map(time => 
        time.charAt(0).toUpperCase() + time.slice(1)
      ).join(', ')
    }
    return availability || 'Not specified'
  }

  const getFeatureIcon = (feature) => {
    const icons = {
      'organic': '🌱',
      'grass-fed': '🌿',
      'a2-milk': '🥛',
      'home-delivery': '🚚',
      'bulk-orders': '📦',
      'pasteurized': '🔥',
      'raw-milk': '🥛',
      'eco-friendly': '♻️'
    }
    return icons[feature] || '✨'
  }

  if (loading) {
    return <LoadingSpinner text="Loading farm details..." />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchFarmDetails} />
  }

  if (!farm) {
    return <ErrorMessage message="Farm not found" />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Farm Images */}
          <div className="card p-0 overflow-hidden">
            {farm.images && farm.images.length > 0 ? (
              <div>
                <div className="relative h-96">
                  <img
                    src={farm.images[selectedImage]?.url}
                    alt={farm.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 flex space-x-2">
                    {isBuyer && (
                      <button
                        onClick={handleWishlistToggle}
                        className={`p-3 rounded-full transition-all duration-200 backdrop-blur-sm ${
                          isInWishlist 
                            ? 'bg-red-500 text-white hover:bg-red-600' 
                            : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
                        }`}
                      >
                        <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
                      </button>
                    )}
                    <button 
                      onClick={handleShare}
                      className="p-3 bg-white/80 hover:bg-white text-gray-600 rounded-full transition-colors backdrop-blur-sm"
                    >
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                {farm.images.length > 1 && (
                  <div className="p-4 flex space-x-2 overflow-x-auto">
                    {farm.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                          selectedImage === index 
                            ? 'border-primary-500' 
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={`${farm.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-96 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <div className="text-6xl">🏡</div>
              </div>
            )}
          </div>

          {/* Farm Information */}
          <div className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {farm.name}
                </h1>
                {farm.averageRating > 0 && (
                  <Rating 
                    rating={farm.averageRating} 
                    totalReviews={farm.totalReviews}
                    size="large"
                  />
                )}
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-dairy-600 dark:text-dairy-400">
                  ₹{farm.price}/L
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  {farm.isVerified && (
                    <div className="text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full flex items-center space-x-1">
                      <Shield className="h-3 w-3" />
                      <span>Verified</span>
                    </div>
                  )}
                  {farm.featured && (
                    <div className="text-sm bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full flex items-center space-x-1">
                      <Award className="h-3 w-3" />
                      <span>Featured</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {farm.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {farm.description}
              </p>
            )}

            {/* Features */}
            {farm.features && farm.features.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Farm Features
                </h3>
                <div className="flex flex-wrap gap-2">
                  {farm.features.map((feature, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center space-x-1 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm"
                    >
                      <span>{getFeatureIcon(feature)}</span>
                      <span>{feature.replace('-', ' ')}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Farm Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Location</div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {farm.location?.address}, {farm.location?.city}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Availability</div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {getAvailabilityText(farm.availability)}
                    </div>
                  </div>
                </div>

                {farm.capacity && (
                  <div className="flex items-center space-x-3">
                    <Truck className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Daily Production</div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {farm.capacity.dailyProduction} liters/day
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Farm Owner</div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {farm.owner?.name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Eye className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Views</div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {farm.views || 0} views
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Listed</div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {new Date(farm.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Reviews ({reviews.length})
              </h2>
              {isBuyer && !showReviewForm && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="btn-primary"
                >
                  Write Review
                </button>
              )}
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="mb-4">
                  <label className="form-label">Rating</label>
                  <Rating
                    rating={newReview.rating}
                    interactive={true}
                    onRatingChange={(rating) => setNewReview(prev => ({ ...prev, rating }))}
                    showText={false}
                    size="large"
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">Comment</label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                    className="form-input"
                    rows="3"
                    placeholder="Share your experience with this farm..."
                  />
                </div>
                <div className="flex space-x-3">
                  <button type="submit" className="btn-primary">
                    Submit Review
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Reviews List */}
            {reviewsLoading ? (
              <LoadingSpinner text="Loading reviews..." />
            ) : reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {review.buyer?.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {review.buyer?.name}
                          </span>
                          <Rating rating={review.rating} showText={false} size="small" />
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          {review.comment}
                        </p>
                        <div className="text-sm text-gray-500 dark:text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No reviews yet. Be the first to review this farm!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Contact Card */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Contact Farm
            </h3>
            
            <div className="space-y-3">
              {farm.contact?.phone && (
                <button
                  onClick={handlePhoneCall}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <Phone className="h-5 w-5" />
                  <span>Call Now</span>
                </button>
              )}
              
              {(farm.contact?.whatsapp || farm.contact?.phone) && (
                <button
                  onClick={handleWhatsApp}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>WhatsApp</span>
                </button>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-2 mb-2">
                  <Phone className="h-4 w-4" />
                  <span>{farm.contact?.phone}</span>
                </div>
                {farm.contact?.email && (
                  <div className="flex items-center space-x-2">
                    <span>📧</span>
                    <span>{farm.contact.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Map Card */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Location
            </h3>
            
            <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Map integration coming soon
                </p>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>{farm.location?.address}</p>
              <p>{farm.location?.city}, {farm.location?.state}</p>
            </div>
            
            <button className="w-full mt-3 btn-secondary">
              Get Directions
            </button>
          </div>

          {/* Farm Stats */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Farm Statistics
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Average Rating</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {farm.averageRating?.toFixed(1) || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Reviews</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {farm.totalReviews || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Views</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {farm.views || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Listed</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(farm.createdAt).toLocaleDateString()}
                </span>
              </div>
              {farm.capacity?.dailyProduction && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Daily Production</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {farm.capacity.dailyProduction}L
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FarmDetails