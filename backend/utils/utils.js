import bcrypt from 'bcrypt';

export function validarFuncao(funcao) {
    const funcoesValidas = ['admin', 'seguranca', 'super-admin'];
    return funcoesValidas.includes(funcao.toLowerCase());
}

export async function validarSenha(senhaInformada, senhaArmazenada) {
    return await bcrypt.compare(senhaInformada, senhaArmazenada);
}

export async function criptografarSenha(senha) {
    const saltRounds = 12;
    return await bcrypt.hash(senha, saltRounds);
}