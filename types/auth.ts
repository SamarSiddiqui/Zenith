export interface WorkingWindow {
  startTime: string; // e.g., "09:00"
  endTime: string;   // e.g., "19:00"
  timezone: string;  // e.g., "UTC", "America/New_York", "Asia/Kolkata"
  activeDays: number[]; // [1, 2, 3, 4, 5] (Monday-Friday)
}

export interface ZenithUserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  workingWindow: WorkingWindow;
  onboarded: boolean;
  themePreference?: 'system' | 'light' | 'dark';
  mindfulReminders?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSessionState {
  user: ZenithUserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface SignUpData {
  fullName: string;
  email: string;
  password?: string;
  workingWindow?: Partial<WorkingWindow>;
}

export interface SignInData {
  email: string;
  password?: string;
}
