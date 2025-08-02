import { Users, Award, BookOpen, Heart } from 'lucide-react';

export default function About() {
  const values = [
    {
      icon: BookOpen,
      title: 'Academic Excellence',
      description: 'We strive for the highest standards in education, ensuring our students are well-prepared for future challenges.'
    },
    {
      icon: Heart,
      title: 'Character Building',
      description: 'We focus on developing strong moral values, integrity, and empathy in our students.'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'We foster a supportive community where everyone feels valued, respected, and included.'
    },
    {
      icon: Award,
      title: 'Innovation',
      description: 'We embrace modern teaching methods and technology to enhance the learning experience.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">About SchoolHub</h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
            Empowering minds, shaping futures, and building tomorrow's leaders through innovative education.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                At SchoolHub, we are dedicated to providing exceptional education that nurtures the whole child. 
                Our mission is to create an environment where students can discover their passions, develop their 
                talents, and grow into confident, responsible global citizens.
              </p>
              <p className="text-lg text-gray-600">
                We believe that every student has unique potential, and we are committed to helping them unlock 
                that potential through personalized learning experiences, innovative teaching methods, and a 
                supportive community.
              </p>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/1516440/pexels-photo-1516440.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Students learning"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Core Values</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              These fundamental principles guide everything we do and shape the culture of our school community.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="bg-blue-100 rounded-lg p-3 w-fit mb-4">
                  <value.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/159844/cellular-education-classroom-159844.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="School building"
                className="rounded-lg shadow-xl"
              />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-lg text-gray-600 mb-6">
                Founded in 2010, SchoolHub began as a small educational institution with a big vision: 
                to revolutionize education through technology and personalized learning. Over the years, 
                we have grown into a leading educational institution known for our innovative approach 
                and exceptional results.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Today, we serve over 500 students with a dedicated team of 50+ educators who are 
                passionate about making a difference in young lives. Our state-of-the-art facilities 
                and cutting-edge technology create an optimal learning environment for the 21st century.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">15+</div>
                  <div className="text-gray-600">Years of Excellence</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">500+</div>
                  <div className="text-gray-600">Happy Students</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}