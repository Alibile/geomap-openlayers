import React, { useEffect, useRef } from "react";
import KML from "ol/format/KML.js";
import Map from "ol/Map.js";
import Stamen from "ol/source/Stamen.js";
import VectorSource from "ol/source/Vector.js";
import View from "ol/View.js";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style.js";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer.js";
import earthquakes from "../data/2012_Earthquakes_Mag5.kml";
import bootstrap from "bootstrap/dist/js/bootstrap.bundle";
const MapInfo = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) {
      const styleCache = {};
      const styleFunction = function (feature) {
        // 2012_Earthquakes_Mag5.kml stores the magnitude of each earthquake in a
        // standards-violating <magnitude> tag in each Placemark.  We extract it from
        // the Placemark's name instead.
        const name = feature.get("name");
        const magnitude = parseFloat(name.substr(2));
        const radius = 5 + 20 * (magnitude - 5);
        let style = styleCache[radius];
        if (!style) {
          style = new Style({
            image: new CircleStyle({
              radius: radius,
              fill: new Fill({
                color: "rgba(255, 153, 0, 0.4)",
              }),
              stroke: new Stroke({
                color: "rgba(255, 204, 0, 0.2)",
                width: 1,
              }),
            }),
          });
          styleCache[radius] = style;
        }
        return style;
      };

      const vector = new VectorLayer({
        source: new VectorSource({
          url: earthquakes,
          format: new KML({
            extractStyles: false,
          }),
        }),
        style: styleFunction,
      });

      const raster = new TileLayer({
        source: new Stamen({
          layer: "toner",
        }),
      });

      const map = new Map({
        layers: [raster, vector],
        target: mapRef.current,
        view: new View({
          center: [0, 0],
          zoom: 2,
        }),
      });

      const info = document.getElementById("info");
      info.style.pointerEvents = "none";
      // eslint-disable-next-line no-undef
      const tooltip = new bootstrap.Tooltip(info, {
        animation: false,
        customClass: "pe-none",
        offset: [0, 5],
        title: "-",
        trigger: "manual",
      });

      let currentFeature;
      const displayFeatureInfo = function (pixel, target) {
        const feature = target.closest(".ol-control")
          ? undefined
          : map.forEachFeatureAtPixel(pixel, function (feature) {
              return feature;
            });
        if (feature) {
          info.style.left = pixel[0] + "px";
          info.style.top = pixel[1] + "px";
          if (feature !== currentFeature) {
            tooltip.setContent({ ".tooltip-inner": feature.get("name") });
          }
          if (currentFeature) {
            tooltip.update();
          } else {
            tooltip.show();
          }
        } else {
          tooltip.hide();
        }
        currentFeature = feature;
      };

      map.on("pointermove", function (evt) {
        if (evt.dragging) {
          tooltip.hide();
          currentFeature = undefined;
          return;
        }
        const pixel = map.getEventPixel(evt.originalEvent);
        displayFeatureInfo(pixel, evt.originalEvent.target);
      });

      map.on("click", function (evt) {
        displayFeatureInfo(evt.pixel, evt.originalEvent.target);
      });

      map.getTargetElement().addEventListener("pointerleave", function () {
        tooltip.hide();
        currentFeature = undefined;
      });
    }
  }, []);

  return (
    <div ref={mapRef} id="map" className="map">
          <div id="info"></div>
          
    </div>
  );
};

export default MapInfo;
