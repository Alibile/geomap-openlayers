import React, { useEffect, useRef } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import Zoom from "ol/control/Zoom";
import { Vector as VectorSource } from "ol/source.js";
import { Vector as VectorLayer } from "ol/layer.js";
import { Draw, Modify, Snap } from "ol/interaction.js";
import XYZ from "ol/source/XYZ.js";

const MapComponent = () => {
  const mapRef = useRef(null);
  const raster = new TileLayer({
    source: new OSM(),
  });


  useEffect(() => {
    if (mapRef.current) {
      const source = new VectorSource();
      
      const vector = new VectorLayer({
        source: source,
        style: {
          "fill-color": "rgba(255, 255, 255, 0.2)",
          "stroke-color": "#ffcc33",
          "stroke-width": 2,
          "circle-radius": 7,
          "circle-fill-color": "#ffcc33",
        },
      });
      const map = new Map({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: new OSM,
          }),
          vector,
        ],
        view: new View({
          center: [0, 0],
          zoom: 2,
          maxZoom: 18, // optional: set the maximum zoom level
        }),
      });
      console.log(map);

      const draw = new Draw({
        source: source,
        type: "Point",
      });

      map.addInteraction(draw);
      console.log(map);

      draw.on("drawend", () => {
        console.log(source.getFeatures());
      });
    }
  }, []);

  return <div ref={mapRef} className="map"></div>;
};

export default MapComponent;
