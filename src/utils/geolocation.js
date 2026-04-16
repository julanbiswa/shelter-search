// Geolocation and Distance utilities

// Haversine Distance Formula - Calculate distance between two coordinates
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

// Get user's current location
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        reject(new Error('Unable to get location: ' + error.message));
      }
    );
  });
};

// Watch user's location (for real-time tracking)
export const watchLocation = (callback, errorCallback) => {
  if (!navigator.geolocation) {
    errorCallback(new Error('Geolocation is not supported'));
    return null;
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      callback({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    },
    (error) => {
      errorCallback(new Error('Error watching location: ' + error.message));
    }
  );

  return watchId;
};

// Stop watching location
export const stopWatchingLocation = (watchId) => {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
  }
};

// Find nearest rooms
export const findNearestRooms = (userLocation, rooms, limit = 5) => {
  if (!rooms || rooms.length === 0) return [];

  const roomsWithDistance = rooms.map((room) => ({
    ...room,
    distance: calculateDistance(
      userLocation.lat,
      userLocation.lng,
      room.latitude,
      room.longitude
    )
  }));

  return roomsWithDistance
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
};

// Calculate recommendation score
export const calculateRecommendationScore = (room, userLocation, priceRange = { min: 0, max: 100000 }) => {
  const distance = calculateDistance(
    userLocation.lat,
    userLocation.lng,
    room.latitude,
    room.longitude
  );

  // Distance score (closer is better) - 0 to 40 points
  const maxDistance = 50; // km
  const distanceScore = Math.max(0, 40 - (distance / maxDistance) * 40);

  // Price score (better value) - 0 to 30 points
  const avgPrice = (priceRange.max + priceRange.min) / 2;
  const priceDiff = Math.abs(room.price - avgPrice);
  const priceRange_ = priceRange.max - priceRange.min;
  const priceScore = Math.max(0, 30 - (priceDiff / priceRange_) * 30);

  // Facilities score - 0 to 30 points
  const facilitiesCount = room.facilities ? room.facilities.length : 0;
  const facilitiesScore = Math.min(30, (facilitiesCount / 10) * 30);

  const totalScore = distanceScore + priceScore + facilitiesScore;

  return {
    score: Math.round(totalScore * 100) / 100,
    distanceScore,
    priceScore,
    facilitiesScore,
    distance
  };
};

// Get recommended rooms
export const getRecommendedRooms = (userLocation, rooms, limit = 5, priceRange) => {
  if (!rooms || rooms.length === 0) return [];

  const roomsWithScores = rooms.map((room) => ({
    ...room,
    recommendation: calculateRecommendationScore(room, userLocation, priceRange)
  }));

  return roomsWithScores
    .sort((a, b) => b.recommendation.score - a.recommendation.score)
    .slice(0, limit);
};

// Filter rooms by proximity and price
export const filterRoomsByProximity = (rooms, userLocation, maxDistance = 10, maxPrice = null) => {
  return rooms.filter((room) => {
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      room.latitude,
      room.longitude
    );
    let isValid = distance <= maxDistance;
    if (maxPrice) {
      isValid = isValid && room.price <= maxPrice;
    }
    return isValid;
  });
};
