import { Star } from 'lucide-react'

const Rating = ({ rating, totalReviews = 0, size = 'medium', showText = true, interactive = false, onRatingChange = null }) => {
  const sizeClasses = {
    small: 'h-3 w-3',
    medium: 'h-4 w-4',
    large: 'h-5 w-5'
  }

  const handleStarClick = (starRating) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating)
    }
  }

  const renderStars = () => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= Math.floor(rating)
      const isHalfFilled = i === Math.ceil(rating) && rating % 1 >= 0.5
      
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => handleStarClick(i)}
          disabled={!interactive}
          className={`
            ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
            transition-all duration-200
            ${interactive ? 'hover:text-yellow-400' : ''}
          `}
        >
          <Star
            className={`
              ${sizeClasses[size]}
              ${isFilled || isHalfFilled ? 'text-yellow-400 fill-current' : 'text-gray-300'}
            `}
          />
        </button>
      )
    }
    return stars
  }

  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center space-x-0.5">
        {renderStars()}
      </div>
      {showText && (
        <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">{rating.toFixed(1)}</span>
          {totalReviews > 0 && (
            <span>({totalReviews} reviews)</span>
          )}
        </div>
      )}
    </div>
  )
}

export default Rating