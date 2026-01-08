// utils/locationUtils.tsx
import L from "leaflet";
import { ShoppingBag, Bus, Trees, Accessibility } from "lucide-react";
import React from "react";

// ฟังก์ชันเพื่อรับคีย์การแปลสำหรับชื่อคุณสมบัติการเข้าถึง
export const getAccessibilityFeatureTranslationKey = (
  feature: string
): string => {
  const mapping: Record<string, string> = {
    parking: "review.feature.parking",
    entrance: "review.feature.entrance",
    ramp: "review.feature.ramp",
    pathway: "review.feature.pathway",
    elevator: "review.feature.elevator",
    restroom: "review.feature.restroom",
    seating: "review.feature.seating",
    staffAssistance: "review.feature.staff",
    etc: "review.feature.other",
  };
  return mapping[feature] || feature;
};

// Helper function to check if date is within last 24 hours
export const isWithinLast24Hours = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  const timeDifference = now.getTime() - date.getTime();
  const hoursDifference = timeDifference / (1000 * 60 * 60);
  return hoursDifference <= 24;
};

// Helper to check if there's any recent data
export const hasRecentData = (feature: any): boolean => {
  // Check if there are any recent votes or images
  // This is a simplified implementation - you'd need to adapt based on your actual data structure

  // Check for recent images
  const hasRecentImages = feature.images.some(
    (img: any) => img.timestamp && isWithinLast24Hours(img.timestamp)
  );

  // In a real implementation, you would also check for recent votes
  // For now, we'll just assume 30% of votes are recent for simulation
  const recentLikes = Math.floor(feature.votes.like * 0.3);
  const recentDislikes = Math.floor(feature.votes.dislike * 0.3);

  return hasRecentImages || recentLikes > 0 || recentDislikes > 0;
};

// Function to get marker icon based on accessibility level
export function getMarkerIcon(accessibility: string) {
  const color =
    accessibility === "high"
      ? "#22c55e"
      : accessibility === "medium"
      ? "#eab308"
      : "#ef4444";

  return L.divIcon({
    className: "custom-div-icon",
    html: `
      <div style="
        background-color: ${color};
        width: 50px;
        height: 50px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: pointer;
      "></div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

// Function to get category icon
export function getCategoryIcon(category: string) {
  switch (category) {
    case "Shopping Mall":
      return <ShoppingBag className="w-5 h-5" />;
    case "Public Transport":
      return <Bus className="w-5 h-5" />;
    case "Park":
      return <Trees className="w-5 h-5" />;
    default:
      return <Accessibility className="w-5 h-5" />;
  }
}
