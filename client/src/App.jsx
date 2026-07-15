import React, { useState, useEffect } from 'react';
import { GraduationCap, Bell, Activity, LogOut, Globe } from 'lucide-react';
import LandingPage from './components/LandingPage';
import LoginPortal from './components/LoginPortal';
import AdminDashboard from './components/AdminDashboard';
import FacultyDashboard from './components/FacultyDashboard';
import AIInsightsPanel from './components/AIInsightsPanel';
import NotificationPanel from './components/NotificationPanel';
import ChatbotWidget from './components/ChatbotWidget';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [role, setRole] = useState(localStorage.getItem('role') || '');

  // Navigation states
  const [view, setView] = useState('marketing'); // 'marketing' | 'dashboard'
  const [showLogin, setShowLogin] = useState(false);
  const [activeTab, setActiveTab] = useState(''); // depends on role
  const [notifOpen, setNotifOpen] = useState(false);
  const [aiReloadTrigger, setAiReloadTrigger] = useState(0);

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Database Connected', desc: 'Secure connection established to backend API.', time: '10 mins ago', read: false },
    { id: 2, title: 'AI Engine Initialized', desc: 'Predictive modeling analytics verified.', time: '5 mins ago', read: false }
  ]);

  const addNotif = (title, desc) => {
    const newNotif = {
      id: notifications.length + 1,
      title,
      desc,
      time: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotifRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          handleLogout();
        }
        return Promise.reject(error);
      }
    );
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  useEffect(() => {
    if (token && user) {
      setView('dashboard');
      setActiveTab(role === 'admin' ? 'admin-overview' : 'faculty-attendance');
    }
  }, [token, user]);

  const handleLoginSuccess = (userToken, userDetails, userRole) => {
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userDetails));
    localStorage.setItem('role', userRole);

    setToken(userToken);
    setUser(userDetails);
    setRole(userRole);
    setShowLogin(false);
    setView('dashboard');
    setActiveTab(userRole === 'admin' ? 'admin-overview' : 'faculty-attendance');

    addNotif('Auth Successful', `Successfully logged in as ${userDetails.name || 'Administrator'}.`);
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken('');
    setUser(null);
    setRole('');
    setView('marketing');
  };

  const handleTriggerReloadAi = () => {
    setAiReloadTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-bgbase">

      {view === 'marketing' && (
        <LandingPage onLaunchPortal={() => setShowLogin(true)} />
      )}

      {showLogin && (
        <LoginPortal
          API_BASE_URL={API_BASE_URL}
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setShowLogin(false)}
        />
      )}

      {view === 'dashboard' && user && (
        <div className="flex min-h-screen relative">

          {/* Sidebar */}
          <aside className="w-[280px] border-r border-glassBorder bg-glass backdrop-blur-md flex flex-col fixed top-0 bottom-0 z-50">
            <div className="p-6 border-b border-glassBorder">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primaryIndigo to-secondaryTeal rounded-lg text-white p-2">
                  <GraduationCap size={20} />
                </div>
                <span className="text-lg font-extrabold tracking-tight">UniSmart</span>
              </div>

              {/* User badge card */}
              <div className="flex items-center gap-3 bg-white/2 border border-glassBorder p-3.5 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primaryIndigo to-accentPurple text-white flex items-center justify-center font-bold text-sm">
                  {user.name ? user.name.charAt(0) : 'A'}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-[11px] font-bold text-white truncate">{user.name || 'Super Admin'}</h4>
                  <p className="text-[9px] font-semibold text-textSecondary uppercase tracking-wider mt-0.5">{role === 'admin' ? 'Super Admin' : 'Department Faculty'}</p>
                </div>
              </div>
            </div>

            {/* Sidebar Navigation items */}
            <nav className="flex-1 py-6 px-4 flex flex-col gap-1.5">
              {role === 'admin' ? (
                <>
                  <button
                    onClick={() => setActiveTab('admin-overview')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all ${activeTab === 'admin-overview'
                      ? 'bg-primaryIndigo/10 text-primaryIndigo border-l-[3px] border-primaryIndigo pl-3'
                      : 'text-textSecondary hover:bg-white/2 hover:text-white'
                      }`}
                  >
                    Dashboard Overview
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setActiveTab('faculty-attendance')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all ${activeTab === 'faculty-attendance'
                      ? 'bg-primaryIndigo/10 text-primaryIndigo border-l-[3px] border-primaryIndigo pl-3'
                      : 'text-textSecondary hover:bg-white/2 hover:text-white'
                      }`}
                  >
                    Class Attendance
                  </button>
                  <button
                    onClick={() => setActiveTab('faculty-gradebook')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all ${activeTab === 'faculty-gradebook'
                      ? 'bg-primaryIndigo/10 text-primaryIndigo border-l-[3px] border-primaryIndigo pl-3'
                      : 'text-textSecondary hover:bg-white/2 hover:text-white'
                      }`}
                  >
                    Gradebook (Marks)
                  </button>
                  <button
                    onClick={() => setActiveTab('faculty-ai-insights')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all ${activeTab === 'faculty-ai-insights'
                      ? 'bg-primaryIndigo/10 text-primaryIndigo border-l-[3px] border-primaryIndigo pl-3'
                      : 'text-textSecondary hover:bg-white/2 hover:text-white'
                      }`}
                  >
                    AI Insights Engine
                  </button>
                </>
              )}
            </nav>

            <div className="p-4 border-t border-glassBorder">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-glassBorder bg-white/2 text-xs font-semibold text-textSecondary hover:text-white hover:bg-white/5 transition-all"
              >
                <LogOut size={14} />
                <span>Exit Portal</span>
              </button>
            </div>
          </aside>

          {/* Main dashboard content */}
          <main className="flex-1 pl-[280px] min-h-screen flex flex-col">

            {/* Top Bar Header */}
            <header className="h-[80px] px-10 flex justify-between items-center border-b border-glassBorder sticky top-0 bg-bgbase/90 backdrop-blur-md z-45">
              <div>
                <h1 className="text-lg font-extrabold text-white capitalize">
                  {activeTab.replace('-', ' ')}
                </h1>
                <p className="text-[10px] text-textSecondary mt-0.5">
                  {role === 'admin' ? 'Super Admin Administration Panel' : `Instructor Roster: ${user.department || 'Computer Science'}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="w-10 h-10 rounded-lg bg-white/2 border border-glassBorder text-textSecondary hover:text-white flex items-center justify-center transition-colors">
                  <Activity size={16} />
                </button>

                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="w-10 h-10 rounded-lg bg-white/2 border border-glassBorder text-textSecondary hover:text-white flex items-center justify-center transition-colors relative"
                >
                  <Bell size={16} />
                  {unreadNotifCount > 0 && (
                    <span className="w-2.5 h-2.5 bg-dangerRed border-2 border-bgbase rounded-full absolute top-2 right-2 animate-bounce"></span>
                  )}
                </button>

                <button
                  onClick={() => setView('marketing')}
                  className="bg-white/5 border border-glassBorder text-xs text-textSecondary hover:text-white px-4 py-2 rounded-lg flex items-center gap-1.5 hover:bg-white/10 transition-all font-semibold"
                >
                  <Globe size={14} />
                  <span>Lobby</span>
                </button>
              </div>
            </header>

            {/* Tab Viewport */}
            <div className="p-10 flex-1">
              {activeTab === 'admin-overview' && (
                <AdminDashboard
                  token={token}
                  API_BASE_URL={API_BASE_URL}
                  onLogout={handleLogout}
                  addNotif={addNotif}
                />
              )}
              {activeTab === 'faculty-attendance' && (
                <FacultyDashboard
                  token={token}
                  API_BASE_URL={API_BASE_URL}
                  addNotif={addNotif}
                  triggerReloadAi={handleTriggerReloadAi}
                  user={user}
                  mode="attendance"
                />
              )}
              {activeTab === 'faculty-gradebook' && (
                <FacultyDashboard
                  token={token}
                  API_BASE_URL={API_BASE_URL}
                  addNotif={addNotif}
                  triggerReloadAi={handleTriggerReloadAi}
                  user={user}
                  mode="gradebook"
                />
              )}
              {activeTab === 'faculty-ai-insights' && (
                <AIInsightsPanel
                  token={token}
                  API_BASE_URL={API_BASE_URL}
                  reloadTrigger={aiReloadTrigger}
                />
              )}
            </div>

          </main>

          {/* Slide-out notification drawer */}
          {notifOpen && (
            <NotificationPanel
              notifications={notifications}
              onClose={() => setNotifOpen(false)}
              onMarkRead={markNotifRead}
            />
          )}

        </div>
      )}

      {/* Globally accessible AI Academic Assistant Chatbot */}
      <ChatbotWidget
        user={user}
        role={role}
        token={token}
        API_BASE_URL={API_BASE_URL}
      />

    </div>
  );
}
