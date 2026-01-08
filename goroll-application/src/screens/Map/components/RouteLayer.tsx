import React from "react";
import { ShapeSource, LineLayer } from "@rnmapbox/maps";
import { RouteListResponse } from "../../../services/api/types/route";

type RouteLayerProps = {
  visible: boolean;
  routes: RouteListResponse[];
};

const RouteLayer = React.memo(
  ({ visible, routes }: RouteLayerProps) => {
    if (!visible) return null;

    return (
      <>
        {routes.map((res) => (
          <ShapeSource
            key={res.id.toString()}
            id={`route-${res.id}`}
            shape={{
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: res.routeCoordinates,
              },
            }}
          >
            <LineLayer
              id={`routeLine-${res.id}`}
              style={{
                lineColor: "#15803d",
                lineWidth: 5,
                lineOpacity: 0.6,
                lineCap: "round",
                lineJoin: "round",
              }}
              belowLayerID="cluster-circles"
            />
          </ShapeSource>
        ))}
      </>
    );
  },
  (prevProps, nextProps) => prevProps.visible === nextProps.visible
);

export default RouteLayer;
