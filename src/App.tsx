import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CreatePoll from './components/CreatePoll';
import PollView from './components/PollView';
import VisitorCounter from './components/VisitorCounter';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-6">
            <h1 className="text-5xl font-bold text-gray-900 mb-3">Pollify</h1>
            <p className="text-gray-600 mb-3 text-lg">Create and share polls instantly</p>
            <VisitorCounter />
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