import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RouteSpinner } from './components/RouteSpinner';
import { ToastContainer } from './components/Toast';
import { ScrollRestoration } from './components/ScrollRestoration';
import { useThemeSync } from './hooks/useThemeSync';

// Lazy-load each route so the initial bundle stays small. Train.tsx (~1100 LOC)
// and the Recharts dependency in Stats are the biggest wins here.
const Home = lazy(() => import('./screens/Home').then((m) => ({ default: m.Home })));
const Train = lazy(() => import('./screens/Train').then((m) => ({ default: m.Train })));
const Result = lazy(() => import('./screens/Result').then((m) => ({ default: m.Result })));
const Stats = lazy(() => import('./screens/Stats').then((m) => ({ default: m.Stats })));
const Settings = lazy(() => import('./screens/Settings').then((m) => ({ default: m.Settings })));
const Badges = lazy(() => import('./screens/Badges').then((m) => ({ default: m.Badges })));
// Online 1v1 battle. The provider is a layout route that owns the realtime
// transport + battle store and stays mounted across the lobby/play/results
// sub-routes (so the connection survives phase navigation).
const BattleHome = lazy(() => import('./screens/Battle/BattleHome').then((m) => ({ default: m.BattleHome })));
const BattleProvider = lazy(() => import('./battle/BattleProvider').then((m) => ({ default: m.BattleProvider })));
const BattleLobby = lazy(() => import('./screens/Battle/BattleLobby').then((m) => ({ default: m.BattleLobby })));
const BattleTrain = lazy(() => import('./screens/Battle/BattleTrain').then((m) => ({ default: m.BattleTrain })));
const BattleResults = lazy(() => import('./screens/Battle/BattleResults').then((m) => ({ default: m.BattleResults })));

export default function App() {
  useThemeSync();
  return (
    <ErrorBoundary>
      <HashRouter>
        <ScrollRestoration />
        <Suspense fallback={<RouteSpinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/train/:mode" element={<Train />} />
            <Route path="/result" element={<Result />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/badges" element={<Badges />} />
            <Route path="/battle" element={<BattleHome />} />
            <Route path="/battle/room/:roomId" element={<BattleProvider />}>
              <Route path="lobby" element={<BattleLobby />} />
              <Route path="play" element={<BattleTrain />} />
              <Route path="results" element={<BattleResults />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </HashRouter>
      <ToastContainer />
    </ErrorBoundary>
  );
}
