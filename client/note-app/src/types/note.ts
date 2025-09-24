export interface Note {
  _id: string;
  title: string;
  content: string;
  tags?: string[];
  folder?: string;
  createdAt: string;
  attachments?: string[];
  dueDate?: string;
  reminder?: number;
  pinned?: boolean;
  isEncrypted?: boolean;
  isPasswordProtected?: boolean;
  password?: string;
  isLocked?: boolean; // Add this to track current lock state
}

export interface DashboardProps {
  searchQuery: string;
  searchFilter: string;
}

export interface PasswordModalNote {
  id: string;
  content: string;
  title: string;
  isPasswordProtected?: boolean;
}

export interface AddNoteLocationState {
  note?: Note;
}

export interface PasswordState {
  password: string;
  isPasswordProtected: boolean;
  isUnlocked: boolean;
  isLocked: boolean; // Add this
}

export interface NoteFormData {
  title: string;
  tags: string;
  folder: string;
  newFolder: string;
  dueDate: string;
  reminder: string | number;
  files: File[];
}