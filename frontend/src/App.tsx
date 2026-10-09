import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileDrawer } from './components/MobileDrawer';
import { AgentDrawer } from './components/AgentDrawer';
import { AuthModal } from './components/AuthModal';

// Student Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { JobMatchesPage } from './pages/JobMatchesPage';
import { JobDetailPage } from './pages/JobDetailPage';
import { SkillAnalysisPage } from './pages/SkillAnalysisPage';
import { InterviewPrepPage } from './pages/InterviewPrepPage';
import { MockInterviewPage } from './pages/MockInterviewPage';
import { LearningBotPage } from './pages/LearningBotPage';
import { SavedJobsPage } from './pages/SavedJobsPage';
import { SettingsPage } from './pages/SettingsPage';

// Placement Officer Pages
import { OfficerDashboardPage } from './pages/OfficerDashboardPage';
import { OfficerStudentsPage } from './pages/OfficerStudentsPage';
import { OfficerDrivesPage } from './pages/OfficerDrivesPage';
import { OfficerAnalyticsPage } from './pages/OfficerAnalyticsPage';

const AppLayout: React.FC = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-canvas text-ink transition-colors">
      {/* Desktop Fixed Stationary Sidebar */}
      <div className="hidden md:block shrink-0 h-full">
        <Sidebar />
      </div>

      {/* Main Responsive Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden pb-16 md:pb-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile Slide-over Navigation Drawer */}
      <MobileDrawer />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Standalone Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Authenticated / Application Views */}
          <Route element={<AppLayout />}>
            {/* Student Navigation */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/jobs" element={<JobMatchesPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />
            <Route path="/skills" element={<SkillAnalysisPage />} />
            <Route path="/prep" element={<InterviewPrepPage />} />
            <Route path="/mock-interview" element={<MockInterviewPage />} />
            <Route path="/tutor" element={<LearningBotPage />} />
            <Route path="/saved" element={<SavedJobsPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* Placement Officer Navigation */}
            <Route path="/officer" element={<OfficerDashboardPage />} />
            <Route path="/officer/students" element={<OfficerStudentsPage />} />
            <Route path="/officer/drives" element={<OfficerDrivesPage />} />
            <Route path="/officer/analytics" element={<OfficerAnalyticsPage />} />
          </Route>
        </Routes>

        {/* Global Agent Drawer & Auth Modal accessible across both Landing Page and In-App views */}
        <AgentDrawer />
        <AuthModal />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
