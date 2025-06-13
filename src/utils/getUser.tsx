import { User } from "@/types/auth";

export const getUser = (): User | null => {
    try {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        return user;
      } catch {
        return null;
      }
}