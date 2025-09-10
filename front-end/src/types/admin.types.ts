export interface AdminData {
    id: string;
    nome: string;
    funcao: string;
}

export interface AdminSign {
    nome: string;
    senha: string;
    funcao: string;
}

export interface Admin {
    id: string;
    nome: string;
    funcao: 'admin' | 'seguranca';
}