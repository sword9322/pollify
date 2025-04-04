import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CreatePoll from './components/CreatePoll';
import PollView from './components/PollView';
import VisitorCounter from './components/VisitorCounter';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-4">
            <h1 className="text-5xl font-bold text-gray-900 mb-2">Pollify</h1>
            <p className="text-gray-600 mb-2 text-lg">Create and share polls instantly</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
              <VisitorCounter />
              <div className="inline-flex items-center px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium">
                ✨ 100% Free • No Ads • No Sign-up Required
              </div>
            </div>
          </header>

          <Routes>
            <Route path="/" element={<CreatePoll />} />
            <Route path="/poll/:id" element={<PollView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;