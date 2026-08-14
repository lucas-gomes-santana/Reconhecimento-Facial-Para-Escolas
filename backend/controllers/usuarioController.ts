import type { Request, Response } from "express";
import Usuario from "../models/Usuario.ts";
import LogEntrada from "../models/LogEntrada.ts";
import AlunoMatricula from "../models/AlunoMatricula.ts";
import { FaceRecognitionService } from "../services/faceRecognitionService.ts";
import type { EstatisticaModel } from "../models/Estatistica.ts";
import { threshold } from "../utils/threshold.ts";

export class UsuarioController {
  private faceRecognitionService: FaceRecognitionService;
  private Estatistica: EstatisticaModel;
  private Usuario = Usuario;
  private LogEntrada = LogEntrada;
  private AlunoMatricula = AlunoMatricula;
  private threshold = threshold;

  constructor(faceRecognitionService: FaceRecognitionService, estatisticaModel: EstatisticaModel) {
    this.faceRecognitionService = faceRecognitionService;
    this.Estatistica = estatisticaModel;
  }

  private async buscarAlunoMatriculaPorUsuario(usuarioId: string) {
    return await this.AlunoMatricula.findOne({ usuarioId });
  }

  private async registrarLogEntrada(usuarioId: string, tipo: string, similaridade: number) {
    const alunoMatricula = await this.buscarAlunoMatriculaPorUsuario(usuarioId);
    const log = await this.LogEntrada.create({
      usuarioId,
      tipo,
      similaridade,
      alunoMatriculaId: alunoMatricula?._id || null,
      timestamp: new Date(),
    });

    if (tipo === "entrada") {
      await this.Estatistica.incrementarEntrada();
    } else if (tipo === "merenda") {
      await this.Estatistica.incrementarMerenda();
    }

    return log;
  }

  async cadastrarUsuario(req: Request, res: Response) {
    try {
      const { nome, tipoUsuario, descriptor } = req.body;

      const rostoExistente = await this.faceRecognitionService.verificarRostoExistente(
        descriptor,
        threshold,
      );

      if (rostoExistente) {
        return res.status(409).json({
          error: "Rosto já cadastrado",
          usuarioExistente: rostoExistente.nome,
        });
      }

      const novoUsuario = new Usuario({ nome, tipoUsuario, descriptor });
      await novoUsuario.save();

      console.log(`Usuário ${nome} cadastrado com sucesso`);

      res.status(201).json({
        success: true,
        usuario: {
          id: novoUsuario._id,
          nome: novoUsuario.nome,
          tipo: novoUsuario.tipoUsuario,
          data: novoUsuario.dataCadastro,
        },
      });
    } catch (err) {
      console.error("Erro no cadastro:", err);
      res.status(500).json({ error: (err as Error).message });
    }
  }

  async verificarRosto(req: Request, res: Response) {
    try {
      const { descriptor, contexto } = req.body;

      console.log("Iniciando verificação facial...");

      const match = await this.faceRecognitionService.encontrarUsuarioPorSimilaridade(
        descriptor,
        threshold,
      );

      if (contexto !== "cadastro") {
        await this.Estatistica.incrementarVerificacoes();
      }

      if (match) {
        console.log(
          `Usuário encontrado: ${match.usuario.nome} (similaridade: ${(match.similaridade * 100).toFixed(1)}%)`,
        );

        const estaBloqueado = match.usuario.status === "bloqueado";
        const aindaBloqueado =
          estaBloqueado &&
          match.usuario.bloqueadoAte &&
          new Date(match.usuario.bloqueadoAte) > new Date();

        if (contexto === "verificacao" || contexto === "entrada") {
          await this.registrarLogEntrada(
            match.usuario._id.toString(),
            "entrada",
            match.similaridade,
          );
        } else if (contexto === "saida") {
          await this.registrarLogEntrada(match.usuario._id.toString(), "saida", match.similaridade);
        } else if (contexto === "merenda" && !aindaBloqueado) {
          await this.registrarLogEntrada(
            match.usuario._id.toString(),
            "merenda",
            match.similaridade,
          );
        }

        return res.json({
          encontrado: true,
          usuario: {
            id: match.usuario._id,
            nome: match.usuario.nome,
            tipoUsuario: match.usuario.tipoUsuario,
            dataCadastro: match.usuario.dataCadastro,
            status: match.usuario.status,
            bloqueadoAte: match.usuario.bloqueadoAte,
          },
          bloqueado: aindaBloqueado,
          similaridade: match.similaridade,
        });
      } else {
        console.log("Nenhum usuário similar encontrado");
        return res.json({ encontrado: false });
      }
    } catch (err) {
      console.error("Erro na verificação:", err);
      res.status(500).json({ error: (err as Error).message });
    }
  }

  async listarUsuarios(req: Request, res: Response) {
    try {
      const { nome } = req.query as { nome?: string };

      if (nome && nome.trim() !== "") {
        const usuarios = await Usuario.find(
          {
            nome: { $regex: new RegExp(nome.trim(), "i") },
          },
          { descriptor: 0 },
        ).sort({ dataCadastro: -1 });

        return res.json(usuarios);
      }

      // Se não foi passado nome, retorna todos os usuários
      const usuarios = await Usuario.find({}, { descriptor: 0 }).sort({
        dataCadastro: -1,
      });
      res.json(usuarios);
    } catch (err) {
      console.error("Erro ao listar usuários:", err);
      res.status(500).json({ error: (err as Error).message });
    }
  }

  async removerUsuario(req: Request, res: Response) {
    const id = req.params.id as string;

    const usuario = await Usuario.findByIdAndDelete(id);

    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    console.log(`Usuário ${usuario.nome} removido do C.E.R.F com sucesso`);

    res.json({
      message: `Usuário ${usuario.nome} removido com sucesso`,
    });
  }

  async removerTodosOsUsuarios(req: Request, res: Response) {
    const usuario = await this.Usuario.deleteMany({});

    const mensagem =
      usuario.deletedCount === 0
        ? "Não há usuários cadastrados no sistema para remover."
        : "Todos os usuários foram removidos com sucesso!";

    res.status(200).json({
      success: true,
      message: mensagem,
    });
  }

  bloquearUsuario = async (req: Request, res: Response) => {
    const id = req.params.id as string;

    const tempoBloqueio = 60 * 1000; // 1 minuto em milissegundos (ajustar para um tempo maior em produção)
    const bloqueadoAte = new Date(Date.now() + tempoBloqueio);

    const usuario = await Usuario.findByIdAndUpdate(
      id,
      {
        status: "bloqueado" as const,
        bloqueadoAte: bloqueadoAte,
      },
      { new: true },
    );

    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    this.agendarDesbloqueio(id, tempoBloqueio);

    console.log(`Usuário ${usuario.nome} proibido de pegar merenda por 1 minuto`);

    return res.json({
      success: true,
      message: `Usuário ${usuario.nome} proibido de pegar merenda por 1 minuto`,
    });
  };

  agendarDesbloqueio = async (usuarioId: string, tempo: number) => {
    setTimeout(async () => {
      try {
        const usuario = await Usuario.findByIdAndUpdate(usuarioId, {
          status: "liberado" as const,
          bloqueadoAte: null,
        });
        if (usuario) {
          console.log(`Usuário ${usuario.nome} liberado para pegar merenda`);
        }
      } catch (error) {
        console.error("Erro ao desbloquear usuário: ", error);
      }
    }, tempo);
  };
}
