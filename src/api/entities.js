/**
 * Base44 Entity exports for centralized access.
 * All database entities should be accessed through this module.
 */
import { base44 } from './base44Client';

// Export User entity methods with service role for admin access
// Wrapped in functions to avoid initialization errors
export const User = {
  list: async () => {
    try {
      if (!base44.asServiceRole?.entities?.User) {
        throw new Error('Base44 service role not available');
      }
      return await base44.asServiceRole.entities.User.list();
    } catch (error) {
      console.error('Error listing users:', error);
      throw error;
    }
  },
  update: async (userId, data) => {
    try {
      if (!base44.asServiceRole?.entities?.User) {
        throw new Error('Base44 service role not available');
      }
      return await base44.asServiceRole.entities.User.update(userId, data);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },
  get: async (userId) => {
    try {
      if (!base44.asServiceRole?.entities?.User) {
        throw new Error('Base44 service role not available');
      }
      return await base44.asServiceRole.entities.User.get(userId);
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }
};

// You can add more entities here as needed
// export const Task = base44.entities.Task;
// export const Post = base44.entities.Post;
