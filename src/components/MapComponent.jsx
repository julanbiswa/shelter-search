import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

const MapComponent = ({
  center = { lat: 27.7172, lng: 85.3240 },
  zoom = 12,
  rooms = [],
  userLocation = null,
  route = null,
  onMarkerClick = null,
  onMapClick = null
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const routePolylineRef = useRef(null);
  const userLocationMarkerRef = useRef(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    const map = L.map(mapRef.current).setView([center.lat, center.lng], zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    if (onMapClick) {
      map.on('click', (e) => {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      });
    }

    return () => {
      map.remove();
    };
  }, []);

  // Update map center when center prop changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([center.lat, center.lng], zoom);
  }, [center, zoom]);

  // Update room markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => mapInstanceRef.current.removeLayer(marker));
    markersRef.current = [];

    // Add room markers
    rooms.forEach((room) => {
      const marker = L.marker([room.latitude, room.longitude])
        .bindPopup(`
          <div class="marker-popup">
            ${room.image ? `<img src="${room.image}" alt="${room.title}" />` : ''}
            <h3 class="font-bold text-lg">${room.title}</h3>
            <p class="text-gray-600">रु.${room.price}/month</p>
            <p class="text-sm text-gray-700 mt-2">${room.description.substring(0, 50)}...</p>
          </div>
        `)
        .addTo(mapInstanceRef.current);

      marker.on('click', () => {
        if (onMarkerClick) {
          onMarkerClick(room);
        }
      });

      markersRef.current.push(marker);
    });
  }, [rooms, onMarkerClick]);

  // Update user location marker
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return;

    if (userLocationMarkerRef.current) {
      mapInstanceRef.current.removeLayer(userLocationMarkerRef.current);
    }

    const userMarker = L.marker([userLocation.lat, userLocation.lng], {
      icon: L.icon({
        iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48ZGVmcz48c3R5bGU+LnB1bHNlIHsgYW5pbWF0aW9uOiBwdWxzZSAxLjVzIGluZmluaXRlOyB9IEBrZXlmcmFtZXMgcHVsc2UgeyAwJSB7IHI6IDY7IGZpbGwtb3BhY2l0eTogMDsgfSA1MCUgeyBmaWxsLW9wYWNpdHk6IDAuMzsgfSAxMDAlIHsgcjogMTI7IGZpbGwtb3BhY2l0eTogMDsgfSB9PC9zdHlsZT48L2RlZnM+PGNpcmNsZSBjbGFzcz0icHVsc2UiIGN4PSIxNiIgY3k9IjE2IiBmaWxsPSIjMzc4OGQ4Ii8+PGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iOCIgZmlsbD0iIzI1NWRkMyIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -15]
      })
    })
      .bindPopup('<div style="text-align: center; font-weight: bold; color: #2563eb;">📍 You are here</div>')
      .addTo(mapInstanceRef.current);

    userLocationMarkerRef.current = userMarker;
  }, [userLocation]);

  // Update route
  useEffect(() => {
    if (!mapInstanceRef.current || !route) return;

    if (routePolylineRef.current) {
      mapInstanceRef.current.removeLayer(routePolylineRef.current);
    }

    const routeCoordinates = route.path.map((point) => [point.lat, point.lng]);
    const polyline = L.polyline(routeCoordinates, {
      color: '#3B82F6',
      weight: 3,
      opacity: 0.8,
      dashArray: '5, 5'
    }).addTo(mapInstanceRef.current);

    routePolylineRef.current = polyline;

    // Fit bounds to route
    const group = new L.featureGroup([polyline]);
    mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
  }, [route]);

  return (
    <div
      ref={mapRef}
      className="map-container"
      style={{
        width: '100%',
        height: '100%',
        minHeight: '500px'
      }}
    />
  );
};

export default MapComponent;
