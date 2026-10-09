export interface Student {
  id: string;
  full_name: string;
  email: string;
  degree: string;
  branch: string;
  graduation_year: number;
  cgpa: number;
  backlogs: number;
  skills: string[];
  projects: string;
  experience_level: string;
  preferred_role: string;
  preferred_location: string;
  readiness_score: number;
  saved_jobs_count: number;
  resume_filename?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  work_mode: string;
  job_type?: string;
  role_category?: string;
  application_deadline?: string;
  degree_requirements: string[];
  eligible_branches: string[];
  min_cgpa: number;
  max_backlogs: number;
  graduation_year_min: number;
  graduation_year_max: number;
  experience_level: string;
  required_skills: string[];
  preferred_skills: string[];
  salary_range: string;
  description: string;
  match_score?: number;
  is_eligible?: boolean;
  eligibility_status?: 'ELIGIBLE' | 'NOT_ELIGIBLE' | 'CONDITIONAL' | 'UNKNOWN';
  match_reasons?: string[];
  is_saved?: boolean;
  source_type?: 'live_provider' | 'cached_provider' | 'campus_drive' | 'demo';
  provider_name?: string;
  external_job_id?: string;
  original_url?: string;
  posting_date?: string;
  retrieval_date?: string;
  freshness_status?: string;
}

export interface JobProviderStatus {
  active_provider: string;
  is_live_configured: boolean;
  status: string;
  message: string;
  supported_providers: string[];
  adzuna_configured: boolean;
  jooble_configured: boolean;
}

export interface CriterionResult {
  criterion_name: string;
  required_value: string;
  student_value: string;
  status: 'MET' | 'NOT_MET' | 'UNKNOWN';
  explanation: string;
}

export interface EligibilityResult {
  job_id: string;
  job_title: string;
  company: string;
  is_eligible: boolean;
  status: 'ELIGIBLE' | 'NOT_ELIGIBLE' | 'CONDITIONAL';
  failed_mandatory: boolean;
  criteria: CriterionResult[];
  summary: string;
}

export interface SkillGapItem {
  skill: string;
  skill_type: 'required' | 'preferred';
  status: 'matched' | 'missing';
  gap_percentage: number;
  priority: 'High' | 'Medium' | 'Low';
  impact_reason: string;
  recommended_action: string;
  suggested_days: number;
}

export interface SkillGapAnalysis {
  job_id: string;
  job_title: string;
  company: string;
  overall_match_percentage: number;
  matched_skills_count: number;
  missing_required_count: number;
  missing_preferred_count: number;
  total_skills_count: number;
  skills_breakdown: SkillGapItem[];
}

export interface TaskItem {
  id: string;
  week: number;
  day_number: number;
  category: 'Technical' | 'Coding' | 'Aptitude' | 'HR & Communication';
  title: string;
  description: string;
  duration_minutes: number;
  priority: 'High' | 'Medium';
  is_completed: boolean;
  resources: string[];
}

export interface PrepPlan {
  id: string;
  student_id: string;
  job_id: string;
  role_title: string;
  total_days: number;
  completed_tasks_count: number;
  total_tasks_count: number;
  progress_percentage: number;
  tasks: TaskItem[];
}

export interface MockQuestionItem {
  question_id: string;
  question: string;
  category: string;
  focus: string;
  difficulty: string;
  user_answer?: string | null;
  score?: number | null;
  feedback?: {
    source: string;
    score_out_of_100: number;
    technical_score: number;
    communication_score: number;
    completeness_score: number;
    strengths: string[];
    improvement_areas: string[];
    recommended_next_action: string;
    verdict: string;
  } | null;
}

export interface MockSession {
  id: string;
  student_id: string;
  role_title: string;
  category: string;
  current_question_index: number;
  total_questions: number;
  overall_score?: number | null;
  status: 'in_progress' | 'completed';
  questions: MockQuestionItem[];
}

export interface AgentTraceStep {
  step_number: number;
  tool_name: string;
  arguments: Record<string, any>;
  status: string;
  duration_ms: number;
  result_summary: string;
  data?: any;
}

export interface AgentQueryResponse {
  query: string;
  execution_mode: 'LIVE_AI' | 'FALLBACK_DEMO';
  trace: AgentTraceStep[];
  final_answer: string;
  suggested_actions: string[];
  structured_result?: {
    job_match?: {
      title: string;
      company: string;
      score: number;
      is_eligible: boolean;
      eligibility_status: string;
      job_id: string;
    };
    skill_gaps?: {
      overall_match_percentage: number;
      matched_skills: string[];
      missing_skills: string[];
      missing_count: number;
    };
    prep_plan?: {
      tasks_count: number;
      total_days: number;
      role_title: string;
      job_id: string;
    };
    eligibility?: {
      status: string;
      is_eligible: boolean;
      summary: string;
    };
  };
}

export interface TutorMessage {
  id: string;
  sender: 'student' | 'tutor';
  domain?: string;
  topic?: string;
  mode?: string;
  difficulty?: string;
  title?: string;
  content: string;
  codeSnippet?: string;
  language?: string;
  conversationId?: string;
  suggestedFollowups?: string[];
  provider?: string;
  isLiveAi?: boolean;
  timestamp: number;
}

export interface TutorChatResponse {
  domain?: string;
  topic: string;
  mode: string;
  difficulty?: string;
  title: string;
  response: string;
  suggested_followups: string[];
  provider?: string;
  is_live_ai?: boolean;
  timestamp: number;
}

export interface User {
  id: string;
  email: string;
  role: 'student' | 'officer';
  full_name: string;
  institution: string;
  department?: string;
  designation?: string;
  verification_status: 'verified' | 'pending';
  student_id?: string;
  token: string;
}

export interface OfficerStats {
  total_students: number;
  eligible_students: number;
  average_cgpa: number;
  average_readiness_score: number;
  active_recruitment_drives: number;
  placement_rate_percentage: number;
  active_jobs?: number;
  eligible_candidates?: number;
  avg_readiness_pct?: number;
  readiness_distribution?: { high: number; medium: number; low: number };
}

export interface OfficerStudentItem {
  id: string;
  full_name: string;
  email: string;
  degree: string;
  branch: string;
  graduation_year: number;
  cgpa: number;
  backlogs: number;
  skills: string[];
  preferred_role: string;
  readiness_score: number;
  eligible_jobs_count: number;
}

export interface JobCreateInput {
  title: string;
  company: string;
  location: string;
  work_mode?: string;
  job_type?: string;
  role_category?: string;
  eligible_branches: string[];
  min_cgpa: number;
  max_backlogs?: number;
  graduation_year_min?: number;
  graduation_year_max?: number;
  required_skills: string[];
  preferred_skills?: string[];
  salary_range: string;
  description: string;
  application_deadline?: string;
}


