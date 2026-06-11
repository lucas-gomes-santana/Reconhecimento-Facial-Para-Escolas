import cors, { type CorsOptions } from "cors";

const allowedOrigins = ["http://localhost:5173"];

const corsOptions: CorsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) {
    // Permite requisições que não vem do navegador. Desativar em produção para segurança do backend
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Requisição não permitida pelo CORS!"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "PUT"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  exposedHeaders: ["set-cookie"], // Importante para o Postman ver os cookies jwt e usá-los automaticamente
};

export default cors(corsOptions);
