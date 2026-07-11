export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  wallet?: string;
  points: number;
  referrals: number;
  referralCode: string;
  referredBy?: string;
  isVerified: boolean;
  joinedAt: any;
  lastLogin: any;
  completedTasks?: string[];
  completedSurveys?: string[];
  isAdmin?: boolean;
  streakCount?: number;
  lastStreakDate?: any;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  reward: number;
  type: 'text' | 'image' | 'voice';
  questions: SurveyQuestion[];
  createdAt: any;
}

export interface SurveyQuestion {
  id: string;
  text: string;
  type: 'text' | 'multiple-choice' | 'image-review' | 'voice';
  options?: string[];
  imageUrl?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  type: 'twitter' | 'telegram' | 'youtube' | 'login';
  link?: string;
  icon?: string;
}

export interface UserTask {
  userId: string;
  taskId: string;
  status: 'pending' | 'completed';
  completedAt?: any;
}

export interface UserAnswer {
  userId: string;
  surveyId: string;
  answers: Record<string, any>;
  completedAt: any;
}
