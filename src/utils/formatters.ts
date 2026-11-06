export const formatPrice = (
  price: number,
  currency: string = 'USD'
): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(price);
};

export const formatArea = (sqm: number): string => {
  const sqft = Math.round(sqm * 10.7639);
  return `${sqm} m² (${sqft.toLocaleString()} sq ft)`;
};

export const formatCoordinates = (coords: { lat: number; lng: number }): string => {
  const latDir = coords.lat >= 0 ? 'N' : 'S';
  const lngDir = coords.lng >= 0 ? 'E' : 'W';
  return `LAT ${Math.abs(coords.lat).toFixed(4)}° ${latDir} | LON ${Math.abs(
    coords.lng
  ).toFixed(4)}° ${lngDir}`;
};
