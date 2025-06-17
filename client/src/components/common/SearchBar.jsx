import { useState } from 'react'
import { Search, X, Filter } from 'lucide-react'

const SearchBar = ({ 
  onSearch, 
  placeholder = "Search farms...", 
  className = "",
  showFilters = false,
  onFilterToggle = null 
}) => {
  const [query, setQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(query.trim())
  }

  const handleClear = () => {
    setQuery('')
    onSearch('')
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="form-input pl-10 pr-10 w-full"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 text-gray-400"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {showFilters && onFilterToggle && (
          <button
            type="button"
            onClick={onFilterToggle}
            className="btn-secondary flex items-center space-x-2 px-4 py-3"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
        )}
      </div>
    </form>
  )
}

export default SearchBar