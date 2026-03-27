export interface ProfileUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface ProfilePostWithSummary {
  id: string;
  content: string;
  images?: string[];
  createdAt: string;
  likesCount: number;  // total likes
  comments: {          // array of latest comments (or all, depending on backend)
    id: string;
    content: string;
    user: {
      id: string;
      firstName: string;
      lastName?: string;
    };
    createdAt: string;
  }[];
}