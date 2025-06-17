import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useForm } from 'react-hook-form'
import { User, Mail, Phone, MapPin, Camera, Save, Shield } from 'lucide-react'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import api from '../services/api'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm()

  useEffect(() => {
    if (user) {
      setValue('name', user.name)
      setValue('email', user.email)
      setValue('phone', user.phone || '')
      setValue('location.address', user.location?.address || '')
      setValue('location.city', user.location?.city || '')
      setValue('location.state', user.location?.state || '')
    }
  }, [user, setValue])

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const formData = new FormData()
      
      // Add form fields
      Object.keys(data).forEach(key => {
        if (key === 'location') {
          formData.append('location', JSON.stringify(data.location))
        } else {
          formData.append(key, data[key])
        }
      })

      // Add avatar if selected
      if (selectedFile) {
        formData.append('avatar', selectedFile)
      }

      const response = await api.put('/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      updateUser(response.data.user)
      toast.success('Profile updated successfully')
      setAvatarPreview(null)
      setSelectedFile(null)
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <LoadingSpinner />
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Profile Settings
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Picture Section */}
        <div className="lg:col-span-1">
          <div className="card p-6 text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 mx-auto mb-4 relative">
                {avatarPreview || user.avatar ? (
                  <img
                    src={avatarPreview || user.avatar}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-primary-600 flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-lg">
                    <span className="text-white text-3xl font-bold">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                )}
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-full cursor-pointer transition-colors shadow-lg"
                >
                  <Camera className="h-4 w-4" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {user.name}
            </h2>
            <div className="flex items-center justify-center mt-2">
              <Shield className="h-4 w-4 text-primary-600 mr-1" />
              <span className="text-sm text-primary-600 dark:text-primary-400 capitalize font-medium">
                {user.role}
              </span>
            </div>
            
            {user.isVerified && (
              <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                ✓ Verified Account
              </div>
            )}
          </div>
        </div>

        {/* Profile Form Section */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="form-label">
                  <User className="h-4 w-4 inline mr-2" />
                  Full Name
                </label>
                <div className="relative input-with-icon">
                  <div className="icon-left">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('name', {
                      required: 'Name is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters'
                      }
                    })}
                    type="text"
                    className="form-input pl-10"
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="form-label">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email Address
                </label>
                <div className="relative input-with-icon">
                  <div className="icon-left">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('email')}
                    type="email"
                    className="form-input pl-10 bg-gray-100 dark:bg-gray-700"
                    disabled
                    placeholder="Email cannot be changed"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Email address cannot be modified
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="form-label">
                  <Phone className="h-4 w-4 inline mr-2" />
                  Phone Number
                </label>
                <div className="relative input-with-icon">
                  <div className="icon-left">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('phone')}
                    type="tel"
                    className="form-input pl-10"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="form-label">
                  <Shield className="h-4 w-4 inline mr-2" />
                  Account Type
                </label>
                <div className="relative input-with-icon">
                  <div className="icon-left">
                    <Shield className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    value={user.role}
                    type="text"
                    className="form-input pl-10 bg-gray-100 dark:bg-gray-700 capitalize"
                    disabled
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Account type cannot be changed
                </p>
              </div>
            </div>

            {/* Location Section */}
            <div className="mt-8">
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                <MapPin className="h-4 w-4 inline mr-2" />
                Location Information
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="form-label">Address</label>
                  <div className="relative input-with-icon">
                    <div className="icon-left">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('location.address')}
                      type="text"
                      className="form-input pl-10"
                      placeholder="Enter your address"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">City</label>
                  <input
                    {...register('location.city')}
                    type="text"
                    className="form-input"
                    placeholder="Enter your city"
                  />
                </div>

                <div>
                  <label className="form-label">State</label>
                  <input
                    {...register('location.state')}
                    type="text"
                    className="form-input"
                    placeholder="Enter your state"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-end">
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
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Account Statistics */}
      <div className="mt-8 card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Account Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Days Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {user.isVerified ? 'Yes' : 'No'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Verified</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {user.role === 'farmer' ? 'Farmer' : 'Buyer'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Role</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {new Date(user.lastLogin).toLocaleDateString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Last Login</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile