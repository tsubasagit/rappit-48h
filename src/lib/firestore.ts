import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Project, Message, HearingData, HearingPhase, ProjectStatus, UserProfile } from '../types';

// ── Users ──
export async function createUserProfile(uid: string, email: string, displayName: string | null, photoURL: string | null) {
  await setDoc(doc(db, 'users', uid), {
    email,
    displayName,
    photoURL,
    createdAt: serverTimestamp(),
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid,
    email: data.email,
    displayName: data.displayName,
    photoURL: data.photoURL,
    createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
  };
}

// ── Projects ──
function toProject(id: string, data: Record<string, unknown>): Project {
  return {
    id,
    userId: data.userId as string,
    title: data.title as string,
    status: (data.status as ProjectStatus) ?? 'hearing',
    hearingPhase: (data.hearingPhase as HearingPhase) ?? 'problem',
    hearingData: (data.hearingData as HearingData) ?? {},
    serviceSpecMd: data.serviceSpecMd as string | undefined,
    mockupUrls: data.mockupUrls as string[] | undefined,
    startedAt: (data.startedAt as Timestamp)?.toDate() ?? new Date(),
    deadline: (data.deadline as Timestamp)?.toDate() ?? new Date(),
    createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate() ?? new Date(),
  };
}

export async function createProject(userId: string, title: string): Promise<string> {
  const now = new Date();
  const deadline = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const ref = await addDoc(collection(db, 'projects'), {
    userId,
    title,
    status: 'hearing',
    hearingPhase: 'problem',
    hearingData: {},
    startedAt: Timestamp.fromDate(now),
    deadline: Timestamp.fromDate(deadline),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getOrCreateProject(userId: string): Promise<string> {
  const q = query(
    collection(db, 'projects'),
    where('userId', '==', userId),
    limit(1),
  );
  const snap = await getDocs(q);
  if (!snap.empty) {
    return snap.docs[0].id;
  }
  return createProject(userId, 'マイプロジェクト');
}

export function subscribeProjects(userId: string, callback: (projects: Project[]) => void) {
  const q = query(
    collection(db, 'projects'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(q, (snap) => {
    const projects = snap.docs.map((d) => toProject(d.id, d.data()));
    callback(projects);
  });
}

export function subscribeProject(projectId: string, callback: (project: Project | null) => void) {
  return onSnapshot(doc(db, 'projects', projectId), (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    callback(toProject(snap.id, snap.data()));
  });
}

export async function updateProjectStatus(projectId: string, status: ProjectStatus) {
  await updateDoc(doc(db, 'projects', projectId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function updateHearingData(projectId: string, phase: HearingPhase, data: Partial<HearingData>) {
  await updateDoc(doc(db, 'projects', projectId), {
    hearingPhase: phase,
    hearingData: data,
    updatedAt: serverTimestamp(),
  });
}

// ── Messages ──
function toMessage(id: string, data: Record<string, unknown>): Message {
  return {
    id,
    role: data.role as Message['role'],
    content: data.content as string,
    metadata: data.metadata as Message['metadata'],
    createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
  };
}

export function subscribeMessages(projectId: string, callback: (messages: Message[]) => void) {
  const q = query(
    collection(db, 'projects', projectId, 'messages'),
    orderBy('createdAt', 'asc'),
  );
  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map((d) => toMessage(d.id, d.data()));
    callback(messages);
  });
}

export async function addMessage(projectId: string, role: Message['role'], content: string, metadata?: Message['metadata']) {
  await addDoc(collection(db, 'projects', projectId, 'messages'), {
    role,
    content,
    metadata: metadata ?? null,
    createdAt: serverTimestamp(),
  });
}
