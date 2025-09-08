import cors from "cors";

const allowedOrigins = [
  'http://localhost:5173', // React/Vite desenvolvimento
  'https://seu-frontend-react.com' // produção
];

const corsOptions = {
  origin: function (origin, callback) {
    
    if (!origin) return callback(null, true); // Permitir requisições sem origin (Postman, apps móveis). Desativar isso em produção!
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Requisição não permitida pelo CORS!'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Permitir cookies/credentials se necessário
};

export default cors(corsOptions);