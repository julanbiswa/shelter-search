import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../utils/auth';
import { Storage } from '../utils/storage';
import { getCurrentLocation, findNearestRooms, getRecommendedRooms, calculateDistance } from '../utils/geolocation';
import { findRoute } from '../utils/routing';
import MapComponent from '../components/MapComponent';
import Toast from '../components/Toast';

const TenantMapView = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const user = AuthService.getCurrentUser();
  const [rooms, setRooms] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [nearestRooms, setNearestRooms] = useState([]);
  const [recommendedRooms, setRecommendedRooms] = useState([]);
  const [route, setRoute] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPrice, setFilterPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [locationSearch, setLocationSearch] = useState('');
  const [mapCenter, setMapCenter] = useState({ lat: 27.7172, lng: 85.3240 });

  // Load rooms and get user location
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Get all rooms
      const allRooms = await Storage.getAllRooms();
      setRooms(allRooms);

      // Get user's current location
      const location = await getCurrentLocation();
      setUserLocation(location);

      // Get nearest and recommended rooms
      const nearest = findNearestRooms(location, allRooms, 5);
      setNearestRooms(nearest);

      const recommended = getRecommendedRooms(location, allRooms, 5, { min: 300, max: 2000 });
      setRecommendedRooms(recommended);
    } catch (error) {
      setToast({ type: 'error', message: 'Error loading data: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerClick = (room) => {
    setSelectedRoom(room);
  };

  const handleFindRoute = async () => {
    if (!selectedRoom || !userLocation) {
      console.log('Missing data:', { userLocation, selectedRoom });
      return;
    }

    try {
      console.log('Calling findRoute with:', {
        userLocation,
        destination: { lat: selectedRoom.latitude, lng: selectedRoom.longitude },
      });
      const routeResult = findRoute(
        userLocation,
        { lat: selectedRoom.latitude, lng: selectedRoom.longitude },
        [],
        'astar'
      );
      setRoute(routeResult);
      setToast({
        type: 'success',
        message: `Route found! Distance: ${routeResult.distance.toFixed(1)}km`
      });
    } catch (error) {
      console.error('Error in handleFindRoute:', error);
      setToast({ type: 'error', message: 'Error finding route' });
    }
  };

  const handleLocationSearch = async () => {
    if (!locationSearch.trim()) {
      setToast({ type: 'error', message: 'Please enter a location name' });
      return;
    }

    try {
      // Use Nominatim API to geocode the location (Kathmandu focused)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          locationSearch + ', Kathmandu, Nepal'
        )}&format=json&limit=1`
      );

      const results = await response.json();

      if (results.length === 0) {
        setToast({
          type: 'error',
          message: `Location "${locationSearch}" not found. Try searching in Kathmandu area.`
        });
        return;
      }

      const location = results[0];
      setMapCenter({
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lon)
      });

      setToast({
        type: 'success',
        message: `Location found: ${location.display_name.split(',')[0]}`
      });

      setLocationSearch('');
    } catch (error) {
      setToast({
        type: 'error',
        message: 'Error searching location: ' + error.message
      });
    }
  };

  const handleOpenDirections = () => {
    if (!selectedRoom || !userLocation) {
      console.log('Missing data for directions:', { userLocation, selectedRoom });
      setToast({ type: 'error', message: 'Please select a room first' });
      return;
    }

    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${selectedRoom.latitude},${selectedRoom.longitude}&travelmode=walking`;
    console.log('Opening Google Maps with URL:', googleMapsUrl);

    window.open(googleMapsUrl, '_blank');

    setToast({
      type: 'success',
      message: 'Opening directions in Google Maps...'
    });
  };

  const handleLogout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
    navigate('/login');
  };

  // Filter rooms based on search and price
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = searchQuery === '' || 
      room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPrice = filterPrice === '' || room.price <= parseInt(filterPrice);
    
    return matchesSearch && matchesPrice;
  });

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed md:relative w-full md:w-96 h-full bg-white shadow-xl transform transition-transform md:translate-x-0  ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        } z-40 flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Rooms</h2>
          <button
            onClick={() => setShowSidebar(false)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b space-y-3">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Price Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Price: रु.{filterPrice || 'Any'}
            </label>
            <input
              type="range"
              min="0"
              max="5000"
              step="100"
              value={filterPrice}
              onChange={(e) => setFilterPrice(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Location Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🔍 Search Location
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., Baneshwor, Thamel..."
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
                className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleLocationSearch}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
              >
                Search
              </button>
            </div>
          </div>

          {/* Info */}
          {userLocation && (
            <div className="text-sm text-gray-600">
              📍 Your location: ({userLocation.lat.toFixed(2)}, {userLocation.lng.toFixed(2)})
            </div>
          )}
        </div>

        {/* Recommendations */}
        {!selectedRoom && recommendedRooms.length > 0 && (
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">🌟 Recommended for You</h3>
            <div className="space-y-2">
              {recommendedRooms.slice(0, 3).map((room) => (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg cursor-pointer hover:shadow-md transition border border-blue-200"
                >
                  <p className="font-semibold text-gray-900">{room.title}</p>
                  <p className="text-sm text-gray-600">रु.{room.price}/mo</p>
                  <p className="text-xs text-blue-600">
                    Score: {room.recommendation.score.toFixed(1)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nearest Rooms */}
        {!selectedRoom && nearestRooms.length > 0 && (
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">📍 Nearest Rooms</h3>
            <div className="space-y-2">
              {nearestRooms.slice(0, 3).map((room) => (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className="p-3 bg-green-50 rounded-lg cursor-pointer hover:shadow-md transition border border-green-200"
                >
                  <p className="font-semibold text-gray-900">{room.title}</p>
                  <p className="text-sm text-gray-600">रु.{room.price}/mo</p>
                  <p className="text-xs text-green-600">
                    {room.distance.toFixed(1)}km away
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Room List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {selectedRoom ? (
            <div>
              <button
                onClick={() => {
                  setSelectedRoom(null);
                  setRoute(null);
                }}
                className="w-full mb-4 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200 font-semibold transition"
              >
                ← Back to List
              </button>

              {/* Room Details */}
              <div className="bg-white border-2 border-blue-200 rounded-lg overflow-hidden">
                {selectedRoom.image && (
                  <img
                    src={selectedRoom.image}
                    alt={selectedRoom.title}
                    className="w-full h-40 object-cover"
                  />
                )}

                <div className="p-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {selectedRoom.title}
                  </h3>

                  <div className="mb-3">
                    <p className="text-2xl font-bold text-blue-600">
                      रु.{selectedRoom.price}<span className="text-base text-gray-600">/mo</span>
                    </p>
                  </div>

                  <p className="text-gray-700 mb-3 text-sm">
                    {selectedRoom.description}
                  </p>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-gray-600">Type</p>
                      <p className="font-semibold">{selectedRoom.roomType}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-gray-600">Rooms</p>
                      <p className="font-semibold">{selectedRoom.numRooms}</p>
                    </div>
                  </div>

                  {/* Facilities */}
                  {selectedRoom.facilities && selectedRoom.facilities.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        Facilities:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {selectedRoom.facilities.map((fac, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
                          >
                            ✓ {fac}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Distance */}
                  {userLocation && (
                    <div className="bg-blue-50 p-2 rounded mb-3 text-sm">
                      <p className="text-gray-600">Distance from you</p>
                      <p className="font-bold">
                        {calculateDistance(
                          userLocation.lat,
                          userLocation.lng,
                          selectedRoom.latitude,
                          selectedRoom.longitude
                        ).toFixed(1)} km
                      </p>
                    </div>
                  )}

                  {/* Owner Info */}
                  <div className="border-t pt-3 mb-3">
                    <p className="text-sm text-gray-600">Owner</p>
                    <p className="font-semibold">{selectedRoom.ownerName}</p>
                    <p className="text-sm text-blue-600 font-mono">
                      {selectedRoom.contactNumber}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <button
                      onClick={handleFindRoute}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                    >
                      🗺️ Find Route
                    </button>
                    <button
                      onClick={handleOpenDirections}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                    >
                      🧭 Open Directions (Google Maps)
                    </button>
                    <button
                      onClick={() => navigate(`/room/${selectedRoom.id}`)}
                      className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition"
                    >
                      View Full Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Found {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''}
              </p>
              {filteredRooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className="p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-md transition"
                >
                  <p className="font-semibold text-gray-900">{room.title}</p>
                  <p className="text-sm text-gray-600">रु.{room.price}/mo</p>
                  {userLocation && (
                    <p className="text-xs text-gray-500">
                      {calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        room.latitude,
                        room.longitude
                      ).toFixed(1)}
                      km away
                    </p>
                  )}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t space-y-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition"
          >
            Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Map Section */}
      <div className="flex-1 relative">
        {/* Mobile Toggle Button */}
        <button
          onClick={() => setShowSidebar(true)}
          className="md:hidden absolute top-4 left-4 z-30 p-2 bg-white rounded-lg shadow-lg hover:shadow-xl transition"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Map */}
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Loading map...</p>
            </div>
          </div>
        ) : (
          <MapComponent
            center={mapCenter}
            rooms={filteredRooms}
            userLocation={userLocation}
            route={route}
            onMarkerClick={handleMarkerClick}
          />
        )}

        {/* Route Info */}
        {route && (
          <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
            <h4 className="font-bold text-gray-900 mb-2">Route Information</h4>
            <p className="text-sm text-gray-600 mb-2">
              Distance: <strong>{route.distance.toFixed(1)} km</strong>
            </p>
            <p className="text-sm text-gray-600 mb-3">
              Algorithm: <strong>{route.algorithm}</strong>
            </p>
            <button
              onClick={() => setRoute(null)}
              className="w-full px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm font-semibold transition"
            >
              Clear Route
            </button>
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default TenantMapView;
