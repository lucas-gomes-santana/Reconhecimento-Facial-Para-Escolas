export interface AdminData {
    _id: string;
    nome: string;
    funcao: 'admin' | 'seguranca';
    dataCadastro: string;
}

export interface AdminSign {
    nome: string;
    senha: string;
    funcao: string;
}