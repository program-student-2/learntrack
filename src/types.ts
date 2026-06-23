export interface LearningRecord {
  id: string;
  date: string; // ISO string
  content: string;
  durationMinutes: number;
  subjectId?: string; // UUID of the SubjectGoal (optional for legacy or uncategorized)
}

export interface SubjectGoal {
  id: string;
  name: string;
  targetHours: number;
}

export interface UserSettings {
  userName: string;
  weeklyGoalHours: number;
  finalGoalHours: number;
  targetSchoolName: string;
  subjectGoals: SubjectGoal[];
}

export interface AppContextType {
  records: LearningRecord[];
  settings: UserSettings;
  onAddRecord: (record: Omit<LearningRecord, 'id'>) => void;
  onDeleteRecord: (id: string) => void;
  onEditRecord: (record: LearningRecord) => void;
  onUpdateSettings: (settings: UserSettings) => void;
  onImportData: (records: LearningRecord[], settings: UserSettings) => void;
}
