import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../utils/auth';
import RoomUploadForm from '../components/RoomUploadForm';
import Toast from '../components/Toast';
import api from '../utils/api';

const OwnerPanel = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchUserAndRooms = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser();
        if (!currentUser) {
          navigate('/login');
          return;
        }
        setUser(currentUser);
        const roomsResponse = await api.get(`/shelters/owner/${currentUser.id}`);
        setRooms(roomsResponse.data || []);
      } catch (error) {
        setToast({ type: 'error', message: 'Error loading rooms' });
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndRooms();
  }, [navigate]);

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;

    try {
      await api.delete(`/shelters/${roomId}`);
      setRooms(rooms.filter((r) => r.id !== roomId));
      setToast({ type: 'success', message: 'Room deleted successfully' });
    } catch (error) {
      setToast({ type: 'error', message: 'Error deleting room' });
    }
  };

  const handleLogout = async () => {
    await AuthService.logout();
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Owner Dashboard</h1>
              <p className="text-gray-600">Manage your rooms</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Show Upload Form or Room List */}
        {showUploadForm ? (
          <RoomUploadForm
            onRoomAdded={() => {
              setShowUploadForm(false);
              loadRooms();
            }}
            onCancel={() => setShowUploadForm(false)}
          />
        ) : (
          <>
            {/* Upload Button */}
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">My Rooms</h2>
                <p className="text-gray-600">You have {rooms.length} room(s) listed</p>
              </div>
              <button
                onClick={() => setShowUploadForm(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Upload New Room
              </button>
            </div>

            {/* Rooms Grid */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : rooms.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No rooms yet</h3>
                <p className="text-gray-600 mb-6">Start by uploading your first room</p>
                <button
                  onClick={() => setShowUploadForm(true)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                >
                  Upload Room
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                  <div key={room.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                    {/* Image */}
                    <div className="relative h-48 bg-gray-200 overflow-hidden">
                      {room.image && (
                        <img
                          src={room.image}
                          alt={room.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        ${room.price}/mo
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{room.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{room.description}</p>

                      {/* Info */}
                      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.5 1.5H5.75A4.25 4.25 0 001.5 5.75v8.5A4.25 4.25 0 005.75 18.5h8.5a4.25 4.25 0 004.25-4.25v-8.5A4.25 4.25 0 0014.25 1.5h-3.75" />
                          </svg>
                          {room.numRooms} Room{room.numRooms > 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          {room.roomType}
                        </div>
                      </div>

                      {/* Facilities */}
                      {room.facilities && room.facilities.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {room.facilities.slice(0, 3).map((facility, idx) => (
                              <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {facility}
                              </span>
                            ))}
                            {room.facilities.length > 3 && (
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                +{room.facilities.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-4 border-t">
                        <button
                          onClick={() => handleDeleteRoom(room.id)}
                          className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition text-sm font-semibold"
                        >
                          Delete
                        </button>
                        <button
                          className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition text-sm font-semibold"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default OwnerPanel;
