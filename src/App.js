
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';


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

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
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
            <Route index element={<Navigate to="dashboard" replace />} />
            </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
