import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Gift } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { format, isToday } from 'date-fns';

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);
  const [birthdayStudents, setBirthdayStudents] = useState([]);

  const defaultBanners = [
    {
      id: 'banner1',
      title: 'Welcome to SchoolHub',
      subtitle: 'Excellence in Education',
      image: 'https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg?auto=compress&cs=tinysrgb&w=1200',
      type: 'banner'
    },
    {
      id: 'banner2',
      title: 'Nurturing Young Minds',
      subtitle: 'Building Tomorrow\'s Leaders',
      image: 'https://images.pexels.com/photos/1720186/pexels-photo-1720186.jpeg?auto=compress&cs=tinysrgb&w=1200',
      type: 'banner'
    },
    {
      id: 'banner3',
      title: 'Innovation in Learning',
      subtitle: 'Modern Education for Modern World',
      image: 'https://images.pexels.com/photos/159844/cellular-education-classroom-159844.jpeg?auto=compress&cs=tinysrgb&w=1200',
      type: 'banner'
    }
  ];

  useEffect(() => {
    fetchTodaysBirthdays();
  }, []);

  useEffect(() => {
    const allSlides = [...defaultBanners];
    
    // Add birthday slide if there are birthday students
    if (birthdayStudents.length > 0) {
      allSlides.push({
        id: 'birthday',
        type: 'birthday',
        students: birthdayStudents
      });
    }
    
    setSlides(allSlides);
  }, [birthdayStudents]);

  useEffect(() => {
    if (slides.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const fetchTodaysBirthdays = async () => {
    try {
      const today = format(new Date(), 'MM-dd');
      const studentsRef = collection(db, 'students');
      const q = query(studentsRef, where('birthDate', '>=', today), where('birthDate', '<=', today + '\uf8ff'));
      
      const querySnapshot = await getDocs(q);
      const students = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const birthDate = new Date(data.birthDate);
        if (isToday(birthDate)) {
          students.push({ id: doc.id, ...data });
        }
      });
      
      setBirthdayStudents(students);
    } catch (error) {
      console.error('Error fetching birthdays:', error);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (slides.length === 0) {
    return <div className="h-96 bg-gray-200 animate-pulse"></div>;
  }

  const currentSlideData = slides[currentSlide];

  return (
    <div className="relative h-96 md:h-[500px] overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600">
      {/* Banner Slide */}
      {currentSlideData.type === 'banner' && (
        <div className="relative w-full h-full">
          <img
            src={currentSlideData.image}
            alt={currentSlideData.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white max-w-4xl px-4">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
                {currentSlideData.title}
              </h1>
              <p className="text-xl md:text-2xl opacity-90 animate-fade-in-delay">
                {currentSlideData.subtitle}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Birthday Slide */}
      {currentSlideData.type === 'birthday' && (
        <div className="relative w-full h-full bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white max-w-6xl px-4">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <Gift className="h-12 w-12 text-yellow-300 animate-bounce" />
                <h1 className="text-4xl md:text-5xl font-bold">🎉 Happy Birthday! 🎉</h1>
                <Gift className="h-12 w-12 text-yellow-300 animate-bounce" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {currentSlideData.students.slice(0, 3).map((student) => (
                  <div key={student.id} className="bg-white bg-opacity-20 backdrop-blur-md rounded-xl p-6 transform hover:scale-105 transition-transform">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-4 border-yellow-300">
                      <img
                        src={student.photo || 'https://images.pexels.com/photos/1450114/pexels-photo-1450114.jpeg?auto=compress&cs=tinysrgb&w=200'}
                        alt={student.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{student.name}</h3>
                    <p className="text-lg opacity-90">Class {student.class}</p>
                    <p className="text-sm opacity-80 mt-2">
                      🎂 Wishing you a wonderful birthday filled with joy and success!
                    </p>
                  </div>
                ))}
              </div>

              {currentSlideData.students.length > 3 && (
                <p className="mt-6 text-lg opacity-90">
                  And {currentSlideData.students.length - 3} more birthday celebration{currentSlideData.students.length - 3 > 1 ? 's' : ''} today!
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}