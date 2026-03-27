interface Post {
  id: string; 
  content: string;
  images?: string[]; 
  createdAt: string;
  user: {
    id: string;
    firstName?: string | null | undefined ; 
    lastName?: string | null | undefined ;
    email: string;
  };
  time?: string; 
}