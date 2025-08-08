import { useState, useEffect, useCallback } from 'react';
import { 
  Camera, 
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Album,
  Image as ImageIcon,
  Loader2,
  Grid,
  List
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy,
  where 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [viewMode, setViewMode] = useState('grid');
  const [error, setError] = useState(null);

  const categories = [
    { value: 'all', label: 'All Events', icon: <ImageIcon size={16} /> },
    { value: 'events', label: 'Events', icon: '🎉' },
    { value: 'memories', label: 'Memories', icon: '📸' },
    { value: 'sports', label: 'Sports', icon: '⚽' },
    { value: 'achievement', label: 'Achievement', icon: '🏅' },
    { value: 'others', label: 'Others', icon: '📷' }
  ];

  // Memoized fetch functions
  const fetchAlbums = useCallback(async () => {
    try {
      const albumsRef = collection(db, 'albums');
      const q = query(albumsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const albumData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() 
      }));
      setAlbums(albumData);
    } catch (err) {
      console.error('Error fetching albums:', err);
      setError('Failed to load albums. Please try again later.');
    }
  }, []);

  const fetchPhotos = useCallback(async () => {
    try {
      const photosRef = collection(db, 'photos');
      const q = query(photosRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const photoData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      setPhotos(photoData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching photos:', err);
      setError('Failed to load photos. Please try again later.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchAlbums(), fetchPhotos()]);
      } catch (err) {
        setError('Failed to load gallery data.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [fetchAlbums, fetchPhotos]);

  // Improved filtering with useMemo
  useEffect(() => {
    const filterPhotos = () => {
      let filtered = [...photos];

      if (selectedAlbum !== 'all') {
        filtered = filtered.filter(photo => photo.albumId === selectedAlbum);
      }

      if (selectedCategory !== 'all') {
        const categoryAlbums = albums.filter(album => album.category === selectedCategory);
        const categoryAlbumIds = categoryAlbums.map(album => album.id);
        filtered = filtered.filter(photo => categoryAlbumIds.includes(photo.albumId));
      }

      setFilteredPhotos(filtered);
    };

    filterPhotos();
  }, [photos, selectedCategory, selectedAlbum, albums]);

  const openImageModal = (photo, index) => {
    setSelectedImage(photo);
    setCurrentImageIndex(index);
    setShowImageModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeImageModal = useCallback(() => {
    setShowImageModal(false);
    document.body.style.overflow = 'auto';
  }, []);

  const navigateImage = useCallback((direction) => {
    const newIndex = direction === 'next' 
      ? (currentImageIndex + 1) % filteredPhotos.length
      : (currentImageIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    
    setCurrentImageIndex(newIndex);
    setSelectedImage(filteredPhotos[newIndex]);
  }, [currentImageIndex, filteredPhotos]);

  // Keyboard navigation for image modal
  useEffect(() => {
    if (!showImageModal) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeImageModal();
      } else if (e.key === 'ArrowRight') {
        navigateImage('next');
      } else if (e.key === 'ArrowLeft') {
        navigateImage('prev');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showImageModal, navigateImage, closeImageModal]);

  const getCategoryConfig = (category) => {
    return categories.find(c => c.value === category) || categories[0];
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown date';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-800 text-white py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Photo Gallery</h1>
            <p className="text-xl md:text-2xl opacity-90">Loading your memories...</p>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-center">
            <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-lg">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Gallery</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-800 text-white py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Photo Gallery</h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
            Explore our collection of memorable moments, achievements, and celebrations
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <motion.button
                  key={category.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedCategory(category.value);
                    if (category.value !== 'all') {
                      setSelectedAlbum('all');
                    }
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    selectedCategory === category.value
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                  }`}
                >
                  {category.icon}
                  {category.label}
                </motion.button>
              ))}
            </div>

            {/* Album Filter and Controls */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <select
                  value={selectedAlbum}
                  onChange={(e) => setSelectedAlbum(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
                >
                  <option value="all">All Albums</option>
                  {albums
                    .filter(album => selectedCategory === 'all' || album.category === selectedCategory)
                    .map(album => (
                      <option key={album.id} value={album.id}>{album.name}</option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <Album size={16} className="text-gray-500" />
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:bg-gray-100'}`}
                  aria-label="Grid view"
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:bg-gray-100'}`}
                  aria-label="List view"
                >
                  <List size={16} />
                </button>
              </div>
              
              <span className="text-sm text-gray-600 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-200">
                {filteredPhotos.length} {filteredPhotos.length === 1 ? 'photo' : 'photos'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Albums Grid (when no specific album is selected) */}
        {selectedAlbum === 'all' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
              <Album size={24} className="text-indigo-600" />
              Albums
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
              {albums
                .filter(album => selectedCategory === 'all' || album.category === selectedCategory)
                .map((album) => {
                  const categoryConfig = getCategoryConfig(album.category);
                  const albumPhotos = photos.filter(photo => photo.albumId === album.id);
                  
                  return (
                    <motion.div 
                      key={album.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer border border-gray-100"
                      onClick={() => setSelectedAlbum(album.id)}
                    >
                      <div className="relative h-48">
                        <img
                          src={album.coverImage || (albumPhotos[0]?.imageUrl) || 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80'}
                          alt={album.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute top-3 left-3">
                          <span className="bg-white backdrop-blur-sm px-2.5 py-1 rounded-full text-sm flex items-center gap-1">
                            {categoryConfig.icon}
                            <span className="text-xs font-medium">{categoryConfig.label}</span>
                          </span>
                        </div>
                        <div className="absolute bottom-3 right-3">
                          <span className="bg-black/70 text-white px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <Camera size={14} />
                            {albumPhotos.length}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{album.name}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2">{album.description}</p>
                        <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
                          <span>{formatDate(album.createdAt)}</span>
                          <button className="text-indigo-600 hover:text-indigo-800 font-medium">
                            View album →
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Photos Section */}
        {selectedAlbum !== 'all' && (
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Album size={24} className="text-indigo-600" />
                {albums.find(a => a.id === selectedAlbum)?.name || 'Photos'}
              </h2>
              <p className="text-gray-600 mt-1 max-w-2xl">
                {albums.find(a => a.id === selectedAlbum)?.description}
              </p>
            </div>
            <motion.button
              whileHover={{ x: -2 }}
              onClick={() => setSelectedAlbum('all')}
              className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              <ChevronLeft size={18} />
              Back to Albums
            </motion.button>
          </div>
        )}

        {/* Photos Grid/List View */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredPhotos.map((photo, index) => (
              <motion.div 
                key={photo.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="relative group cursor-pointer"
                onClick={() => openImageModal(photo, index)}
                whileHover={{ scale: 1.02 }}
              >
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-sm relative">
                  <img
                    src={photo.imageUrl}
                    alt={photo.title || 'Gallery photo'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all rounded-xl flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
                {photo.title && (
                  <p className="mt-2 text-sm text-gray-600 truncate">{photo.title}</p>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPhotos.map((photo, index) => (
              <motion.div 
                key={photo.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex gap-4 items-center"
                onClick={() => openImageModal(photo, index)}
                whileHover={{ y: -2 }}
              >
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={photo.imageUrl}
                    alt={photo.title || 'Gallery photo'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{photo.title || 'Untitled Photo'}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{photo.description}</p>
                  <div className="mt-2 text-xs text-gray-400">
                    {formatDate(photo.createdAt)}
                  </div>
                </div>
                <div className="text-gray-400">
                  <ChevronRight size={20} />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredPhotos.length === 0 && (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
              <Camera className="h-12 w-12 text-indigo-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No photos found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {selectedCategory !== 'all' || selectedAlbum !== 'all' 
                ? 'Try adjusting your filters or selecting a different album.'
                : 'Photos will appear here once they are added to the gallery.'
              }
            </p>
            {(selectedCategory !== 'all' || selectedAlbum !== 'all') && (
              <motion.button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedAlbum('all');
                }}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Reset Filters
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
            onClick={closeImageModal}
          >
            <motion.div 
              className="relative max-w-6xl w-full max-h-full"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeImageModal}
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black/50 rounded-full p-2 backdrop-blur-sm"
                aria-label="Close image"
              >
                <X className="h-6 w-6" />
              </motion.button>

              {/* Navigation Buttons */}
              {filteredPhotos.length > 1 && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateImage('prev');
                    }}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-black/50 rounded-full p-2 backdrop-blur-sm"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateImage('next');
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-black/50 rounded-full p-2 backdrop-blur-sm"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </motion.button>
                </>
              )}

              {/* Image */}
              <div className="flex items-center justify-center h-full">
                <motion.img
                  key={selectedImage.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  src={selectedImage.imageUrl}
                  alt={selectedImage.title || 'Gallery photo'}
                  className="max-w-full max-h-[80vh] object-contain"
                />
              </div>

              {/* Image Info */}
              <motion.div 
                className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-4 rounded-xl backdrop-blur-sm"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    {selectedImage.title && (
                      <h3 className="text-lg font-semibold mb-1">{selectedImage.title}</h3>
                    )}
                    {selectedImage.description && (
                      <p className="text-sm opacity-90">{selectedImage.description}</p>
                    )}
                  </div>
                  <div className="text-xs opacity-75 bg-black/30 px-2 py-1 rounded-full">
                    {currentImageIndex + 1} / {filteredPhotos.length}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}