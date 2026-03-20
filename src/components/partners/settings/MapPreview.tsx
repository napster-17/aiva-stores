//src/components/partners/MapPreview.tsx
'use client';

import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useMapEvents } from 'react-leaflet';
import { useMemo, useRef, useEffect } from 'react';
import { ZoomControl } from 'react-leaflet';

const DefaultIcon = typeof window !== 'undefined' ? L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
}) : null;

// Helper component to handle view updates when coordinates change
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

interface MapPreviewProps {
  lat: number;
  lng: number;
  height?: number;
  radius?: number;
  mapType?: 'standard' | 'satellite';
  onLocationChange?: (lat: number, lng: number) => void;
}

// Helper to handle view updates, clicking, and zooming to radius
function MapEvents({ center, radius, onLocationChange }: { 
  center: [number, number], 
  radius?: number, 
  onLocationChange?: (lat: number, lng: number) => void 
}) {
  const map = useMapEvents({
    click(e) {
      if (onLocationChange) onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    if (radius && radius > 0) {
      // Calculate bounds using the radius without creating a full layer object first
      const centerLatLng = L.latLng(center[0], center[1]);
      const bounds = centerLatLng.toBounds(radius);
      map.fitBounds(bounds, { padding: [20, 20] });
    } else {
      map.setView(center, map.getZoom());
    }
  }, [center, radius, map]);

  return null;
}

export default function MapPreview({ 
  lat, 
  lng, 
  height = 400, 
  radius, 
  mapType = 'standard',
  onLocationChange 
}: MapPreviewProps) {
  const position: [number, number] = [lat, lng];
  const markerRef = useRef<L.Marker>(null);

  // Memoize event handlers for the draggable marker
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null && onLocationChange) {
          const { lat, lng } = marker.getLatLng();
          onLocationChange(lat, lng);
        }
      },
    }),
    [onLocationChange],
  );

  return (
    <div style={{ height: `${height}px` }} className="w-full relative z-0">
      <MapContainer 
        center={position} 
        zoom={14} 
        scrollWheelZoom={false} 
        zoomControl={false} // Disable default top-left position
        style={{ height: '100%', width: '100%' }}
      >
        <ZoomControl position="bottomright" />
        <ChangeView center={position} />
        
        {mapType === 'standard' ? (
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
        ) : (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          />
        )}
        
        {DefaultIcon && (
          <Marker 
            draggable={true}
            eventHandlers={eventHandlers}
            position={position} 
            icon={DefaultIcon} 
            ref={markerRef}
          />
        )}
        <MapEvents center={position} radius={radius} onLocationChange={onLocationChange} />

        {radius && (
          <Circle
            center={position}
            radius={radius}
            pathOptions={{
              fillColor: '#ea580c',
              fillOpacity: 0.15,
              color: '#ea580c',
              weight: 2,
              dashArray: '5, 10'
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}