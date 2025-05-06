import React, { useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import { Vector as VectorLayer } from "ol/layer";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { useGeographic } from "ol/proj";

// Styling of OpenLayers components like zoom and pan controls
import "ol/ol.css";

// By calling the "useGeographic" function in OpenLayers, we tell that we want coordinates to be in degrees
// instead of meters, which is the default. Without this `center: [10.6, 59.9]` brings us to "null island"
useGeographic();

export function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);

  // Fetch the GeoJSON data from your local or online API
  useEffect(() => {
    const fetchGeoJson = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/culturalheritage",
        ); // Adjust this URL as needed
        const data = await response.json();
        setGeoJsonData(data);
      } catch (error) {
        console.error("Error fetching GeoJSON data: ", error);
      }
    };
    fetchGeoJson();
  }, []);

  useEffect(() => {
    if (geoJsonData) {
      // Initialize the OpenLayers map
      const map = new Map({
        view: new View({
          center: [10.8, 59.9],
          zoom: 13,
        }),
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
      });

      // Create a vector source to hold the GeoJSON data
      const vectorSource = new VectorSource({
        features: new GeoJSON().readFeatures(geoJsonData), // Convert GeoJSON to OpenLayers features
      });

      // Create a vector layer to display the polygons
      const vectorLayer = new VectorLayer({
        source: vectorSource,
      });

      // Add the vector layer to the map
      map.addLayer(vectorLayer);

      // Set the map target to the div element where we want the map to be displayed
      map.setTarget(mapRef.current!);
    }
  }, [geoJsonData]); // This effect depends on `geoJsonData`, so it will run when the data is fetched

  return <div ref={mapRef} style={{ width: "100%", height: "500px" }}></div>;
}
