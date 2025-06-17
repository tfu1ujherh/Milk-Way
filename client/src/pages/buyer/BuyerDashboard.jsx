import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { farmService } from '../../services/farmService'
import FarmGrid from '../../components/farm/FarmGrid'
import SearchBar from '../../components/common/SearchBar'
import { Filter, MapPin, Clock, Star, Heart, TrendingUp, Users, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'

const BuyerDashboard = () => {
  const { user } = useAuth()
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    availability: '',
    minRating: '',
    maxDistance: '',
    sortBy: 'nearest',
    features: []
  })
  const [showFilters, setShowFilters] = useState(false)
  const [stats, setStats] = useState({
    totalFarms: 0,
    averagePrice: 0,
    averageRating: 0,
    nearbyFarms: 0
  })

  useEffect(() => {
    fetchFarms()
  }, [filters])

  const fetchFarms = async () => {
    try {
      setLoading(true)
      const params = {
        ...filters,
        search: searchQuery
      }
      const data = await farmService.getAllFarms(params)
      setFarms(data.farms || [])
      
      // Calculate stats
      const totalFarms = data.farms?.length || 0
      const averagePrice = totalFarms > 0 
        ? data.farms.reduce((sum, farm) => sum + farm.price, 0) / totalFarms 
        : 0
      const averageRating = totalFarms > 0
        ? data.farms.reduce((sum, farm) => sum + (farm.averageRating || 0), 0) / totalFarms
        : 0
      
      setStats({
        totalFarms,
        averagePrice: Math.round(averagePrice),
        averageRating: averageRating.toFixed(1),
        nearbyFarms: data.farms?.filter(farm => farm.distance && farm.distance < 10).length || 0
      })
    } catch (error) {
      console.error('Error fetching farms:', error)
      // toast.error('Failed to load farms')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (query) => {
    setSearchQuery(query)
    if (!query.trim()) {
      fetchFarms()
      return
    }

    try {
      setLoading(true)
      const data = await farmService.searchFarms(query)
      setFarms(data.farms || [])
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleFeatureToggle = (feature) => {
    setFilters(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
  }

  const clearFilters = () => {
    setFilters({
      availability: '',
      minRating: '',
      maxDistance: '',
      sortBy: 'nearest',
      features: []
    })
    setSearchQuery('')
  }

  const quickFilters = [
    { label: 'Nearest', value: 'nearest', key: 'sortBy' },
    { label: 'Highest Rated', value: 'rating', key: 'sortBy' },
    { label: 'Morning Available', value: 'morning', key: 'availability' },
    { label: 'Evening Available', value: 'evening', key: 'availability' },
    { label: 'Organic', value: 'organic', key: 'features' },
    { label: 'A2 Milk', value: 'a2-milk', key: 'features' },
  ]

  const availableFeatures = [
    'organic', 'grass-fed', 'a2-milk', 'home-delivery', 
    'bulk-orders', 'pasteurized', 'raw-milk', 'eco-friendly'
  ]

  const dashboardStats = [
    { 
      icon: TrendingUp, 
      label: 'Available Farms', 
      value: stats.totalFarms, 
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
    },
    { 
      icon: DollarSign, 
      label: 'Avg. Price/L', 
      value: `₹${stats.averagePrice}`, 
      color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' 
    },
    { 
      icon: Star, 
      label: 'Avg. Rating', 
      value: stats.averageRating, 
      color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400' 
    },
    { 
      icon: MapPin, 
      label: 'Nearby (<10km)', 
      value: stats.nearbyFarms, 
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400' 
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Find Fresh Milk
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Welcome back, {user?.name}! Discover quality dairy farms near you.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Link
            to="/buyer/wishlist"
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Heart className="h-5 w-5" />
            <span>My Wishlist</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {dashboardStats.map((stat, index) => (
          <div key={index} className="card p-4">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${stat.color} mr-3`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="card p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div className="flex-1">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search farms, locations, or farmers..."
              showFilters={true}
              onFilterToggle={() => setShowFilters(!showFilters)}
            />
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {quickFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => {
                if (filter.key === 'features') {
                  handleFeatureToggle(filter.value)
                } else {
                  handleFilterChange(filter.key, filter.value)
                }
              }}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                (filter.key === 'features' 
                  ? filters.features.includes(filter.value)
                  : filters[filter.key] === filter.value)
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {filter.label}
            </button>
          ))}
          {(Object.values(filters).some(f => f && f.length > 0) || searchQuery) && (
            <button
              onClick={clearFilters}
              className="px-3 py-1 rounded-full text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Availability</label>
                <select
                  value={filters.availability}
                  onChange={(e) => handleFilterChange('availability', e.target.value)}
                  className="form-input"
                >
                  <option value="">Any time</option>
                  <option value="morning">Morning</option>
                  <option value="evening">Evening</option>
                  <option value="both">Both</option>
                </select>
              </div>
              
              <div>
                <label className="form-label">Minimum Rating</label>
                <select
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', e.target.value)}
                  className="form-input"
                >
                  <option value="">Any rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                </select>
              </div>

              <div>
                <label className="form-label">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="form-input"
                >
                  <option value="nearest">Nearest First</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>

            {/* Features Filter */}
            <div>
              <label className="form-label">Features</label>
              <div className="flex flex-wrap gap-2">
                {availableFeatures.map((feature) => (
                  <button
                    key={feature}
                    onClick={() => handleFeatureToggle(feature)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.features.includes(feature)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {feature.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Farm Results */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Available Farms ({farms.length})
          </h2>
          {searchQuery && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Results for "{searchQuery}"
            </p>
          )}
        </div>

        <FarmGrid
          farms={farms}
          loading={loading}
          onRetry={fetchFarms}
          emptyMessage={searchQuery ? `No farms found for "${searchQuery}"` : "No farms available"}
        />
      </div>

      {/* Tips for Buyers */}
      <div className="mt-8 card p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Tips for Finding the Best Milk
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              📍 Check Distance
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Choose farms closer to you for fresher milk and lower transportation time.
            </p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
              ⭐ Read Reviews
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Check ratings and reviews from other buyers to ensure quality and reliability.
            </p>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              ⏰ Check Availability
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Verify farm availability times match your schedule for convenient pickup.
            </p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
              💬 Contact Directly
            </h3>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Reach out to farmers directly to ask questions and build relationships.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BuyerDashboard