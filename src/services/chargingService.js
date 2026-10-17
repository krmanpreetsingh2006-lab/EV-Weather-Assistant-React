/**
 * EV Charging Station Service
 * Handles Open Charge Map API integration, geolocation, and distance calculations.
 */

const OCM_BASE_URL = 'https://api.openchargemap.io/v3/poi/'

/**
 * Calculates the great-circle distance between two points on Earth using Haversine formula.
 * @param {number} lat1 Latitude of origin
 * @param {number} lon1 Longitude of origin
 * @param {number} lat2 Latitude of destination
 * @param {number} lon2 Longitude of destination
 * @returns {number|null} Distance in kilometers, or null if coordinates are invalid.
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const areValid = [lat1, lon1, lat2, lon2].every(
    (n) => typeof n === 'number' && !isNaN(n) && isFinite(n)
  )
  if (!areValid) return null

  const R = 6371 // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Formats a distance in kilometers to a human-readable string.
 * @param {number|null} km
 * @returns {string}
 */
export function formatDistance(km) {
  if (typeof km !== 'number' || isNaN(km) || !isFinite(km)) {
    return 'Not provided'
  }
  if (km < 1) {
    return `${Math.round(km * 1000)} m`
  }
  return `${km.toFixed(1)} km`
}

/**
 * Validates coordinates are strictly within geographical bounds.
 * @param {number} lat
 * @param {number} lon
 * @returns {boolean}
 */
export function isValidCoordinate(lat, lon) {
  return (
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    !isNaN(lat) &&
    !isNaN(lon) &&
    isFinite(lat) &&
    isFinite(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  )
}

/**
 * Builds Google Maps driving directions URL using verified coordinates or validated address.
 * Format: https://www.google.com/maps/dir/?api=1&destination=LATITUDE,LONGITUDE&travelmode=driving
 * @param {object} station
 * @returns {string|null}
 */
export function getDirectionsUrl(station) {
  if (!station) return null

  const { latitude, longitude, address } = station

  if (isValidCoordinate(latitude, longitude)) {
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`
  }

  if (address && address !== 'Address not provided') {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}&travelmode=driving`
  }

  return null
}

/**
 * Parses and sanitizes a raw Open Charge Map POI record.
 * Never invents station names, connectors, distances, or operational status.
 * @param {object} item
 * @param {{latitude?: number, longitude?: number}} originCoords
 * @returns {object}
 */
export function parseStation(item, originCoords = {}) {
  const addressInfo = item.AddressInfo || {}

  // Name
  const name =
    addressInfo.Title?.trim() ||
    item.OperatorInfo?.Title?.trim() ||
    'Unnamed Charging Station'

  // Coordinates
  const lat = typeof addressInfo.Latitude === 'number' ? addressInfo.Latitude : null
  const lon = typeof addressInfo.Longitude === 'number' ? addressInfo.Longitude : null

  // Address assembly
  const addressParts = [
    addressInfo.AddressLine1?.trim(),
    addressInfo.AddressLine2?.trim(),
    addressInfo.Town?.trim(),
    addressInfo.StateOrProvince?.trim(),
    addressInfo.Postcode?.trim(),
    addressInfo.Country?.Title?.trim(),
  ].filter(Boolean)

  const address = addressParts.length > 0 ? addressParts.join(', ') : 'Address not provided'

  // Distance calculation
  let distanceKm = null
  if (
    isValidCoordinate(originCoords.latitude, originCoords.longitude) &&
    isValidCoordinate(lat, lon)
  ) {
    distanceKm = calculateDistanceKm(
      originCoords.latitude,
      originCoords.longitude,
      lat,
      lon
    )
  } else if (typeof addressInfo.Distance === 'number' && !isNaN(addressInfo.Distance)) {
    // Open Charge Map distance with distanceunit=KM
    distanceKm = addressInfo.Distance
  }

  // Connectors
  const rawConnections = Array.isArray(item.Connections) ? item.Connections : []
  const connectors = rawConnections.map((conn) => {
    const type = conn.ConnectionType?.Title?.trim() || 'Not specified'
    const power = typeof conn.PowerKW === 'number' && conn.PowerKW > 0 ? conn.PowerKW : null
    const quantity = typeof conn.Quantity === 'number' && conn.Quantity > 0 ? conn.Quantity : null
    const currentType = conn.CurrentType?.Title?.trim() || null
    const isConnOperational =
      typeof conn.StatusType?.IsOperational === 'boolean'
        ? conn.StatusType.IsOperational
        : null

    return {
      id: conn.ID,
      type,
      power,
      quantity,
      currentType,
      status: conn.StatusType?.Title?.trim() || null,
      isOperational: isConnOperational,
    }
  })

  // Total bays/points
  const totalPoints =
    typeof item.NumberOfPoints === 'number' && item.NumberOfPoints > 0
      ? item.NumberOfPoints
      : connectors.reduce((acc, c) => acc + (c.quantity || 1), 0) || null

  // Operational status (only when reliable data exists)
  const statusTitle = item.StatusType?.Title?.trim() || null
  const isOperational =
    typeof item.StatusType?.IsOperational === 'boolean'
      ? item.StatusType.IsOperational
      : null

  // Operator
  const operatorName = item.OperatorInfo?.Title?.trim() || null

  // Usage type
  const usageType = item.UsageType?.Title?.trim() || null

  // Data Freshness
  const dateUpdated = item.DateLastStatusUpdate || item.DateLastVerified || null

  const stationObj = {
    id: item.ID || `station-${Math.random().toString(36).substring(2, 9)}`,
    name,
    operator: operatorName,
    usageType,
    address,
    latitude: lat,
    longitude: lon,
    distanceKm,
    distanceLabel: formatDistance(distanceKm),
    statusTitle,
    isOperational,
    connectors,
    totalPoints,
    dateUpdated,
  }

  stationObj.directionsUrl = getDirectionsUrl(stationObj)

  return stationObj
}

/**
 * Fetches EV charging stations near given coordinates using Open Charge Map API.
 * Supports cancellation via AbortSignal.
 *
 * @param {object} params
 * @param {number} params.latitude
 * @param {number} params.longitude
 * @param {number} [params.radiusKm=25]
 * @param {number} [params.maxResults=30]
 * @param {AbortSignal} [params.signal]
 * @returns {Promise<{ stations: Array, total: number }>}
 */
export async function fetchChargingStations({
  latitude,
  longitude,
  radiusKm = 25,
  maxResults = 30,
  signal,
}) {
  if (!isValidCoordinate(latitude, longitude)) {
    throw new Error('Valid latitude and longitude coordinates are required')
  }

  const apiKey = (
    typeof import.meta !== 'undefined' &&
    import.meta.env?.VITE_OPENCHARGEMAP_API_KEY
  )?.trim()

  if (!apiKey) {
    const error = new Error(
      'Open Charge Map API key required. Please set VITE_OPENCHARGEMAP_API_KEY in your .env file.'
    )
    error.code = 'MISSING_API_KEY'
    throw error
  }

  const queryParams = new URLSearchParams({
    output: 'json',
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    distance: radiusKm.toString(),
    distanceunit: 'KM',
    maxresults: maxResults.toString(),
    compact: 'true',
    verbose: 'false',
    key: apiKey,
  })

  const url = `${OCM_BASE_URL}?${queryParams.toString()}`

  let response
  try {
    response = await fetch(url, {
      signal,
      headers: {
        'X-API-Key': apiKey,
        Accept: 'application/json',
      },
    })
  } catch (err) {
    if (err.name === 'AbortError') {
      throw err
    }
    const networkError = new Error(
      'Unable to connect to Open Charge Map. Please check your internet connection.'
    )
    networkError.code = 'NETWORK_ERROR'
    throw networkError
  }

  if (response.status === 401 || response.status === 403) {
    const authError = new Error(
      'Invalid or unauthorized Open Charge Map API key. Please check your VITE_OPENCHARGEMAP_API_KEY.'
    )
    authError.code = 'INVALID_API_KEY'
    throw authError
  }

  if (response.status === 429) {
    const rateError = new Error(
      'Open Charge Map rate limit reached. Please wait a moment and try again.'
    )
    rateError.code = 'RATE_LIMITED'
    throw rateError
  }

  if (!response.ok) {
    const serverError = new Error(
      `Open Charge Map service error (${response.status}). Please try again later.`
    )
    serverError.code = 'SERVER_ERROR'
    throw serverError
  }

  let data
  try {
    data = await response.json()
  } catch {
    const parseError = new Error('Received invalid data format from Open Charge Map.')
    parseError.code = 'PARSE_ERROR'
    throw parseError
  }

  if (!Array.isArray(data)) {
    return { stations: [], total: 0 }
  }

  const stations = data
    .map((item) => parseStation(item, { latitude, longitude }))
    // Sort by distance (closest first) when distance is available
    .sort((a, b) => {
      if (a.distanceKm !== null && b.distanceKm !== null) {
        return a.distanceKm - b.distanceKm
      }
      if (a.distanceKm !== null) return -1
      if (b.distanceKm !== null) return 1
      return 0
    })

  return { stations, total: stations.length }
}

/**
 * Requests the user's location via the browser Geolocation API with precise error mapping.
 * @param {PositionOptions} [options]
 * @returns {Promise<{ latitude: number, longitude: number }>}
 */
export function getUserCoordinates(options = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      const err = new Error('Geolocation is not supported by your browser')
      err.code = 'GEOLOCATION_UNSUPPORTED'
      reject(err)
      return
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
      ...options,
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (geoError) => {
        let message = 'Unable to determine your location'
        let code = 'GEOLOCATION_ERROR'

        switch (geoError.code) {
          case 1: // PERMISSION_DENIED
            message =
              'Location permission was denied. Please allow location access in your browser or search by city.'
            code = 'PERMISSION_DENIED'
            break
          case 2: // POSITION_UNAVAILABLE
            message =
              'Location information is currently unavailable. Please try searching by city.'
            code = 'POSITION_UNAVAILABLE'
            break
          case 3: // TIMEOUT
            message = 'Location request timed out. Please try again or search by city.'
            code = 'TIMEOUT'
            break
          default:
            message = geoError.message || message
            break
        }

        const error = new Error(message)
        error.code = code
        reject(error)
      },
      defaultOptions
    )
  })
}
