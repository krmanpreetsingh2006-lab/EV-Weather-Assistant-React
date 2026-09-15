function WeatherCard({ weather }) {
  const iconCode = weather.weather[0].icon
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`

  return (
    <div className="weather-card">
      {/* City */}
      <div className="city-header">
        <span className="location-icon">📍</span>
        <h2>{weather.name}</h2>
      </div>

      {/* Main Weather Focus */}
      <div className="weather-main">
        <img
          src={iconUrl}
          alt={weather.weather[0].description}
          className="weather-icon"
        />
        <div className="temp-block">
          <div className="temperature">
            {Math.round(weather.main.temp)}°C
          </div>
          <p className="condition">
            {weather.weather[0].description}
          </p>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">🌡️</span>
          <span className="stat-label">Feels Like</span>
          <strong className="stat-value">{Math.round(weather.main.feels_like)}°C</strong>
        </div>

        <div className="stat-card">
          <span className="stat-icon">💧</span>
          <span className="stat-label">Humidity</span>
          <strong className="stat-value">{weather.main.humidity}%</strong>
        </div>

        <div className="stat-card">
          <span className="stat-icon">💨</span>
          <span className="stat-label">Wind Speed</span>
          <strong className="stat-value">{weather.wind.speed} m/s</strong>
        </div>

        <div className="stat-card">
          <span className="stat-icon">⬇️</span>
          <span className="stat-label">Min Temp</span>
          <strong className="stat-value">{Math.round(weather.main.temp_min)}°C</strong>
        </div>

        <div className="stat-card">
          <span className="stat-icon">⬆️</span>
          <span className="stat-label">Max Temp</span>
          <strong className="stat-value">{Math.round(weather.main.temp_max)}°C</strong>
        </div>
      </div>
    </div>
  )
}

export default WeatherCard