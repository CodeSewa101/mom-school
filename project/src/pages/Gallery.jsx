import { useState, useEffect } from 'react';
import { 
  Camera, 
  Filter,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy,
  where 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export default function Gallery() {
  const [albums, setAlbums] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [filteredPhotos, setFilteredPhotos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAlbum, setSelectedAlbum] = useState('all');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const categories = [
    { value: 'all', label: '📷 All Events', emoji: '📷' },
    { value: 'academic', label: '📚 Academic Events', emoji: '📚' },
    { value: 'sports', label: '🏆 Sports & Competitions', emoji: '🏆' },
    { value: 'cultural', label: '🎨 Cultural Events', emoji: '🎨' },
    { value: 'workshops', label: '🧑‍🏫 Workshops & Training', emoji: '🧑‍🏫' },
    { value: 'campus', label: '🌿 Campus & Environment', emoji: '🌿' },
    { value: 'graduation', label: '🎓 Graduation Day', emoji: '🎓' },
    { value: 'annual', label: '🎭 Annual Function', emoji: '🎭' }
  ];

  useEffect(() => {
    fetchAlbums();
    fetchPhotos();
  }, []);

  useEffect(() => {
    filterPhotos();
  }, [photos, selectedCategory, selectedAlbum]);

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
      setLoading(false);
    }
  };

  const filterPhotos = () => {
    let filtered = photos;

    // Filter by album
    if (selectedAlbum !== 'all') {
      filtered = filtered.filter(photo => photo.albumId === selectedAlbum);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      const categoryAlbums = albums.filter(album => album.category === selectedCategory);
      const categoryAlbumIds = categoryAlbums.map(album => album.id);
      filtered = filtered.filter(photo => categoryAlbumIds.includes(photo.albumId));
    }

    setFilteredPhotos(filtered);
  };

  const openImageModal = (photo, index) => {
    setSelectedImage(photo);
    setCurrentImageIndex(index);
    setShowImageModal(true);
  };

  const navigateImage = (direction) => {
    const newIndex = direction === 'next' 
      ? (currentImageIndex + 1) % filteredPhotos.length
      : (currentImageIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    
    setCurrentImageIndex(newIndex);
    setSelectedImage(filteredPhotos[newIndex]);
  };

  const getCategoryConfig = (category) => {
    return categories.find(c => c.value === category) || categories[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Photo Gallery</h1>
            <p className="text-xl md:text-2xl opacity-90">Capturing memories and moments</p>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Photo Gallery</h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
            Explore our collection of memorable moments, achievements, and celebrations
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* Album Filter */}
            <div className="flex items-center space-x-4">
              <select
                value={selectedAlbum}
                onChange={(e) => setSelectedAlbum(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Albums</option>
                {albums
                  .filter(album => selectedCategory === 'all' || album.category === selectedCategory)
                  .map(album => (
                    <option key={album.id} value={album.id}>{album.name}</option>
                  ))}
              </select>
              
              <span className="text-sm text-gray-600">
                {filteredPhotos.length} photos
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Albums Grid (when no specific album is selected) */}
      {selectedAlbum === 'all' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Albums</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
            {albums
              .filter(album => selectedCategory === 'all' || album.category === selectedCategory)
              .map((album) => {
                const categoryConfig = getCategoryConfig(album.category);
                const albumPhotos = photos.filter(photo => photo.albumId === album.id);
                
                return (
                  <div 
                    key={album.id} 
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedAlbum(album.id)}
                  >
                    <div className="relative h-48">
                      <img
                        src={album.coverImage || (albumPhotos[0]?.imageUrl) || 'https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?auto=compress&cs=tinysrgb&w=400'}
                        alt={album.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <span className="bg-white bg-opacity-90 px-2 py-1 rounded-full text-sm">
                          {categoryConfig.emoji}
                        </span>
                      </div>
                      <div className="absolute bottom-2 right-2">
                        <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs">
                          {albumPhotos.length} photos
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{album.name}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{album.description}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Photos Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {selectedAlbum !== 'all' && (
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {albums.find(a => a.id === selectedAlbum)?.name || 'Photos'}
              </h2>
              <p className="text-gray-600 mt-1">
                {albums.find(a => a.id === selectedAlbum)?.description}
              </p>
            </div>
            <button
              onClick={() => setSelectedAlbum('all')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Albums
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredPhotos.map((photo, index) => (
            <div 
              key={photo.id} 
              className="relative group cursor-pointer"
              onClick={() => openImageModal(photo, index)}
            >
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-8 w-8 text-white" />
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
            <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No photos found</h3>
            <p className="text-gray-600">
              {selectedCategory !== 'all' || selectedAlbum !== 'all' 
                ? 'Try adjusting your filters to see more photos.'
                : 'Photos will appear here once they are added to the gallery.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-6xl max-h-full w-full">
            {/* Close Button */}
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Navigation Buttons */}
            {filteredPhotos.length > 1 && (
              <>
                <button
                  onClick={() => navigateImage('prev')}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={() => navigateImage('next')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Image */}
            <div className="flex items-center justify-center h-full">
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.title}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Image Info */}
            {(selectedImage.title || selectedImage.description) && (
              <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 text-white p-4 rounded-lg">
                {selectedImage.title && (
                  <h3 className="text-lg font-semibold mb-2">{selectedImage.title}</h3>
                )}
                {selectedImage.description && (
                  <p className="text-sm opacity-90">{selectedImage.description}</p>
                )}
                <div className="mt-2 text-xs opacity-75">
                  {currentImageIndex + 1} of {filteredPhotos.length}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}