import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import type { AgentResponse } from '../types';

export async function sendChatMessage(projectId: string, message: string): Promise<AgentResponse> {
  const fn = httpsCallable<{ projectId: string; message: string }, AgentResponse>(functions, 'rabit48Chat');
  const result = await fn({ projectId, message });
  return result.data;
}

export async function generateSpec(projectId: string): Promise<{ specMd: string }> {
  const fn = httpsCallable<{ projectId: string }, { specMd: string }>(functions, 'rabit48GenerateSpec');
  const result = await fn({ projectId });
  return result.data;
}

export async function generateMockups(projectId: string): Promise<{ mockupUrls: string[] }> {
  const fn = httpsCallable<{ projectId: string }, { mockupUrls: string[] }>(functions, 'rabit48GenerateMockups');
  const result = await fn({ projectId });
  return result.data;
}

export async function regenerateSpec(projectId: string, feedback: string): Promise<{ specMd: string }> {
  const fn = httpsCallable<{ projectId: string; feedback: string }, { specMd: string }>(functions, 'rabit48RegenerateSpec');
  const result = await fn({ projectId, feedback });
  return result.data;
}
