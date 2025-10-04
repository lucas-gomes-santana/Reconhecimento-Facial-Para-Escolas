import cors from "cors";

const allowedOrigins = [
  'http://localhost:5173',
  'https://seu-frontend-react.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permite requisições que não vem do navegador. Desativar em produção para segurança do backend
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Requisição não permitida pelo CORS!'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  exposedHeaders: ['set-cookie'] // Importante para o Postman ver os cookies
};

export default cors(corsOptions);