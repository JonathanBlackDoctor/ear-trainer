import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './screens/Home';
import { Train } from './screens/Train';
import { Result } from './screens/Result';
import { Stats } from './screens/Stats';
import { Settings } from './screens/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/train/:mode" element={<Train />} />
        <Route path="/result" element={<Result />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
