import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence } from 'framer-motion';
import { loadMe } from './store/slices/authSlice.js';
import { connectSocket } from './lib/socket.js';
import { AppLayout } from './components/layout/AppLayout.jsx';
import { Landing } from './pages/Landing.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { MyFiles } from './pages/MyFiles.jsx';
import { SharedFiles } from './pages/SharedFiles.jsx';
import { Workspace } from './pages/Workspace.jsx';
import { Analytics } from './pages/Analytics.jsx';
import { Settings } from './pages/Settings.jsx';
import { Admin } from './pages/Admin.jsx';
import { PublicShare } from './pages/PublicShare.jsx';

function Protected({ children }) {
  const { user } = useSelector((s) => s.auth);
  return user ? children : <Navigate to="/login" replace />;
}

export function App() {
  const dispatch = useDispatch();
  const { user, accessToken } = useSelector((s) => s.auth);
  const theme = useSelector((s) => s.theme.mode);
  useEffect(() => { dispatch(loadMe()).catch(() => {}); }, [dispatch]);
  useEffect(() => { if (accessToken) connectSocket(accessToken, dispatch); }, [accessToken, dispatch]);
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
        <Route path="/share/:token" element={<PublicShare />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<Protected><AppLayout /></Protected>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/files" element={<MyFiles />} />
          <Route path="/shared" element={<SharedFiles />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}