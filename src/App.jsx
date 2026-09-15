import EVRecommendation from './EVRecommendation'
import WeatherCard from './WeatherCard'
import { useState } from 'react'
import './App.css'

function App() {
  const [city, setCity] = useState("")
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Search history
  const [history, setHistory] = useState(() => {
    return JSON.parse(localStorage.getItem("weatherHistory")) || []
  })

  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

  // Search weather by city
  const searchWeather = async (cityName = city) => {
    if (!cityName.trim()) {
      setError("Please enter a city name")
      return
    }

    setLoading(true)
    setError("")
    setWeather(null)

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("City not found")
      }

      const data = await response.json()

      setWeather(data)
      setCity(data.name)

      // Save city in history
      const updatedHistory = [
        data.name,
        ...history.filter(item => item !== data.name)
      ].slice(0, 5)

      setHistory(updatedHistory)
      localStorage.setItem(
        "weatherHistory",
        JSON.stringify(updatedHistory)
      )

    } catch (error) {
      setError(error.message)
    }

    setLoading(false)
  }

  // Use current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      return
    }

    setLoading(true)
    setError("")
    setWeather(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`

          const response = await fetch(url)

          if (!response.ok) {
            throw new Error("Unable to fetch weather")
          }

          const data = await response.json()

          setWeather(data)
          setCity(data.name)

          // Save location city in history
          const updatedHistory = [
            data.name,
            ...history.filter(item => item !== data.name)
          ].slice(0, 5)

          setHistory(updatedHistory)
          localStorage.setItem(
            "weatherHistory",
            JSON.stringify(updatedHistory)
          )

        } catch (error) {
          setError(error.message)
        }

        setLoading(false)
      },

      () => {
        setError("Unable to get your location")
        setLoading(false)
      }
    )
  }

  return (
    <div className="app">

      {/* Header */}
      <header className="header">
        <div className="header-icon">⚡</div>
        <h1>EV Weather & Trip Assistant</h1>
        <p className="subtitle">
          Smart weather insights for EV journeys
        </p>
      </header>

      {/* Search */}
      <div className="search-section">
        <div className="search-box">

          <input
            type="text"
            placeholder="Enter city name..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchWeather()
              }
            }}
          />

          <button
            onClick={() => searchWeather()}
            className="search-btn"
          >
            Search Weather
          </button>

          <button
            onClick={getCurrentLocation}
            className="location-btn"
          >
            📍 Use My Location
          </button>

        </div>
      </div>

      {/* Search History */}
      {history.length > 0 && (
        <div className="history">
          <h2>Search History</h2>

          <div className="history-list">
            {history.map((item) => (
              <button
                key={item}
                className="history-item"
                onClick={() => searchWeather(item)}
              >
                📍 {item}
              </button>
            ))}
          </div>

          <button
            className="clear-history"
            onClick={() => {
              setHistory([])
              localStorage.removeItem("weatherHistory")
            }}
          >
            Clear History
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="status-card loading-card">
          <div className="spinner"></div>
          <p>Fetching weather data...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="status-card error-card">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {/* Results */}
      {weather && (
        <div className="results">
          <WeatherCard weather={weather} />
          <EVRecommendation weather={weather} />
        </div>
      )}

    </div>
  )
}

export default App