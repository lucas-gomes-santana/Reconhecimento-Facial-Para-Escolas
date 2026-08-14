import type { NextFunction, Request, Response } from "express";

export class ValidationMiddleware {
  validateLogin(req: Request, res: Response, next: NextFunction): void {
    const { nome, senha } = req.body;

    if (!nome || !senha) {
      res.status(400).json({ message: "Todos os campos são obrigatórios" });
      return;
    }

    next();
  }

  validateCadastroUsuario(req: Request, res: Response, next: NextFunction): void {
    const { nome, tipoUsuario, descriptor } = req.body;

    if (!nome || !tipoUsuario || !descriptor) {
      res.status(400).json({ message: "Dados incompletos" });
      return;
    }

    next();
  }

  validateVerificacaoRosto(req: Request, res: Response, next: NextFunction): void {
    const { descriptor, contexto } = req.body;
    const errors: string[] = [];

    if (!descriptor) {
      errors.push("Descritor facial não fornecido");
    }

    if (!Array.isArray(descriptor)) {
      errors.push("Formato do descritor facial inválido");
    }

    if (contexto && !["cadastro", "verificacao", "merenda"].includes(contexto)) {
      errors.push("Contexto inválido");
    }

    if (errors.length > 0) {
      res.status(400).json({ message: errors });
      return;
    }

    next();
  }

  validateCadastroAdmin(req: Request, res: Response, next: NextFunction): void {
    const { nome, senha, funcao } = req.body;
    const errors: string[] = [];

    if (!nome || !senha || !funcao) {
      errors.push("Todos os campos são obrigatórios");
    }

    if (senha.length < 8) {
      errors.push("A senha deve ter mínimo de 8 caracteres");
    }

    if (errors.length > 0) {
      res.status(400).json({ message: errors });
      return;
    }

    next();
  }

  validateId(req: Request, res: Response, next: NextFunction): void {
    const { id } = req.body;

    if (!id) {
      res.status(400).json({ message: "Id obrigatório para realizar a operação" });
      return;
    }

    next();
  }

  validateIdParam(req: Request, res: Response, next: NextFunction): void {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: "Id obrigatório para realizar a operação" });
      return;
    }

    next();
  }

  validateMudancaDeSenha(req: Request, res: Response, next: NextFunction): void {
    const { id, novaSenha, confirmarSenha } = req.body;
    const errors: string[] = [];

    if (!id || !novaSenha) {
      errors.push("Todos os campos são obrigatórios");
    }

    if (novaSenha !== confirmarSenha) {
      errors.push("As senhas nova e de confirmação estão diferentes");
    }

    if (novaSenha.length < 8) {
      errors.push("A senha deve ter mínimo de 8 caracteres");
    }

    if (errors.length > 0) {
      res.status(400).json({ message: errors });
      return;
    }

    next();
  }
}

export default new ValidationMiddleware();
