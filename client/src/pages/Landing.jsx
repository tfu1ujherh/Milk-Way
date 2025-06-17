import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowRight, 
  MapPin, 
  Star, 
  Phone, 
  MessageCircle, 
  Search, 
  Shield, 
  Clock, 
  Users, 
  Heart,
  Camera,
  TrendingUp,
  Award,
  Globe,
  Smartphone,
  CheckCircle
} from 'lucide-react'

const Landing = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  const heroImages = [
    "https://media.istockphoto.com/id/1297005860/photo/raw-milk-being-poured-into-container.jpg?s=612x612&w=0&k=20&c=5Xumh49_zYs9GjLkGpZXM41tS17K8M-svN9jLMv0JpE=",
    "https://images.pexels.com/photos/422218/pexels-photo-422218.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://img.freepik.com/free-photo/cows-eating-lush-grass-green-field-front-fuji-mountain-japan_335224-36.jpg?semt=ais_hybrid&w=740",
    "https://st2.depositphotos.com/1368182/7892/i/450/depositphotos_78920596-stock-photo-cow-farm-agriculture.jpg"
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const features = [
    {
      icon: Users,
      title: "Role-Based Access",
      description: "Separate dashboards for Dairy Farmers and Milk Buyers with JWT-secured authentication",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: MapPin,
      title: "Google Maps Integration",
      description: "Find nearby farms with embedded maps, directions, and geolocation services",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: Star,
      title: "Rating & Review System",
      description: "Buyers can rate and review farms to help others find trustworthy farmers",
      color: "bg-yellow-100 text-yellow-600"
    },
    {
      icon: Search,
      title: "Advanced Search & Filters",
      description: "Filter farms by location, availability, ratings, and price ranges",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: Phone,
      title: "Direct Communication",
      description: "Contact farmers via phone calls and WhatsApp with mobile deep links",
      color: "bg-red-100 text-red-600"
    },
    {
      icon: Heart,
      title: "Wishlist Feature",
      description: "Save favorite farms and manage your preferred dairy suppliers",
      color: "bg-pink-100 text-pink-600"
    },
    {
      icon: Camera,
      title: "Photo Upload",
      description: "Farmers can showcase their farms with high-quality images using Multer",
      color: "bg-indigo-100 text-indigo-600"
    },
    {
      icon: Clock,
      title: "Availability Management",
      description: "Set and view milk availability for morning and evening schedules",
      color: "bg-orange-100 text-orange-600"
    }
  ]

  const stats = [
    { number: "500+", label: "Active Farmers", icon: Users },
    { number: "1000+", label: "Happy Buyers", icon: Heart },
    { number: "50+", label: "Cities Covered", icon: MapPin },
    { number: "4.8/5", label: "Average Rating", icon: Star }
  ]

  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Dairy Farmer",
      image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150",
      quote: "MilkWay helped me connect with buyers directly. My farm's visibility increased by 300%!"
    },
    {
      name: "Priya Sharma",
      role: "Milk Buyer",
      image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150",
      quote: "Finding fresh, quality milk from verified local farmers has never been easier."
    },
    {
      name: "Amit Patel",
      role: "Dairy Farmer",
      image: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150",
      quote: "The rating system helped build trust with customers. Highly recommended platform!"
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="dairy-gradient w-10 h-10 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">MW</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">MilkWay</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-primary-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-primary-600 transition-colors">How It Works</a>
              <a href="#testimonials" className="text-gray-700 hover:text-primary-600 transition-colors">Testimonials</a>
              <a href="#contact" className="text-gray-700 hover:text-primary-600 transition-colors">Contact</a>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image Slider */}
        <div className="absolute inset-0">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={image}
                alt={`Dairy farm ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            Welcome to <span className="text-dairy-400">MilkWay</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 animate-slide-up">
            Connecting Dairy Farmers with Quality-Conscious Buyers for Fresh, Local Milk
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
            <Link
              to="/register"
              className="bg-dairy-500 hover:bg-dairy-600 text-white px-8 py-4 rounded-lg font-semibold text-lg flex items-center space-x-2 transition-all duration-200 transform hover:scale-105"
            >
              <span>Start Your Journey</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-dairy-100 text-dairy-600 rounded-full mb-4">
                  <stat.icon className="h-8 w-8" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Dairy Trading
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              MilkWay provides everything you need to connect, trade, and build lasting relationships in the dairy industry
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${feature.color} mb-4`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How MilkWay Works</h2>
            <p className="text-xl text-gray-600">Simple steps to connect farmers and buyers</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* For Farmers */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">For Dairy Farmers</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-dairy-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Register & Create Profile</h4>
                    <p className="text-gray-600">Sign up as a dairy farmer and complete your profile</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-dairy-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">List Your Farm</h4>
                    <p className="text-gray-600">Add farm details, photos, location, and availability</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-dairy-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Connect with Buyers</h4>
                    <p className="text-gray-600">Receive inquiries and build relationships with buyers</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-dairy-500 text-white rounded-full flex items-center justify-center font-bold">4</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Grow Your Business</h4>
                    <p className="text-gray-600">Build reputation through reviews and expand your reach</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Buyers */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">For Milk Buyers</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Sign Up as Buyer</h4>
                    <p className="text-gray-600">Create your account and set your location preferences</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Search & Filter Farms</h4>
                    <p className="text-gray-600">Find nearby farms using advanced search and filters</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Contact Farmers</h4>
                    <p className="text-gray-600">Connect via phone, WhatsApp, or in-app messaging</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">4</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Rate & Review</h4>
                    <p className="text-gray-600">Share your experience to help other buyers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Complete Feature Set</h2>
            <p className="text-xl text-gray-600">Everything you need for successful dairy trading</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Authentication & Security */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-xl">
              <Shield className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">Authentication & Security</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>JWT-based secure authentication</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Role-based access control</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Secure user registration</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Profile management</span>
                </li>
              </ul>
            </div>

            {/* Farm Management */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-8 rounded-xl">
              <TrendingUp className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">Farm Management</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Add/edit/delete farm listings</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Photo upload with Multer</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Availability scheduling</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Price management</span>
                </li>
              </ul>
            </div>

            {/* Communication */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-100 p-8 rounded-xl">
              <Smartphone className="h-12 w-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">Communication</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Direct phone calling</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>WhatsApp integration</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>In-app messaging</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Contact history</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600">Real stories from farmers and buyers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.quote}"</p>
                <div className="flex items-center mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-dairy-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Dairy Business?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of farmers and buyers who trust MilkWay for their dairy trading needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-dairy-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Start Free Today
            </Link>
            <Link
              to="/login"
              className="border-2 border-white text-white hover:bg-white hover:text-dairy-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Sign In
            </Link>
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

export default Landing