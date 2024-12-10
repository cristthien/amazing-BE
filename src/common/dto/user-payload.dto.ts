interface UserPayload {
  id: number; // User's ID
  role: string; // User's role, e.g., 'admin'
  iat: number; // Issued at time (JWT token timestamp)
  exp: number; // Expiration time (JWT token timestamp)
}

export default UserPayload;
