/**
 * ArcGISMap.jsx — Map showing equipment/vehicle last-known GPS positions.
 */
import { useEffect, useRef } from 'react';
import Map from '@arcgis/core/Map.js';
import MapView from '@arcgis/core/views/MapView.js';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer.js';
import Graphic from '@arcgis/core/Graphic.js';
import Point from '@arcgis/core/geometry/Point.js';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol.js';
import PopupTemplate from '@arcgis/core/PopupTemplate.js';
import { EQUIPMENT_TYPES, EQUIPMENT_STATUSES } from '../data.js';

const STATUS_COLORS = {
  available: [74, 222, 128],
  deployed: [251, 191, 36],
  maintenance: [248, 113, 113],
};

function buildGraphics(equipment) {
  return equipment
    .filter((eq) => eq.last_known_lat && eq.last_known_lng)
    .map((eq) => {
      const color = STATUS_COLORS[eq.status] || [148, 163, 184];
      return new Graphic({
        geometry: new Point({
          latitude: eq.last_known_lat,
          longitude: eq.last_known_lng,
          spatialReference: { wkid: 4326 },
        }),
        symbol: new SimpleMarkerSymbol({
          style: 'circle',
          color: color,
          size: 12,
          outline: { color: [255, 255, 255], width: 1.5 },
        }),
        attributes: eq,
        popupTemplate: new PopupTemplate({
          title: '{name}',
          content: `<b>Type:</b> ${EQUIPMENT_TYPES.find((t) => t.value === eq.type)?.label ?? eq.type}<br/>
                    <b>Status:</b> ${EQUIPMENT_STATUSES.find((s) => s.value === eq.status)?.label ?? eq.status}<br/>
                    <b>Notater:</b> ${eq.notes || '—'}`,
        }),
      });
    });
}

export default function ArcGISMap({ equipment }) {
  const mapDivRef = useRef(null);
  const viewRef = useRef(null);
  const layerRef = useRef(null);

  // Initialise map once
  useEffect(() => {
    const map = new Map({ basemap: 'dark-gray-vector' });
    const graphicsLayer = new GraphicsLayer({ title: 'Utstyr GPS' });
    map.add(graphicsLayer);
    layerRef.current = graphicsLayer;

    const view = new MapView({
      container: mapDivRef.current,
      map,
      center: [10.752, 59.913], // Oslo
      zoom: 11,
      ui: { components: ['zoom', 'compass'] },
    });
    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []);

  // Update graphics when equipment changes
  useEffect(() => {
    if (!layerRef.current) return;
    layerRef.current.removeAll();
    layerRef.current.addMany(buildGraphics(equipment));
  }, [equipment]);

  return <div ref={mapDivRef} className="map-container" style={{ width: '100%', height: '100%' }} />;
}
