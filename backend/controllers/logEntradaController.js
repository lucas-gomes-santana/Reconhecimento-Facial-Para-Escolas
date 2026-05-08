export class LogEntradaController {
  constructor(logEntradaModel, estatisticaModel) {
    this.LogEntrada = logEntradaModel;
    this.Estatistica = estatisticaModel;
  }

  async buscarLogsPorUsuario(req, res) {
    try {
      const { usuarioId } = req.params;
      const { tipo, limite = 50 } = req.query;

      const filtro = { usuarioId: usuarioId };
      if (tipo) {
        filtro.tipo = tipo;
      }

      const logs = await this.LogEntrada.find(filtro)
        .sort({ timestamp: -1 })
        .limit(parseInt(limite))
        .lean();

      res.json({
        success: true,
        dados: logs,
      });
    } catch (err) {
      console.error("Erro ao buscar logs:", err);
      res.status(500).json({ message: err.message });
    }
  }

  async buscarLogsPorAlunoMatricula(req, res) {
    try {
      const { alunoMatriculaId } = req.params;
      const { tipo, limite = 50 } = req.query;

      const filtro = { alunoMatriculaId: alunoMatriculaId };
      if (tipo) {
        filtro.tipo = tipo;
      }

      const logs = await this.LogEntrada.find(filtro)
        .sort({ timestamp: -1 })
        .limit(parseInt(limite))
        .lean();

      res.json({
        success: true,
        dados: logs,
      });
    } catch (err) {
      console.error("Erro ao buscar logs:", err);
      res.status(500).json({ message: err.message });
    }
  }

  async buscarLogsPorData(req, res) {
    try {
      const { tipo } = req.query;
      const { dataInicio, dataFim } = req.query;

      const filtro = {};
      if (tipo) filtro.tipo = tipo;
      if (dataInicio || dataFim) {
        filtro.timestamp = {};
        if (dataInicio) filtro.timestamp.$gte = new Date(dataInicio);
        if (dataFim) filtro.timestamp.$lte = new Date(dataFim);
      }

      const logs = await this.LogEntrada.find(filtro).sort({ timestamp: -1 }).lean();

      res.json({
        success: true,
        dados: logs,
      });
    } catch (err) {
      console.error("Erro ao buscar logs por data:", err);
      res.status(500).json({ message: err.message });
    }
  }

  async registrarLog(req, res) {
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
      } else if (tipo === "saida") {
        await this.Estatistica.incrementarSaida();
      } else if (tipo === "merenda") {
        await this.Estatistica.incrementarMerenda();
      }

      res.status(201).json({
        success: true,
        dados: log,
      });
    } catch (err) {
      console.error("Erro ao registrar log:", err);
      res.status(500).json({ message: err.message });
    }
  }
}

