import api from './api'

export const wishlistService = {
  // Get user's wishlist
  getWishlist: async () => {
    const response = await api.get('/wishlist')
    return response.data
  },

  // Add farm to wishlist
  addToWishlist: async (farmId) => {
    const response = await api.post('/wishlist', { farmId })
    return response.data
  },

  // Remove farm from wishlist
  removeFromWishlist: async (farmId) => {
    const response = await api.delete(`/wishlist/${farmId}`)
    return response.data
  },

  // Check if farm is in wishlist
  isInWishlist: async (farmId) => {
    const response = await api.get(`/wishlist/check/${farmId}`)
    return response.data
  }
}