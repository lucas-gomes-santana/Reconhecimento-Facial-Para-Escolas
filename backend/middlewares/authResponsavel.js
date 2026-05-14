import jwt from "jsonwebtoken";

const accessTokenSecret = process.env.JWT_SECRET || "chave-super-secreta";

export function autenticarResponsavel(req, res, next) {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  jwt.verify(token, accessTokenSecret, (err, usuario) => {
    if (err) {
      return res.status(403).json({ message: "Token inválido" });
    }

    if (usuario.tipo !== "responsavel") {
      return res.status(403).json({ message: "Acesso restrito a responsáveis" });
    }

    req.responsavel = usuario;
    next();
  });
}
