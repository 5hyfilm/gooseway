import axios from "axios";

export async function searchLocation(query: string) {
  const accessToken = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    query
  )}.json?access_token=${accessToken}`;

  try {
    const response = await axios.get(url);
    const firstResult = response.data.features[0];

    if (firstResult) {
      const { place_name, geometry } = firstResult;
      const [longitude, latitude] = geometry.coordinates;
      console.log("Place:", place_name);
      console.log("Latitude:", latitude);
      console.log("Longitude:", longitude);
      return { name: place_name, latitude, longitude };
    } else {
      console.log("No results found");
      return null;
    }
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

export async function searchAutocomplete(query: string, lang?: "th" | "en") {
  const accessToken = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const language = lang ?? "th";
  // const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
  //   query
  // )}.json?autocomplete=true&limit=20&country=th&access_token=${accessToken}`;
  const url = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(
    query
  )}&country=th&limit=10&proximity=ip&language=${language}&access_token=${accessToken}`;

  try {
    const response = await axios.get(url);

    return response.data.features.map((feature: any) => ({
      id: feature.id,
      name: `${
        language === "th"
          ? feature.properties.name_preferred
          : feature.properties.name
      }${feature.properties.place_formatted ? `, ${feature.properties.place_formatted}` : ""}`,
      latitude: feature.geometry.coordinates[1],
      longitude: feature.geometry.coordinates[0],
    }));
  } catch (error) {
    console.error("Autocomplete error:", error);
    return [];
  }
}
