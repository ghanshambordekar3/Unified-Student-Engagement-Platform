import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import Finance from './pages/Finance';
import AdmissionPredictor from './pages/AdmissionPredictor';
import Timeline from './pages/Timeline';
import Progress from './pages/Progress';
import SOPGenerator from './pages/SOPGenerator';
import Loans from './pages/Loans';
import Rewards from './pages/Rewards';
import Content from './pages/Content';
import storage from './utils/storage';
import { trackPageView } from './utils/personalization';

function RequireProfile({ children }) {
  const profile = storage.get('edupath_profile', null);
  if (!profile) return <Navigate to="/" replace />;
  return children;
}

function HomeRedirect() {
  const profile = storage.get('edupath_profile', null);
  if (profile) return <Navigate to="/dashboard" replace />;
  return <Landing />;
}

function TrackingWrapper({ children }) {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);
  return children;
}

function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-white">
      <Navbar />
      <main className="flex-1 lg:ml-60 pt-16 lg:pt-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}

const protectedPages = [
  { path: '/dashboard', Component: Dashboard },
  { path: '/explore', Component: Explore },
  { path: '/finance', Component: Finance },
  { path: '/predictor', Component: AdmissionPredictor },
  { path: '/timeline', Component: Timeline },
  { path: '/progress', Component: Progress },
  { path: '/sop', Component: SOPGenerator },
  { path: '/loans', Component: Loans },
  { path: '/rewards', Component: Rewards },
  { path: '/content', Component: Content },
];

export default function App() {
  return (
    <BrowserRouter>
      <TrackingWrapper>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/onboarding" element={<Onboarding />} />
          {protectedPages.map(({ path, Component }) => (
            <Route
              key={path}
              path={path}
              element={
                <RequireProfile>
                  <AppLayout><Component /></AppLayout>
                </RequireProfile>
              }
            />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </TrackingWrapper>
    </BrowserRouter>
  );
}
