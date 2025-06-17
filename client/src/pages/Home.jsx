import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { farmService } from '../services/farmService'
import SearchBar from '../components/common/SearchBar'
import FarmGrid from '../components/farm/FarmGrid'
import { ArrowRight,
  TrendingUp,
  Users,
  Star,
  MapPin,
  Globe,
  MessageCircle,
  Phone, } from 'lucide-react'



const Home = () => {
  const { user, isFarmer, isBuyer } = useAuth()
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchFarms()
  }, [])

  const fetchFarms = async () => {
    try {
      setLoading(true)
      const data = await farmService.getAllFarms({ limit: 8 })
      setFarms(data.farms || [])
    } catch (error) {
      console.error('Error fetching farms:', error)
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
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    { icon: Users, label: 'Active Farmers', value: '500+', color: 'bg-blue-100 text-blue-600' },
    { icon: Star, label: 'Happy Buyers', value: '1000+', color: 'bg-green-100 text-green-600' },
    { icon: MapPin, label: 'Locations', value: '50+', color: 'bg-purple-100 text-purple-600' },
    { icon: TrendingUp, label: 'Quality Rating', value: '4.8/5', color: 'bg-yellow-100 text-yellow-600' },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="dairy-gradient text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Welcome, {user?.name}! 👋
            </h1>
            <p className="text-xl md:text-2xl mb-2 opacity-90">
              {user?.role === 'farmer' ? 'Dairy Farmer' : 'Milk Buyer'}
            </p>
            <p className="text-lg md:text-xl mb-8 opacity-80">
              Connecting dairy farmers with quality-conscious buyers for fresh, local milk
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              {isFarmer ? (
                <>
                  <Link
                    to="/farmer/add-farm"
                    className="bg-white text-primary-600 hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-all duration-200 transform hover:scale-105"
                  >
                    <span>List Your Farm</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    to="/farmer/dashboard"
                    className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-semibold transition-all duration-200"
                  >
                    Manage Farms
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/buyer/dashboard"
                    className="bg-white text-primary-600 hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-all duration-200 transform hover:scale-105"
                  >
                    <span>Find Fresh Milk</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    to="/buyer/wishlist"
                    className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-semibold transition-all duration-200"
                  >
                    My Wishlist
                  </Link>
                </>
              )}
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <SearchBar
                onSearch={handleSearch}
                placeholder="Search for farms, locations, or farmers..."
                className="text-left"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${stat.color} mb-4`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Farms Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {searchQuery ? `Search Results for "${searchQuery}"` : 'Featured Farms'}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {searchQuery 
                ? `Discover farms matching your search criteria`
                : 'Discover fresh, quality milk from verified local dairy farmers'
              }
            </p>
          </div>

          <FarmGrid
            farms={farms}
            loading={loading}
            onRetry={fetchFarms}
            emptyMessage={searchQuery ? `No farms found for "${searchQuery}"` : "No farms available"}
          />

          {!searchQuery && farms.length >= 8 && (
            <div className="text-center mt-12">
              <Link
                to={isBuyer ? "/buyer/dashboard" : "/dashboard"}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <span>View All Farms</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Why Choose MilkWay?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Fresh & Quality</h3>
                    <p className="text-gray-600 dark:text-gray-400">Direct from verified local dairy farms</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Easy Connect</h3>
                    <p className="text-gray-600 dark:text-gray-400">Simple platform to connect farmers and buyers</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Trusted Reviews</h3>
                    <p className="text-gray-600 dark:text-gray-400">Community-driven ratings and reviews</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Location-Based</h3>
                    <p className="text-gray-600 dark:text-gray-400">Find the nearest farms with GPS integration</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Dairy farm"
                className="rounded-xl shadow-lg w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="dairy-gradient w-10 h-10 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">MW</span>
                </div>
                <span className="text-2xl font-bold">MilkWay</span>
              </div>
              <p className="text-gray-400 mb-4">
                Connecting dairy farmers with quality-conscious buyers for fresh, local milk. 
                Building sustainable relationships in the dairy industry.
              </p>
              <div className="flex space-x-4">
                <Globe className="h-6 w-6 text-gray-400" />
                <MessageCircle className="h-6 w-6 text-gray-400" />
                <Phone className="h-6 w-6 text-gray-400" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Farm Listings</li>
                <li>Google Maps</li>
                <li>Reviews & Ratings</li>
                <li>Direct Communication</li>
                <li>Wishlist</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>FAQ</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MilkWay. All rights reserved. Built with ❤️ for the dairy community.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home