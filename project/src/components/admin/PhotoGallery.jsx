import { useState, useEffect } from 'react';
import { 
  Camera, 
  Plus, 
  Edit, 
  Trash2, 
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { uploadToCloudinary } from '../../config/cloudinary';
import toast from 'react-hot-toast';

export default function PhotoGallery() {
  const [albums, setAlbums] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [filteredPhotos, setFilteredPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddAlbumModal, setShowAddAlbumModal] = useState(false);
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);

  const [albumFormData, setAlbumFormData] = useState({
    name: '',
    description: '',
    category: '',
    coverImage: ''
  });

  const [photoFormData, setPhotoFormData] = useState({
    title: '',
    description: '',
    albumId: '',
    imageUrl: '',
    tags: []
  });

  const categories = [
    { value: 'academic', label: '📚 Academic Events', emoji: '📚' },
    { value: 'sports', label: '🏆 Sports & Competitions', emoji: '🏆' },
    { value: 'cultural', label: '🎨 Cultural Events', emoji: '🎨' },
    { value: 'workshops', label: '🧑‍🏫 Workshops & Training', emoji: '🧑‍🏫' },
    { value: 'campus', label: '🌿 Campus & Environment', emoji: '🌿' },
    { value: 'graduation', label: '🎓 Graduation Day', emoji: '🎓' },
    { value: 'annual', label: '🎭 Annual Function', emoji: '🎭' },
    { value: 'other', label: '📷 Other Events', emoji: '📷' }
  ];

  useEffect(() => {
    fetchAlbums();
    fetchPhotos();
  }, []);

  useEffect(() => {
    filterPhotos();
  }, [photos, selectedAlbum]);

  const fetchAlbums = async () => {
    try {
      const albumsRef = collection(db, 'albums');
      const q = query(albumsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const albumData = [];
      snapshot.forEach((doc) => {
        albumData.push({ id: doc.id, ...doc.data() });
      });
      
      setAlbums(albumData);
    } catch (error) {
      console.error('Error fetching albums:', error);
      toast.error('Failed to fetch albums');
    }
  };

  const fetchPhotos = async () => {
    try {
      const photosRef = collection(db, 'photos');
      const q = query(photosRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const photoData = [];
      snapshot.forEach((doc) => {
        photoData.push({ id: doc.id, ...doc.data() });
      });
      
      setPhotos(photoData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast.error('Failed to fetch photos');
      setLoading(false);
    }
  };

  const filterPhotos = () => {
    if (selectedAlbum === 'all') {
      setFilteredPhotos(photos);
    } else {
      setFilteredPhotos(photos.filter(photo => photo.albumId === selectedAlbum));
    }
  };

  const handleAlbumInputChange = (e) => {
    const { name, value } = e.target;
    setAlbumFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoInputChange = (e) => {
    const { name, value } = e.target;
    setPhotoFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await uploadToCloudinary(file);
      
      if (type === 'album') {
        setAlbumFormData(prev => ({
          ...prev,
          coverImage: imageUrl
        }));
      } else {
        setPhotoFormData(prev => ({
          ...prev,
          imageUrl: imageUrl
        }));
      }
      
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleAlbumSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const albumData = {
        ...albumFormData,
        updatedAt: new Date()
      };

      if (editingAlbum) {
        await updateDoc(doc(db, 'albums', editingAlbum.id), albumData);
        toast.success('Album updated successfully');
      } else {
        await addDoc(collection(db, 'albums'), {
          ...albumData,
          createdAt: new Date(),
          photoCount: 0
        });
        toast.success('Album created successfully');
      }
      
      resetAlbumForm();
      fetchAlbums();
    } catch (error) {
      console.error('Error saving album:', error);
      toast.error('Failed to save album');
    }
  };

  const handlePhotoSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await addDoc(collection(db, 'photos'), {
        ...photoFormData,
        createdAt: new Date()
      });
      
      // Update album photo count
      const album = albums.find(a => a.id === photoFormData.albumId);
      if (album) {
        await updateDoc(doc(db, 'albums', album.id), {
          photoCount: (album.photoCount || 0) + 1,
          updatedAt: new Date()
        });
      }
      
      toast.success('Photo added successfully');
      resetPhotoForm();
      fetchPhotos();
      fetchAlbums();
    } catch (error) {
      console.error('Error saving photo:', error);
      toast.error('Failed to save photo');
    }
  };

  const handleEditAlbum = (album) => {
    setEditingAlbum(album);
    setAlbumFormData(album);
    setShowAddAlbumModal(true);
  };

  const handleDeleteAlbum = async (albumId) => {
    if (!window.confirm('Are you sure you want to delete this album? All photos in this album will also be deleted.')) return;
    
    try {
      // Delete all photos in the album
      const albumPhotos = photos.filter(photo => photo.albumId === albumId);
      for (const photo of albumPhotos) {
        await deleteDoc(doc(db, 'photos', photo.id));
      }
      
      // Delete the album
      await deleteDoc(doc(db, 'albums', albumId));
      
      toast.success('Album deleted successfully');
      fetchAlbums();
      fetchPhotos();
    } catch (error) {
      console.error('Error deleting album:', error);
      toast.error('Failed to delete album');
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;
    
    try {
      const photo = photos.find(p => p.id === photoId);
      await deleteDoc(doc(db, 'photos', photoId));
      
      // Update album photo count
      if (photo && photo.albumId) {
        const album = albums.find(a => a.id === photo.albumId);
        if (album && album.photoCount > 0) {
          await updateDoc(doc(db, 'albums', album.id), {
            photoCount: album.photoCount - 1,
            updatedAt: new Date()
          });
        }
      }
      
      toast.success('Photo deleted successfully');
      fetchPhotos();
      fetchAlbums();
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Failed to delete photo');
    }
  };

  const resetAlbumForm = () => {
    setAlbumFormData({
      name: '',
      description: '',
      category: '',
      coverImage: ''
    });
    setEditingAlbum(null);
    setShowAddAlbumModal(false);
  };

  const resetPhotoForm = () => {
    setPhotoFormData({
      title: '',
      description: '',
      albumId: '',
      imageUrl: '',
      tags: []
    });
    setShowAddPhotoModal(false);
  };

  const openImageModal = (photo) => {
    setSelectedImage(photo);
    setShowImageModal(true);
  };

  const getCategoryConfig = (category) => {
    return categories.find(c => c.value === category) || categories[categories.length - 1];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Photo Gallery</h1>
            <p className="text-gray-600 mt-2">Manage school photos and albums</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowAddAlbumModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Album</span>
            </button>
            <button
              onClick={() => setShowAddPhotoModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Camera className="h-4 w-4" />
              <span>Add Photo</span>
            </button>
          </div>
        </div>

        {/* Albums Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Albums</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {albums.map((album) => {
              const categoryConfig = getCategoryConfig(album.category);
              return (
                <div key={album.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    <img
                      src={album.coverImage || 'https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?auto=compress&cs=tinysrgb&w=400'}
                      alt={album.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="bg-white bg-opacity-90 px-2 py-1 rounded-full text-sm">
                        {categoryConfig.emoji}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <button
                        onClick={() => handleEditAlbum(album)}
                        className="bg-white bg-opacity-90 p-1 rounded-full hover:bg-opacity-100 transition-all"
                      >
                        <Edit className="h-4 w-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteAlbum(album.id)}
                        className="bg-white bg-opacity-90 p-1 rounded-full hover:bg-opacity-100 transition-all"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{album.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{album.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {album.photoCount || 0} photos
                      </span>
                      <button
                        onClick={() => setSelectedAlbum(album.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Photos
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Photos Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Photos</h2>
            <div className="flex items-center space-x-4">
              <select
                value={selectedAlbum}
                onChange={(e) => setSelectedAlbum(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Albums</option>
                {albums.map(album => (
                  <option key={album.id} value={album.id}>{album.name}</option>
                ))}
              </select>
              <span className="text-sm text-gray-600">
                {filteredPhotos.length} photos
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredPhotos.map((photo) => (
              <div key={photo.id} className="relative group">
                <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => openImageModal(photo)}
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                    <button
                      onClick={() => openImageModal(photo)}
                      className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {photo.title && (
                  <p className="mt-2 text-sm text-gray-600 truncate">{photo.title}</p>
                )}
              </div>
            ))}
          </div>

          {filteredPhotos.length === 0 && (
            <div className="text-center py-12">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No photos found</h3>
              <p className="text-gray-600">Add some photos to get started.</p>
            </div>
          )}
        </div>

        {/* Add Album Modal */}
        {showAddAlbumModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {editingAlbum ? 'Edit Album' : 'Create New Album'}
                </h2>
                
                <form onSubmit={handleAlbumSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Album Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={albumFormData.name}
                      onChange={handleAlbumInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={albumFormData.description}
                      onChange={handleAlbumInputChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={albumFormData.category}
                      onChange={handleAlbumInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Image
                    </label>
                    <div className="flex items-center space-x-4">
                      {albumFormData.coverImage && (
                        <img
                          src={albumFormData.coverImage}
                          alt="Cover"
                          className="h-20 w-20 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'album')}
                          className="hidden"
                          id="album-cover-upload"
                        />
                        <label
                          htmlFor="album-cover-upload"
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center space-x-2"
                        >
                          <Upload className="h-4 w-4" />
                          <span>{uploading ? 'Uploading...' : 'Upload Cover'}</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={resetAlbumForm}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editingAlbum ? 'Update Album' : 'Create Album'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add Photo Modal */}
        {showAddPhotoModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Photo</h2>
                
                <form onSubmit={handlePhotoSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Photo *
                    </label>
                    <div className="flex items-center space-x-4">
                      {photoFormData.imageUrl && (
                        <img
                          src={photoFormData.imageUrl}
                          alt="Preview"
                          className="h-32 w-32 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'photo')}
                          className="hidden"
                          id="photo-upload"
                        />
                        <label
                          htmlFor="photo-upload"
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center space-x-2"
                        >
                          <Upload className="h-4 w-4" />
                          <span>{uploading ? 'Uploading...' : 'Upload Photo'}</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Album *
                    </label>
                    <select
                      name="albumId"
                      value={photoFormData.albumId}
                      onChange={handlePhotoInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Album</option>
                      {albums.map(album => (
                        <option key={album.id} value={album.id}>{album.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={photoFormData.title}
                      onChange={handlePhotoInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={photoFormData.description}
                      onChange={handlePhotoInputChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={resetPhotoForm}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!photoFormData.imageUrl || !photoFormData.albumId}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add Photo
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Image Modal */}
        {showImageModal && selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-4xl max-h-full">
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
              >
                <X className="h-8 w-8" />
              </button>
              
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.title}
                className="max-w-full max-h-full object-contain"
              />
              
              {selectedImage.title && (
                <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">{selectedImage.title}</h3>
                  {selectedImage.description && (
                    <p className="text-sm opacity-90">{selectedImage.description}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}