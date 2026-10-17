import { useState } from 'react'
import ChargingStationCard from './ChargingStationCard'

function ChargingStations({
  stations = [],
  loading = false,
  error = null,
  locationName = '',
  onRetry = null,
  onFindNearby = null,
  isGeoSearch = false,
}) {
  const [visibleCount, setVisibleCount] = useState(10)

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 10)
  }

  const isMissingKey = error?.code === 'MISSING_API_KEY'

  return (
    <section className="charging-stations-section" aria-label="EV Charging Stations">
      {/* Section Header */}
      <div className="charging-header">
        <div className="charging-title-group">
          <div className="charging-badge-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
          </div>
          <div>
            <div className="charging-title-row">
              <h2>EV Charging Stations</h2>
              {!loading && !error && stations.length > 0 && (
                <span className="stations-count-badge" aria-label={`${stations.length} stations found`}>
                  {stations.length} Available
                </span>
              )}
            </div>

            {locationName && (
              <p className="charging-location-label">
                {isGeoSearch ? (
                  <>
                    <svg className="location-tiny-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10"></circle>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <span>Showing chargers near your <strong>current location</strong> (25 km radius)</span>
                  </>
                ) : (
                  <>
                    <svg className="location-tiny-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>Showing chargers in/near <strong>{locationName}</strong> (25 km radius)</span>
                  </>
                )}
              </p>
            )}
          </div>
        </div>

        {onFindNearby && (
          <button
            type="button"
            className="charging-nearby-btn"
            onClick={onFindNearby}
            title="Search verified EV chargers near your live GPS position"
          >
            <svg className="nearby-radar-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="22" y1="12" x2="18" y2="12"></line>
              <line x1="6" y1="12" x2="2" y2="12"></line>
              <line x1="12" y1="6" x2="12" y2="2"></line>
              <line x1="12" y1="22" x2="12" y2="18"></line>
            </svg>
            <span>Find Near Me</span>
          </button>
        )}
      </div>

      {/* Freshness & Real-Time Availability Notice */}
      <div className="charging-disclaimer-banner" role="note">
        <svg className="disclaimer-info-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <span className="disclaimer-text">
          Notice: Operational status and bay availability may vary in real time. Data provided by{' '}
          <a
            href="https://openchargemap.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="ocm-link"
          >
            Open Charge Map
          </a>.
        </span>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="charging-loading-card" role="status">
          <div className="spinner-large" aria-hidden="true"></div>
          <div className="loading-text-wrap">
            <h4>Scanning EV Charging Grid</h4>
            <p>Locating verified charging points and real-time connector specs within 25 km...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="charging-error-card" role="alert">
          <div className="error-icon-wrap" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div className="error-details">
            <h4 className="error-title">
              {isMissingKey ? 'Open Charge Map API Key Required' : 'Unable to Load Stations'}
            </h4>
            <p className="error-message">{error.message || 'An unexpected error occurred while fetching stations.'}</p>

            {isMissingKey && (
              <div className="api-key-instructions">
                <p>
                  To activate live charging station search, add your free Open Charge Map API key to your{' '}
                  <code>.env</code> file:
                </p>
                <pre className="env-code-sample">VITE_OPENCHARGEMAP_API_KEY=your_key_here</pre>
                <div className="setup-actions">
                  <a
                    href="https://openchargemap.org/site/develop/api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="get-key-btn"
                  >
                    Get Free OCM API Key ↗
                  </a>
                </div>
              </div>
            )}

            {onRetry && (
              <button
                type="button"
                className="retry-btn"
                onClick={onRetry}
              >
                <svg className="retry-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="1 4 1 10 7 10"></polyline>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                </svg>
                <span>Retry Search</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && stations.length === 0 && (
        <div className="charging-empty-card">
          <div className="empty-icon-circle" aria-hidden="true">
            <svg className="empty-plug-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="16" height="10" rx="2" ry="2"></rect>
              <line x1="22" y1="11" x2="22" y2="13"></line>
              <line x1="6" y1="11" x2="6" y2="13"></line>
              <line x1="10" y1="11" x2="10" y2="13"></line>
            </svg>
          </div>
          <h4>No Charging Stations Found</h4>
          <p>
            No charging points were reported within 25 km of this location. Try searching for a neighboring
            city or scanning your current location.
          </p>
          {onFindNearby && (
            <button
              type="button"
              className="empty-action-btn"
              onClick={onFindNearby}
            >
              <svg className="empty-btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="22" y1="12" x2="18" y2="12"></line>
                <line x1="6" y1="12" x2="2" y2="12"></line>
                <line x1="12" y1="6" x2="12" y2="2"></line>
                <line x1="12" y1="22" x2="12" y2="18"></line>
              </svg>
              <span>Search Around My Current Location</span>
            </button>
          )}
        </div>
      )}

      {/* Stations List */}
      {!loading && !error && stations.length > 0 && (
        <>
          <div className="stations-grid">
            {stations.slice(0, visibleCount).map((station) => (
              <ChargingStationCard key={station.id} station={station} />
            ))}
          </div>

          {/* Load More Pagination */}
          {stations.length > visibleCount && (
            <div className="load-more-wrap">
              <button
                type="button"
                className="load-more-btn"
                onClick={handleLoadMore}
              >
                <span>Load More Chargers</span>
                <span className="load-more-count">({stations.length - visibleCount} remaining)</span>
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default ChargingStations
