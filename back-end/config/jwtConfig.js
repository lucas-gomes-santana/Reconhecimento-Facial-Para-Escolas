import jwt from "jsonwebtoken";


const secret = process.env.JWT_SECRET || "chave-super-secreta";

export function gerarToken(payload) {
  return jwt.sign(payload, secret, { expiresIn: "1h" }); // expira em 1 hora
}

export function verificarToken(token) {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    return null;
  }
}

// Middleware para proteger rotas
export function autenticarToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token não fornecido" });

  jwt.verify(token, secret, (err, usuario) => {
    if (err) return res.status(403).json({ message: "Token inválido" });
    req.usuario = usuario;
    next();
  });
}
