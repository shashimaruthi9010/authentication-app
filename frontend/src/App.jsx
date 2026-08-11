import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import Login      from './pages/Login';
import Signup     from './pages/Signup';
import Dashboard  from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import FoodDiary  from './pages/FoodDiary';
import Symptoms   from './pages/Symptoms';
import LabResults from './pages/LabResults';
import Assessment from './pages/Assessment';
import MealPlan   from './pages/MealPlan';
import Progress   from './pages/Progress';
import AppShell   from './components/AppShell';
import { isProfileComplete } from './utils/profile';

/**
 * DashboardRoute — requires auth and a completed health profile.
 */
function DashboardRoute({ children }) {
  const token = localStorage.getItem('access_token');
  if (!token) return <Navigate to="/login" replace />;
  if (!isProfileComplete()) return <Navigate to="/onboarding" replace />;
  return children;
}

/**
 * OnboardingRoute — requires auth; skips onboarding if profile is already complete.
 */
function OnboardingRoute({ children }) {
  const token = localStorage.getItem('access_token');
  if (!token) return <Navigate to="/login" replace />;
  if (isProfileComplete()) return <Navigate to="/dashboard" replace />;
  return children;
}

/**
 * PublicRoute — redirects authenticated users away from auth pages.
 */
function PublicRoute({ children }) {
  const token = localStorage.getItem('access_token');
  if (token) {
    return isProfileComplete()
      ? <Navigate to="/dashboard" replace />
      : <Navigate to="/onboarding" replace />;
  }
  return children;
}

/**
 * ProtectedLayout — wraps every authenticated screen in the app shell.
 */
function ProtectedLayout() {
  const location = useLocation();
  const topbarId = location.pathname === '/dashboard' ? 'dashboard-navbar' : undefined;
  return (
    <AppShell topbarId={topbarId}>
      <Outlet />
    </AppShell>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default → redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public auth routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />

        {/* Health profile onboarding */}
        <Route
          path="/onboarding"
          element={
            <OnboardingRoute>
              <Onboarding />
            </OnboardingRoute>
          }
        />

        {/* Protected product routes */}
        <Route element={<DashboardRoute><ProtectedLayout /></DashboardRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/food-diary" element={<FoodDiary />} />
          <Route path="/symptoms" element={<Symptoms />} />
          <Route path="/lab-results" element={<LabResults />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/meal-plan" element={<MealPlan />} />
          <Route path="/progress" element={<Progress />} />
        </Route>

        {/* Catch-all → redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
