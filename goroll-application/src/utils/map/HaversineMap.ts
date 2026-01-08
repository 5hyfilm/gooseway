export function haversineDistance(
  coord1: [number, number],
  coord2: [number, number]
) {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const calculateTotalDistanceMeters = (
  routeRecord: [number, number][]
): number => {
  if (routeRecord.length < 2) return 0;

  const R = 6371000; // Earth's radius in meters

  const toRadians = (degrees: number): number => degrees * (Math.PI / 180);

  let total = 0;

  for (let i = 1; i < routeRecord.length; i++) {
    const [lng1, lat1] = routeRecord[i - 1];
    const [lng2, lat2] = routeRecord[i];

    const φ1 = toRadians(lat1);
    const φ2 = toRadians(lat2);
    const Δφ = toRadians(lat2 - lat1);
    const Δλ = toRadians(lng2 - lng1);

    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    total += R * c;
  }

  return total; // in meters
};

type MapBounds = {
  center: [number, number];
  zoom: number;
};

export const calculateMapBounds = (points: [number, number][]): MapBounds => {
  if (!points || points.length === 0) {
    return {
      center: [100.5018, 13.7563],
      zoom: 12,
    };
  }

  let minLon = points[0][0];
  let maxLon = points[0][0];
  let minLat = points[0][1];
  let maxLat = points[0][1];

  for (const [lon, lat] of points) {
    minLon = Math.min(minLon, lon);
    maxLon = Math.max(maxLon, lon);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }

  const center: [number, number] = [
    (minLon + maxLon) / 2,
    (minLat + maxLat) / 2,
  ];

  const WORLD_DIM = { height: 256, width: 256 };
  const ZOOM_MAX = 20;

  const latRad = (lat: number) => {
    const sin = Math.sin((lat * Math.PI) / 180);
    const radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
    return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
  };

  const zoom = (mapPx: number, worldPx: number, fraction: number) =>
    Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);

  const latFraction = (latRad(maxLat) - latRad(minLat)) / Math.PI;
  const lonFraction = (maxLon - minLon) / 360;

  const mapWidthPx = 200;
  const mapHeightPx = 200;

  const zoomLat = zoom(mapHeightPx, WORLD_DIM.height, latFraction);
  const zoomLon = zoom(mapWidthPx, WORLD_DIM.width, lonFraction);

  const finalZoom = Math.min(zoomLat, zoomLon, ZOOM_MAX);

  return {
    center,
    zoom: finalZoom,
  };
};
