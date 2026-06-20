import type { Request, Response } from "express";
import type { EstatisticaModel } from "../models/Estatistica.ts";
import type { ILogEntrada } from "../models/LogEntrada.ts";

export class LogEntradaController {
  private LogEntrada: import("mongoose").Model<ILogEntrada>;
  private Estatistica: EstatisticaModel;

  constructor(
    logEntradaModel: import("mongoose").Model<ILogEntrada>,
    estatisticaModel: EstatisticaModel,
  ) {
    this.LogEntrada = logEntradaModel;
    this.Estatistica = estatisticaModel;
  }

  async buscarLogsPorUsuario(req: Request, res: Response) {
    try {
      const usuarioId = req.params.usuarioId as string;
      const { tipo } = req.query as { tipo?: string };
      const limite = parseInt((req.query.limite as string) || "50");

      const filtro: Record<string, unknown> = { usuarioId: usuarioId };
      if (tipo) {
        filtro.tipo = tipo;
      }

      const logs = await this.LogEntrada.find(filtro).sort({ timestamp: -1 }).limit(limite).lean();

      res.json({
        success: true,
        dados: logs,
      });
    } catch (err) {
      console.error("Erro ao buscar logs:", err);
      res.status(500).json({ message: (err as Error).message });
    }
  }

  async buscarLogsPorAlunoMatricula(req: Request, res: Response) {
    try {
      const alunoMatriculaId = req.params.alunoMatriculaId as string;
      const { tipo } = req.query as { tipo?: string };
      const limite = parseInt((req.query.limite as string) || "50");

      const filtro: Record<string, unknown> = {
        alunoMatriculaId: alunoMatriculaId,
      };
      if (tipo) {
        filtro.tipo = tipo;
      }

      const logs = await this.LogEntrada.find(filtro).sort({ timestamp: -1 }).limit(limite).lean();

      res.json({
        success: true,
        dados: logs,
      });
    } catch (err) {
      console.error("Erro ao buscar logs:", err);
      res.status(500).json({ message: (err as Error).message });
    }
  }

  async buscarLogsPorData(req: Request, res: Response) {
    try {
      const { tipo, dataInicio, dataFim } = req.query as Record<string, string | undefined>;

      const filtro: Record<string, unknown> = {};
      if (tipo) filtro.tipo = tipo;
      if (dataInicio || dataFim) {
        filtro.timestamp = {};
        if (dataInicio) (filtro.timestamp as Record<string, Date>).$gte = new Date(dataInicio);
        if (dataFim) (filtro.timestamp as Record<string, Date>).$lte = new Date(dataFim);
      }

      const logs = await this.LogEntrada.find(filtro).sort({ timestamp: -1 }).lean();

      res.json({
        success: true,
        dados: logs,
      });
    } catch (err) {
      console.error("Erro ao buscar logs por data:", err);
      res.status(500).json({ message: (err as Error).message });
    }
  }

  async registrarLog(req: Request, res: Response) {
    try {
      const { usuarioId, tipo, similaridade, alunoMatriculaId } = req.body;

      if (!usuarioId || !tipo) {
        return res.status(400).json({ message: "usuarioId e tipo são obrigatórios" });
      }

      const log = await this.LogEntrada.create({
        usuarioId,
        tipo,
        similaridade,
        alunoMatriculaId: alunoMatriculaId || null,
        timestamp: new Date(),
      });

      if (tipo === "entrada") {
        await this.Estatistica.incrementarEntrada();
      } else if (tipo === "merenda") {
        await this.Estatistica.incrementarMerenda();
      }

      res.status(201).json({
        success: true,
        dados: log,
      });
    } catch (err) {
      console.error("Erro ao registrar log:", err);
      res.status(500).json({ message: (err as Error).message });
    }
  }
}
