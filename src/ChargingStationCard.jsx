function ChargingStationCard({ station }) {
  if (!station) return null

  const {
    name,
    operator,
    address,
    distanceLabel,
    statusTitle,
    isOperational,
    connectors,
    totalPoints,
    dateUpdated,
    directionsUrl,
  } = station

  // Determine operational status display
  let statusBadgeClass = 'status-unknown'
  let statusText = statusTitle || 'Status not provided'

  if (isOperational === true) {
    statusBadgeClass = 'status-operational'
    statusText = statusTitle || 'Operational'
  } else if (isOperational === false) {
    statusBadgeClass = 'status-offline'
    statusText = statusTitle || 'Non-Operational'
  }

  // Format date freshness if present
  let formattedDate = null
  if (dateUpdated) {
    try {
      const d = new Date(dateUpdated)
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      }
    } catch {
      formattedDate = null
    }
  }

  const hasDistance = distanceLabel && distanceLabel !== 'Not provided'
  const hasMeta = totalPoints || formattedDate

  return (
    <article className="station-card" aria-label={`Charging station ${name}`}>
      {/* 1. Station Name and Distance Header */}
      <div className="station-header">
        <div className="station-title-col">
          <div className="station-title-row">
            <span className="station-bolt-icon" aria-hidden="true">⚡</span>
            <h3 className="station-name">{name}</h3>
          </div>
          {operator && (
            <span className="station-operator">
              <span className="operator-label">Network:</span> {operator}
            </span>
          )}
        </div>

        <div className="station-badges-group">
          {hasDistance && (
            <span className="station-distance-pill" title="Distance from search location">
              <svg className="dist-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <span>{distanceLabel}</span>
            </span>
          )}

          {statusTitle && (
            <span className={`station-status-pill ${statusBadgeClass}`} title="Operational Status">
              <span className="station-status-dot" aria-hidden="true"></span>
              <span>{statusText}</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. Full Address - naturally wrapping without clipping */}
      <div className="station-address-block">
        <svg className="address-pin-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <p className="station-address">{address || 'Address not provided'}</p>
      </div>

      {/* 3. Connector and Charging-Power Information */}
      <div className="station-connectors-section">
        <div className="connectors-header">
          <svg className="plug-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 2v6m-4-6v6m-2 4h12a2 2 0 0 1 2 2v2a6 6 0 0 1-6 6h0a6 6 0 0 1-6-6v-2a2 2 0 0 1 2-2z"></path>
            <line x1="12" y1="20" x2="12" y2="24"></line>
          </svg>
          <span className="connectors-tag">Plugs &amp; Power</span>
        </div>

        {connectors && connectors.length > 0 ? (
          <div className="connectors-chips" role="list" aria-label="Available connectors">
            {connectors.map((conn, idx) => (
              <span key={conn.id || idx} className="connector-chip" role="listitem">
                <span className="connector-type">{conn.type}</span>
                {conn.power && (
                  <span className="connector-power">{conn.power} kW</span>
                )}
                {conn.currentType && (
                  <span className="connector-current">{conn.currentType}</span>
                )}
                {conn.quantity && conn.quantity > 1 && (
                  <span className="connector-qty">×{conn.quantity}</span>
                )}
              </span>
            ))}
          </div>
        ) : (
          <span className="connectors-empty">Connector specifications not reported</span>
        )}
      </div>

      {/* 4 & 5. Metadata and Get Directions Footer Bar */}
      <div className="station-footer-bar">
        <div className="station-meta-tags">
          {totalPoints && (
            <span className="station-points-pill" title="Total charging bays">
              <span className="meta-icon" aria-hidden="true">⚡</span>
              <span>{totalPoints} {totalPoints === 1 ? 'bay' : 'bays'}</span>
            </span>
          )}

          {formattedDate && (
            <span className="station-freshness-pill" title="Date verified on Open Charge Map">
              <span className="meta-icon" aria-hidden="true">🕒</span>
              <span>Verified {formattedDate}</span>
            </span>
          )}

          {!hasMeta && (
            <span className="station-meta-dim">Open Charge Map verified</span>
          )}
        </div>

        <div className="station-action-wrap">
          {directionsUrl ? (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="directions-btn"
              title={`Get driving directions to ${name} in Google Maps`}
            >
              <span>Get Directions</span>
              <svg className="directions-arrow-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="7" y1="17" x2="17" y2="7"></line>
                <polyline points="7 7 17 7 17 17"></polyline>
              </svg>
            </a>
          ) : (
            <button className="directions-btn disabled" disabled title="Directions coordinates not provided">
              <span>Directions unavailable</span>
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

export default ChargingStationCard
