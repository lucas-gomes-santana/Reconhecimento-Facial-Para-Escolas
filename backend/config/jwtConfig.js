import jwt from "jsonwebtoken";

const accessTokenSecret = process.env.JWT_SECRET || "chave-super-secreta";
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || "chave-refresh-secreta";

const accessTokenConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 3600000 // 1 hora de duração
};

const refreshTokenConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias de duração
};

export function gerarAccessToken(payload) {
  return jwt.sign(payload, accessTokenSecret, { expiresIn: "1h" });
}

export function gerarRefreshToken(payload) {
  return jwt.sign(payload, refreshTokenSecret, { expiresIn: "7d" });
}

export function verificarAccessToken(token) {
  try {
    return jwt.verify(token, accessTokenSecret);
  } catch (err) {
    return null;
  }
}

export function verificarRefreshToken(token) {
  try {
    return jwt.verify(token, refreshTokenSecret);
  } catch (err) {
    return null;
  }
}

export function definirTokens(res, accessToken, refreshToken) {
  res.cookie('jwt', accessToken, accessTokenConfig);
  res.cookie('refreshToken', refreshToken, refreshTokenConfig);
}

export function removerTokens(res) {
  res.clearCookie('jwt');
  res.clearCookie('refreshToken');
}

// Middleware para proteger rotas
export function autenticarToken(req, res, next) {
  const token = req.cookies.jwt;
  
  if (!token) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  jwt.verify(token, accessTokenSecret, (err, usuario) => {
    if (err) {
      // Não remove os cookies aqui, deixa o cliente usar o refresh token
      return res.status(403).json({ message: "Token inválido" });
    }
    req.usuario = usuario;
    next();
  });
}