// src/components/admin/RouteOnMap.tsx

import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { LatLngTuple } from "leaflet";

interface RouteOnMapProps {
  path: [number, number][]; // อาเรย์ของจุดพิกัด [lat, lng]
  from: string;
  to: string;
}

// เพิ่ม interface เพื่อขยาย L.Icon.Default.prototype
interface IconDefaultPrototype extends L.Icon.Default {
  _getIconUrl?: string;
}

const RouteOnMap: React.FC<RouteOnMapProps> = ({ path, from, to }) => {
  // แก้ไขปัญหารูปภาพ icon ของ Leaflet
  useEffect(() => {
    // กำหนด path ของ marker icon ใหม่
    delete (L.Icon.Default.prototype as IconDefaultPrototype)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "/leaflet/marker-icon-2x.png",
      iconUrl: "/leaflet/marker-icon.png",
      shadowUrl: "/leaflet/marker-shadow.png",
    });
  }, []);

  // คำนวณ center และ bound เพื่อให้แผนที่แสดงเส้นทางทั้งหมด
  const calculateBounds = (): LatLngTuple => {
    if (!path || path.length === 0) return [13.7563, 100.5018]; // Bangkok default

    const center: LatLngTuple = [
      path.reduce((sum, point) => sum + point[0], 0) / path.length,
      path.reduce((sum, point) => sum + point[1], 0) / path.length,
    ];

    return center;
  };

  const center = calculateBounds();

  // สร้าง custom marker สำหรับจุดเริ่มต้นและปลายทาง
  const startIcon = new L.Icon({
    iconUrl: "/leaflet/marker-icon.png", // ใช้ไอคอนมาตรฐานก่อนถ้ายังไม่มีไฟล์ custom
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const endIcon = new L.Icon({
    iconUrl: "/leaflet/marker-icon.png", // ใช้ไอคอนมาตรฐานก่อนถ้ายังไม่มีไฟล์ custom
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  // ถ้าไม่มีเส้นทาง
  if (!path || path.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">ไม่มีข้อมูลเส้นทาง</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* จุดเริ่มต้น */}
      <Marker position={path[0] as LatLngTuple} icon={startIcon}>
        <Popup>
          <strong>จุดเริ่มต้น:</strong> {from}
        </Popup>
      </Marker>

      {/* จุดสิ้นสุด */}
      <Marker position={path[path.length - 1] as LatLngTuple} icon={endIcon}>
        <Popup>
          <strong>ปลายทาง:</strong> {to}
        </Popup>
      </Marker>

      {/* เส้นทาง */}
      <Polyline
        positions={path as LatLngTuple[]}
        color="#3b82f6"
        weight={4}
        opacity={0.7}
      />
    </MapContainer>
  );
};

export default RouteOnMap;
