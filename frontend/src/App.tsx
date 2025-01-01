import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import Layout from './components/layout/Layout';
import PrivateRoute from './components/auth/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Goals from './pages/Goals';
import Wellness from './pages/Wellness';
import Community from './pages/Community';
import Finance from './pages/Finance';
import { RootState } from './store';
import { connectWebSocket, disconnectWebSocket } from './store/slices/websocketSlice';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Connect to WebSocket when user is authenticated
    if (isAuthenticated && user) {
      dispatch(connectWebSocket(user.id));
    }

    // Cleanup WebSocket connection on unmount or when user logs out
    return () => {
      if (isAuthenticated) {
        dispatch(disconnectWebSocket());
      }
    };
  }, [isAuthenticated, user, dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout>
                  <Routes>
                    <Route index element={<Dashboard />} />
                    <Route path="chat" element={<Chat />} />
                    <Route path="goals" element={<Goals />} />
                    <Route path="wellness" element={<Wellness />} />
                    <Route path="community" element={<Community />} />
                    <Route path="finance" element={<Finance />} />
                    <Route path="profile" element={<Profile />} />
                  </Routes>
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
