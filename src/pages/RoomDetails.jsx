import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCurrentLocation, calculateDistance } from '../utils/geolocation';
import { findRoute } from '../utils/routing';
import Toast from '../components/Toast';
import MapComponent from '../components/MapComponent';
import api from '../utils/api';

const RoomDetails = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [route, setRoute] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadRoom();
    getUserLocation();
  }, [roomId]);

  const loadRoom = async () => {
    try {
      const response = await api.get(`/shelters/${roomId}`);
      if (response.data) {
        setRoom(response.data);
      } else {
        setToast({ type: 'error', message: 'Room not found' });
        setTimeout(() => navigate(-1), 2000);
      }
    } catch (error) {
      setToast({ type: 'error', message: 'Error loading room' });
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = async () => {
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
    } catch (error) {
      console.log('Could not get user location');
    }
  };

  const handleFindRoute = async () => {
    if (!room || !userLocation) {
      console.log('Missing data:', { userLocation, room });
      return;
    }

    try {
      console.log('Calling findRoute with:', {
        userLocation,
        destination: { lat: room.latitude, lng: room.longitude },
      });
      const routeResult = findRoute(
        userLocation,
        { lat: room.latitude, lng: room.longitude },
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

  const handleContact = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Contact Room Owner',
        text: `${room.ownerName}: ${room.contactNumber}`
      });
    } else {
      setToast({
        type: 'info',
        message: `Contact: ${room.ownerName} - ${room.contactNumber}`
      });
    }
  };

  const handleOpenDirections = async () => {
    if (!room || !userLocation) {
      console.log('Missing data for directions:', { userLocation, room });
      setToast({ type: 'error', message: 'Please enable location to open directions' });
      return;
    }

    try {
      const response = await api.post('/geolocation/directions', {
        origin: userLocation,
        destination: { lat: room.latitude, lng: room.longitude }
      });

      const directionsUrl = response.data.url;
      console.log('Opening directions with URL:', directionsUrl);

      window.open(directionsUrl, '_blank');

      setToast({
        type: 'success',
        message: 'Opening directions...'
      });
    } catch (error) {
      console.error('Error fetching directions:', error);
      setToast({
        type: 'error',
        message: 'Failed to fetch directions. Please try again later.'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading room details...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return null;
  }

  const images = room.images && room.images.length > 0 ? room.images : [room.image];
  const distance = userLocation
    ? calculateDistance(userLocation.lat, userLocation.lng, room.latitude, room.longitude)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition flex items-center gap-2 text-gray-700 font-semibold"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{room.title}</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
              <div className="relative h-96 bg-gray-200">
                {images.length > 0 && (
                  <img
                    src={images[currentImageIndex]}
                    alt={`${room.title} ${currentImageIndex}`}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Gallery Navigation */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentImageIndex((prev) =>
                          prev === 0 ? images.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-100 p-2 rounded-full shadow-lg transition"
                    >
                      <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    <button
                      onClick={() =>
                        setCurrentImageIndex((prev) =>
                          prev === images.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-100 p-2 rounded-full shadow-lg transition"
                    >
                      <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* Image Counter */}
                    <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {currentImageIndex + 1}/{images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="p-3 bg-gray-50 flex gap-2 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                        idx === currentImageIndex ? 'border-blue-500' : 'border-gray-300'
                      }`}
                    >
                      <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Room</h2>
              <p className="text-gray-700 leading-relaxed text-lg">{room.description}</p>
            </div>

            {/* Facilities */}
            {room.facilities && room.facilities.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Facilities</h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {room.facilities.map((facility, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-800 font-medium">{facility}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Room Info */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Room Information</h2>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Room Type</p>
                  <p className="text-2xl font-bold text-blue-600 capitalize">{room.roomType}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Number of Rooms</p>
                  <p className="text-2xl font-bold text-green-600">{room.numRooms}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Monthly Price</p>
                  <p className="text-2xl font-bold text-purple-600">रु.{room.price}</p>
                </div>
                {distance && (
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Distance from You</p>
                    <p className="text-2xl font-bold text-orange-600">{distance.toFixed(1)} km</p>
                  </div>
                )}
              </div>
            </div>

            {/* Map Preview */}
            {!showMap && (
              <button
                onClick={() => setShowMap(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg transition mb-8"
              >
                🗺️ View on Map
              </button>
            )}

            {showMap && (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
                <div style={{ height: '400px' }}>
                  <MapComponent
                    center={{ lat: room.latitude, lng: room.longitude }}
                    zoom={15}
                    rooms={[room]}
                    userLocation={userLocation}
                    route={route}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            {/* Price Card */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg shadow-lg p-6 mb-6">
              <p className="text-blue-100 text-sm mb-1">Monthly Rent</p>
              <p className="text-5xl font-bold mb-4">रु.{room.price}</p>
              <p className="text-blue-100 text-sm">
                Located at: ({room.latitude.toFixed(4)}, {room.longitude.toFixed(4)})
              </p>
            </div>

            {/* Owner Info */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Owner Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Owner Name</p>
                  <p className="text-lg font-semibold text-gray-900">{room.ownerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contact Number</p>
                  <p className="text-lg font-mono font-semibold text-blue-600">
                    {room.contactNumber}
                  </p>
                </div>
              </div>

              <button
                onClick={handleContact}
                className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Contact Owner
              </button>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6 space-y-3">
              <button
                onClick={handleFindRoute}
                disabled={!userLocation}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition"
              >
                🗺️ Find Route
              </button>

              <button
                onClick={handleOpenDirections}
                disabled={!userLocation}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition"
              >
                🧭 Get Directions (Google Maps)
              </button>

              <button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition"
              >
                ❤️ Add to Favorites
              </button>

              <button
                onClick={() => navigate(-1)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-lg transition"
              >
                Go Back
              </button>
            </div>

            {/* Route Info */}
            {route && (
              <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-200">
                <h4 className="font-bold text-gray-900 mb-3">Route Information</h4>
                <div className="space-y-2 mb-4">
                  <p className="text-sm">
                    <span className="text-gray-600">Distance:</span>{' '}
                    <strong className="text-blue-600">{route.distance.toFixed(1)} km</strong>
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-600">Algorithm:</span>{' '}
                    <strong className="text-blue-600">{route.algorithm}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setRoute(null)}
                  className="w-full px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-semibold transition"
                >
                  Clear Route
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default RoomDetails;
