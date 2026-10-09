import React, { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  Briefcase,
  MapPin,
  Calendar,
  Award,
  BookOpen,
  Code2,
  Edit3,
  X,
  Save,
  CheckCircle2,
  AlertCircle,
  FileText,
  UploadCloud,
  Plus,
  RefreshCw,
  FolderGit2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export const ProfilePage: React.FC = () => {
  const { currentStudent, refreshStudent } = useApp();

  // Mode: Read-Only by default
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [degree, setDegree] = useState('B.Tech');
  const [branch, setBranch] = useState('Information Technology');
  const [graduationYear, setGraduationYear] = useState(2027);
  const [cgpa, setCgpa] = useState('8.2');
  const [backlogs, setBacklogs] = useState('0');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [preferredRole, setPreferredRole] = useState('Software Development Engineer');
  const [preferredLocation, setPreferredLocation] = useState('Hyderabad');
  const [projects, setProjects] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state from current student
  const resetFormFromStudent = () => {
    if (currentStudent) {
      setFullName(currentStudent.full_name || '');
      setEmail(currentStudent.email || '');
      setDegree(currentStudent.degree || 'B.Tech');
      setBranch(currentStudent.branch || '');
      setGraduationYear(currentStudent.graduation_year || 2027);
      setCgpa(currentStudent.cgpa !== undefined ? currentStudent.cgpa.toString() : '8.2');
      setBacklogs(currentStudent.backlogs !== undefined ? currentStudent.backlogs.toString() : '0');
      setSkills(currentStudent.skills || []);
      setPreferredRole(currentStudent.preferred_role || '');
      setPreferredLocation(currentStudent.preferred_location || '');
      setProjects(currentStudent.projects || '');
    }
  };

  useEffect(() => {
    resetFormFromStudent();
  }, [currentStudent]);

  const handleCancelEdit = () => {
    resetFormFromStudent();
    setErrorMessage(null);
    setIsEditing(false);
  };

  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newSkill.trim();
    if (trimmed && !skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkills([...skills, trimmed]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Field-level validation
    if (!fullName.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }
    const parsedCgpa = parseFloat(cgpa);
    if (isNaN(parsedCgpa) || parsedCgpa < 0 || parsedCgpa > 10) {
      setErrorMessage('CGPA must be a valid number between 0.0 and 10.0.');
      return;
    }
    const parsedBacklogs = parseInt(backlogs, 10);
    if (isNaN(parsedBacklogs) || parsedBacklogs < 0) {
      setErrorMessage('Backlogs must be a non-negative integer.');
      return;
    }

    if (!currentStudent) return;

    setIsSaving(true);
    try {
      await api.updateStudent(currentStudent.id, {
        full_name: fullName.trim(),
        email: email.trim(),
        degree,
        branch: branch.trim(),
        graduation_year: Number(graduationYear),
        cgpa: parsedCgpa,
        backlogs: parsedBacklogs,
        skills,
        preferred_role: preferredRole.trim(),
        preferred_location: preferredLocation.trim(),
        projects: projects.trim(),
      });
      await refreshStudent();
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully and saved to database!');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update student profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentStudent) {
    return <div className="p-8 text-center text-muted text-xs">Loading candidate profile...</div>;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-theme shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary-app text-white flex items-center justify-center font-extrabold text-xl sm:text-2xl shadow-subtle shrink-0">
            {currentStudent.full_name ? currentStudent.full_name.charAt(0) : 'S'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
                {currentStudent.full_name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-surface-tint text-primary-app border border-theme">
                CGPA {currentStudent.cgpa}
              </span>
            </div>
            <p className="text-xs text-muted mt-1 flex items-center gap-2 flex-wrap">
              <span>{currentStudent.branch || 'Branch Not Set'}</span>
              <span>·</span>
              <span>Class of {currentStudent.graduation_year}</span>
              <span>·</span>
              <span>{currentStudent.email}</span>
            </p>
          </div>
        </div>

        {/* Edit / View Mode Toggle Action Button */}
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-primary-app hover:opacity-90 text-white text-xs font-bold rounded-xl shadow-subtle transition-opacity flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <button
            onClick={handleCancelEdit}
            className="px-4 py-2 bg-canvas hover:bg-surface text-ink text-xs font-bold rounded-xl border border-theme transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        )}
      </div>

      {/* Notification Alerts */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2 shadow-subtle">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2 shadow-subtle">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* MODE 1: READ-ONLY STRUCTURED PROFILE VIEW */}
      {!isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Academic & Career Credentials */}
          <div className="md:col-span-1 space-y-6">
            {/* Academic Credentials Card */}
            <div className="p-5 rounded-2xl bg-surface border border-theme shadow-subtle space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-primary-app" />
                <span>Academic Record</span>
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-muted block text-[11px]">Degree & Major</span>
                  <span className="font-bold text-ink">
                    {currentStudent.degree || 'B.Tech'} in {currentStudent.branch || 'Not Specified'}
                  </span>
                </div>

                <div>
                  <span className="text-muted block text-[11px]">Cumulative GPA</span>
                  <span className="font-extrabold text-primary-app text-sm">
                    {currentStudent.cgpa} / 10.0
                  </span>
                </div>

                <div>
                  <span className="text-muted block text-[11px]">Graduation Year</span>
                  <span className="font-bold text-ink">{currentStudent.graduation_year}</span>
                </div>

                <div>
                  <span className="text-muted block text-[11px]">Active Academic Backlogs</span>
                  <span className={`font-bold inline-block px-2 py-0.5 rounded text-[11px] ${
                    currentStudent.backlogs === 0
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-800'
                  }`}>
                    {currentStudent.backlogs} Active Backlog(s)
                  </span>
                </div>
              </div>
            </div>

            {/* Career Target Card */}
            <div className="p-5 rounded-2xl bg-surface border border-theme shadow-subtle space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-primary-app" />
                <span>Placement Targets</span>
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-muted block text-[11px]">Target Role</span>
                  <span className="font-bold text-ink">
                    {currentStudent.preferred_role || 'Software Development Engineer'}
                  </span>
                </div>

                <div>
                  <span className="text-muted block text-[11px]">Preferred Location</span>
                  <span className="font-bold text-ink">
                    {currentStudent.preferred_location || 'Hyderabad'}
                  </span>
                </div>

                <div>
                  <span className="text-muted block text-[11px]">Experience Level</span>
                  <span className="font-bold text-ink">
                    {currentStudent.experience_level || 'Fresher'}
                  </span>
                </div>
              </div>
            </div>

            {/* Resume Verification Status Card */}
            <div className="p-5 rounded-2xl bg-surface border border-theme shadow-subtle space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-primary-app" />
                <span>Resume Document</span>
              </h4>

              <div className="p-3 rounded-xl bg-canvas border border-theme flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-ink block truncate max-w-[150px]">
                    {currentStudent.resume_filename || 'teja_resume_v1.pdf'}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Indexed by Agent
                  </span>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-2.5 py-1 bg-surface border border-theme text-primary-app text-[11px] font-bold rounded-lg hover:bg-surface-tint transition-colors cursor-pointer"
                >
                  Replace
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Skills & Project Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Skills Inventory Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-theme shadow-subtle space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-primary-app" />
                  <span>Technical Skills & Competencies</span>
                </h4>
                <span className="text-xs font-bold text-primary-app bg-surface-tint px-2.5 py-0.5 rounded-full border border-theme">
                  {currentStudent.skills.length} Validated Skills
                </span>
              </div>

              {currentStudent.skills && currentStudent.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {currentStudent.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-xl text-xs font-semibold bg-canvas text-ink border border-theme shadow-2xs hover:border-primary-app/60 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-muted bg-canvas rounded-xl border border-theme">
                  No technical skills added yet. Click <strong>Edit Profile</strong> to add programming languages and frameworks.
                </div>
              )}
            </div>

            {/* Projects & Portfolio Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-theme shadow-subtle space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <FolderGit2 className="w-4 h-4 text-primary-app" />
                <span>Featured Projects & Engineering Work</span>
              </h4>

              {currentStudent.projects ? (
                <div className="space-y-3">
                  {currentStudent.projects.split(';').map((proj, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-canvas border border-theme space-y-1 text-xs"
                    >
                      <h5 className="font-bold text-ink">
                        {proj.trim()}
                      </h5>
                      <p className="text-[11px] text-muted">
                        Demonstrated engineering project evaluated during campus placement eligibility checks.
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-muted bg-canvas rounded-xl border border-theme">
                  No projects documented yet. Highlight your capstone or GitHub repositories here.
                </div>
              )}
            </div>

            {/* Agent Eligibility Match Recommendation */}
            <div className="p-5 rounded-2xl bg-surface-tint border border-theme space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-primary-app" />
                  <span>Profile Placement Health</span>
                </span>
                <span className="text-xs font-extrabold text-primary-app">
                  Verified Candidate
                </span>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Your profile information is deterministically matched against all active campus hiring criteria. Mandatory eligibility gates (CGPA cutoffs, branch restrictions, and backlog thresholds) are verified without hallucination.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* MODE 2: EXPLICIT EDIT PROFILE FORM */
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-theme shadow-subtle space-y-5">
            <div className="flex items-center justify-between border-b border-theme pb-3">
              <h3 className="text-base font-bold text-ink">
                Edit Candidate Information
              </h3>
              <span className="text-xs text-muted">
                * Required fields
              </span>
            </div>

            {/* Personal Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-canvas border border-theme rounded-xl px-3.5 py-2 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-primary-app"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-canvas border border-theme rounded-xl px-3.5 py-2 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-primary-app"
                />
              </div>
            </div>

            {/* Academic Information */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">Degree</label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full bg-canvas border border-theme rounded-xl px-3.5 py-2 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-primary-app"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">Branch / Major *</label>
                <input
                  type="text"
                  required
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full bg-canvas border border-theme rounded-xl px-3.5 py-2 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-primary-app"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">Graduation Year *</label>
                <input
                  type="number"
                  required
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(Number(e.target.value))}
                  className="w-full bg-canvas border border-theme rounded-xl px-3.5 py-2 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-primary-app"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">CGPA (0.0 - 10.0) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  required
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  className="w-full bg-canvas border border-theme rounded-xl px-3.5 py-2 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-primary-app"
                />
              </div>
            </div>

            {/* Backlogs & Targets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">Active Backlogs *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={backlogs}
                  onChange={(e) => setBacklogs(e.target.value)}
                  className="w-full bg-canvas border border-theme rounded-xl px-3.5 py-2 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-primary-app"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">Target Role</label>
                <input
                  type="text"
                  value={preferredRole}
                  onChange={(e) => setPreferredRole(e.target.value)}
                  className="w-full bg-canvas border border-theme rounded-xl px-3.5 py-2 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-primary-app"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">Preferred Location</label>
                <input
                  type="text"
                  value={preferredLocation}
                  onChange={(e) => setPreferredLocation(e.target.value)}
                  className="w-full bg-canvas border border-theme rounded-xl px-3.5 py-2 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-primary-app"
                />
              </div>
            </div>

            {/* Technical Skills Editor */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-ink">Technical Skills</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add skill (e.g. React, Kubernetes, Pandas)..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  className="flex-1 bg-canvas border border-theme rounded-xl px-3.5 py-2 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-primary-app"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-surface-tint border border-theme text-primary-app hover:bg-primary-app hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-canvas text-ink border border-theme flex items-center gap-1.5"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-muted hover:text-red-500 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Projects Editor */}
            <div className="space-y-1 pt-2">
              <label className="text-xs font-bold text-ink">Projects (Semicolon-separated)</label>
              <textarea
                rows={3}
                value={projects}
                onChange={(e) => setProjects(e.target.value)}
                placeholder="e.g. PlaceMate AI Assistant; Scalable Microservices API; Analytics Dashboard"
                className="w-full bg-canvas border border-theme rounded-xl p-3 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-primary-app leading-relaxed"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-theme flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="px-4 py-2.5 bg-canvas hover:bg-surface text-ink text-xs font-bold rounded-xl border border-theme transition-colors cursor-pointer"
              >
                Discard Changes
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 bg-primary-app hover:opacity-90 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-subtle transition-opacity flex items-center gap-1.5 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
