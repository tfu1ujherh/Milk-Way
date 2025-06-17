import FarmCard from './FarmCard'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorMessage from '../common/ErrorMessage'

const FarmGrid = ({ 
  farms, 
  loading = false, 
  error = null, 
  onRetry = null,
  onFarmDeleted = null,
  showActions = false,
  emptyMessage = "No farms found"
}) => {
  if (loading) {
    return <LoadingSpinner text="Loading farms..." />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={onRetry} />
  }

  if (!farms || farms.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏡</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {emptyMessage}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Check back later for new farm listings.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {farms.map((farm) => (
        <FarmCard
          key={farm._id}
          farm={farm}
          onFarmDeleted={onFarmDeleted}
          showActions={showActions}
        />
      ))}
    </div>
  )
}

export default FarmGrid