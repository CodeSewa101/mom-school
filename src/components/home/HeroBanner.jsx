import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";
import { format, isToday } from "date-fns";
import banner1 from "../../image/banner1.jpg";
import banner2 from "../../image/banner2.jpg";
import banner3 from "../../image/banner3.jpg";

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);
  const [birthdayStudents, setBirthdayStudents] = useState([]);

  const defaultBanners = [
    {
      id: "banner1",
      title: "A School with Heart & Vision",
      subtitle: "Excellence in Education",
      image: banner1,
      type: "banner",
    },
    {
      id: "banner2",
      title: "Every Child a Star, Every Dream a Journey",
      subtitle: "Building Tomorrow's Leaders",
      image: banner2,
      type: "banner",
    },
    {
      id: "banner3",
      title: "Innovation in Learning",
      subtitle: "Know Meditation, Know Life. No meditation, No Life.",
      image: banner3,
      type: "banner",
    },
  ];

  useEffect(() => {
    fetchTodaysBirthdays();
  }, []);

  useEffect(() => {
    const allSlides = [...defaultBanners];

    if (birthdayStudents.length > 0) {
      allSlides.push({
        id: "birthday",
        type: "birthday",
        students: birthdayStudents,
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
      const today = format(new Date(), "MM-dd");
      const studentsRef = collection(db, "students");
      const q = query(
        studentsRef,
        where("birthDate", ">=", today),
        where("birthDate", "<=", today + "\uf8ff")
      );

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
      console.error("Error fetching birthdays:", error);
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
      {currentSlideData.type === "banner" && (
        <div className="relative w-full h-full">
          <img
            src={currentSlideData.image}
            alt={currentSlideData.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="absolute inset-0 flex items-end justify-center pb-16 md:pb-24">
            <div className="text-center text-white max-w-3xl px-4 w-full">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="relative inline-block">
                  {currentSlideData.title.split(" ").map((word, i) => (
                    <span
                      key={i}
                      className="inline-block mr-2 relative group"
                      style={{
                        animation: `floatUp 0.8s ${i * 0.1}s forwards`,
                        opacity: 0,
                      }}
                    >
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-yellow-200 relative z-10">
                        {word}
                      </span>
                      <span className="absolute inset-0 bg-yellow-300 opacity-20 blur-md group-hover:opacity-40 transition-opacity duration-300"></span>
                    </span>
                  ))}
                </span>
              </h1>
              <p className="text-lg md:text-xl mt-4">
                <span className="inline-block px-5 py-2 bg-black bg-opacity-50 rounded-lg backdrop-blur-sm border-l-4 border-yellow-400 relative overflow-hidden group">
                  <span className="relative z-10">
                    {currentSlideData.subtitle}
                  </span>
                  <span className="absolute inset-y-0 left-0 w-1 bg-yellow-400 animate-marquee group-hover:animate-none group-hover:w-full transition-all duration-500"></span>
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Birthday Slide */}
      {currentSlideData.type === "birthday" && (
        <div className="relative w-full h-full bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="absolute inset-0 flex items-end justify-center pb-12 md:pb-20">
            <div className="text-center text-white max-w-5xl px-4 w-full">
              <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300 relative inline-block">
                    <span className="relative z-10">Happy Birthday!</span>
                    <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-yellow-300 to-pink-300 rounded-full animate-underline-expand"></span>
                  </span>
                </h1>
                <div className="flex justify-center space-x-4 mt-5">
                  {["🎂", "🎁", "🎈", "✨"].map((emoji, i) => (
                    <span
                      key={i}
                      className="text-2xl inline-block hover:scale-125 transition-transform duration-300"
                      style={{
                        animation: `bounce 1s ${i * 0.2}s infinite alternate`,
                        textShadow: "0 0 8px rgba(255,255,255,0.5)",
                      }}
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
                {currentSlideData.students.slice(0, 3).map((student) => (
                  <div
                    key={student.id}
                    className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4 transform hover:scale-105 transition-all duration-300 border-2 border-white border-opacity-20 hover:border-opacity-40 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden border-4 border-yellow-300 shadow-lg relative z-10">
                      <img
                        src={
                          student.photo ||
                          "https://images.pexels.com/photos/1450114/pexels-photo-1450114.jpeg?auto=compress&cs=tinysrgb&w=200"
                        }
                        alt={student.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <h3 className="text-lg font-bold mb-2 relative z-10">
                      <span className="bg-gradient-to-r from-yellow-200 to-yellow-100 bg-clip-text text-transparent relative inline-block">
                        {student.name}
                        <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-yellow-200 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                      </span>
                    </h3>
                    <p className="text-base text-gray-200 relative z-10">
                      <span className="inline-block px-2 py-1 bg-black/20 rounded-md">
                        Class {student.class}
                      </span>
                    </p>
                    <p className="text-xs text-gray-300 mt-2 italic relative z-10">
                      <span className="inline-block transform hover:skew-x-3 transition-transform duration-300">
                        "Wishing you a wonderful birthday!"
                      </span>
                    </p>
                  </div>
                ))}
              </div>

              {currentSlideData.students.length > 3 && (
                <p className="mt-6 text-base text-white">
                  <span className="inline-block px-4 py-2 bg-black/40 rounded-full border border-white/20 hover:border-yellow-300 transition-all duration-300 relative overflow-hidden">
                    <span className="relative z-10">
                      And {currentSlideData.students.length - 3} more
                      celebrating today!
                    </span>
                    <span className="absolute inset-0 bg-yellow-300 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></span>
                  </span>
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
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-40 text-white p-2 rounded-full transition-all backdrop-blur-sm z-10"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-40 text-white p-2 rounded-full transition-all backdrop-blur-sm z-10"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide
                  ? "bg-yellow-300 shadow-md animate-pulse"
                  : "bg-white bg-opacity-50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
