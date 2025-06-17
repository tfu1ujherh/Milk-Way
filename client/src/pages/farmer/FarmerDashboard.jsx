import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { farmService } from '../../services/farmService'
import FarmGrid from '../../components/farm/FarmGrid'
import SearchBar from '../../components/common/SearchBar'
import { Plus, BarChart3, Star, DollarSign, Users } from 'lucide-react'
import toast from 'react-hot-toast'

const FarmerDashboard = () => {
  const { user } = useAuth()
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalFarms: 0,
    totalReviews: 0,
    averageRating: 0,
    totalEarnings: 0
  })

  useEffect(() => {
    fetchFarms()
  }, [])

  const fetchFarms = async () => {
    try {
      setLoading(true)
      const data = await farmService.getFarmerFarms()
      setFarms(data.farms || [])
      
      // Calculate stats
      const totalFarms = data.farms?.length || 0
      const totalReviews = data.farms?.reduce((sum, farm) => sum + (farm.totalReviews || 0), 0) || 0
      const averageRating = data.farms?.length 
        ? data.farms.reduce((sum, farm) => sum + (farm.averageRating || 0), 0) / data.farms.length 
        : 0
      const totalEarnings = data.farms?.reduce((sum, farm) => sum + (farm.price * 30 || 0), 0) || 0 // Estimated monthly

      setStats({
        totalFarms,
        totalReviews,
        averageRating: averageRating || 0,
        totalEarnings
      })
    } catch (error) {
      console.error('Error fetching farms:', error)
      toast.error('Failed to load farms')
    } finally {
      setLoading(false)
    }
  }

  const handleFarmDeleted = (farmId) => {
    setFarms(prevFarms => prevFarms.filter(farm => farm._id !== farmId))
    toast.success('Farm deleted successfully')
  }

  const dashboardStats = [
    { 
      icon: BarChart3, 
      label: 'Total Farms', 
      value: stats.totalFarms, 
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
    },
    { 
      icon: Star, 
      label: 'Average Rating', 
      value: stats.averageRating.toFixed(1), 
      color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400' 
    },
    { 
      icon: Users, 
      label: 'Total Reviews', 
      value: stats.totalReviews, 
      color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' 
    },
    { 
      icon: DollarSign, 
      label: 'Est. Monthly', 
      value: `₹${stats.totalEarnings.toLocaleString()}`, 
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400' 
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Farmer Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Welcome back, {user?.name}! Manage your dairy farms and track your performance.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link
            to="/farmer/add-farm"
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add New Farm</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardStats.map((stat, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/farmer/add-farm"
            className="btn-primary"
          >
            Add New Farm
          </Link>
          <Link
            to="/profile"
            className="btn-secondary"
          >
            Update Profile
          </Link>
          <Link
            to="/"
            className="btn-secondary"
          >
            View All Farms
          </Link>
        </div>
      </div>

      {/* My Farms Section */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            My Farms ({farms.length})
          </h2>
        </div>

        <FarmGrid
          farms={farms}
          loading={loading}
          onRetry={fetchFarms}
          onFarmDeleted={handleFarmDeleted}
          showActions={true}
          emptyMessage="You haven't added any farms yet"
        />

        {farms.length === 0 && !loading && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🏡</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No farms added yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start by adding your first dairy farm to connect with buyers.
            </p>
            <Link
              to="/farmer/add-farm"
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Your First Farm</span>
            </Link>
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="mt-8 card p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Tips for Success
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              📸 High-Quality Photos
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Upload clear, well-lit photos of your farm and facilities to attract more buyers.
            </p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
              ⏰ Update Availability
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Keep your availability schedule up-to-date to help buyers plan their visits.
            </p>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              💬 Respond Quickly
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Quick responses to buyer inquiries can significantly increase your sales.
            </p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
              🌟 Maintain Quality
            </h3>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Consistent quality and good reviews will help build your reputation.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FarmerDashboard