import "./Poster.css";
import { PosterForm } from "./PosterForm.js";
import { useState, useEffect } from "react";
import Map from "../api/Map.js";


export function Poster({ isOpen, onClose, onSubmit }) {

  const [mapData, setMapData] = useState(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") { onClose(); }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleMapSubmit = (data) => {
    console.log('Map data received:', data); // 데이터 확인
    setMapData({
      startName: data.startName,
      endName: data.endName,
      waypoints: data.waypoints,
      distance: data.distance,
      duration: data.duration,
      fuelCost: data.fuelCost,
      taxiCost: data.taxiCost
    });
  };

  if (!isOpen) return null;

  return (
    <div id="Posting">
      <Map onMapSubmit={handleMapSubmit} />
      <PosterForm onSubmit={onSubmit} onClose={onClose} mapData={mapData} />
    </div>
  );
}