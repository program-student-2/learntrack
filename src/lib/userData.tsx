import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { doc, onSnapshot, setDoc, type DocumentReference } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './auth';
import type { LearningRecord, UserSettings } from '../types';

const DEFAULT_SETTINGS: UserSettings = {
  userName: 'User',
  weeklyGoalHours: 10,
  finalGoalHours: 100,
  targetSchoolName: '',
  subjectGoals: [],
};

// Legacy localStorage keys (used for one-time migration to Firestore).
const LEGACY_RECORDS_KEY = 'antigravity_study_records_v1';
const LEGACY_SETTINGS_KEY = 'antigravity_study_settings_v1';

type Status = 'loading' | 'ready' | 'error';

interface UserDataValue {
  records: LearningRecord[];
  settings: UserSettings;
  status: Status;
  error: string | null;
  addRecord: (record: Omit<LearningRecord, 'id'>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  editRecord: (record: LearningRecord) => Promise<void>;
  updateSettings: (settings: UserSettings) => Promise<void>;
  importData: (records: LearningRecord[], settings: UserSettings) => Promise<void>;
}

const Ctx = createContext<UserDataValue | null>(null);

export function UserDataProvider({ children }: { children: ReactNode }) {
  const { user, status: authStatus } = useAuth();

  const [records, setRecords] = useState<LearningRecord[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);

  // We use a ref to the current Firestore doc so write helpers can
  // remain stable even as state updates.
  const docRef = useRef<DocumentReference | null>(null);

  useEffect(() => {
    if (!db || !user || authStatus !== 'signed-in') {
      docRef.current = null;
      setRecords([]);
      setSettings(DEFAULT_SETTINGS);
      setStatus('loading');
      return;
    }

    const ref = doc(db, 'users', user.uid, 'data', 'state');
    docRef.current = ref;
    setStatus('loading');
    setError(null);

    let migrated = false;

    const unsub = onSnapshot(
      ref,
      async (snap) => {
        if (snap.exists()) {
          const data = snap.data() as { records?: LearningRecord[]; settings?: UserSettings };
          setRecords(Array.isArray(data.records) ? data.records : []);
          setSettings({ ...DEFAULT_SETTINGS, ...(data.settings ?? {}) });
          setStatus('ready');
          return;
        }

        // Document doesn't exist yet. On the very first snapshot per session,
        // see whether we have legacy localStorage data to migrate, then write
        // an initial document.
        if (migrated) return;
        migrated = true;

        const legacyRecords = readLocal<LearningRecord[]>(LEGACY_RECORDS_KEY, []);
        const legacySettings = readLocal<UserSettings>(LEGACY_SETTINGS_KEY, DEFAULT_SETTINGS);

        const initial = {
          records: legacyRecords,
          settings: { ...DEFAULT_SETTINGS, ...legacySettings },
        };

        try {
          await setDoc(ref, initial);
          if (legacyRecords.length > 0) {
            // Clear legacy keys after a successful migration so they don't
            // resurface on other devices.
            localStorage.removeItem(LEGACY_RECORDS_KEY);
            localStorage.removeItem(LEGACY_SETTINGS_KEY);
          }
          // onSnapshot will fire again with the new doc and populate state.
        } catch (e) {
          setError(formatError(e));
          setStatus('error');
        }
      },
      (e) => {
        setError(formatError(e));
        setStatus('error');
      }
    );

    return unsub;
  }, [user, authStatus]);

  const write = useCallback(
    async (patch: { records?: LearningRecord[]; settings?: UserSettings }) => {
      const ref = docRef.current;
      if (!ref) return;
      await setDoc(ref, patch, { merge: true });
    },
    []
  );

  const addRecord = useCallback(
    async (record: Omit<LearningRecord, 'id'>) => {
      const next = [...records, { ...record, id: crypto.randomUUID() }];
      await write({ records: next });
    },
    [records, write]
  );

  const deleteRecord = useCallback(
    async (id: string) => {
      const next = records.filter((r) => r.id !== id);
      await write({ records: next });
    },
    [records, write]
  );

  const editRecord = useCallback(
    async (updated: LearningRecord) => {
      const next = records.map((r) => (r.id === updated.id ? updated : r));
      await write({ records: next });
    },
    [records, write]
  );

  const updateSettings = useCallback(
    async (next: UserSettings) => {
      await write({ settings: next });
    },
    [write]
  );

  const importData = useCallback(
    async (newRecords: LearningRecord[], newSettings: UserSettings) => {
      const ref = docRef.current;
      if (!ref) return;
      // Replace (not merge) so removed records are actually gone.
      await setDoc(ref, { records: newRecords, settings: newSettings });
    },
    []
  );

  return (
    <Ctx.Provider
      value={{
        records,
        settings,
        status,
        error,
        addRecord,
        deleteRecord,
        editRecord,
        updateSettings,
        importData,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useUserData(): UserDataValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useUserData must be used inside <UserDataProvider>');
  return ctx;
}

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function formatError(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}
