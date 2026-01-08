import React from "react";
import { ShapeSource, CircleLayer, SymbolLayer } from "@rnmapbox/maps";
import { featureCollection } from "@turf/helpers";

type MapClusterPropsType = {
  combinedGeoJSON: GeoJSON.FeatureCollection;
  onClick: (id: string, type: string) => void;
};

export default function MapCluster({
  combinedGeoJSON,
  onClick,
}: MapClusterPropsType) {
  const handlePress = (e: any) => {
    const feature = e.features?.[0];

    if (!feature) return;

    const isCluster = feature.properties?.point_count > 0;

    if (!isCluster) {
      onClick(feature.id, feature.properties?.locationType);
    }
  };

  return (
    <ShapeSource
      id="all-locations"
      cluster={true}
      shape={featureCollection(combinedGeoJSON.features)}
      onPress={handlePress}
    >
      {/* Clustered Points */}
      <CircleLayer
        id="cluster-circles"
        filter={["has", "point_count"]}
        style={{
          circleColor: "#2563eb",
          circleRadius: 18,
          circleStrokeColor: "white",
          circleStrokeWidth: 2,
        }}
      />

      {/* Cluster Count Label */}
      <SymbolLayer
        id="cluster-counts"
        filter={["has", "point_count"]}
        style={{
          textField: "{point_count}",
          textSize: 12,
          textColor: "white",
        }}
      />

      {/* Non-Clustered Points */}
      <SymbolLayer
        id="single-point-icons"
        filter={["!", ["has", "point_count"]]}
        style={{
          iconImage: [
            "case",
            ["==", ["get", "locationType"], "obstacle"],
            "obstacle",
            [
              "concat",
              ["get", "locationCategory"],
              "-",
              ["get", "locationType"],
            ],
          ],
          iconSize: 0.2,
        }}
      />
    </ShapeSource>
  );
}
