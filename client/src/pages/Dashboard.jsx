import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const { user, isFarmer, isBuyer } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isFarmer) {
      navigate('/farmer/dashboard', { replace: true })
    } else if (isBuyer) {
      navigate('/buyer/dashboard', { replace: true })
    }
  }, [user, navigate, isFarmer, isBuyer])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="loading-spinner"></div>
    </div>
  )
}

export default Dashboard