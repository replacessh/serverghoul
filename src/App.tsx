import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import { store } from './store';
import { AuthProvider } from './contexts/AuthContext';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import theme from './theme';
import { SnackbarProvider } from 'notistack';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

const HomePage = React.lazy(() => import('./pages/HomePage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const ProductsPage = React.lazy(() => import('./pages/ProductsPage'));
const ProductDetails = React.lazy(() => import('./pages/ProductDetails'));
const AdminPage = React.lazy(() => import('./pages/AdminPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const CartPage = React.lazy(() => import('./pages/CartPage'));
const SupportPage = React.lazy(() => import('./pages/SupportPage'));
const AccessibilityPage = React.lazy(() => import('./pages/AccessibilityPage'));
const AdminProductEdit = React.lazy(() => import('./pages/AdminProductEdit'));

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider maxSnack={3}>
          <AuthProvider>
            <AccessibilityProvider>
              <Layout>
                <React.Suspense fallback={<div>Загрузка...</div>}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/products/:id" element={<ProductDetails />} />
                    <Route path="/support" element={<SupportPage />} />
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute adminOnly>
                          <AdminPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/cart"
                      element={
                        <ProtectedRoute>
                          <CartPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/accessibility" element={<AccessibilityPage />} />
                    <Route
                      path="/admin/products/:id/edit"
                      element={
                        <ProtectedRoute adminOnly>
                          <AdminProductEdit />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </React.Suspense>
              </Layout>
            </AccessibilityProvider>
          </AuthProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default App;