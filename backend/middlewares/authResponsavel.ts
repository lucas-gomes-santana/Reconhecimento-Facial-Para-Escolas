import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

const accessTokenSecret = process.env.JWT_SECRET || "chave-super-secreta";

interface ResponsavelPayload {
  id: string;
  tipo: string;
}

declare global {
  namespace Express {
    interface Request {
      responsavel?: { id: string; tipo: string };
    }
  }
}

export function autenticarResponsavel(req: Request, res: Response, next: NextFunction): void {
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

    const payload = usuario as ResponsavelPayload;

    if (payload.tipo !== "responsavel") {
      res.status(403).json({ message: "Acesso restrito a responsáveis" });
      return;
    }

    req.responsavel = payload;
    next();
  });
}
