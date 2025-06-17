import api from './api'

export const farmService = {
  // Get all farms
  getAllFarms: async (params = {}) => {
    const response = await api.get('/farms', { params })
    return response.data
  },

  // Get farm by ID
  getFarmById: async (id) => {
    const response = await api.get(`/farms/${id}`)
    return response.data
  },

  // Create new farm (farmers only)
  createFarm: async (farmData) => {
    const response = await api.post('/farms', farmData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // Update farm (farmers only)
  updateFarm: async (id, farmData) => {
    const response = await api.put(`/farms/${id}`, farmData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // Delete farm (farmers only)
  deleteFarm: async (id) => {
    const response = await api.delete(`/farms/${id}`)
    return response.data
  },

  // Get farmer's farms
  getFarmerFarms: async () => {
    const response = await api.get('/farms/my-farms')
    return response.data
  },

  // Search farms
  searchFarms: async (query) => {
    const response = await api.get(`/farms/search?q=${query}`)
    return response.data
  }
}