import api from './api'

export const reviewService = {
  // Get reviews for a farm
  getFarmReviews: async (farmId) => {
    const response = await api.get(`/reviews/farm/${farmId}`)
    return response.data
  },

  // Add review (buyers only)
  addReview: async (reviewData) => {
    const response = await api.post('/reviews', reviewData)
    return response.data
  },

  // Update review
  updateReview: async (id, reviewData) => {
    const response = await api.put(`/reviews/${id}`, reviewData)
    return response.data
  },

  // Delete review
  deleteReview: async (id) => {
    const response = await api.delete(`/reviews/${id}`)
    return response.data
  },

  // Get user's reviews
  getUserReviews: async () => {
    const response = await api.get('/reviews/my-reviews')
    return response.data
  }
}