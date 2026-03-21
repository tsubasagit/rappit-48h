// ── User ──
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Date;
}

// ── Project ──
export type ProjectStatus =
  | 'hearing'
  | 'generating'
  | 'reviewing'
  | 'approved'
  | 'implementing'
  | 'completed';

export type HearingPhase =
  | 'problem'
  | 'users'
  | 'features'
  | 'design'
  | 'tech'
  | 'confirm'
  | 'build_together'
  | 'next_steps';

export const HEARING_PHASES: { key: HearingPhase; label: string }[] = [
  { key: 'problem', label: '課題定義' },
  { key: 'users', label: 'ペルソナ設計' },
  { key: 'features', label: '機能設計' },
  { key: 'design', label: 'UI設計' },
  { key: 'tech', label: '技術選定' },
  { key: 'confirm', label: '振り返り' },
  { key: 'build_together', label: '一緒に作ろう' },
  { key: 'next_steps', label: '次のステップ' },
];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  hearing: 'ヒアリング中',
  generating: '生成中',
  reviewing: 'レビュー待ち',
  approved: '承認済み',
  implementing: '実装中',
  completed: '完了',
};

export interface HearingData {
  problemStatement?: string;
  targetUsers?: string;
  userRoles?: string[];
  features?: {
    must: string[];
    should: string[];
    nice: string[];
  };
  designPreferences?: string;
  techConstraints?: string;
  platformTargets?: string[];
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  status: ProjectStatus;
  hearingPhase: HearingPhase;
  hearingData: HearingData;
  serviceSpecMd?: string;
  mockupUrls?: string[];
  startedAt: Date;
  deadline: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ── Message ──
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  metadata?: {
    phase?: HearingPhase;
    phaseComplete?: boolean;
    extractedData?: { field: string; value: unknown }[];
  };
  createdAt: Date;
}

// ── Agent Response (Gemini) ──
export interface AgentResponse {
  reply: string;
  currentPhase: HearingPhase;
  phaseComplete: boolean;
  extractedData: { field: string; value: unknown }[];
}
