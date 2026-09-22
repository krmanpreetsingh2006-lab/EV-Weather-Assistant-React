import { useState } from 'react'
import Hyperspeed from './components/Hyperspeed/Hyperspeed'
import { hyperspeedPresets } from './components/Hyperspeed/HyperSpeedPresets'
import WeatherCard from './WeatherCard'
import EVRecommendation from './EVRecommendation'
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
    <div className="app-wrapper">
      {/* Background Hyperspeed Canvas Layer */}
      <div className="hyperspeed-layer" aria-hidden="true">
        <Hyperspeed effectOptions={hyperspeedPresets.evElectric} />
      </div>

      {/* Dark Ambient Overlay to ensure text readability */}
      <div className="dark-overlay" aria-hidden="true"></div>

      {/* Foreground Interactive Content */}
      <main className="app">
        {/* Header */}
        <header className="header">
          <div className="header-badge">
            <span className="badge-pulse"></span>
            <span className="header-icon">⚡</span>
            <span className="badge-text">EV Range &amp; Weather Intelligence</span>
          </div>
          <h1>EV Weather &amp; Trip Assistant</h1>
          <p className="subtitle">
            Real-time weather insights &amp; battery efficiency forecasting
          </p>
        </header>

        {/* Search Bar */}
        <div className="search-section">
          <div className="search-box">
            <div className="input-wrapper">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Search destination city (e.g., Oslo, Seattle, Tokyo)..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    searchWeather()
                  }
                }}
              />
            </div>

            <div className="search-actions">
              <button
                onClick={() => searchWeather()}
                className="search-btn"
              >
                Search Weather
              </button>

              <button
                onClick={getCurrentLocation}
                className="location-btn"
                title="Use current GPS location"
              >
                <span className="loc-pin">📍</span> Use My Location
              </button>
            </div>
          </div>
        </div>

        {/* Search History */}
        {history.length > 0 && (
          <div className="history">
            <div className="history-header">
              <span className="history-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Recent Searches
              </span>

              <button
                className="clear-history"
                onClick={() => {
                  setHistory([])
                  localStorage.removeItem("weatherHistory")
                }}
                title="Clear all recent searches"
              >
                Clear
              </button>
            </div>

            <div className="history-list">
              {history.map((item) => (
                <button
                  key={item}
                  className="history-item"
                  onClick={() => searchWeather(item)}
                >
                  <span className="pin">📍</span>
                  <span className="item-name">{item}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="status-card loading-card">
            <div className="spinner"></div>
            <p>Fetching real-time atmospheric data...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="status-card error-card">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {/* Weather & EV Recommendations Results */}
        {weather && (
          <div className="results">
            <WeatherCard weather={weather} />
            <EVRecommendation weather={weather} />
          </div>
        )}
      </main>
    </div>
  )
}

export default App