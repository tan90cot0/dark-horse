import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { MapData, Marker as MapMarker } from '../../data/mapData';
import CustomPopup from './CustomPopup';

// Workaround for Leaflet marker icons with Webpack/Vite
// This is necessary because Leaflet's default marker icons don't work well with bundlers
// We need to manually create the marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icon
const createCustomIcon = () => {
  return L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
  });
};

// Component to handle map center and zoom changes
interface MapViewProps {
  center: [number, number];
  zoom: number;
}

const MapView: React.FC<MapViewProps> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
};

interface LeafletMapProps {
  mapData: MapData;
  selectedMarkerId: string | null;
  onMarkerClick: (markerId: string) => void;
}

const LeafletMap: React.FC<LeafletMapProps> = ({ mapData, selectedMarkerId, onMarkerClick }) => {
  const [activeMarker, setActiveMarker] = useState<MapMarker | null>(null);
  
  // Set center and zoom from map data
  const center: [number, number] = [mapData.map_info.center.lat, mapData.map_info.center.lng];
  const zoom = mapData.map_info.zoom;
  
  // Create custom icon
  const customIcon = createCustomIcon();

  // Find and set the active marker when selectedMarkerId changes
  useEffect(() => {
    if (selectedMarkerId) {
      const selected = mapData.markers.find(marker => marker.id === selectedMarkerId) || null;
      setActiveMarker(selected);
    } else {
      setActiveMarker(null);
    }
  }, [selectedMarkerId, mapData.markers]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%', borderRadius: 'inherit' }}
      className="z-0"
    >
      <TileLayer
        url={mapData.tile_layers[0].url}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {/* Update view when map center or zoom changes */}
      <MapView center={center} zoom={zoom} />
      
      {/* Cluster markers */}
      <MarkerClusterGroup
        chunkedLoading
        iconCreateFunction={(cluster) => {
          return L.divIcon({
            html: `<div class="cluster-icon">${cluster.getChildCount()}</div>`,
            className: 'custom-marker-cluster',
            iconSize: L.point(40, 40)
          });
        }}
      >
        {mapData.markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.position.lat, marker.position.lng]}
            icon={customIcon}
            eventHandlers={{
              click: () => {
                onMarkerClick(marker.id);
                setActiveMarker(marker);
              },
            }}
          >
            <Popup>
              <CustomPopup marker={marker} />
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
};

export default LeafletMap;