export interface HistoryItem {
  date: string;
  action: string;
  user: string;
}

export interface AppealFile {
  stored_name: string;
  original_name: string;
  size: number;
  mime_type: string;
}

export interface AppealMessage {
  text: string;
  user: string;
  user_id: string;
  date: string;
}

export interface Appeal {
  _id: string;
  title: string;
  content: string;
  category: string;
  status: string;
  author_id: string;
  author_name: string;
  author_surname: string;
  is_anonymous: boolean;
  files: AppealFile[];
  assigned_to: string | null;
  assigned_name: string | null;
  response: string | null;
  allow_messages: boolean;
  messages: AppealMessage[];
  history: HistoryItem[];
  created_at: string;
  updated_at: string;
}

export interface AppealStats {
  total: number;
  pending: number;
  in_review: number;
  accepted: number;
  resolved: number;
  rejected: number;
}
