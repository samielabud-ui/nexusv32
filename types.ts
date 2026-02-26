
export interface Question {
  id: string;
  ciclo: string;
  modalidade: string;
  modulo: string;
  tema: string;
  problema: number;
  enunciado: string;
  alternativas: string[];
  gabarito: number;
}

export interface VideoLesson {
  id: string;
  title: string;
}

export interface LastWatched {
  lessonId: string;
  lessonTitle: string;
  courseName: string;
  platformId: string;
}

export interface ActivityItem {
  id: string;
  type: 'aula' | 'questoes' | 'apostila' | 'estudo';
  title: string;
  subtitle: string;
  timestamp: Date;
  metadata?: any;
}

export type UserRole = 'user' | 'admin' | 'superadmin';

export interface UserStats {
  uid?: string;
  displayName: string;
  photoURL?: string;
  totalAnswered: number;
  totalCorrect: number;
  totalErrors: number;
  streak: number;
  points: number;
  ciclo: string;
  isPremium: boolean;
  plan: 'basic' | 'premium';
  premiumEmoji?: string;
  dailyUsage: number;
  openedContentIds?: string[];
  lastDailyReset?: string;
  watchedLessons?: string[];
  lastWatched?: LastWatched;
  recentActivity?: ActivityItem[];
  dailyPointedContent?: string[];
  recentIncentive?: {
    fromName: string;
    fromId: string;
    timestamp: number;
  };
  studyActive: boolean;
  studyStartTime?: number | null;
  dailyStudyTime: number; 
  totalStudyTime: number; 
  themePreference?: 'dark' | 'light';
  weakestTheme?: {
    theme: string;
    errorCount: number;
    moduleId?: number;
  };
  // Novos Campos Sociais e Admin
  medCourse?: string;
  semester?: string;
  birthday?: string;
  adm?: boolean;
  role?: UserRole;
  isBanned?: boolean;
  groupId?: string | null;
  setupComplete: boolean;
}

export interface AdminLog {
  id: string;
  timestamp: any;
  adminId: string;
  adminName: string;
  action: string;
  targetId: string;
  details: string;
}

export interface Group {
  id: string;
  name: string;
  password?: string;
  creatorId: string;
  creatorName?: string;
  members: string[]; // UIDs
  status: 'active' | 'closed';
  createdAt: any;
  totalMessages?: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  imageUrl?: string;
  timestamp: any;
}
