// Google Places API (New) — v1 REST wrapper

const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY as string
const BASE_URL = 'https://places.googleapis.com/v1'

// Bounding rectangle covering all of Japan — used as fallback when no viewport bounds provided
const JAPAN_RECT = {
  low:  { latitude: 24.0, longitude: 122.0 },
  high: { latitude: 46.0, longitude: 154.0 },
}

export interface ViewportBounds {
  low:  { latitude: number; longitude: number }
  high: { latitude: number; longitude: number }
}

export interface PlaceSuggestion {
  placeId: string
  mainText: string
  secondaryText: string
  types: string[]
}

export interface PlaceDetails {
  placeId: string
  name: string
  address: string
  lat: number
  lng: number
  // photoName kept for backwards compat with the Place type stored in DB
  photoName?: string
  // All available photo resource names (up to 5)
  photoNames: string[]
  rating?: number
  websiteUri?: string
  phoneNumber?: string
  // Weekday descriptions e.g. "Monday: 9:00 AM – 5:00 PM"
  openingHours?: string[]
  types?: string[]
}

// Simple in-memory details cache to avoid re-fetching on repeated edits
const detailsCache = new Map<string, PlaceDetails>()

export async function searchPlaces(
  input: string,
  bounds?: ViewportBounds,
): Promise<PlaceSuggestion[]> {
  const trimmed = input.trim()
  if (trimmed.length < 2) return []

  try {
    const response = await fetch(`${BASE_URL}/places:autocomplete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
      },
      body: JSON.stringify({
        input: trimmed,
        locationBias: { rectangle: bounds ?? JAPAN_RECT },
      }),
    })

    if (!response.ok) return []

    const data = await response.json()
    return (data.suggestions ?? [])
      .map((s: any) => ({
        placeId:       s.placePrediction?.placeId ?? '',
        mainText:      s.placePrediction?.structuredFormat?.mainText?.text ?? s.placePrediction?.text?.text ?? '',
        secondaryText: s.placePrediction?.structuredFormat?.secondaryText?.text ?? '',
        types:         s.placePrediction?.types ?? [],
      }))
      .filter((s: PlaceSuggestion) => s.placeId)
  } catch {
    return []
  }
}

// Text search — returns multiple results with full details, used for the results panel
export async function textSearchPlaces(
  query: string,
  bounds?: ViewportBounds,
): Promise<PlaceDetails[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  try {
    const response = await fetch(`${BASE_URL}/places:searchText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': [
          'places.id',
          'places.displayName',
          'places.formattedAddress',
          'places.location',
          'places.photos',
          'places.rating',
          'places.websiteUri',
          'places.internationalPhoneNumber',
          'places.regularOpeningHours',
          'places.types',
        ].join(','),
      },
      body: JSON.stringify({
        textQuery: trimmed,
        maxResultCount: 10,
        // Use strict restriction when the user provides explicit viewport bounds;
        // fall back to a bias covering all of Japan when no bounds are available.
        ...(bounds
          ? { locationRestriction: { rectangle: bounds } }
          : { locationBias: { rectangle: JAPAN_RECT } }),
      }),
    })

    if (!response.ok) return []

    const data = await response.json()
    return (data.places ?? [])
      .map((p: any) => mapPlaceResponse(p.id, p))
      .filter((r: PlaceDetails) => r.placeId && r.lat !== 0)
  } catch {
    return []
  }
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  if (detailsCache.has(placeId)) return detailsCache.get(placeId)!

  try {
    const response = await fetch(`${BASE_URL}/places/${placeId}`, {
      headers: {
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': [
          'displayName',
          'formattedAddress',
          'location',
          'photos',
          'rating',
          'websiteUri',
          'internationalPhoneNumber',
          'regularOpeningHours',
          'types',
        ].join(','),
      },
    })

    if (!response.ok) return null

    const data = await response.json()
    const details = mapPlaceResponse(placeId, data)
    detailsCache.set(placeId, details)
    return details
  } catch {
    return null
  }
}

/** Returns a URL suitable for use as <img src> — browser will follow the redirect to the CDN. */
export function getPhotoUrl(photoName: string, maxWidth = 600): string {
  return `${BASE_URL}/${photoName}/media?maxWidthPx=${maxWidth}&key=${API_KEY}`
}

// ─── Internal helpers ──────────────────────────────────────────────────────────

function mapPlaceResponse(placeId: string, data: any): PlaceDetails {
  const photoNames: string[] = (data.photos ?? [])
    .slice(0, 5)
    .map((ph: any) => ph.name as string)
    .filter(Boolean)

  return {
    placeId,
    name:         data.displayName?.text ?? '',
    address:      data.formattedAddress ?? '',
    lat:          data.location?.latitude ?? 0,
    lng:          data.location?.longitude ?? 0,
    photoNames,
    photoName:    photoNames[0],
    rating:       data.rating,
    websiteUri:   data.websiteUri,
    phoneNumber:  data.internationalPhoneNumber,
    openingHours: data.regularOpeningHours?.weekdayDescriptions,
    types:        data.types,
  }
}
