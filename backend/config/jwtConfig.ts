import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

const accessTokenSecret = process.env.JWT_SECRET || "chave-super-secreta";
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || "chave-refresh-secreta";

export interface TokenPayload {
  id: string;
  nome?: string;
  funcao?: string;
}

declare global {
  namespace Express {
    interface Request {
      usuario?: TokenPayload;
    }
  }
}

const accessTokenConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 3600000, // 1 hora de duração
  // maxAge: 60000 // 1 minuto de duração para testes
};

const refreshTokenConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias de duração do refresh token
};

export function gerarAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, accessTokenSecret, { expiresIn: "1h" });
}

export function gerarRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, refreshTokenSecret, { expiresIn: "7d" });
}

export function verificarAccessToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, accessTokenSecret);
    return decoded as TokenPayload;
  } catch {
    return null;
  }
}

export function verificarRefreshToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, refreshTokenSecret);
    return decoded as TokenPayload;
  } catch {
    return null;
  }
}

export function definirTokens(res: Response, accessToken: string, refreshToken: string): void {
  res.cookie("jwt", accessToken, accessTokenConfig);
  res.cookie("refreshToken", refreshToken, refreshTokenConfig);
}

export function removerTokens(res: Response): void {
  res.clearCookie("jwt");
  res.clearCookie("refreshToken");
}

// Middleware para proteger rotas
export function autenticarToken(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies.jwt;

  if (!token) {
    res.status(401).json({ message: "Token não fornecido" });
    return;
  }

  jwt.verify(token, accessTokenSecret, (err, usuario) => {
    if (err) {
      res.status(403).json({ message: "Token inválido" });
      return;
    }
    req.usuario = usuario as TokenPayload;
    next();
  });
}
