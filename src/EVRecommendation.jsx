function EVRecommendation({ weather }) {
  const temp = weather.main.temp
  const wind = weather.wind.speed
  const condition = weather.weather[0].main

  let message = ""

  if (condition === "Rain" || condition === "Thunderstorm") {
    message = "Rainy weather. Drive carefully and plan your charging stops."
  } else if (temp >= 35) {
    message = "High temperature. Keep an eye on battery performance."
  } else if (wind >= 10) {
    message = "Strong winds may increase energy consumption."
  } else if (temp <= 5) {
    message = "Cold weather can reduce EV efficiency slightly."
  } else {
    message = "Weather looks good for your EV journey! 🚗⚡"
  }

  return (
    <div className="ev-card">
      <div className="ev-header">
        <span className="ev-icon">⚡</span>
        <h2>EV Trip Recommendation</h2>
      </div>
      <p className="ev-message">{message}</p>
    </div>
  )
}

export default EVRecommendation