import './App.css';
import {
  BrowserRouter,
  Route,
  Routes
} from 'react-router-dom';
import { Toaster } from 'sonner';
import Login from './components/pages/Login';
import SignUp from './components/pages/SignUp';
import Dashboard from './components/pages/Dashboard';
import { AuthProvider } from './services/context/AuthContext';
import ForgotPassword from './components/pages/ForgotPassword';
import ChangePassword from './components/pages/ChangePassword';
import ProtectedRoute from './components/routes/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        richColors
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App;