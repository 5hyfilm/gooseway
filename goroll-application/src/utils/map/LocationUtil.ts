import * as Location from "expo-location";

export const handleUseLocation = async () => {
  const { status } = await Location.getForegroundPermissionsAsync();
  if (status !== "granted") {
    return null;
  }
  const loc = await Location.getCurrentPositionAsync({});
  const newLocation = {
    latitude: loc.coords.latitude,
    longitude: loc.coords.longitude,
  };

  return newLocation;
};
