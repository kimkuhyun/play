export interface Company {
  id: number;
  company: string;
  location: string;
  lat: number;
  lng: number;
  salary: string;
  keywords: string[];
  deadline: string;
  description: string;
  sourceUrl?: string;
}

export interface ResumeBlock {
  id: number;
  type: 'h2' | 'h3' | 'p';
  text: string;
}

export interface ApplicationData {
  starred?: boolean;
  status?: 'starred' | 'to-apply' | 'applied' | 'interview';
  customName?: string;
  customJob?: string;
  notes?: string;
}

export interface InterviewQuestion {
  id: number;
  q: string;
  a: string;
  cat: string;
}

export type ViewState = 'command' | 'processing' | 'dashboard';
export type SidebarTab = 'search' | 'analysis' | 'activity' | 'starred' | 'prep' | 'resumes' | 'settings';
