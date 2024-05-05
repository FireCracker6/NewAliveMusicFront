import { UserSubscriptionDTO } from "../Dashboard/Dashboard";

export interface User {
  userId?: string;
    fullName?: string; 
    email?: string;
    roles?: string[];
    token?: string;
    profilePicturePath?: string | undefined | null;
    isAuthorized?: boolean | undefined;
      userSubscription?: UserSubscriptionDTO | null;
  trackCount?: number | null;
  loading?: boolean;
   
  }