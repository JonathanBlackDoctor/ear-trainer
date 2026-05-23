import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RouteSpinner } from './components/RouteSpinner';
import { ToastContainer } from './components/Toast';
import { useThemeSync } from './hooks/useThemeSync';

// Lazy-load each route so the initial bundle stays small. Train.tsx (~1100 LOC)
// and the Recharts dependency in Stats are the biggest wins here.
const Home = lazy(() => import('./screens/Home').then((m) => ({ default: m.Home })));
const Train = lazy(() => import('./screens/Train').then((m) => ({ default: m.Train })));
const Result = lazy(() => import('./screens/Result').then((m) => ({ default: m.Result })));
const Stats = lazy(() => import('./screens/Stats').then((m) => ({ default: m.Stats })));
const Settings = lazy(() => import('./screens/Settings').then((m) => ({ default: m.Settings })));
const Lab = lazy(() => import('./screens/Lab').then((m) => ({ default: m.Lab })));
const Badges = lazy(() => import('./screens/Badges').then((m) => ({ default: m.Badges })));

export default function App() {
  useThemeSync();
  return (
    <ErrorBoundary>
      <HashRouter>
        <Suspense fallback={<RouteSpinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/train/:mode" element={<Train />} />
            <Route path="/result" element={<Result />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/lab" element={<Lab />} />
            <Route path="/badges" element={<Badges />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </HashRouter>
      <ToastContainer />
    </ErrorBoundary>
  );
}
