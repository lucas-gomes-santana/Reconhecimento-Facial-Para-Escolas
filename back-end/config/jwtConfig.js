import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET || "chave-super-secreta";

const cookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // true em produção
  sameSite: 'strict',
  maxAge: 3600000 // 1 hora em millisegundos
};

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

export function definirTokenCookie(res, token) {
  res.cookie('jwt', token, cookieConfig);
}

export function removerTokenCookie(res) {
  res.clearCookie('jwt');
}

// Middleware para proteger rotas
export function autenticarToken(req, res, next) {
  const token = req.cookies.jwt;
  
  if (!token) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  jwt.verify(token, secret, (err, usuario) => {
    if (err) {
      res.clearCookie('jwt');
      return res.status(403).json({ message: "Token inválido" });
    }
    req.usuario = usuario;
    next();
  });
}
