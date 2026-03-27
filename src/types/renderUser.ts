// type/renderUser.ts
export interface UserType {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive?: boolean;
  createdAt?: string;
  firebaseUid?: string;
}

// Safely render user as a string
export function renderUser(user: UserType | null | undefined) {
  if (!user) return "Unknown User";
  return `${user.firstName} ${user.lastName} (${user.email})`;
}