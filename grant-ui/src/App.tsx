import { useState } from 'react';
import LandingPage from './components/LandingPage';
import AdminLogin from './components/auth/AdminLogin';
import UserLogin from './components/auth/UserLogin';
import Dashboard from './Dashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'user' | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleRoleSelect = (role: 'admin' | 'user') => {
    setSelectedRole(role);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true); // Go to your dashboard!
  };

  // Show dashboard if logged in
  if (isLoggedIn) {
    return <Dashboard />;
  }

  // Show login flow if role selected  
  if (selectedRole === 'admin') {
    return <AdminLogin onRoleSuccess={handleLoginSuccess} />;
  }

  if (selectedRole === 'user') {
    return <UserLogin onLoginSuccess={handleLoginSuccess} />;
  }

  // Default: show landing page
  return <LandingPage onRoleSelect={handleRoleSelect} />;
}

export default App;
