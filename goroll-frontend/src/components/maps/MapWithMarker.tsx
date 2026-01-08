"use client";

import React, { useRef, useEffect } from "react";
import Map, {
  Marker,
  NavigationControl,
  MapRef,
  MapMouseEvent,
  GeolocateControl,
  FullscreenControl,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

type MapWithMarkerProps = {
  location: [number, number] | [];
  isEditable?: boolean;
  handleSelectLocation?: (route: [number, number]) => void;
};

export default function MapWithMarker({
  location,
  isEditable = true,
  handleSelectLocation,
}: MapWithMarkerProps) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const mapRef = useRef<MapRef | null>(null);

  const handleSetRoute = (e: MapMouseEvent) => {
    if (isEditable) {
      const lngLat = e.lngLat;
      handleSelectLocation?.([lngLat.lat, lngLat.lng]);
    }
  };

  useEffect(() => {
    if (mapRef.current && location.length === 2 && typeof location[0] === "number" && typeof location[1] === "number") {
      mapRef.current.flyTo({
        center: [location[1], location[0]], // Mapbox uses [lng, lat]

        duration: 1000,
      });
    }
  }, [location]);

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={token}
      initialViewState={{
        latitude: location[0] ?? 13.7563,
        longitude: location[1] ?? 100.5018,
        zoom: location.length ? 14 : 10,
      }}
      style={{ width: "100%", height: "100%", borderRadius: "6px" }}
      mapStyle="mapbox://styles/mapbox/streets-v9"
      attributionControl={false}
      onLoad={() => {
        if (mapRef.current && isEditable) {
          mapRef.current.getCanvas().style.cursor = "pointer";
        }
      }}
      onClick={handleSetRoute}
    >
      {isEditable && (
        <GeolocateControl
          position="top-left"
          trackUserLocation
          showUserLocation
        />
      )}
      <FullscreenControl position="top-left" />
      <NavigationControl position="top-left" />

      {location?.length === 2 &&
        typeof location[0] === "number" &&
        typeof location[1] === "number" && (
          <Marker latitude={location[0]} longitude={location[1]} color="red" />
        )}
    </Map>
  );
}
