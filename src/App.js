
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import theme from './theme';


import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

import Categories from './pages/Categories';
import Products from './pages/Products';
import Business from './pages/Business';
import Layout from './components/Layout';
import User from './pages/User';
import PlaceOrder from './pages/PlaceOrder';
import Orders from './pages/Orders';
import FAQ from './pages/FAQ';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Admins from './pages/Admins';
import Announcements from './pages/Announcements';
import Landing from './pages/Landing';


function RequireAuth({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* At the top so every screen, including login, can show messages */}
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
      <Router>
        <Routes>
          {/* Public: the eMall landing page and sign-in */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          {/* Admin pages need a session; without one, go to sign-in */}
          <Route element={<RequireAuth><Layout /></RequireAuth>}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="businesses" element={<Business />} />
            <Route path="categories" element={<Categories />} />
            <Route path="products" element={<Products />} />
            <Route path="users" element={<User />} />
            <Route path="place-order" element={<PlaceOrder />} />
            <Route path="orders" element={<Orders />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="admins" element={<Admins />} />
            <Route path="announcements" element={<Announcements />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
