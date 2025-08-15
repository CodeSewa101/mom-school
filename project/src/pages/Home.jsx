import HeroBanner from "../components/home/HeroBanner";
import NotificationBar from "../components/home/NotificationBar";
import MessageScroll from "../components/home/MessageScroll";
import { Link } from "react-router-dom";
import principalImg from "../image/Principal.jpg";
import {
  BookOpen,
  Users,
  Award,
  Calendar,
  Clock,
  Bell,
  CalendarDays,
  FileText,
  CheckCircle,
  GraduationCap,
  Globe,
  Activity,
  Smile,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  const features = [
    {
      icon: BookOpen,
      title: "Quality Education",
      description: "Comprehensive curriculum for academic excellence.",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Users,
      title: "Experienced Faculty",
      description: "Dedicated teachers with personalized approach.",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Award,
      title: "Achievement Focus",
      description: "Excellence in academics and extracurriculars.",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      icon: Calendar,
      title: "Holistic Development",
      description: "Balanced intellectual and emotional growth.",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ];

  const quickLinks = [
    {
      icon: Clock,
      title: "Time Table",
      action: "View",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "/admin/timetable",
    },
    {
      icon: Bell,
      title: "Notices",
      action: "View",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      href: "/notices",
    },
    {
      icon: CalendarDays,
      title: "Calendar",
      action: "View",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      href: "/calendar",
    },
    {
      icon: FileText,
      title: "Resources",
      action: "Access",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      href: "/resources",
    },
    {
      icon: CheckCircle,
      title: "Admissions",
      action: "Apply",
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      href: "/admissions",
    },
  ];

  const academicResources = [
    {
      icon: Clock,
      title: "Time Table",
      description: "View class schedules and academic timings",
      color: "text-blue-600",
      bgColor: "bg-blue-100/50",
      borderColor: "border-blue-200",
      href: "/admin/timetable",
    },
    {
      icon: Bell,
      title: "Notices",
      description: "Important announcements and updates",
      color: "text-purple-600",
      bgColor: "bg-purple-100/50",
      borderColor: "border-purple-200",
      href: "/notices",
    },
    {
      icon: CalendarDays,
      title: "Calendar",
      description: "Academic events and holidays",
      color: "text-amber-600",
      bgColor: "bg-amber-100/50",
      borderColor: "border-amber-200",
      href: "/calendar",
    },
    {
      icon: FileText,
      title: "Solutions",
      description: "Study materials and resources",
      color: "text-emerald-600",
      bgColor: "bg-emerald-100/50",
      borderColor: "border-emerald-200",
      href: "/resources",
    },
    {
      icon: CheckCircle,
      title: "TC Verify",
      description: "Transfer certificate verification",
      color: "text-rose-600",
      bgColor: "bg-rose-100/50",
      borderColor: "border-rose-200",
      href: "/tc-verify",
    },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Hero Banner */}
      <HeroBanner />

      {/* Message Scroll */}
      <MessageScroll />

      {/* Notification Bar */}
      <NotificationBar />

      {/* Welcome Section */}
<section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-blue-50 relative">
  <div className="absolute inset-0 opacity-5 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
  <div className="max-w-6xl mx-auto relative">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="text-center mb-16"
    >
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
        Welcome to <br className="sm:hidden" />
        <span className="text-blue-600 text-3xl sm:text-4xl md:text-5xl block mt-2">
          MOM SCHOOL OF EXCELLENCY
        </span>
      </h1>
      <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
        Where traditional values meet innovative education to shape
        tomorrow's leaders through a transformative learning experience
      </p>
    </motion.div>
  </div>
</section>

      {/* Principal's Message Section */}
<section className="py-20 bg-white relative">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Section Heading */}
    <div className="text-center mb-16">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-4xl font-bold text-gray-900 mb-4"
      >
        <span className="relative inline-block">
          <span className="relative z-10">Message from the </span>
          <span className="text-blue-600 relative z-10">Principal</span>
          <span className="absolute bottom-0 left-0 w-full h-3 bg-yellow-200 opacity-60 -z-0 transform -rotate-1"></span>
        </span>
      </motion.h2>
    </div>

    {/* Content Section */}
    <div className="flex flex-col lg:flex-row gap-12 items-center">
      {/* Principal's Photo */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="w-full lg:w-1/3 flex justify-center"
      >
        <div className="relative w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-gray-100">
          <img
            src={principalImg}
            alt="Principal Dr. Jane Smith"
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6 text-white">
            <h4 className="text-xl font-bold drop-shadow-md">Miss. Pratima Kumari Patra</h4>
            <p className="text-sm opacity-90 drop-shadow-md">Principal</p>
          </div>
        </div>
      </motion.div>

      {/* Message Content */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="w-full lg:w-2/3"
      >
        <div className="bg-blue-50 rounded-2xl p-8 md:p-10 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-blue-200 opacity-20"></div>
          <div className="relative">
            <blockquote className="text-gray-700 text-lg md:text-xl leading-relaxed mb-6">
              "It is my privilege to serve as the principal of our vibrant and dedicated learning community. 
              At our MOM School of Excellency, we believe that education is not just about academic achievement—it is about 
              inspiring curiosity, building character, and preparing our students to thrive in an ever-changing world."
            </blockquote>
            <p className="text-gray-600 mb-6">
              Our talented staff works tirelessly to create an environment where every child feels valued, challenged, 
              and supported. We encourage our students to dream big, work hard, and develop a lifelong love of learning. 
              We also recognize the importance of strong partnerships between school, home, and community. Together, 
              we can ensure that each student receives the guidance, opportunities, and encouragement they need to reach 
              their fullest potential.
            </p>
            <p className="text-gray-600 mb-6">
              Thank you for visiting our website and taking the time to learn more about our school. 
              We are proud of our students, our staff, and our shared commitment to excellence.
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-4">
                JS
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Miss. Pratima Kumari Patra</h4>
                <p className="text-sm text-gray-600">Principal, MOM SCHOOL OF EXCELLENCY</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </div>
</section>


      {/* Academic Session Section */}
      <section className="relative py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-gray-900 mb-3"
            >
              <span className="relative inline-block">
                <span className="relative z-10">ACADEMIC YEAR </span>
                <span className="text-blue-600 relative z-10">2025-2026</span>
                <span className="absolute bottom-0 left-0 w-full h-3 bg-yellow-200 opacity-60 -z-0 transform -rotate-1"></span>
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-gray-500 uppercase tracking-wider text-sm font-medium"
            >
              Essential Resources At Your Fingertips
            </motion.p>
          </div>

          {/* Resources Grid - First Row (3 cards) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Time Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-100 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden"
            >
              <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-blue-200 opacity-20 group-hover:opacity-30 transition-all"></div>
              <div className="flex flex-col h-full">
                <div className="flex items-start mb-6">
                  <div className="bg-blue-100 p-3 rounded-xl mr-4">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Time Table
                    </h3>
                    <p className="text-gray-500 mt-1">
                      View class schedules and academic timings
                    </p>
                  </div>
                </div>
                <div className="mt-auto">
                  <Link
                    to="/admin/timetable"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mt-6 group-hover:underline"
                  >
                    View Schedule
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Notices */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl border border-purple-100 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden"
            >
              <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-purple-200 opacity-20 group-hover:opacity-30 transition-all"></div>
              <div className="flex flex-col h-full">
                <div className="flex items-start mb-6">
                  <div className="bg-purple-100 p-3 rounded-xl mr-4">
                    <Bell className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Notices</h3>
                    <p className="text-gray-500 mt-1">
                      Important announcements and updates
                    </p>
                  </div>
                </div>
                <div className="mt-auto">
                  <Link
                    to="/notices"
                    className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium mt-6 group-hover:underline"
                  >
                    View Notices
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Calendar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="bg-gradient-to-br from-amber-50 to-white p-6 rounded-2xl border border-amber-100 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden"
            >
              <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-amber-200 opacity-20 group-hover:opacity-30 transition-all"></div>
              <div className="flex flex-col h-full">
                <div className="flex items-start mb-6">
                  <div className="bg-amber-100 p-3 rounded-xl mr-4">
                    <CalendarDays className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Calendar
                    </h3>
                    <p className="text-gray-500 mt-1">
                      Academic events and holidays
                    </p>
                  </div>
                </div>
                <div className="mt-auto">
                  <Link
                    to="/calendar"
                    className="inline-flex items-center text-amber-600 hover:text-amber-800 font-medium mt-6 group-hover:underline"
                  >
                    View Calendar
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Resources Grid - Second Row (2 centered cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Solutions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden"
            >
              <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-emerald-200 opacity-20 group-hover:opacity-30 transition-all"></div>
              <div className="flex flex-col h-full">
                <div className="flex items-start mb-6">
                  <div className="bg-emerald-100 p-3 rounded-xl mr-4">
                    <FileText className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Solutions
                    </h3>
                    <p className="text-gray-500 mt-1">
                      Study materials and resources
                    </p>
                  </div>
                </div>
                <div className="mt-auto">
                  <Link
                    to="/resources"
                    className="inline-flex items-center text-emerald-600 hover:text-emerald-800 font-medium mt-6 group-hover:underline"
                  >
                    Access Resources
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* TC Verify */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="bg-gradient-to-br from-rose-50 to-white p-6 rounded-2xl border border-rose-100 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden"
            >
              <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-rose-200 opacity-20 group-hover:opacity-30 transition-all"></div>
              <div className="flex flex-col h-full">
                <div className="flex items-start mb-6">
                  <div className="bg-rose-100 p-3 rounded-xl mr-4">
                    <CheckCircle className="w-6 h-6 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Result
                    </h3>
                    <p className="text-gray-500 mt-1">
                      View Result
                    </p>
                  </div>
                </div>
                <div className="mt-auto">
                  <Link
                    to="/tc-verify"
                    className="inline-flex items-center text-rose-600 hover:text-rose-800 font-medium mt-6 group-hover:underline"
                  >
                    View Result
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')]"></div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6">Our Achievements</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Celebrating excellence in education through numbers that tell our
              story
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              {
                number: "500+",
                label: "Students Enrolled",
                icon: GraduationCap,
              },
              { number: "50+", label: "Expert Faculty", icon: Users },
              { number: "15+", label: "Years of Excellence", icon: Calendar },
              { number: "95%", label: "Success Rate", icon: Award },
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={item}
                className="text-center bg-white/10 p-8 rounded-xl backdrop-blur-sm hover:bg-white/15 transition-all hover:scale-105"
              >
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                    <stat.icon className="h-7 w-7" />
                  </div>
                </div>
                <div className="text-5xl font-bold mb-3">{stat.number}</div>
                <div className="text-sm opacity-90 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Parents Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hear from our community about their experiences
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                quote:
                  "Mom School has transformed my child's learning experience. The teachers are exceptional!",
                author: "Mr. Prakash Rout",
                role: "Parent of 3rd Grader",
              },
              {
                quote:
                  "The holistic approach to education here is exactly what we were looking for.",
                author: "Swarnalata Panda",
                role: "Parent of 5th Grader",
              },
              {
                quote:
                  "My daughter loves going to school every day. That says it all!",
                author: "Sunita Sahu",
                role: "Parent of 2nd Grader",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                variants={item}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-2"
              >
                <div className="text-amber-400 mb-4 flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 italic mb-6">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-gray-900">
                      {testimonial.author}
                    </h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')]"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Ready to Join Our Community?
            </h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto">
              Discover how we can help your child reach their full potential in
              a nurturing environment
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-lg"
              >
                Schedule a Tour
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all"
              >
                Contact Admissions
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
