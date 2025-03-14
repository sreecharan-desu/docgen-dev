export interface User {
  name?: string;
  email?: string;
}

export interface ApiKey {
  id: string;
  key: string;
  created_at: string;
  plan: string;
}

export type DashboardSection = 'api-keys' | 'billing' | 'projects' | 'settings'; 