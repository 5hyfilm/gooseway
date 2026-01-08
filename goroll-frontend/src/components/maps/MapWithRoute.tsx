"use client";

import React, { useMemo, useRef } from "react";
import Map, {
  Source,
  Layer,
  Marker,
  NavigationControl,
  MapRef,
  MapMouseEvent,
  GeolocateControl,
  FullscreenControl,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { featureCollection } from "@turf/helpers";

import { calculateBounds } from "../../../utils/mapUtils";

type MapRouteProps = {
  path: [number, number][];
  isEditable?: boolean;
  handleSelectRoute?: (route: [number, number]) => void;
};

export default function MapRoute({
  path,
  isEditable,
  handleSelectRoute,
}: MapRouteProps) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const mapRef = useRef<MapRef | null>(null);

  const center = useMemo(
    () => calculateBounds(!isEditable ? path : []),
    [path, isEditable]
  );

  const routeGeoJson = useMemo(() => {
    return featureCollection([
      {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: path,
        },
        properties: {
          name: "Sample Route",
        },
      },
    ]);
  }, [path]);

  const handleSetRoute = (e: MapMouseEvent) => {
    if (isEditable) {
      const lngLat = e.lngLat;
      handleSelectRoute?.([lngLat.lng, lngLat.lat]);
    }
  };

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={token}
      initialViewState={{
        latitude: center[0],
        longitude: center[1],
        zoom: 14,
      }}
            style={{ width: "100%", height: "100%",borderRadius: "6px" }}
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

      {path.length > 0 && (
        <>
          <Marker latitude={path[0][1]} longitude={path[0][0]} />
          <Marker
            latitude={path[path.length - 1][1]}
            longitude={path[path.length - 1][0]}
          />
          <Source id="route" type="geojson" data={routeGeoJson}>
            <Layer
              id="route"
              type="line"
              paint={{
                "line-color": "#3b82f6",
                "line-width": 4,
                "line-opacity": 0.7,
              }}
              layout={{
                "line-cap": "round",
                "line-join": "round",
              }}
            />
          </Source>
        </>
      )}
    </Map>
  );
}
