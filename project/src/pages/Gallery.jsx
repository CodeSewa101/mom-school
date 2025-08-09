import { useState, useEffect, useCallback } from 'react';
import { 
  Camera, 
  X,
  ChevronLeft,
  ChevronRight,
  Album,
  Image as ImageIcon,
  Loader2,
  Grid,
  List,
  Search,
  Plus
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
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { value: 'all', label: 'All', icon: '🌎', color: 'bg-gray-100 text-gray-800' },
    { value: 'events', label: 'Events', icon: '🎉', color: 'bg-purple-100 text-purple-800' },
    { value: 'memories', label: 'Memories', icon: '📸', color: 'bg-blue-100 text-blue-800' },
    { value: 'sports', label: 'Sports', icon: '⚽', color: 'bg-green-100 text-green-800' },
    { value: 'achievement', label: 'Achievements', icon: '🏆', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'others', label: 'Others', icon: '📷', color: 'bg-indigo-100 text-indigo-800' }
  ];

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

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(photo => 
          (photo.title && photo.title.toLowerCase().includes(query)) ||
          (photo.description && photo.description.toLowerCase().includes(query))
        );
      }

      setFilteredPhotos(filtered);
    };

    filterPhotos();
  }, [photos, selectedCategory, selectedAlbum, albums, searchQuery]);

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
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              Our Visual Journey
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl opacity-90"
            >
              Loading your memories...
            </motion.p>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center">
          <motion.div
            animate={{ 
              rotate: 360,
              transition: { duration: 2, repeat: Infinity, ease: "linear" }
            }}
          >
            <Loader2 className="h-16 w-16 text-indigo-600" />
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-gray-600"
          >
            Curating your gallery experience...
          </motion.p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100"
        >
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <X className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Gallery Unavailable</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-md transition-all"
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 text-white py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        </div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Our Visual Journey
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto"
          >
            Moments captured, memories preserved
          </motion.p>
        </div>
        
        {/* Floating decorative elements */}
        <motion.div 
          className="absolute top-20 left-20 w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm"
          animate={{
            y: [0, 15, 0],
            transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }}
        />
        <motion.div 
          className="absolute bottom-10 right-20 w-24 h-24 rounded-full bg-white/5 backdrop-blur-sm"
          animate={{
            y: [0, -20, 0],
            transition: { duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }
          }}
        />
      </div>

      {/* Filters */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Search and Category Filter */}
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search photos..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex overflow-x-auto pb-2 sm:pb-0 gap-2 scrollbar-hide">
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
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                      selectedCategory === category.value
                        ? `${category.color} shadow-md font-semibold`
                        : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                    }`}
                  >
                    <span className="text-lg">{category.icon}</span>
                    {category.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Album Filter and Controls */}
            <div className="flex items-center gap-4">
              <div className="relative min-w-[180px]">
                <select
                  value={selectedAlbum}
                  onChange={(e) => setSelectedAlbum(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm w-full"
                >
                  <option value="all">All Albums</option>
                  {albums
                    .filter(album => selectedCategory === 'all' || album.category === selectedCategory)
                    .map(album => (
                      <option key={album.id} value={album.id}>{album.name}</option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <Album size={18} className="text-gray-500" />
                </div>
              </div>
              
              <div className="flex items-center gap-1 bg-white rounded-xl p-1.5 shadow-sm border border-gray-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600 shadow-inner' : 'text-gray-500 hover:bg-gray-100'}`}
                  aria-label="Grid view"
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600 shadow-inner' : 'text-gray-500 hover:bg-gray-100'}`}
                  aria-label="List view"
                >
                  <List size={18} />
                </button>
              </div>
              
              <span className="text-sm text-gray-700 bg-white px-3.5 py-1.5 rounded-xl shadow-sm border border-gray-200 font-medium flex items-center gap-1">
                <Camera size={16} className="text-indigo-600" />
                {filteredPhotos.length} {filteredPhotos.length === 1 ? 'Memory' : 'Memories'}
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
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <Album size={24} />
                </div>
                <span>Featured Albums</span>
              </h2>
              <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
                <Plus size={16} />
                New Album
              </button>
            </div>
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
                      className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer border border-gray-100 group"
                      onClick={() => setSelectedAlbum(album.id)}
                    >
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={album.coverImage || (albumPhotos[0]?.imageUrl) || 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80'}
                          alt={album.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                        <div className="absolute top-4 left-4">
                          <span className={`${categoryConfig.color} backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 shadow-sm`}>
                            <span className="text-lg">{categoryConfig.icon}</span>
                            <span className="font-medium">{categoryConfig.label}</span>
                          </span>
                        </div>
                        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 shadow-sm">
                          <Camera size={16} />
                          <span>{albumPhotos.length} {albumPhotos.length === 1 ? 'photo' : 'photos'}</span>
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{album.name}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{album.description}</p>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>{formatDate(album.createdAt)}</span>
                          <button className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 group-hover:underline">
                            View album
                            <ChevronRight size={16} className="mt-0.5" />
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
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedAlbum('all')}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {albums.find(a => a.id === selectedAlbum)?.name || 'Photos'}
                </h2>
                <p className="text-gray-600 mt-1 max-w-2xl">
                  {albums.find(a => a.id === selectedAlbum)?.description}
                </p>
              </div>
            </div>
            <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
              <Plus size={16} />
              Add Photos
            </button>
          </div>
        )}

        {/* Photos Grid/List View */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredPhotos.map((photo, index) => (
              <motion.div 
                key={photo.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative group cursor-pointer"
                onClick={() => openImageModal(photo, index)}
                whileHover={{ scale: 1.03 }}
                layout
              >
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-md relative">
                  <img
                    src={photo.imageUrl}
                    alt={photo.title || 'Gallery photo'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-end p-4">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      {photo.title && (
                        <h3 className="text-white font-medium truncate">{photo.title}</h3>
                      )}
                      <p className="text-white/80 text-xs mt-1">
                        {formatDate(photo.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPhotos.map((photo, index) => (
              <motion.div 
                key={photo.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex gap-4 items-center group"
                onClick={() => openImageModal(photo, index)}
                whileHover={{ y: -2 }}
                layout
              >
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
                  <img
                    src={photo.imageUrl}
                    alt={photo.title || 'Gallery photo'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{photo.title || 'Untitled Photo'}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{photo.description}</p>
                  <div className="mt-2 text-xs text-gray-400 flex items-center gap-2">
                    <span>{formatDate(photo.createdAt)}</span>
                    {photo.albumId && (
                      <span className="bg-gray-100 px-2 py-1 rounded-full">
                        {albums.find(a => a.id === photo.albumId)?.name || 'Album'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-gray-400 group-hover:text-indigo-600 transition-colors">
                  <ChevronRight size={20} />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredPhotos.length === 0 && (
          <div className="text-center py-20">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mx-auto w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center mb-6"
            >
              <Camera className="h-16 w-16 text-indigo-500" />
            </motion.div>
            <h3 className="text-2xl font-medium text-gray-900 mb-3">No memories found</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              {selectedCategory !== 'all' || selectedAlbum !== 'all' || searchQuery
                ? 'Try adjusting your filters or search query.'
                : 'Photos will appear here once they are added to the gallery.'
              }
            </p>
            {(selectedCategory !== 'all' || selectedAlbum !== 'all' || searchQuery) && (
              <motion.button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedAlbum('all');
                  setSearchQuery('');
                }}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-md transition-all flex items-center gap-2 mx-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ImageIcon size={18} />
                Show All Photos
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
                className="absolute top-6 right-6 text-white hover:text-gray-300 z-10 bg-black/50 rounded-full p-3 backdrop-blur-sm"
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
                    className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-black/50 rounded-full p-3 backdrop-blur-sm"
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
                    className="absolute right-6 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-black/50 rounded-full p-3 backdrop-blur-sm"
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
                  className="max-w-full max-h-[80vh] object-contain rounded-lg"
                />
              </div>

              {/* Image Info */}
              <motion.div 
                className="absolute bottom-6 left-6 right-6 bg-black/70 text-white p-6 rounded-xl backdrop-blur-sm"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    {selectedImage.title && (
                      <h3 className="text-xl font-semibold mb-2">{selectedImage.title}</h3>
                    )}
                    {selectedImage.description && (
                      <p className="text-sm opacity-90">{selectedImage.description}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedImage.albumId && (
                        <span className="bg-white/20 px-3 py-1 rounded-full text-xs">
                          {albums.find(a => a.id === selectedImage.albumId)?.name || 'Album'}
                        </span>
                      )}
                      <span className="bg-white/20 px-3 py-1 rounded-full text-xs">
                        {formatDate(selectedImage.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm opacity-75 bg-black/30 px-3 py-1 rounded-full flex-shrink-0">
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