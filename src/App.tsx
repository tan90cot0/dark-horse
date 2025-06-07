import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Timeline from './pages/Timeline';
import Map from './pages/Map';
import NoticeBoard from './pages/NoticeBoard';
import Love from './pages/Love';
import CycleTracker from './pages/CycleTracker';
import RelationshipCalendar from './pages/RelationshipCalendar';
import Chat from './pages/Chat';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
        <Navbar />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/map" element={<Map />} />
            <Route path="/notice-board" element={<NoticeBoard />} />
            <Route path="/love" element={<Love />} />
            <Route path="/wellness" element={<CycleTracker />} />
            <Route path="/calendar" element={<RelationshipCalendar />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </main>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App; 