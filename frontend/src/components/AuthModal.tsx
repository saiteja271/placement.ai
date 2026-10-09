import React, { useState } from 'react';
import {
  X,
  UserCheck,
  ShieldAlert,
  GraduationCap,
  Briefcase,
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  Building,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, currentUser, login, register, loginDemo, logout, authModalInitialMode } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup'>(authModalInitialMode || 'signin');
  const [role, setRole] = useState<'student' | 'officer'>('student');

  React.useEffect(() => {
    if (isAuthModalOpen && authModalInitialMode) {
      setMode(authModalInitialMode);
    }
  }, [isAuthModalOpen, authModalInitialMode]);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [institution, setInstitution] = useState('National Institute of Technology');
  // Student
  const [branch, setBranch] = useState('Information Technology');
  const [graduationYear, setGraduationYear] = useState('2027');
  const [cgpa, setCgpa] = useState('8.2');
  const [skills, setSkills] = useState('Python, Java, SQL, Git');
  // Officer
  const [designation, setDesignation] = useState('Head of Training & Placement');
  const [department, setDepartment] = useState('Training & Placement Cell');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleDemoLogin = async (targetRole: 'student' | 'officer') => {
    setIsLoading(true);
    setError(null);
    try {
      await loginDemo(targetRole);
      setSuccess(`Logged in successfully as ${targetRole === 'student' ? 'Student Demo (Teja)' : 'Placement Officer Demo (Dr. Ramesh Kumar)'}!`);
      setTimeout(() => {
        closeAuthModal();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'signin') {
        if (!email.trim() || !password.trim()) {
          throw new Error('Please enter both email and password.');
        }
        await login(email.trim(), password.trim());
        setSuccess('Signed in successfully!');
        setTimeout(() => closeAuthModal(), 700);
      } else {
        if (!fullName.trim() || !email.trim() || !password.trim()) {
          throw new Error('Please fill in all required fields.');
        }

        const payload: any = {
          role,
          email: email.trim(),
          password: password.trim(),
          full_name: fullName.trim(),
          institution: institution.trim(),
        };

        if (role === 'student') {
          payload.branch = branch;
          payload.graduation_year = Number(graduationYear) || 2027;
          payload.cgpa = parseFloat(cgpa) || 8.0;
          payload.skills = skills.split(',').map((s) => s.trim()).filter(Boolean);
        } else {
          payload.designation = designation;
          payload.department = department;
        }

        const user = await register(payload);
        if (user.role === 'officer' && user.verification_status === 'pending') {
          setSuccess('Officer account registered! Verification is pending for your institution domain.');
        } else {
          setSuccess('Account created and signed in successfully!');
        }
        setTimeout(() => closeAuthModal(), 1200);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-surface border border-theme rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-theme flex items-center justify-between bg-surface-tint">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-primary-app text-white flex items-center justify-center font-extrabold text-xs">
                P
              </span>
              <h3 className="text-base font-bold text-ink">
                PlaceMate AI Account Portal
              </h3>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Role-based access for Students and Placement Officers
            </p>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-canvas transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Hackathon Judge Quick Start Banner */}
          <div className="p-3.5 rounded-xl bg-canvas border border-theme space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-primary-app uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Hackathon Judges · One-Click Demo Accounts</span>
              </span>
              <span className="text-[10px] bg-surface px-2 py-0.5 rounded font-mono text-muted border border-theme">
                Instant Access
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleDemoLogin('student')}
                disabled={isLoading}
                className="p-2.5 rounded-xl border border-primary-app/40 bg-surface hover:bg-primary-app hover:text-white text-ink text-left transition-all cursor-pointer shadow-subtle group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-1.5 group-hover:text-white">
                    <GraduationCap className="w-3.5 h-3.5 text-primary-app group-hover:text-white" />
                    Student Demo
                  </span>
                  <ArrowRight className="w-3 h-3 text-muted group-hover:text-white" />
                </div>
                <p className="text-[10px] text-muted group-hover:text-white/80 mt-1">
                  Teja (IT, 8.2 CGPA) · Matches & Prep
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('officer')}
                disabled={isLoading}
                className="p-2.5 rounded-xl border border-primary-app/40 bg-surface hover:bg-primary-app hover:text-white text-ink text-left transition-all cursor-pointer shadow-subtle group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-1.5 group-hover:text-white">
                    <Briefcase className="w-3.5 h-3.5 text-primary-app group-hover:text-white" />
                    Officer Demo
                  </span>
                  <ArrowRight className="w-3 h-3 text-muted group-hover:text-white" />
                </div>
                <p className="text-[10px] text-muted group-hover:text-white/80 mt-1">
                  Dr. Ramesh · Directory & Drive Portal
                </p>
              </button>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-theme text-xs font-bold">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(null); }}
              className={`pb-2.5 px-4 cursor-pointer transition-all border-b-2 ${
                mode === 'signin'
                  ? 'border-primary-app text-primary-app'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              Sign In to Existing Account
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              className={`pb-2.5 px-4 cursor-pointer transition-all border-b-2 ${
                mode === 'signup'
                  ? 'border-primary-app text-primary-app'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              Create New Account
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {mode === 'signup' && (
              <>
                {/* Role Switcher */}
                <div className="space-y-1">
                  <label className="font-bold text-ink">Account Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        role === 'student'
                          ? 'border-primary-app bg-surface-tint text-primary-app font-bold'
                          : 'border-theme bg-canvas text-muted hover:text-ink'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4" />
                        <span>Student</span>
                      </div>
                      <p className="text-[10px] text-muted mt-0.5">Explore jobs & mock prep</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('officer')}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        role === 'officer'
                          ? 'border-primary-app bg-surface-tint text-primary-app font-bold'
                          : 'border-theme bg-canvas text-muted hover:text-ink'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4" />
                        <span>Placement Officer</span>
                      </div>
                      <p className="text-[10px] text-muted mt-0.5">Manage drives & directory</p>
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-ink">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={role === 'student' ? 'e.g. Teja Reddy' : 'e.g. Dr. Ramesh Kumar'}
                    className="w-full bg-canvas border border-theme rounded-xl px-3 py-2 text-ink focus:outline-none focus:ring-1 focus:ring-primary-app"
                  />
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="font-bold text-ink">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={mode === 'signin' ? 'student@placemate.ai' : role === 'student' ? 'student@example.com' : 'officer@nit.ac.in'}
                className="w-full bg-canvas border border-theme rounded-xl px-3 py-2 text-ink focus:outline-none focus:ring-1 focus:ring-primary-app"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-ink">Password *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-canvas border border-theme rounded-xl px-3 py-2 text-ink focus:outline-none focus:ring-1 focus:ring-primary-app"
              />
            </div>

            {mode === 'signup' && role === 'student' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="font-bold text-ink">Branch / Major</label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full bg-canvas border border-theme rounded-xl px-3 py-2 text-ink"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-ink">CGPA</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    className="w-full bg-canvas border border-theme rounded-xl px-3 py-2 text-ink"
                  />
                </div>
              </div>
            )}

            {mode === 'signup' && role === 'officer' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="font-bold text-ink">Official Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full bg-canvas border border-theme rounded-xl px-3 py-2 text-ink"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-ink">Department / Cell</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-canvas border border-theme rounded-xl px-3 py-2 text-ink"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-primary-app hover:opacity-90 disabled:opacity-50 text-white font-bold rounded-xl shadow-subtle transition-opacity cursor-pointer flex items-center justify-center gap-1.5 mt-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{mode === 'signin' ? 'Sign In' : 'Create PlaceMate Account'}</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
