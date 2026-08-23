import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import PhysicalCourses from './pages/PhysicalCourses';
import OnlineCourses from './pages/OnlineCourses';
import Admin from './pages/Admin';
import Success from './pages/Success';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col font-sans bg-slate-50">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/physical-courses" element={<PhysicalCourses />} />
            <Route path="/online-courses" element={<OnlineCourses />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/success" element={<Success />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
