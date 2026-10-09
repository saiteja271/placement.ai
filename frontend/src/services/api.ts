import {
  Student, Job, EligibilityResult, SkillGapAnalysis,
  PrepPlan, MockSession, AgentQueryResponse, TutorChatResponse
} from '../types';

const API_BASE = '/api';

export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let errorDetail = `Request failed: ${res.status} ${res.statusText}`;
    try {
      const errorJson = await res.json();
      if (errorJson.detail) errorDetail = errorJson.detail;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  return res.json();
}

export const api = {
  // Students
  getStudents: () => fetchJson<Student[]>('/students'),
  getStudent: (id: string) => fetchJson<Student>(`/students/${id}`),
  createStudent: (data: Partial<Student>) =>
    fetchJson<Student>('/students', { method: 'POST', body: JSON.stringify(data) }),
  updateStudent: (id: string, data: Partial<Student>) =>
    fetchJson<Student>(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Jobs
  getJobs: (params?: { search?: string; work_mode?: string; location?: string; eligibility_filter?: string; student_id?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.work_mode) query.append('work_mode', params.work_mode);
    if (params?.location) query.append('location', params.location);
    if (params?.eligibility_filter) query.append('eligibility_filter', params.eligibility_filter);
    if (params?.student_id) query.append('student_id', params.student_id);
    return fetchJson<Job[]>(`/jobs?${query.toString()}`);
  },
  getJob: (id: string, studentId: string = 'S001') =>
    fetchJson<Job>(`/jobs/${id}?student_id=${studentId}`),
  getJobProviderStatus: () =>
    fetchJson<import('../types').JobProviderStatus>('/jobs/provider-status'),

  // Eligibility & Skill Gaps
  checkEligibility: (jobId: string, studentId: string) =>
    fetchJson<EligibilityResult>(`/jobs/${jobId}/eligibility?student_id=${studentId}`, { method: 'POST' }),
  getSkillGaps: (jobId: string, studentId: string) =>
    fetchJson<SkillGapAnalysis>(`/jobs/${jobId}/skill-gaps?student_id=${studentId}`, { method: 'POST' }),

  // Prep Plan
  getPrepPlan: (jobId: string, studentId: string, days: number = 28, regenerate: boolean = false) =>
    fetchJson<PrepPlan>(`/jobs/${jobId}/prep-plan?student_id=${studentId}&days=${days}&regenerate=${regenerate}`, { method: 'POST' }),
  toggleTask: (planId: string, taskId: string, isCompleted: boolean) =>
    fetchJson<{ success: boolean; task_id: string; is_completed: boolean; progress_percentage: number; completed_count: number }>(
      `/prep-plan/${planId}/task-toggle`,
      { method: 'POST', body: JSON.stringify({ task_id: taskId, is_completed: isCompleted }) }
    ),

  // Saved Jobs
  getSavedJobs: (studentId: string) =>
    fetchJson<Job[]>(`/students/${studentId}/saved-jobs`),
  saveJob: (studentId: string, jobId: string) =>
    fetchJson<{ saved: boolean; message: string }>(`/students/${studentId}/saved-jobs/${jobId}`, { method: 'POST' }),
  unsaveJob: (studentId: string, jobId: string) =>
    fetchJson<{ saved: boolean; message: string }>(`/students/${studentId}/saved-jobs/${jobId}`, { method: 'DELETE' }),

  // Mock Interview
  startMockInterview: (
    studentId: string,
    roleTitle: string,
    category: string,
    difficulty: string = 'Intermediate',
    questionCount: number = 3
  ) =>
    fetchJson<MockSession>(
      `/mock-interview/start?student_id=${studentId}&role_title=${encodeURIComponent(roleTitle)}&category=${encodeURIComponent(category)}&difficulty=${encodeURIComponent(difficulty)}&question_count=${questionCount}`,
      { method: 'POST' }
    ),
  submitMockAnswer: (sessionId: string, questionIndex: number, answer: string) =>
    fetchJson<MockSession>('/mock-interview/answer', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId, question_index: questionIndex, user_answer: answer })
    }),

  // Agent Orchestrator
  runAgentQuery: (
    studentId: string,
    query: string,
    mode: string = 'auto',
    conversationHistory?: any[]
  ) => {
    const userStr = localStorage.getItem('placemate_auth_user');
    let token = '';
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        token = u.token || '';
      } catch (e) {}
    }
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = token;
    }
    return fetchJson<AgentQueryResponse>('/agent/query', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        student_id: studentId,
        query,
        mode,
        conversation_history: conversationHistory
      })
    });
  },

  // AI Learning Tutor Chatbot
  askTutor: (
    studentId: string,
    domain: string,
    mode: string,
    message: string,
    difficulty: string = 'Intermediate',
    codeSnippet?: string,
    language?: string,
    conversationId?: string,
    history?: { role: string; content: string }[]
  ) =>
    fetchJson<TutorChatResponse>('/tutor/chat', {
      method: 'POST',
      body: JSON.stringify({
        student_id: studentId,
        domain,
        topic: domain,
        mode,
        message,
        difficulty,
        code_snippet: codeSnippet,
        language,
        conversation_id: conversationId,
        history
      })
    }),

  // Authentication & Role Management
  login: (email: string, password: string) =>
    fetchJson<import('../types').User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
  register: (payload: any) =>
    fetchJson<import('../types').User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  demoLogin: (role: 'student' | 'officer') =>
    fetchJson<import('../types').User>(`/auth/demo-login?role=${role}`, {
      method: 'POST'
    }),
  getMe: (token?: string) =>
    fetchJson<import('../types').User>(`/auth/me${token ? `?token=${encodeURIComponent(token)}` : ''}`),

  // Placement Officer Workspace
  getOfficerStats: () =>
    fetchJson<import('../types').OfficerStats>('/officer/stats'),
  getOfficerStudents: (params?: { branch?: string; min_cgpa?: number; graduation_year?: number }) => {
    const q = new URLSearchParams();
    if (params?.branch) q.append('branch', params.branch);
    if (params?.min_cgpa) q.append('min_cgpa', params.min_cgpa.toString());
    if (params?.graduation_year) q.append('graduation_year', params.graduation_year.toString());
    const qs = q.toString();
    return fetchJson<import('../types').OfficerStudentItem[]>(`/officer/students${qs ? `?${qs}` : ''}`);
  },
  createOfficerJob: (data: import('../types').JobCreateInput) =>
    fetchJson<Job>('/officer/jobs', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getOfficerAnalytics: () =>
    fetchJson<{
      branch_distribution: { branch: string; count: number }[];
      readiness_breakdown: { tier: string; count: number }[];
      total_active_drives: number;
    }>('/officer/analytics'),

  // Health
  getHealth: () => fetchJson<{ status: string; rules_engine: string; service: string }>('/health'),
};
