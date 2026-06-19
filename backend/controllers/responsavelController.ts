import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import Responsavel from "../models/Responsavel.js";
import Vinculo from "../models/Vinculo.js";
import AlunoMatricula from "../models/AlunoMatricula.js";
import LogEntrada from "../models/LogEntrada.js";
import {
  gerarAccessToken,
  gerarRefreshToken,
  definirTokens,
  removerTokens,
} from "../config/jwtConfig.js";
import type { TokenPayload } from "../config/jwtConfig.js";

declare global {
  namespace Express {
    interface Request {
      responsavel?: { id: string; tipo: string };
    }
  }
}

export class ResponsavelController {
  async cadastrar(req: Request, res: Response) {
    try {
      const {
        nomeCompleto,
        parentesco,
        cpf,
        telefone,
        email,
        senha,
        matriculaAluno,
        cpfAluno,
        nomeAluno,
      } = req.body;

      if (!nomeCompleto || !parentesco || !cpf || !telefone || !email || !senha) {
        return res
          .status(400)
          .json({ message: "Todos os campos são obrigatórios" });
      }

      if (!matriculaAluno && !cpfAluno) {
        return res
          .status(400)
          .json({ message: "Matrícula ou CPF do aluno é obrigatório" });
      }

      const responsavelExistente = await Responsavel.findOne({ cpf });
      if (responsavelExistente) {
        return res.status(400).json({ message: "CPF já possui conta" });
      }

      const emailExistente = await Responsavel.findOne({
        email: email.toLowerCase(),
      });
      if (emailExistente) {
        return res.status(400).json({ message: "E-mail já está em uso" });
      }

      const alunoQuery = matriculaAluno
        ? { matricula: matriculaAluno }
        : { cpf: cpfAluno };
      const alunoMatricula = await AlunoMatricula.findOne(alunoQuery);
      if (!alunoMatricula) {
        return res.status(404).json({ message: "Aluno não encontrado" });
      }

      if (nomeAluno) {
        const nomeNormalizadoAluno = nomeAluno.trim().toLowerCase();
        const nomeNormalizadoBanco =
          alunoMatricula.nomeCompleto.trim().toLowerCase();
        if (nomeNormalizadoAluno !== nomeNormalizadoBanco) {
          return res
            .status(400)
            .json({ message: "Dados do aluno não conferem" });
        }
      }

      const responsavel = new Responsavel({
        nomeCompleto,
        parentesco,
        cpf,
        telefone,
        email: email.toLowerCase(),
        senha,
      });
      await responsavel.save();

      const vinculo = new Vinculo({
        responsavelId: responsavel._id,
        alunoMatriculaId: alunoMatricula._id,
      });
      await vinculo.save();

      const payload: TokenPayload = { id: responsavel._id.toString() };
      const accessToken = gerarAccessToken(payload);
      const refreshToken = gerarRefreshToken(payload);

      definirTokens(res, accessToken, refreshToken);

      res.status(201).json({
        success: true,
        responsavel: {
          id: responsavel._id,
          nomeCompleto: responsavel.nomeCompleto,
        },
      });
    } catch (err) {
      console.error("Erro no cadastro de responsável:", err);
      res.status(500).json({ message: (err as Error).message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { cpf, senha } = req.body;

      if (!cpf || !senha) {
        return res
          .status(400)
          .json({ message: "CPF e senha são obrigatórios" });
      }

      const responsavel = await Responsavel.findOne({ cpf });
      if (!responsavel) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      const senhaValida = await bcrypt.compare(senha, responsavel.senha);
      if (!senhaValida) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      const payload: TokenPayload = { id: responsavel._id.toString() };
      const accessToken = gerarAccessToken(payload);
      const refreshToken = gerarRefreshToken(payload);

      definirTokens(res, accessToken, refreshToken);

      res.json({
        success: true,
        responsavel: {
          id: responsavel._id,
          nomeCompleto: responsavel.nomeCompleto,
        },
      });
    } catch (err) {
      console.error("Erro no login de responsável:", err);
      res.status(500).json({ message: (err as Error).message });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      removerTokens(res);
      res.json({ success: true, message: "Logout realizado com sucesso" });
    } catch (err) {
      console.error("Erro no logout:", err);
      res.status(500).json({ message: (err as Error).message });
    }
  }

  async perfil(req: Request, res: Response) {
    try {
      const responsavel = await Responsavel.findById(
        req.responsavel!.id,
      ).select("-senha");
      if (!responsavel) {
        return res
          .status(404)
          .json({ message: "Responsável não encontrado" });
      }

      res.json({ success: true, dados: responsavel });
    } catch (err) {
      console.error("Erro ao buscar perfil:", err);
      res.status(500).json({ message: (err as Error).message });
    }
  }

  async meusAlunos(req: Request, res: Response) {
    try {
      const vinculos = await Vinculo.find({
        responsavelId: req.responsavel!.id,
      })
        .populate("alunoMatriculaId")
        .lean();

      const alunos = vinculos
        .filter((v: any) => v.alunoMatriculaId)
        .map((v: any) => ({
          id: v.alunoMatriculaId._id,
          nomeCompleto: v.alunoMatriculaId.nomeCompleto,
          matricula: v.alunoMatriculaId.matricula,
          turma: v.alunoMatriculaId.turma,
          turno: v.alunoMatriculaId.turno,
        }));

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const amanha = new Date(hoje);
      amanha.setDate(amanha.getDate() + 1);

      const alunosComStatus = await Promise.all(
        alunos.map(async (aluno: any) => {
          const logsEntrada = await LogEntrada.find({
            usuarioId: { $exists: false },
            tipo: "entrada",
            timestamp: { $gte: hoje, $lt: amanha },
          }).lean();

          const logsMerenda = await LogEntrada.find({
            tipo: "merenda",
            timestamp: { $gte: hoje, $lt: amanha },
          }).lean();

          const logAluno = logsEntrada.find(
            (l: any) =>
              l.alunoMatriculaId?.toString() === aluno.id.toString(),
          );
          const logMerenda = logsMerenda.find(
            (l: any) =>
              l.alunoMatriculaId?.toString() === aluno.id.toString(),
          );

          return {
            ...aluno,
            entradaHoje: logAluno ? true : false,
            merendaHoje: logMerenda ? true : false,
          };
        }),
      );

      res.json({ success: true, dados: alunosComStatus });
    } catch (err) {
      console.error("Erro ao buscar alunos:", err);
      res.status(500).json({ message: (err as Error).message });
    }
  }

  async entradas(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const vinculo = await Vinculo.findOne({
        responsavelId: req.responsavel!.id,
        alunoMatriculaId: id,
      });

      if (!vinculo) {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const logs = await LogEntrada.find({ tipo: "entrada" })
        .sort({ timestamp: -1 })
        .limit(50)
        .lean();

      const logsFiltrados = (logs as any[]).filter(
        (l) => l.alunoMatriculaId?.toString() === id,
      );

      res.json({ success: true, dados: logsFiltrados });
    } catch (err) {
      console.error("Erro ao buscar entradas:", err);
      res.status(500).json({ message: (err as Error).message });
    }
  }

  async merenda(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const vinculo = await Vinculo.findOne({
        responsavelId: req.responsavel!.id,
        alunoMatriculaId: id,
      });

      if (!vinculo) {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const logs = await LogEntrada.find({ tipo: "merenda" })
        .sort({ timestamp: -1 })
        .limit(50)
        .lean();

      const logsFiltrados = (logs as any[]).filter(
        (l) => l.alunoMatriculaId?.toString() === id,
      );

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const amanha = new Date(hoje);
      amanha.setDate(amanha.getDate() + 1);

      const retiradaHoje = logsFiltrados.some((log) => {
        const dataLog = new Date(log.timestamp);
        return dataLog >= hoje && dataLog < amanha;
      });

      res.json({
        success: true,
        dados: {
          retiradaHoje,
          historico: logsFiltrados,
        },
      });
    } catch (err) {
      console.error("Erro ao buscar merenda:", err);
      res.status(500).json({ message: (err as Error).message });
    }
  }

  async vincular(req: Request, res: Response) {
    try {
      const { matriculaAluno, nomeAluno } = req.body;

      if (!matriculaAluno || !nomeAluno) {
        return res
          .status(400)
          .json({ message: "Matrícula e nome do aluno são obrigatórios" });
      }

      const alunoMatricula = await AlunoMatricula.findOne({
        matricula: matriculaAluno,
      });
      if (!alunoMatricula) {
        return res
          .status(404)
          .json({ message: "Matrícula não encontrada" });
      }

      const nomeNormalizadoAluno = nomeAluno.trim().toLowerCase();
      const nomeNormalizadoBanco =
        alunoMatricula.nomeCompleto.trim().toLowerCase();
      if (nomeNormalizadoAluno !== nomeNormalizadoBanco) {
        return res
          .status(400)
          .json({ message: "Dados do aluno não conferem" });
      }

      const vinculoExistente = await Vinculo.findOne({
        responsavelId: req.responsavel!.id,
        alunoMatriculaId: alunoMatricula._id,
      });

      if (vinculoExistente) {
        return res
          .status(400)
          .json({ message: "Aluno já vinculado" });
      }

      const vinculo = new Vinculo({
        responsavelId: req.responsavel!.id,
        alunoMatriculaId: alunoMatricula._id,
      });
      await vinculo.save();

      res.status(201).json({
        success: true,
        message: "Aluno vinculado com sucesso",
      });
    } catch (err) {
      console.error("Erro ao vincular aluno:", err);
      res.status(500).json({ message: (err as Error).message });
    }
  }

  async validarMatricula(req: Request, res: Response) {
    try {
      const { matricula, cpf, nomeAluno } = req.body;

      if (!matricula && !cpf) {
        return res
          .status(400)
          .json({ message: "Matrícula ou CPF é obrigatório", found: false });
      }

      const query = matricula ? { matricula } : { cpf };
      const alunoMatricula = await AlunoMatricula.findOne(query);

      if (!alunoMatricula) {
        return res
          .status(404)
          .json({ message: "Aluno não encontrado", found: false });
      }

      if (nomeAluno) {
        const nomeNormalizadoAluno = nomeAluno.trim().toLowerCase();
        const nomeNormalizadoBanco =
          alunoMatricula.nomeCompleto.trim().toLowerCase();

        if (nomeNormalizadoAluno !== nomeNormalizadoBanco) {
          return res
            .status(400)
            .json({
              message: "Dados do aluno não conferem",
              found: false,
            });
        }
      }

      return res.json({
        found: true,
        aluno: {
          id: alunoMatricula._id,
          nomeCompleto: alunoMatricula.nomeCompleto,
          matricula: alunoMatricula.matricula,
          cpf: alunoMatricula.cpf,
          turma: alunoMatricula.turma,
          turno: alunoMatricula.turno,
        },
      });
    } catch (err) {
      console.error("Erro ao validar matrícula:", err);
      res.status(500).json({ message: (err as Error).message });
    }
  }
}
