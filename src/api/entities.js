/**
 * Base44 Entity exports for centralized access.
 * All database entities should be accessed through this module.
 */
import { base44 } from './base44Client';

// Export User entity with service role for admin access
export const User = base44.asServiceRole.entities.User;

// You can add more entities here as needed
// export const Task = base44.entities.Task;
// export const Post = base44.entities.Post;
