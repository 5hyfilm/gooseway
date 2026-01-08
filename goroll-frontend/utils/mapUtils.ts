export const calculateBounds = (path: [number, number][]): [number, number] => {
  if (!Array.isArray(path) || path.length === 0) {
    return [13.7563,100.5018]; // Bangkok default
  }

  const center: [number, number] = [
    path.reduce((sum, point) => sum + point[1], 0) / path.length,
    path.reduce((sum, point) => sum + point[0], 0) / path.length,
  ];

  return center;
};

export const haversineDistance = ([lng1, lat1]: [number, number], [lng2, lat2]: [number, number]): number => {
  const R = 6371000;

  const radians = (angle : number) => (angle * Math.PI) / 180;

  const dLat = radians(lat2 - lat1);
  const dLon = radians(lng2 - lng1);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radians(lat1)) * Math.cos(radians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;
  return distance;
}
