function EVRecommendation({ weather }) {
  const temp = weather.main.temp
  const wind = weather.wind.speed
  const condition = weather.weather[0].main

  let message
  let statusBadge
  let badgeType
  let rangeImpact
  let thermalAdvice

  if (condition === "Rain" || condition === "Thunderstorm") {
    message = "Rainy weather. Drive carefully and plan your charging stops."
    statusBadge = "Wet Conditions"
    badgeType = "caution"
    rangeImpact = "Moderate (~5 - 10% lower range due to rolling resistance)"
    thermalAdvice = "Plan sheltered charging stops if heavy rain"
  } else if (temp >= 35) {
    message = "High temperature. Keep an eye on battery performance."
    statusBadge = "High Thermal Load"
    badgeType = "warning"
    rangeImpact = "Noticeable (~10 - 15% lower range due to AC cabin cooling)"
    thermalAdvice = "Pre-cool cabin while connected to charger"
  } else if (wind >= 10) {
    message = "Strong winds may increase energy consumption."
    statusBadge = "Strong Aerodynamic Drag"
    badgeType = "warning"
    rangeImpact = "Elevated (~8 - 14% higher consumption at highway speeds)"
    thermalAdvice = "Maintain steady cruise speed to preserve range"
  } else if (temp <= 5) {
    message = "Cold weather can reduce EV efficiency slightly."
    statusBadge = "Cold Weather Impact"
    badgeType = "warning"
    rangeImpact = "Significant (~15 - 25% lower range due to cabin heater & cell temp)"
    thermalAdvice = "Pre-condition battery before departure"
  } else {
    message = "Weather looks good for your EV journey! 🚗⚡"
    statusBadge = "Optimal Efficiency"
    badgeType = "optimal"
    rangeImpact = "Optimal (Full rated range expected)"
    thermalAdvice = "Standard regenerative braking efficiency"
  }

  return (
    <article className={`ev-card ev-card-${badgeType}`} aria-label="EV Trip Recommendation">
      {/* Header */}
      <div className="ev-header">
        <div className="ev-title-group">
          <div className="ev-icon-pill" aria-hidden="true">
            <svg className="ev-header-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
          </div>
          <div>
            <h2>EV Trip Recommendation</h2>
            <p className="ev-tagline">Intelligent powertrain &amp; battery analysis</p>
          </div>
        </div>

        <span className={`ev-status-badge badge-${badgeType}`}>
          <span className="status-dot" aria-hidden="true"></span>
          {statusBadge}
        </span>
      </div>

      {/* Main Advisory Message Banner */}
      <div className="ev-message-box">
        <div className="ev-message-accent" aria-hidden="true"></div>
        <p className="ev-message">{message}</p>
      </div>

      {/* Range & Thermal Insights Grid */}
      <div className="ev-metrics-row">
        <div className="ev-metric-item">
          <div className="ev-metric-header">
            <svg className="ev-metric-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="7" width="16" height="10" rx="2" ry="2"></rect>
              <line x1="22" y1="11" x2="22" y2="13"></line>
              <line x1="6" y1="11" x2="6" y2="13"></line>
              <line x1="10" y1="11" x2="10" y2="13"></line>
            </svg>
            <span className="metric-label">Estimated Range Impact</span>
          </div>
          <p className="metric-val">{rangeImpact}</p>
        </div>

        <div className="ev-metric-item">
          <div className="ev-metric-header">
            <svg className="ev-metric-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span className="metric-label">Efficiency Recommendation</span>
          </div>
          <p className="metric-val">{thermalAdvice}</p>
        </div>
      </div>
    </article>
  )
}

export default EVRecommendation