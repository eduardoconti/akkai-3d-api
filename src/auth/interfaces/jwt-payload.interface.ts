export interface JwtPayload {
  sub: number;
  login: string;
  role: string;
  permissions: string[];
  sessionId?: string;
}
