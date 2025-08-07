import { 
  GraduationCap, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowUp,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* School Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <GraduationCap className="h-10 w-10 text-blue-400" />
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
                MOM SCHOOL OF EXCELLENCY
              </span>
            </div>
            <p className="text-gray-300 mb-6 text-lg leading-relaxed">
              Empowering education through innovative technology and dedicated teaching.
              Building bright futures for every student.
            </p>
            <div className="space-y-3 text-gray-300">
              <a 
                href="https://maps.google.com/?q=Laxmi+Bazar,Near+Satya+Narayan+Temple,Aska.pin:761110"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start space-x-3 hover:text-white transition-colors"
              >
                <MapPin className="h-5 w-5 mt-0.5 text-blue-400 flex-shrink-0" />
                <span>Laxmi Bazar, Near Satya Narayan Temple, Aska.pin:761110</span>
              </a>
              <div className="flex items-start space-x-3 hover:text-white transition-colors">
                <Phone className="h-5 w-5 mt-0.5 text-blue-400 flex-shrink-0" />
                <span>(+91) 7205727976, 8658847497</span>
              </div>
              <a href="mailto:momschoolofexcellency@gmail.com" className="flex items-start space-x-3 hover:text-white transition-colors">
                <Mail className="h-5 w-5 mt-0.5 text-blue-400 flex-shrink-0" />
                <span>momschoolofexcellency@gmail.com</span>
              </a>
            </div>

            {/* Social Media Links */}
            <div className="flex space-x-5 mt-8">
              <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors hover:-translate-y-1 transform">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors hover:-translate-y-1 transform">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors hover:-translate-y-1 transform">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors hover:-translate-y-1 transform">
                <Youtube className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors hover:-translate-y-1 transform">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-6 pb-2 border-b border-gray-700 inline-block">Quick Links</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors flex items-center group">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                About Us
              </a></li>
              <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors flex items-center group">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Admissions
              </a></li>
              <li><a href="/gallery" className="text-gray-300 hover:text-blue-400 transition-colors flex items-center group">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Photo Gallery
              </a></li>
              <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors flex items-center group">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Academic Programs
              </a></li>
              <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors flex items-center group">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Faculty
              </a></li>
              <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors flex items-center group">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Contact
              </a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-xl font-semibold mb-6 pb-2 border-b border-gray-700 inline-block">Resources</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors flex items-center group">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Student Portal
              </a></li>
              <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors flex items-center group">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Parent Portal
              </a></li>
              <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors flex items-center group">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Library
              </a></li>
              <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors flex items-center group">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Calendar
              </a></li>
              <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors flex items-center group">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Support
              </a></li>
              <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors flex items-center group">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Careers
              </a></li>
            </ul>
          </div>
        </div>

        {/* Back to Top Button */}
        <div className="text-center mt-14">
          <a 
            href="#" 
            className="inline-flex items-center px-4 py-2 rounded-full bg-gray-800 hover:bg-blue-600 text-blue-400 hover:text-white transition-all duration-300"
          >
            <ArrowUp className="mr-2 h-4 w-4" />
            Back to Top
          </a>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-700 mt-10 pt-8 text-center text-gray-400">
          <p className="text-sm md:text-base">
            &copy; {new Date().getFullYear()} MOM SCHOOL OF EXCELLENCY. All rights reserved. 
            <br className="sm:hidden" /> Developed by <a 
              href="https://codesewa.in" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              CodeSewa
            </a>.
          </p>
        </div>
      </div>
    </footer>
  );
}