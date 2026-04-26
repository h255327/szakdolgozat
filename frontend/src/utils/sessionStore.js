import { getToken } from '../services/auth';
import { jwtDecode } from './jwt';

// Returns a localStorage key scoped to the current user so different
// accounts stored in the same browser don't share persisted UI state.
export function userKey(suffix) {
  const token  = getToken();
  const userId = token ? jwtDecode(token)?.id : 'guest';
  return `${suffix}_${userId}`;
}
