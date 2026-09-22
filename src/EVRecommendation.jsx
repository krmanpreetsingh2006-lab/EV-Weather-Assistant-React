function EVRecommendation({ weather }) {
  const temp = weather.main.temp
  const wind = weather.wind.speed
  const condition = weather.weather[0].main

  let message = ""
  let statusBadge = "Optimal Driving"
  let badgeType = "optimal"
  let rangeImpact = "Minimal (0 - 3%)"
  let thermalAdvice = "Ideal battery operating range"

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
    <div className={`ev-card ev-card-${badgeType}`}>
      {/* Header */}
      <div className="ev-header">
        <div className="ev-title-group">
          <div className="ev-icon-pill">
            <span className="ev-icon">⚡</span>
          </div>
          <div>
            <h2>EV Trip Recommendation</h2>
            <p className="ev-tagline">Intelligent powertrain & battery analysis</p>
          </div>
        </div>
        <span className={`ev-status-badge badge-${badgeType}`}>
          <span className="status-dot"></span>
          {statusBadge}
        </span>
      </div>

      {/* Main advisory message */}
      <div className="ev-message-box">
        <p className="ev-message">{message}</p>
      </div>

      {/* EV Range & Efficiency Quick Insights */}
      <div className="ev-metrics-row">
        <div className="ev-metric-item">
          <span className="metric-label">Estimated Range Impact</span>
          <span className="metric-val">{rangeImpact}</span>
        </div>
        <div className="ev-metric-item">
          <span className="metric-label">Efficiency Recommendation</span>
          <span className="metric-val">{thermalAdvice}</span>
        </div>
      </div>
    </div>
  )
}

export default EVRecommendation