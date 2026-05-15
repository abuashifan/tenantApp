export type User = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  status: string;
  last_login_at?: string | null;
};

export type LoginResponse = {
  user: User;
  token: string;
  token_type: 'Bearer';
};

