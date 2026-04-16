// Common utility functions

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'Nepali'
  }).format(amount);
};

// Format distance
export const formatDistance = (distanceKm) => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
};

// Validate email
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate phone number
export const validatePhone = (phone) => {
  const re = /^[0-9]{10,}$/;
  return re.test(phone.replace(/\D/g, ''));
};

// Format date
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Format time
export const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Convert file to base64
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Compress image before upload
export const compressImage = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress and return as base64
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
};

// Generate unique ID
export const generateId = (prefix = 'id') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Sleep function
export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  return text.length > maxLength ? text.substr(0, maxLength) + '...' : text;
};

// Capitalize string
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Convert address to coordinates (simple mock)
export const searchLocation = async (query) => {
  // In a real app, this would call a geocoding API
  // For now, return mock data
  const mockLocations = {
    'new york': { lat: 40.7128, lng: -74.0060, name: 'New York' },
    'los angeles': { lat: 34.0522, lng: -118.2437, name: 'Los Angeles' },
    'chicago': { lat: 41.8781, lng: -87.6298, name: 'Chicago' },
    'houston': { lat: 29.7604, lng: -95.3698, name: 'Houston' },
    'phoenix': { lat: 33.4484, lng: -112.0742, name: 'Phoenix' },
    'philadelphia': { lat: 39.9526, lng: -75.1652, name: 'Philadelphia' },
    'san antonio': { lat: 29.4241, lng: -98.4936, name: 'San Antonio' },
    'san diego': { lat: 32.7157, lng: -117.1611, name: 'San Diego' },
    'dallas': { lat: 32.7767, lng: -96.7970, name: 'Dallas' },
    'san francisco': { lat: 37.7749, lng: -122.4194, name: 'San Francisco' }
  };

  const lowerQuery = query.toLowerCase();
  for (const [key, value] of Object.entries(mockLocations)) {
    if (key.includes(lowerQuery) || lowerQuery.includes(key)) {
      return value;
    }
  }

  // Default to New York if not found
  return { lat: 40.7128, lng: -74.0060, name: query };
};
