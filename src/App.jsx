import { useState, useRef, useEffect } from 'react'
import Hyperspeed from './components/Hyperspeed/Hyperspeed'
import { hyperspeedPresets } from './components/Hyperspeed/HyperSpeedPresets'
import WeatherCard from './WeatherCard'
import EVRecommendation from './EVRecommendation'
import ChargingStations from './ChargingStations'
import { fetchChargingStations, getUserCoordinates } from './services/chargingService'
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

  // EV Charging Stations state
  const [chargingStations, setChargingStations] = useState([])
  const [chargingLoading, setChargingLoading] = useState(false)
  const [chargingError, setChargingError] = useState(null)
  const [chargingLocation, setChargingLocation] = useState("")
  const [isGeoSearch, setIsGeoSearch] = useState(false)
  const [lastSearchedCoords, setLastSearchedCoords] = useState(null)

  // Request cancellation and race condition refs
  const activeAbortController = useRef(null)
  const currentSearchId = useRef(0)

  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

  // Clean up any pending network requests on unmount
  useEffect(() => {
    return () => {
      if (activeAbortController.current) {
        activeAbortController.current.abort()
      }
    }
  }, [])

  // Core charging station search handler with stale-request prevention
  const searchChargingStations = async ({
    latitude,
    longitude,
    locationName,
    isGeo = false,
  }) => {
    // Abort previous in-flight charging request
    if (activeAbortController.current) {
      activeAbortController.current.abort()
    }
    const controller = new AbortController()
    activeAbortController.current = controller

    const searchId = ++currentSearchId.current

    setChargingLoading(true)
    setChargingError(null)
    setChargingLocation(locationName)
    setIsGeoSearch(isGeo)
    setLastSearchedCoords({ latitude, longitude, locationName, isGeo })

    try {
      const data = await fetchChargingStations({
        latitude,
        longitude,
        radiusKm: 25,
        maxResults: 30,
        signal: controller.signal,
      })

      // Verify this is still the active search (prevent race conditions)
      if (searchId === currentSearchId.current) {
        setChargingStations(data.stations)
        setChargingLoading(false)
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        return // superseded by newer search
      }
      if (searchId === currentSearchId.current) {
        setChargingError({
          message: err.message,
          code: err.code || 'UNKNOWN',
        })
        setChargingStations([])
        setChargingLoading(false)
      }
    }
  }

  // Search weather by city (and fetch charging stations for the city coordinates)
  const searchWeather = async (cityName = city) => {
    if (!cityName.trim()) {
      setError("Please enter a city name")
      return
    }

    setLoading(true)
    setError("")
    setWeather(null)

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric`

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

      // Fetch charging stations for the city's verified coordinates
      if (
        data.coord &&
        typeof data.coord.lat === 'number' &&
        typeof data.coord.lon === 'number'
      ) {
        const fullLocationName = `${data.name}${data.sys?.country ? ', ' + data.sys.country : ''}`
        searchChargingStations({
          latitude: data.coord.lat,
          longitude: data.coord.lon,
          locationName: fullLocationName,
          isGeo: false,
        })
      }

    } catch (error) {
      setError(error.message)
    }

    setLoading(false)
  }

  // Use current location for weather & charging stations
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

          // Fetch charging stations for current GPS coordinates
          const fullLocationName = `${data.name}${data.sys?.country ? ', ' + data.sys.country : ''}`
          searchChargingStations({
            latitude,
            longitude,
            locationName: fullLocationName,
            isGeo: true,
          })

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

  // Dedicated "Find Nearby Chargers" button handler
  const handleFindNearbyChargers = async () => {
    setChargingLoading(true)
    setChargingError(null)
    setIsGeoSearch(true)
    setChargingLocation("Current Location")

    try {
      const { latitude, longitude } = await getUserCoordinates()
      await searchChargingStations({
        latitude,
        longitude,
        locationName: "Current Location",
        isGeo: true,
      })
    } catch (geoErr) {
      setChargingLoading(false)
      setChargingStations([])
      setChargingError({
        message: geoErr.message,
        code: geoErr.code || 'GEOLOCATION_ERROR',
      })
    }
  }

  // Retry charging stations search
  const handleRetryCharging = () => {
    if (lastSearchedCoords) {
      searchChargingStations(lastSearchedCoords)
    } else {
      handleFindNearbyChargers()
    }
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
            <span className="badge-pulse" aria-hidden="true"></span>
            <span className="header-icon" aria-hidden="true">⚡</span>
            <span className="badge-text">EV Range &amp; Weather Intelligence</span>
          </div>
          <h1>EV Weather &amp; Trip Assistant</h1>
          <p className="subtitle">
            Real-time atmospheric insights, charging station locator &amp; battery efficiency forecasting
          </p>
        </header>

        {/* Search Console */}
        <section className="search-section" aria-label="Location Search and Actions">
          <div className="search-box">
            {/* Main Input Row */}
            <div className="input-row">
              <div className="input-wrapper">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
                  aria-label="Destination city"
                />
                {city && (
                  <button
                    type="button"
                    className="clear-input-btn"
                    onClick={() => setCity("")}
                    title="Clear input"
                    aria-label="Clear input text"
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => searchWeather()}
                className="search-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="btn-spinner" aria-hidden="true"></span>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <span>Search Weather</span>
                    <svg className="btn-arrow-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </>
                )}
              </button>
            </div>

            {/* Quick Actions Row */}
            <div className="search-actions">
              <button
                type="button"
                onClick={getCurrentLocation}
                className="location-btn"
                title="Use current GPS location for weather and chargers"
              >
                <svg className="action-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>Use My Location</span>
              </button>

              <button
                type="button"
                onClick={handleFindNearbyChargers}
                className="chargers-btn"
                title="Search EV charging stations near your current GPS location"
              >
                <svg className="action-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
                <span>Find Nearby Chargers</span>
              </button>
            </div>
          </div>
        </section>

        {/* Search History */}
        {history.length > 0 && (
          <section className="history" aria-label="Recent Searches">
            <div className="history-header">
              <span className="history-title">
                <svg className="history-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>Recent Searches</span>
              </span>

              <button
                type="button"
                className="clear-history"
                onClick={() => {
                  setHistory([])
                  localStorage.removeItem("weatherHistory")
                }}
                title="Clear all recent searches"
              >
                Clear History
              </button>
            </div>

            <div className="history-list" role="list">
              {history.map((item) => (
                <button
                  type="button"
                  key={item}
                  className="history-item"
                  onClick={() => searchWeather(item)}
                  title={`Search weather for ${item}`}
                >
                  <svg className="pin-tiny" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span className="item-name">{item}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Atmospheric Loading State */}
        {loading && (
          <div className="status-card loading-card" role="status">
            <div className="spinner" aria-hidden="true"></div>
            <div className="status-text-wrap">
              <strong>Fetching Atmospheric Telemetry</strong>
              <p>Querying real-time temperature, wind dynamics &amp; conditions...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="status-card error-card" role="alert">
            <div className="status-icon-wrap" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div className="status-text-wrap">
              <strong>Search Notice</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Weather & EV Recommendations Results */}
        {weather && (
          <section className="results" aria-label="Trip Intelligence">
            <WeatherCard weather={weather} />
            <EVRecommendation weather={weather} />
          </section>
        )}

        {/* EV Charging Stations Section */}
        {(chargingLocation || chargingLoading || chargingError || chargingStations.length > 0) && (
          <div className="stations-wrapper">
            <ChargingStations
              stations={chargingStations}
              loading={chargingLoading}
              error={chargingError}
              locationName={chargingLocation}
              isGeoSearch={isGeoSearch}
              onRetry={handleRetryCharging}
              onFindNearby={handleFindNearbyChargers}
            />
          </div>
        )}
      </main>
    </div>
  )
}

export default App