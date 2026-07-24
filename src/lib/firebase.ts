import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import { ChatSession, IdeaEvaluation, PrototypeGuidance, CustomInstructions, ThemeSettings } from "../types";

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firestore with specific database ID if available
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");

// Collection References
const SESSIONS_COL = "chat_sessions";
const IDEAS_COL = "ideas";
const GUIDANCE_COL = "guidance_blueprints";
const SETTINGS_COL = "app_settings";

/**
 * Real-time listener for Chat Sessions
 */
export function subscribeChatSessions(onUpdate: (sessions: ChatSession[]) => void) {
  const q = query(collection(db, SESSIONS_COL));
  return onSnapshot(
    q,
    (snapshot) => {
      const sessions: ChatSession[] = [];
      snapshot.forEach((docSnap) => {
        sessions.push(docSnap.data() as ChatSession);
      });
      // Sort sessions by timestamp descending (newest first)
      sessions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      onUpdate(sessions);
    },
    (error) => {
      console.warn("Firestore sessions subscription notice:", error);
    }
  );
}

/**
 * Helper to strip undefined values so Firestore setDoc does not throw
 */
function removeUndefined<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Save or Update a Chat Session
 */
export async function saveChatSessionToFirestore(session: ChatSession) {
  try {
    const sessionRef = doc(db, SESSIONS_COL, session.id);
    const cleanSession = removeUndefined(session);
    await setDoc(sessionRef, cleanSession, { merge: true });
  } catch (error) {
    console.error("Error saving chat session to Firestore:", error);
  }
}

/**
 * Delete a Chat Session
 */
export async function deleteChatSessionFromFirestore(sessionId: string) {
  try {
    const sessionRef = doc(db, SESSIONS_COL, sessionId);
    await deleteDoc(sessionRef);
  } catch (error) {
    console.error("Error deleting chat session from Firestore:", error);
  }
}

/**
 * Real-time listener for Ideas
 */
export function subscribeIdeas(onUpdate: (ideas: IdeaEvaluation[]) => void) {
  const q = query(collection(db, IDEAS_COL));
  return onSnapshot(
    q,
    (snapshot) => {
      const ideas: IdeaEvaluation[] = [];
      snapshot.forEach((docSnap) => {
        ideas.push(docSnap.data() as IdeaEvaluation);
      });
      ideas.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      onUpdate(ideas);
    },
    (error) => {
      console.warn("Firestore ideas subscription notice:", error);
    }
  );
}

/**
 * Save an Idea Evaluation
 */
export async function saveIdeaToFirestore(idea: IdeaEvaluation) {
  try {
    const ideaRef = doc(db, IDEAS_COL, idea.id);
    await setDoc(ideaRef, removeUndefined(idea), { merge: true });
  } catch (error) {
    console.error("Error saving idea to Firestore:", error);
  }
}

/**
 * Real-time listener for Prototype Guidance Blueprints
 */
export function subscribeGuidance(onUpdate: (guidanceList: PrototypeGuidance[]) => void) {
  const q = query(collection(db, GUIDANCE_COL));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: PrototypeGuidance[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as PrototypeGuidance);
      });
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      onUpdate(list);
    },
    (error) => {
      console.warn("Firestore guidance subscription notice:", error);
    }
  );
}

/**
 * Save a Prototype Guidance Blueprint
 */
export async function saveGuidanceToFirestore(guidance: PrototypeGuidance) {
  try {
    const gRef = doc(db, GUIDANCE_COL, guidance.id);
    await setDoc(gRef, removeUndefined(guidance), { merge: true });
  } catch (error) {
    console.error("Error saving guidance blueprint to Firestore:", error);
  }
}

/**
 * Subscribe to User Settings
 */
export function subscribeCustomInstructions(onUpdate: (instructions: CustomInstructions) => void) {
  const ref = doc(db, SETTINGS_COL, "custom_instructions");
  return onSnapshot(ref, (docSnap) => {
    if (docSnap.exists()) {
      onUpdate(docSnap.data() as CustomInstructions);
    }
  });
}

export async function saveCustomInstructionsToFirestore(instructions: CustomInstructions) {
  try {
    const ref = doc(db, SETTINGS_COL, "custom_instructions");
    await setDoc(ref, removeUndefined(instructions), { merge: true });
  } catch (error) {
    console.error("Error saving custom instructions to Firestore:", error);
  }
}

export function subscribeThemeSettings(onUpdate: (theme: ThemeSettings) => void) {
  const ref = doc(db, SETTINGS_COL, "theme_settings");
  return onSnapshot(ref, (docSnap) => {
    if (docSnap.exists()) {
      onUpdate(docSnap.data() as ThemeSettings);
    }
  });
}

export async function saveThemeSettingsToFirestore(theme: ThemeSettings) {
  try {
    const ref = doc(db, SETTINGS_COL, "theme_settings");
    await setDoc(ref, removeUndefined(theme), { merge: true });
  } catch (error) {
    console.error("Error saving theme settings to Firestore:", error);
  }
}
