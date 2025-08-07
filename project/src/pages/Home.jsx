import HeroBanner from '../components/home/HeroBanner';
import NotificationBar from '../components/home/NotificationBar';
import { BookOpen, Users, Award, Calendar } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: BookOpen,
      title: 'Quality Education',
      description: 'Comprehensive curriculum designed to nurture academic excellence and critical thinking skills.'
    },
    {
      icon: Users,
      title: 'Experienced Faculty',
      description: 'Dedicated teachers committed to providing personalized attention and guidance to every student.'
    },
    {
      icon: Award,
      title: 'Achievement Focus',
      description: 'Encouraging students to excel in academics, sports, and extracurricular activities.'
    },
    {
      icon: Calendar,
      title: 'Holistic Development',
      description: 'Balanced approach to education focusing on intellectual, physical, and emotional growth.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <HeroBanner />
      
      {/* Notification Bar */}
      <NotificationBar />

      {/* Welcome Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Welcome to Mom School Of Excellency
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12">
            Where education meets innovation. We're committed to providing a nurturing environment 
            that empowers students to reach their full potential and become tomorrow's leaders.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="bg-blue-600 rounded-lg p-3 w-fit mx-auto mb-4 group-hover:bg-blue-700 transition-colors">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Achievements</h2>
            <p className="text-xl opacity-90">Building a legacy of excellence in education</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { number: '500+', label: 'Students' },
              { number: '50+', label: 'Teachers' },
              { number: '15+', label: 'Years of Excellence' },
              { number: '95%', label: 'Success Rate' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Join Our Educational Community
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Discover how Mom School of Excellency can help your child reach their full potential with our 
            comprehensive educational programs and supportive learning environment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Learn More
            </button>
            <button className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors">
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}