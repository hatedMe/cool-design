export interface User {
  id: number;
  name: string;
  status: 'enabled' | 'disabled';
}
export interface UserQuery {
  name: string;
  status?: User['status'];
  page: number;
  pageSize: number;
  sortBy?: string;
  order?: 'asc' | 'desc' | null;
}
export interface UserService {
  deleteUsers(ids: number[]): Promise<void>;
  listUsers(query: UserQuery): Promise<{ items: User[]; total: number }>;
  updateUser(id: number, draft: Pick<User, 'name' | 'status'>): Promise<User>;
}
