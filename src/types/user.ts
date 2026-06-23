export interface User {
  _id: string;
  email: string;
  name: string;
  surname: string;
  roles: ("user" | "officer" | "admin")[];
  created_at?: string;
}
