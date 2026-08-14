import bcrypt from "bcrypt";

export function validarFuncaoCadastrada(funcao: string): boolean {
  const funcoesValidas = ["admin", "seguranca", "super-admin"];
  return funcoesValidas.includes(funcao.toLowerCase());
}

export async function validarSenha(senhaInformada: string, senhaArmazenada: string): Promise<boolean> {
  return await bcrypt.compare(senhaInformada, senhaArmazenada);
}

export async function criptografarSenha(senha: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(senha, saltRounds);
}
