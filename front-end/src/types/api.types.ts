export interface ApiResponse {
    success: boolean;
    message?: string;
    admin?: {
        id: string;
        nome: string;
        funcao: string;
    };
    error?: string;
}