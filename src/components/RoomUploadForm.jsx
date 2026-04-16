import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import MapComponent from '../components/MapComponent';
import { Storage } from '../utils/storage';
import { AuthService } from '../utils/auth';
import { fileToBase64 } from '../utils/helpers';
import { getCurrentLocation } from '../utils/geolocation';
import Toast from '../components/Toast';

const RoomUploadForm = ({ onRoomAdded, onCancel }) => {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      description: '',
      price: '',
      roomType: 'single',
      numRooms: 1,
      facilities: [],
      ownerName: AuthService.getCurrentUser()?.name || '',
      contactNumber: AuthService.getCurrentUser()?.phone || ''
    }
  });

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const facilitiesWatch = watch('facilities');
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const newImages = [...images];
    const newPreviews = [...previewImages];

    for (const file of files) {
      if (newImages.length < 5) {
        const base64 = await fileToBase64(file);
        newImages.push(base64);
        newPreviews.push(base64);
      }
    }

    setImages(newImages);
    setPreviewImages(newPreviews);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previewImages.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviewImages(newPreviews);
  };

  const toggleFacility = (facility) => {
    const currentFacilities = facilitiesWatch || [];
    const newFacilities = currentFacilities.includes(facility)
      ? currentFacilities.filter((f) => f !== facility)
      : [...currentFacilities, facility];
    // Note: You would need to update the form value here
  };

  const handleUseCurrentLocation = async () => {
    try {
      const location = await getCurrentLocation();
      setSelectedLocation(location);
      setToast({
        type: 'success',
        message: `Location set to: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
      });
    } catch (error) {
      setToast({
        type: 'error',
        message: 'Error getting location: ' + error.message
      });
    }
  };

  const onSubmit = async (data) => {
    if (!selectedLocation) {
      setToast({ type: 'error', message: 'Please select a location on the map' });
      return;
    }

    if (images.length === 0) {
      setToast({ type: 'error', message: 'Please upload at least one image' });
      return;
    }

    setLoading(true);
    try {
      const user = AuthService.getCurrentUser();
      const room = {
        id: `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...data,
        price: parseInt(data.price),
        numRooms: parseInt(data.numRooms),
        facilities: facilitiesWatch || [],
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        image: images[0],
        images: images,
        ownerId: user.id,
        createdAt: new Date().toISOString()
      };

      await Storage.addRoom(room);
      setToast({ type: 'success', message: 'Room uploaded successfully!' });
      reset();
      setImages([]);
      setPreviewImages([]);
      setSelectedLocation(null);

      if (onRoomAdded) {
        onRoomAdded(room);
      }

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      setToast({ type: 'error', message: 'Error uploading room: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const facilities = ['WiFi', 'Parking', 'Kitchen', 'Water Supply', 'Washing Machine', 'Security'];

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-h-[90vh] overflow-y-auto">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Form Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload New Room</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Title *
              </label>
              <input
                {...register('title', { required: 'Title is required' })}
                className={`w-full px-4 py-2 rounded-lg border-2 focus:outline-none ${
                  errors.title ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="e.g., Cozy 2BHK Apartment"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows="3"
                className={`w-full px-4 py-2 rounded-lg border-2 focus:outline-none ${
                  errors.description ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="Describe your room..."
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
            </div>

            {/* Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Price (USD) *
                </label>
                <input
                  {...register('price', {
                    required: 'Price is required',
                    pattern: { value: /^[0-9]+$/, message: 'Price must be a number' }
                  })}
                  type="number"
                  className={`w-full px-4 py-2 rounded-lg border-2 focus:outline-none ${
                    errors.price ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="500"
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
              </div>

              {/* Room Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Type *
                </label>
                <select
                  {...register('roomType')}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:outline-none"
                >
                  <option value="single">Single Room</option>
                  <option value="flat">Flat</option>
                  <option value="apartment">Apartment</option>
                </select>
              </div>
            </div>

            {/* Number of Rooms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Rooms *
              </label>
              <input
                {...register('numRooms')}
                type="number"
                min="1"
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:outline-none"
              />
            </div>

            {/* Facilities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Facilities
              </label>
              <div className="grid grid-cols-2 gap-3">
                {facilities.map((facility) => (
                  <label key={facility} className="flex items-center">
                    <input
                      type="checkbox"
                      value={facility}
                      checked={facilitiesWatch?.includes(facility) || false}
                      {...register('facilities')}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                    <span className="ml-2 text-gray-700">{facility}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Owner Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Owner Name *
              </label>
              <input
                {...register('ownerName', { required: 'Name is required' })}
                className={`w-full px-4 py-2 rounded-lg border-2 focus:outline-none ${
                  errors.ownerName ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.ownerName && <p className="text-red-500 text-sm mt-1">{errors.ownerName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number *
              </label>
              <input
                {...register('contactNumber', { required: 'Contact is required' })}
                className={`w-full px-4 py-2 rounded-lg border-2 focus:outline-none ${
                  errors.contactNumber ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.contactNumber && <p className="text-red-500 text-sm mt-1">{errors.contactNumber.message}</p>}
            </div>

            {/* Images Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images (up to 5) *
              </label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-50 transition text-blue-600 font-medium"
              >
                + Click to upload images
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
              >
                {loading ? 'Uploading...' : 'Upload Room'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Map Section */}
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Select Location on Map *
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Click on the map to select the GPS location for your room.
            </p>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition mb-4"
            >
              📍 Use My Current Location
            </button>
          </div>

          <div className="bg-gray-100 rounded-lg overflow-hidden" style={{ height: '400px' }}>
            <MapComponent
              onMapClick={setSelectedLocation}
              rooms={[]}
            />
          </div>

          {selectedLocation && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-semibold">
                ✓ Location selected
              </p>
              <p className="text-sm text-green-700 mt-1">
                Lat: {selectedLocation.lat.toFixed(4)}, Lng: {selectedLocation.lng.toFixed(4)}
              </p>
            </div>
          )}

          {/* Image Previews */}
          {previewImages.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3">
                Preview ({previewImages.length}/5)
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {previewImages.map((img, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={img}
                      alt={`Preview ${idx}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default RoomUploadForm;
