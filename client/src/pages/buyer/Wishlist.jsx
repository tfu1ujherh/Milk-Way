import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { wishlistService } from '../../services/wishlistService'
import FarmGrid from '../../components/farm/FarmGrid'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'
import { Heart, Trash2, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

const Wishlist = () => {
  const { user } = useAuth()
  const [wishlist, setWishlist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      setLoading(true)
      const data = await wishlistService.getWishlist()
      setWishlist(data.wishlist)
      setError(null)
    } catch (error) {
      console.error('Error fetching wishlist:', error)
      setError('Failed to load wishlist')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFromWishlist = async (farmId) => {
    try {
      await wishlistService.removeFromWishlist(farmId)
      toast.success('Removed from wishlist')
      
      // Update local state
      setWishlist(prev => ({
        ...prev,
        farms: prev.farms.filter(item => item.farm._id !== farmId)
      }))
    } catch (error) {
      toast.error('Failed to remove from wishlist')
    }
  }

  const handleUpdateNotes = async (farmId, notes) => {
    try {
      await wishlistService.updateNotes(farmId, notes)
      toast.success('Notes updated')
      
      // Update local state
      setWishlist(prev => ({
        ...prev,
        farms: prev.farms.map(item => 
          item.farm._id === farmId 
            ? { ...item, notes }
            : item
        )
      }))
    } catch (error) {
      toast.error('Failed to update notes')
    }
  }

  if (loading) {
    return <LoadingSpinner text="Loading your wishlist..." />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchWishlist} />
  }

  const farms = wishlist?.farms?.map(item => item.farm) || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Heart className="h-8 w-8 text-red-500" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Wishlist
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Your saved dairy farms - {farms.length} farm{farms.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      {/* Wishlist Stats */}
      {farms.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6 text-center">
            <div className="text-3xl font-bold text-red-500 mb-2">
              {farms.length}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Saved Farms
            </div>
          </div>
          
          <div className="card p-6 text-center">
            <div className="text-3xl font-bold text-yellow-500 mb-2">
              {farms.length > 0 
                ? (farms.reduce((sum, farm) => sum + (farm.averageRating || 0), 0) / farms.length).toFixed(1)
                : '0.0'
              }
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Avg. Rating
            </div>
          </div>
          
          <div className="card p-6 text-center">
            <div className="text-3xl font-bold text-green-500 mb-2">
              ₹{farms.length > 0 
                ? Math.round(farms.reduce((sum, farm) => sum + (farm.price || 0), 0) / farms.length)
                : '0'
              }
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Avg. Price/L
            </div>
          </div>
        </div>
      )}

      {/* Wishlist Content */}
      {farms.length > 0 ? (
        <div className="space-y-6">
          {/* Farms Grid */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Your Saved Farms
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.farms.map((item) => (
                <div key={item.farm._id} className="relative">
                  {/* Farm Card */}
                  <div className="card group relative overflow-hidden">
                    <Link to={`/farm/${item.farm._id}`} className="block">
                      {/* Farm Image */}
                      <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        {item.farm.images && item.farm.images.length > 0 ? (
                          <img
                            src={item.farm.images[0].url}
                            alt={item.farm.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-4xl">🏡</div>
                          </div>
                        )}
                        
                        {/* Remove Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleRemoveFromWishlist(item.farm._id)
                          }}
                          className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Farm Details */}
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {item.farm.name}
                          </h3>
                          <div className="text-lg font-bold text-dairy-600 dark:text-dairy-400">
                            ₹{item.farm.price}/L
                          </div>
                        </div>

                        {/* Rating */}
                        {item.farm.averageRating > 0 && (
                          <div className="mb-2">
                            <div className="flex items-center space-x-1">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <span
                                    key={i}
                                    className={`text-sm ${
                                      i < Math.floor(item.farm.averageRating)
                                        ? 'text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {item.farm.averageRating.toFixed(1)} ({item.farm.totalReviews} reviews)
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Location */}
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          📍 {item.farm.location?.city}, {item.farm.location?.state}
                        </div>

                        {/* Added Date */}
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          Added on {new Date(item.addedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </Link>

                    {/* Notes Section */}
                    {item.notes && (
                      <div className="px-4 pb-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                              {item.notes}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/buyer/dashboard"
                className="btn-primary"
              >
                Discover More Farms
              </Link>
              <button
                onClick={() => {
                  const farmNames = farms.map(farm => farm.name).join(', ')
                  navigator.clipboard.writeText(`My MilkWay Wishlist: ${farmNames}`)
                  toast.success('Wishlist copied to clipboard!')
                }}
                className="btn-secondary"
              >
                Share Wishlist
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16">
          <Heart className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Your wishlist is empty
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Start exploring dairy farms and save your favorites to build your wishlist.
          </p>
          <Link
            to="/buyer/dashboard"
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Heart className="h-5 w-5" />
            <span>Discover Farms</span>
          </Link>
        </div>
      )}
    </div>
  )
}

export default Wishlist