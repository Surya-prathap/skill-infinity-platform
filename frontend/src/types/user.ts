export interface UserProfile {
  id?: string;
  userId?: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
  title?: string;
  phoneNumber?: string;
  roles?: string[];
  createdAt?: string;
  updatedAt?: string;
}
