function WeatherCard({ weather }) {
  const iconCode = weather.weather[0].icon
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`
  const country = weather.sys?.country ? `, ${weather.sys.country}` : ""
  const description = weather.weather[0].description

  return (
    <article className="weather-card" aria-label="Current Weather Conditions">
      {/* City & Condition Header */}
      <div className="weather-card-header">
        <div className="city-header">
          <svg className="location-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <h2>
            <span className="city-name">{weather.name}</span>
            {country && <span className="country-code">{country}</span>}
          </h2>
        </div>

        <div className="condition-pill">
          <span className="condition-dot" aria-hidden="true"></span>
          <span className="condition-text">{description}</span>
        </div>
      </div>

      {/* Main Weather Focus - High visual impact */}
      <div className="weather-main">
        <div className="weather-icon-wrapper">
          <div className="weather-icon-glow" aria-hidden="true"></div>
          <img
            src={iconUrl}
            alt={description}
            className="weather-icon"
            width="68"
            height="68"
            loading="lazy"
          />
        </div>

        <div className="temp-block">
          <div className="temp-display">
            <span className="temp-num">{Math.round(weather.main.temp)}</span>
            <span className="temp-unit">°C</span>
          </div>

          <div className="temp-range-sub">
            <span className="feels-pill">
              Feels like <strong>{Math.round(weather.main.feels_like)}°C</strong>
            </span>
            <span className="range-divider" aria-hidden="true">•</span>
            <span className="high-low-pill">
              <span className="hl-high">H: {Math.round(weather.main.temp_max)}°</span>
              <span className="hl-slash">/</span>
              <span className="hl-low">L: {Math.round(weather.main.temp_min)}°</span>
            </span>
          </div>
        </div>
      </div>

      {/* Statistics Grid - Clean Telemetry Pods */}
      <div className="stats-grid" aria-label="Atmospheric Metrics">
        <div className="stat-card">
          <div className="stat-header">
            <svg className="stat-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
            </svg>
            <span className="stat-label">Feels Like</span>
          </div>
          <strong className="stat-value">{Math.round(weather.main.feels_like)}°C</strong>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <svg className="stat-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
            </svg>
            <span className="stat-label">Humidity</span>
          </div>
          <strong className="stat-value">{weather.main.humidity}%</strong>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <svg className="stat-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path>
            </svg>
            <span className="stat-label">Wind Speed</span>
          </div>
          <strong className="stat-value">{weather.wind.speed} <span className="stat-unit">m/s</span></strong>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <svg className="stat-svg stat-svg-low" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
            <span className="stat-label">Min Temp</span>
          </div>
          <strong className="stat-value">{Math.round(weather.main.temp_min)}°C</strong>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <svg className="stat-svg stat-svg-high" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="19" x2="12" y2="5"></line>
              <polyline points="5 12 12 5 19 12"></polyline>
            </svg>
            <span className="stat-label">Max Temp</span>
          </div>
          <strong className="stat-value">{Math.round(weather.main.temp_max)}°C</strong>
        </div>
      </div>
    </article>
  )
}

export default WeatherCard