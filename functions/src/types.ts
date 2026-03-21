export type HearingPhase = "problem" | "users" | "features" | "design" | "tech" | "confirm" | "build_together" | "next_steps";

export interface AgentResponse {
  reply: string;
  currentPhase: HearingPhase;
  phaseComplete: boolean;
  extractedData: { field: string; value: unknown }[];
}

export interface HearingData {
  problemStatement?: string;
  targetUsers?: string;
  userRoles?: string[];
  features?: { must: string[]; should: string[]; nice: string[] };
  designPreferences?: string;
  techConstraints?: string;
  platformTargets?: string[];
}

export interface ConversationTurn {
  role: "user" | "model";
  parts: { text: string }[];
}
