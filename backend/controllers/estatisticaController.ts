import type { Request, Response } from "express";
import type { EstatisticaModel } from "../models/Estatistica.ts";

export class EstatisticaController {
  private Estatistica: EstatisticaModel;
  private Usuario: import("mongoose").Model<any>;

  constructor(estatisticaModel: EstatisticaModel, usuarioModel: import("mongoose").Model<any>) {
    this.Estatistica = estatisticaModel;
    this.Usuario = usuarioModel;
  }

  async obterEstatisticas(req: Request, res: Response) {
    try {
      const estatistica = await this.Estatistica.getInstance();
      const totalCadastros = await this.Usuario.countDocuments();

      res.json({
        success: true,
        dados: {
          totalCadastros: totalCadastros,
          totalVerificacoes: estatistica.totalVerificacoes,
          totalEntradas: estatistica.totalEntradas,
          totalSaidas: estatistica.totalSaidas,
          totalMerendas: estatistica.totalMerendas,
          ultimaAtualizacao: estatistica.ultimaAtualizacao,
        },
      });
    } catch (err) {
      console.error("Erro ao obter estatísticas:", err);
      res.status(500).json({ message: (err as Error).message });
    }
  }

  async reiniciarVerificacoes(req: Request, res: Response) {
    try {
      const estatistica = await this.Estatistica.getInstance();
      estatistica.totalVerificacoes = 0;
      estatistica.ultimaAtualizacao = new Date();
      await estatistica.save();

      res.json({
        success: true,
        message: "Quantidade de verificações reiniciadas com sucesso",
      });
    } catch (err) {
      console.error("Erro ao reiniciar verificações:", err);
      res.status(500).json({ message: (err as Error).message });
    }
  }

  async obterEstatisticasDetalhadas(req: Request, res: Response) {
    try {
      const estatistica = await this.Estatistica.getInstance();
      const totalCadastros = await this.Usuario.countDocuments();

      const usuariosPorTipo = await this.Usuario.aggregate([
        {
          $group: {
            _id: "$tipoUsuario",
            quantidade: { $sum: 1 },
          },
        },
      ]);

      const primeiroUsuario = await this.Usuario.findOne().sort({
        dataCadastro: 1,
      });
      const ultimoCadastro = await this.Usuario.findOne().sort({
        dataCadastro: -1,
      });

      res.json({
        success: true,
        dados: {
          totalCadastros: totalCadastros,
          totalVerificacoes: estatistica.totalVerificacoes,
          totalEntradas: estatistica.totalEntradas,
          totalSaidas: estatistica.totalSaidas,
          totalMerendas: estatistica.totalMerendas,
          usuariosPorTipo,
          primeiroCadastro: primeiroUsuario?.dataCadastro,
          ultimoCadastro: ultimoCadastro?.dataCadastro,
          ultimaAtualizacao: estatistica.ultimaAtualizacao,
        },
      });
    } catch (err) {
      console.error("Erro ao obter estatísticas detalhadas:", err);
      res.status(500).json({ message: (err as Error).message });
    }
  }

  async gerarRelatorio(req: Request, res: Response) {
    try {
      const estatistica = await this.Estatistica.getInstance();
      const totalCadastros = await this.Usuario.countDocuments();

      const usuariosPorTipo = await this.Usuario.aggregate([
        {
          $group: {
            _id: "$tipoUsuario",
            quantidade: { $sum: 1 },
          },
        },
      ]);

      const ultimoCadastro = await this.Usuario.findOne().sort({
        dataCadastro: -1,
      });
      const primeiroCadastro = await this.Usuario.findOne().sort({
        dataCadastro: 1,
      });

      // Buscar usuários com nome, tipo E data de cadastro
      const todosUsuarios = await this.Usuario.find({}, "nome tipoUsuario dataCadastro")
        .sort({ nome: 1 })
        .lean(); // Retorna objetos Javascript puros ao invés do documento MongoDB inteiro, ideal para métodos de leitura

      const ordemTipos = ["Aluno", "Professor", "Funcionario", "Outro"];

      const usuariosOrganizados = ordemTipos
        .map((tipo) => {
          const usuarios = todosUsuarios
            .filter((u: any) => u.tipoUsuario === tipo)
            .map((u: any) => ({
              nome: u.nome,
              dataCadastro: u.dataCadastro,
            }));

          return {
            tipo,
            usuarios,
            quantidade: usuarios.length,
          };
        })
        .filter((grupo) => grupo.quantidade > 0);

      res.json({
        success: true,
        dados: {
          dataRelatorio: new Date(),
          totalCadastros,
          totalVerificacoes: estatistica.totalVerificacoes,
          totalEntradas: estatistica.totalEntradas,
          totalSaidas: estatistica.totalSaidas,
          totalMerendas: estatistica.totalMerendas,
          usuariosPorTipo,
          usuariosOrganizados,
          primeiroCadastro: primeiroCadastro?.dataCadastro,
          ultimoCadastro: ultimoCadastro?.dataCadastro,
          ultimaAtualizacao: estatistica.ultimaAtualizacao,
        },
      });
    } catch (error) {
      console.error("Erro ao gerar o relatório: ", error);
      res.status(500).json({ message: (error as Error).message });
    }
  }
}
