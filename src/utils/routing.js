// Route Finding Algorithms

class Node {
  constructor(lat, lng) {
    this.lat = lat;
    this.lng = lng;
    this.neighbors = [];
  }

  addNeighbor(node, distance) {
    this.neighbors.push({ node, distance });
  }

  getKey() {
    return `${this.lat.toFixed(4)},${this.lng.toFixed(4)}`;
  }
}

// Calculate distance between two points
const distance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Heuristic function for A* algorithm (straight-line distance)
const heuristic = (lat1, lng1, lat2, lng2) => {
  return distance(lat1, lng1, lat2, lng2);
};

// Dijkstra's Algorithm for shortest path
export const dijkstraRoute = (start, end, waypoints = []) => {
  const points = [start, ...waypoints, end];
  const distances = {};
  const previous = {};
  const unvisited = new Set();

  // Initialize
  points.forEach((point) => {
    const key = `${point.lat.toFixed(4)},${point.lng.toFixed(4)}`;
    distances[key] = Infinity;
    previous[key] = null;
    unvisited.add(key);
  });

  const startKey = `${start.lat.toFixed(4)},${start.lng.toFixed(4)}`;
  distances[startKey] = 0;

  while (unvisited.size > 0) {
    let minKey = null;
    let minDistance = Infinity;

    // Find unvisited node with minimum distance
    unvisited.forEach((key) => {
      if (distances[key] < minDistance) {
        minDistance = distances[key];
        minKey = key;
      }
    });

    if (minKey === null || distances[minKey] === Infinity) {
      break;
    }

    unvisited.delete(minKey);
    const [lat1, lng1] = minKey.split(',').map(parseFloat);

    // Check all other unvisited nodes
    unvisited.forEach((key) => {
      const [lat2, lng2] = key.split(',').map(parseFloat);
      const dist = distance(lat1, lng1, lat2, lng2);
      const newDistance = distances[minKey] + dist;

      if (newDistance < distances[key]) {
        distances[key] = newDistance;
        previous[key] = minKey;
      }
    });
  }

  // Reconstruct path
  const endKey = `${end.lat.toFixed(4)},${end.lng.toFixed(4)}`;
  const path = [];
  let currentKey = endKey;

  while (currentKey !== null) {
    const [lat, lng] = currentKey.split(',').map(parseFloat);
    path.unshift({ lat, lng });
    currentKey = previous[currentKey];
  }

  return {
    path,
    distance: distances[endKey],
    algorithm: 'Dijkstra'
  };
};

// A* Algorithm for shortest path
export const aStarRoute = (start, end, waypoints = []) => {
  const openSet = [start];
  const cameFrom = new Map();
  const gScore = new Map();
  const fScore = new Map();

  const getKey = (point) => `${point.lat.toFixed(4)},${point.lng.toFixed(4)}`;

  const startKey = getKey(start);
  const endKey = getKey(end);

  gScore.set(startKey, 0);
  fScore.set(startKey, heuristic(start.lat, start.lng, end.lat, end.lng));

  const points = [start, ...waypoints, end];

  while (openSet.length > 0) {
    // Find node with lowest fScore
    let current = openSet[0];
    let currentIndex = 0;
    let minFScore = fScore.get(getKey(openSet[0]));

    for (let i = 1; i < openSet.length; i++) {
      const currentF = fScore.get(getKey(openSet[i]));
      if (currentF < minFScore) {
        minFScore = currentF;
        current = openSet[i];
        currentIndex = i;
      }
    }

    const currentKey = getKey(current);

    if (currentKey === endKey) {
      // Reconstruct path
      const path = [current];
      let temp = current;

      while (cameFrom.has(getKey(temp))) {
        temp = cameFrom.get(getKey(temp));
        path.unshift(temp);
      }

      return {
        path,
        distance: gScore.get(endKey),
        algorithm: 'A*'
      };
    }

    openSet.splice(currentIndex, 1);

    // Check neighbors
    points.forEach((neighbor) => {
      if (
        neighbor.lat === current.lat &&
        neighbor.lng === current.lng
      ) {
        return;
      }

      const neighborKey = getKey(neighbor);
      const tentativeGScore =
        gScore.get(currentKey) +
        distance(
          current.lat,
          current.lng,
          neighbor.lat,
          neighbor.lng
        );

      if (!gScore.has(neighborKey) || tentativeGScore < gScore.get(neighborKey)) {
        cameFrom.set(neighborKey, current);
        gScore.set(neighborKey, tentativeGScore);
        fScore.set(
          neighborKey,
          tentativeGScore +
            heuristic(neighbor.lat, neighbor.lng, end.lat, end.lng)
        );

        if (!openSet.some((p) => getKey(p) === neighborKey)) {
          openSet.push(neighbor);
        }
      }
    });
  }

  // No path found, return straight line
  return {
    path: [start, end],
    distance: distance(start.lat, start.lng, end.lat, end.lng),
    algorithm: 'A* (direct path)'
  };
};

// Simple route between two points with waypoints
export const findRoute = (start, end, waypoints = [], algorithm = 'astar') => {
  if (algorithm === 'dijkstra') {
    return dijkstraRoute(start, end, waypoints);
  } else {
    return aStarRoute(start, end, waypoints);
  }
};

// Generate route coordinates for display on map
export const generateRouteCoordinates = (start, end, numPoints = 20) => {
  const coordinates = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const lat = start.lat + (end.lat - start.lat) * t;
    const lng = start.lng + (end.lng - start.lng) * t;
    coordinates.push([lat, lng]);
  }
  return coordinates;
};
