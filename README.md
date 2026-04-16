# Shelter Search - Rental Room Finding Web Application

A modern, fully-functional React-based web application that helps tenants find rental rooms and allows owners to upload properties with GPS locations. All data is stored locally in the browser using IndexedDB.

## Features

### 🏠 Owner Mode
- **Upload Rooms**: Add new rental properties with detailed information
- **Room Details**: Set title, description, price, type, number of rooms
- **Facilities**: Add amenities like WiFi, parking, kitchen, water supply, etc.
- **Image Upload**: Upload up to 5 images per room
- **GPS Location**: Select room location directly on interactive map
- **Room Management**: View, edit, and delete your listings

### 🔍 Tenant Mode
- **Interactive Map**: Full-screen Leaflet map with room markers
- **Room Discovery**: Click markers to see room details
- **Search & Filter**: Search by title, description, or filter by price
- **Nearest Rooms**: Automatically find rooms closest to your location
- **Smart Recommendations**: AI-based room scoring using distance, price, and facilities
- **Route Finding**: Get directions using Dijkstra or A* algorithms
- **Real-time Location**: Detect and track your current location on map
- **Detailed View**: View complete room information with image gallery

### 🔐 Authentication
- **User Registration**: Secure signup with email, phone, and password
- **Password Hashing**: SHA256 encryption for password security
- **Session Management**: Persistent login using LocalStorage
- **Form Validation**: Client-side validation using React Hook Form

### 🗺️ Advanced Features
- **Haversine Distance Calculation**: Accurate distance computation between coordinates
- **Multi-algorithm Route Finding**: Choose between Dijkstra and A* pathfinding
- **Room Recommendation System**: Score rooms based on distance, price, and facilities
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Local Data Storage**: IndexedDB and LocalStorage - no server required

## Tech Stack

**Frontend:**
- React 18.2 - UI library
- Vite 5.0 - Build tool
- React Router 6 - Client-side routing
- React Hook Form 7.48 - Form management & validation
- Tailwind CSS 3.3 - Utility-first CSS framework
- Leaflet 1.9.4 - Interactive map library
- CryptoJS 4.2 - Password hashing

**Storage:**
- IndexedDB - NoSQL client-side database
- LocalStorage - Key-value session storage

**Algorithms:**
- Haversine Formula - Distance between coordinates
- Dijkstra's Algorithm - Shortest path finding
- A* Algorithm - Optimized pathfinding with heuristics

## Installation

### Prerequisites
- Node.js 16+ 
- npm 8+

### Steps

1. **Clone or extract the project**
```bash
cd ShelterSearch
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

The application will open automatically at `http://localhost:3000`

### Build for production
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Project Structure

```
ShelterSearch/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── MapComponent.jsx        # Leaflet map wrapper
│   │   ├── ProtectedRoute.jsx      # Route protection HOC
│   │   ├── RoomUploadForm.jsx      # Room creation form
│   │   └── Toast.jsx              # Notification component
│   ├── pages/              # Page components
│   │   ├── LoginPage.jsx          # User login
│   │   ├── SignupPage.jsx         # User registration
│   │   ├── Dashboard.jsx          # Mode selection
│   │   ├── OwnerPanel.jsx         # Owner room management
│   │   ├── TenantMapView.jsx      # Main map interface
│   │   └── RoomDetails.jsx        # Detailed room view
│   ├── utils/              # Utility functions
│   │   ├── storage.js             # IndexedDB operations
│   │   ├── auth.js                # Authentication logic
│   │   ├── geolocation.js         # Location & distance utils
│   │   ├── routing.js             # Pathfinding algorithms
│   │   └── helpers.js             # Common utilities
│   ├── App.jsx             # Main app component with routing
│   ├── index.css           # Global styles
│   └── main.jsx            # React entry point
├── index.html              # HTML template
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS config
├── postcss.config.js       # PostCSS configuration
└── package.json            # Dependencies
```

## Usage Guide

### First Time Setup

1. **Create Account**
   - Click "Create one" on login page
   - Fill in name, email, phone, and password
   - Account is automatically saved to IndexedDB

2. **Choose Your Role**
   - After login, select Owner or Tenant mode on dashboard

### Owner Mode Workflow

1. **Navigate to Owner Mode**
   - Click "Enter Owner Mode" on dashboard

2. **Upload a Room**
   - Click "Upload New Room" button
   - Fill in room details (title, description, price, etc.)
   - Select facilities (WiFi, parking, etc.)
   - Click on map to set GPS location
   - Upload 1-5 room images
   - Click "Upload Room"

3. **Manage Rooms**
   - View all your uploaded rooms
   - Delete rooms from your listing
   - Click "Edit" to modify (coming soon)

### Tenant Mode Workflow

1. **Navigate to Tenant Mode**
   - Click "Enter Tenant Mode" on dashboard

2. **Browse Rooms**
   - Map loads with all available rooms as markers
   - Search rooms by title or description
   - Filter by maximum price
   - View recommended and nearest rooms in sidebar

3. **View Room Details**
   - Click room marker or room name in list
   - View all room images in gallery
   - Check facilities and specifications
   - See distance from your location

4. **Find Routes**
   - Click "Find Route" to calculate directions
   - Route displays on map using A* algorithm
   - View distance and route information

5. **Get Recommendations**
   - System automatically scores rooms based on:
     - Distance from your location
     - Monthly price
     - Available facilities
   - Top recommendations shown in sidebar

## Data Structure

### User Object
```javascript
{
  id: "user_1699564845123_abc123",
  name: "John Doe",
  email: "john@example.com",
  phone: "1234567890",
  password: "hashed_sha256",
  createdAt: "2024-01-15T10:30:00Z"
}
```

### Room Object
```javascript
{
  id: "room_1699564845123_xyz789",
  title: "Cozy 2BHK Apartment",
  description: "Spacious apartment near city center...",
  price: 1200,
  roomType: "apartment",
  numRooms: 2,
  facilities: ["WiFi", "Parking", "Kitchen"],
  latitude: 40.7128,
  longitude: -74.0060,
  image: "base64_encoded_primary_image",
  images: ["base64_1", "base64_2", ...],
  ownerId: "user_1699564845123_abc123",
  ownerName: "John Doe",
  contactNumber: "9876543210",
  createdAt: "2024-01-15T10:30:00Z"
}
```

## Key Algorithms

### Haversine Distance Formula
Calculates accurate distance between two geographic points:
```
a = sin²(Δφ/2) + cos(φ1) * cos(φ2) * sin²(Δλ/2)
distance = 2 * R * atan2(√a, √(1−a))
where R = Earth's radius (6371 km)
```

### A* Pathfinding
Efficient route finding with heuristic guidance:
- Uses f-score = g-score + heuristic
- Heuristic = straight-line distance to destination
- Optimal for real-world routing

### Room Recommendation Scoring
```
Score = (40 * Distance) + (30 * Price) + (30 * Facilities)
- Distance: 0-40 points (closer is better)
- Price: 0-30 points (better value)
- Facilities: 0-30 points (more amenities)
Total: 0-100 scale
```

## Features Breakdown

### Authentication System
- ✅ User registration with validation
- ✅ Secure password hashing (SHA256)
- ✅ Session persistence using LocalStorage
- ✅ Protected routes for logged-in users only
- ✅ Logout functionality

### Room Management
- ✅ Create new room listings
- ✅ Upload multiple images (base64 encoded)
- ✅ Set GPS coordinates via map interface
- ✅ Manage facilities and amenities
- ✅ Delete room listings
- ✅ View all owner's rooms

### Search & Discovery
- ✅ Full-screen interactive map
- ✅ Text search in room titles/descriptions
- ✅ Price range filtering
- ✅ Nearest rooms detection
- ✅ Smart room recommendations
-✅ Real-time room markers

### Routing & Navigation
- ✅ Automatic location detection
- ✅ Route finding algorithms (Dijkstra & A*)
- ✅ Distance calculation (Haversine)
- ✅ Route display on map
- ✅ Turn-by-turn directions

### UI/UX
- ✅ Clean, modern design with Tailwind CSS
- ✅ Responsive layout (mobile, tablet, desktop)
- ✅ Toast notifications
- ✅ Loading states
- ✅ Image gallery with navigation
- ✅ Real-time form validation

## Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

**Requirements:**
- IndexedDB support
- Geolocation API access
- ES6+ JavaScript support

## Limitations & Known Issues

1. **Image Storage**: Large images increase browser storage usage (limit to 5MB per image)
2. **Geolocation**: Requires browser permission and network access
3. **Offline Mode**: Map tiles require internet; rooms data cached locally
4. **Browser Storage**: IndexedDB limit ~50MB per domain (varies by browser)

## Performance Tips

1. **Optimize Images**: Compress images before uploading
2. **Clear Cache**: Browser DevTools > Application > Clear site data
3. **Performance**: Use latest browser version for best performance

## Troubleshooting

### "Geolocation permission denied"
- Allow location access in browser settings
- Check if browser supports Geolocation API

### "Map not loading"
- Ensure internet connection for OSM tiles
- Try refreshing the page
- Check browser console for errors

### "Can't upload room"
- Verify location selected on map
- Ensure at least one image uploaded
- Check form validation errors

### "Rooms not appearing"
- Verify rooms were uploaded in Owner mode
- Check IndexedDB in DevTools
- Refresh browser

## API Reference (Optional - for future backend integration)

When ready to add backend support, these endpoints would be:

```
POST   /api/auth/signup      - Register user
POST   /api/auth/login       - Login user
POST   /api/rooms            - Create room
GET    /api/rooms            - Get all rooms
GET    /api/rooms/:id        - Get room details
PUT    /api/rooms/:id        - Update room
DELETE /api/rooms/:id        - Delete room
GET    /api/rooms/nearby     - Get nearby rooms
POST   /api/favorites        - Add favorite
DELETE /api/favorites/:id    - Remove favorite
```

## Future Enhancements

- [ ] Backend API integration (Node.js/Express)
- [ ] Real database (MongoDB/PostgreSQL)
- [ ] User profiles and preferences
- [ ] Room reviews and ratings
- [ ] Favorites/bookmarks system
- [ ] Advanced filtering options
- [ ] Real-time notifications
- [ ] Payment integration
- [ ] Room booking system
- [ ] Admin dashboard
- [ ] Analytics and reporting

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Fix security vulnerabilities
npm audit fix --force
```

## License

This project is provided as-is for educational and personal use.

## Support

For issues, suggestions, or improvements:
1. Check the troubleshooting section
2. Review the console for error messages
3. Verify all form inputs are correct
4. Try clearing browser cache and data

## Version History

**v1.0.0** - Initial Release
- Complete auth system
- Owner room management
- Tenant map interface
- Route finding algorithms
- Smart recommendations
- Local data storage

---

Built with ❤️ using React, Vite, and Leaflet
