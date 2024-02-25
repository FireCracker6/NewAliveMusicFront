export interface User {
    fullName?: string; 
    email?: string;
    roles?: string[];
    token?: string;
    contactId?: string;
    isAuthorized?: boolean | undefined;
   
  }