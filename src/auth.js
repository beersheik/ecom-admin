export const getRole     = () => localStorage.getItem('role') || '';
export const getBusiness = () => localStorage.getItem('business') || '';
export const getToken    = () => localStorage.getItem('token') || '';
export const isSuperAdmin = () => getRole() === 'superadmin';
export const isAdmin      = () => getRole() === 'admin';

export const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`
});
