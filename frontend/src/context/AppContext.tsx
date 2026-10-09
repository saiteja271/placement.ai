import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student, User } from '../types';
import { api } from '../services/api';

export type ThemeId = 'lavender' | 'ocean' | 'sand' | 'midnight';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  tagline: string;
  primaryColor: string;
  badgeBg: string;
  canvasBg: string;
  cardBg: string;
  textColor: string;
  isDark: boolean;
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'lavender',
    name: 'Lavender Light',
    tagline: 'Default career-tech violet & crisp white',
    primaryColor: '#6557E8',
    badgeBg: '#EEEBFF',
    canvasBg: '#F8F9FC',
    cardBg: '#FFFFFF',
    textColor: '#20243A',
    isDark: false,
  },
  {
    id: 'ocean',
    name: 'Ocean Light',
    tagline: 'Deep ocean cyan & breezy clean slate',
    primaryColor: '#0284C7',
    badgeBg: '#E0F2FE',
    canvasBg: '#F1F6FA',
    cardBg: '#FFFFFF',
    textColor: '#0F172A',
    isDark: false,
  },
  {
    id: 'sand',
    name: 'Warm Sand',
    tagline: 'Elegant warm terracotta & cream paper',
    primaryColor: '#C25E3E',
    badgeBg: '#FBEFE8',
    canvasBg: '#FAF7F2',
    cardBg: '#FFFFFF',
    textColor: '#292524',
    isDark: false,
  },
  {
    id: 'midnight',
    name: 'Midnight Dark',
    tagline: 'Deep navy-charcoal with electric violet',
    primaryColor: '#7568FA',
    badgeBg: '#242254',
    canvasBg: '#0F1422',
    cardBg: '#181E30',
    textColor: '#F8FAFC',
    isDark: true,
  },
];

interface AppContextType {
  currentStudent: Student | null;
  studentsList: Student[];
  isLoadingStudent: boolean;
  theme: ThemeId;
  currentThemeConfig: ThemeConfig;
  setTheme: (theme: ThemeId) => void;
  cycleTheme: () => void;
  themesList: ThemeConfig[];
  selectStudent: (id: string) => void;
  refreshStudent: () => Promise<void>;
  isAgentDrawerOpen: boolean;
  openAgentDrawer: (prompt?: string) => void;
  closeAgentDrawer: () => void;
  agentInitialPrompt: string;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  // Auth & Roles
  currentUser: User | null;
  isAuthModalOpen: boolean;
  authModalInitialMode?: 'signin' | 'signup';
  openAuthModal: (mode?: 'signin' | 'signup' | any) => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: any) => Promise<User>;
  loginDemo: (role: 'student' | 'officer') => Promise<User>;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [studentsList, setStudentsList] = useState<Student[]>([]);
  const [isLoadingStudent, setIsLoadingStudent] = useState<boolean>(true);

  // Initialize theme from localStorage with Lavender Light as default
  const [theme, setThemeState] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('placemate_theme') as ThemeId | null;
    if (saved && ['lavender', 'ocean', 'sand', 'midnight'].includes(saved)) {
      return saved;
    }
    return 'lavender';
  });

  const [isAgentDrawerOpen, setIsAgentDrawerOpen] = useState<boolean>(false);
  const [agentInitialPrompt, setAgentInitialPrompt] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Apply theme attributes to document element
  const applyTheme = (themeId: ThemeId) => {
    document.documentElement.setAttribute('data-theme', themeId);
    if (themeId === 'midnight') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('placemate_theme', themeId);
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeId) => {
    setThemeState(newTheme);
  };

  const cycleTheme = () => {
    const currentIndex = THEMES.findIndex((t) => t.id === theme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    setTheme(THEMES[nextIndex].id);
  };

  const currentThemeConfig = THEMES.find((t) => t.id === theme) || THEMES[0];

  const loadStudents = async () => {
    try {
      setIsLoadingStudent(true);
      const list = await api.getStudents();
      setStudentsList(list);
      if (list.length > 0) {
        // Default to Teja (S001) or first student
        const defaultStudent = list.find((s) => s.id === 'S001') || list[0];
        setCurrentStudent(defaultStudent);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setIsLoadingStudent(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const selectStudent = async (id: string) => {
    try {
      setIsLoadingStudent(true);
      const student = await api.getStudent(id);
      setCurrentStudent(student);
    } catch (err) {
      console.error('Failed to select student:', err);
    } finally {
      setIsLoadingStudent(false);
    }
  };

  const refreshStudent = async () => {
    if (!currentStudent) return;
    try {
      const updated = await api.getStudent(currentStudent.id);
      setCurrentStudent(updated);
      const list = await api.getStudents();
      setStudentsList(list);
    } catch (err) {
      console.error('Failed to refresh student:', err);
    }
  };

  const openAgentDrawer = (prompt: string = '') => {
    setAgentInitialPrompt(prompt);
    setIsAgentDrawerOpen(true);
  };

  const closeAgentDrawer = () => {
    setIsAgentDrawerOpen(false);
    setAgentInitialPrompt('');
  };

  // User Authentication
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('placemate_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'signin' | 'signup'>('signin');

  const openAuthModal = (initialMode?: 'signin' | 'signup' | any) => {
    if (initialMode === 'signin' || initialMode === 'signup') {
      setAuthModalInitialMode(initialMode);
    } else {
      setAuthModalInitialMode('signin');
    }
    setIsAuthModalOpen(true);
  };
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const login = async (email: string, password: string): Promise<User> => {
    const user = await api.login(email, password);
    setCurrentUser(user);
    localStorage.setItem('placemate_auth_user', JSON.stringify(user));
    if (user.student_id) {
      selectStudent(user.student_id);
    }
    return user;
  };

  const register = async (payload: any): Promise<User> => {
    const user = await api.register(payload);
    setCurrentUser(user);
    localStorage.setItem('placemate_auth_user', JSON.stringify(user));
    if (user.student_id) {
      await loadStudents();
      selectStudent(user.student_id);
    }
    return user;
  };

  const loginDemo = async (role: 'student' | 'officer'): Promise<User> => {
    const user = await api.demoLogin(role);
    setCurrentUser(user);
    localStorage.setItem('placemate_auth_user', JSON.stringify(user));
    if (user.student_id) {
      selectStudent(user.student_id);
    }
    return user;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('placemate_auth_user');
  };

  useEffect(() => {
    if (!currentUser) {
      loginDemo('student').catch(() => {});
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentStudent,
        studentsList,
        isLoadingStudent,
        theme,
        currentThemeConfig,
        setTheme,
        cycleTheme,
        themesList: THEMES,
        selectStudent,
        refreshStudent,
        isAgentDrawerOpen,
        openAgentDrawer,
        closeAgentDrawer,
        agentInitialPrompt,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        currentUser,
        isAuthModalOpen,
        authModalInitialMode,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        loginDemo,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
