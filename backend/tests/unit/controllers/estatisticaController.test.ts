import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";
import { EstatisticaController } from "../../../controllers/estatisticaController.ts";
import type { EstatisticaModel } from "../../../models/Estatistica.ts";
import type { IUsuario } from "../../../models/Usuario.ts";

interface EstatisticaAtual {
  _id: string;
  totalVerificacoes: number;
  totalEntradas: number;
  totalSaidas: number;
  totalMerendas: number;
  ultimaAtualizacao: Date;
  save: ReturnType<typeof vi.fn>;
}

interface MockEstatisticaModel {
  getInstance: ReturnType<typeof vi.fn>;
}

interface MockUsuarioModel {
  countDocuments: ReturnType<typeof vi.fn>;
  aggregate: ReturnType<typeof vi.fn>;
  findOne: ReturnType<typeof vi.fn>;
  find: ReturnType<typeof vi.fn>;
}

describe("EstatisticaController", () => {
  let controller: EstatisticaController;
  let mockEstatisticaModel: MockEstatisticaModel;
  let mockUsuarioModel: MockUsuarioModel;
  let mockReq: Request;
  let mockRes: Response;
  let estatisticaAtual: EstatisticaAtual;

  function criarEstatistica(): EstatisticaAtual {
    return {
      _id: "807f1f77bcf86cd799439011",
      totalVerificacoes: 100,
      totalEntradas: 50,
      totalSaidas: 30,
      totalMerendas: 20,
      ultimaAtualizacao: new Date("2025-06-01"),
      save: vi.fn().mockResolvedValue(true),
    };
  }

  beforeEach(() => {
    estatisticaAtual = criarEstatistica();

    mockEstatisticaModel = {
      getInstance: vi.fn().mockResolvedValue(estatisticaAtual),
    };

    mockUsuarioModel = {
      countDocuments: vi.fn().mockResolvedValue(0),
      aggregate: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(() => ({
        sort: vi.fn().mockResolvedValue(null),
      })),
      find: vi.fn(() => ({
        sort: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      })),
    };

    controller = new EstatisticaController(
      mockEstatisticaModel as unknown as EstatisticaModel,
      mockUsuarioModel as unknown as import("mongoose").Model<IUsuario>,
    );

    mockReq = {} as unknown as Request;
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
  });

  describe("obterEstatisticas", () => {
    it("deve retornar estatísticas com sucesso", async () => {
      mockUsuarioModel.countDocuments.mockResolvedValue(200);

      await controller.obterEstatisticas(mockReq, mockRes);

      expect(mockEstatisticaModel.getInstance).toHaveBeenCalledTimes(1);
      expect(mockUsuarioModel.countDocuments).toHaveBeenCalledTimes(1);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        dados: {
          totalCadastros: 200,
          totalVerificacoes: 100,
          totalEntradas: 50,
          totalSaidas: 30,
          totalMerendas: 20,
          ultimaAtualizacao: estatisticaAtual.ultimaAtualizacao,
        },
      });
    });

    it("deve retornar 500 em caso de erro", async () => {
      mockEstatisticaModel.getInstance.mockRejectedValue(new Error("DB Error"));

      await controller.obterEstatisticas(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "DB Error" });
    });
  });

  describe("reiniciarVerificacoes", () => {
    it("deve zerar totalVerificacoes", async () => {
      await controller.reiniciarVerificacoes(mockReq, mockRes);

      expect(mockEstatisticaModel.getInstance).toHaveBeenCalledTimes(1);
      expect(estatisticaAtual.totalVerificacoes).toBe(0);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Quantidade de verificações reiniciadas com sucesso",
      });
    });

    it("deve retornar 500 em caso de erro", async () => {
      mockEstatisticaModel.getInstance.mockRejectedValue(new Error("Erro DB"));

      await controller.reiniciarVerificacoes(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe("obterEstatisticasDetalhadas", () => {
    it("deve retornar estatísticas detalhadas com agregação por tipo", async () => {
      mockUsuarioModel.countDocuments.mockResolvedValue(200);
      mockUsuarioModel.aggregate.mockResolvedValue([
        { _id: "Aluno", quantidade: 100 },
        { _id: "Professor", quantidade: 50 },
      ]);

      const primeiroUsuario = {
        _id: "1",
        nome: "Primeiro",
        dataCadastro: new Date("2025-01-01"),
      };
      const ultimoUsuario = {
        _id: "2",
        nome: "Ultimo",
        dataCadastro: new Date("2025-06-01"),
      };

      const sortMock = vi
        .fn()
        .mockResolvedValueOnce(primeiroUsuario)
        .mockResolvedValueOnce(ultimoUsuario);
      mockUsuarioModel.findOne = vi.fn(() => ({ sort: sortMock }));

      await controller.obterEstatisticasDetalhadas(mockReq, mockRes);

      expect(mockUsuarioModel.aggregate).toHaveBeenCalledWith([
        { $group: { _id: "$tipoUsuario", quantidade: { $sum: 1 } } },
      ]);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        dados: expect.objectContaining({
          totalCadastros: 200,
          usuariosPorTipo: [
            { _id: "Aluno", quantidade: 100 },
            { _id: "Professor", quantidade: 50 },
          ],
          primeiroCadastro: primeiroUsuario.dataCadastro,
          ultimoCadastro: ultimoUsuario.dataCadastro,
        }),
      });
    });

    it("deve retornar 500 em caso de erro", async () => {
      mockEstatisticaModel.getInstance.mockRejectedValue(new Error("Erro DB"));

      await controller.obterEstatisticasDetalhadas(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe("gerarRelatorio", () => {
    it("deve gerar relatório completo", async () => {
      mockUsuarioModel.countDocuments.mockResolvedValue(200);
      mockUsuarioModel.aggregate.mockResolvedValue([
        { _id: "Aluno", quantidade: 100 },
        { _id: "Professor", quantidade: 50 },
      ]);

      const primeiroUsuario = {
        _id: "1",
        nome: "Primeiro",
        dataCadastro: new Date("2025-01-01"),
      };
      const ultimoUsuario = {
        _id: "2",
        nome: "Ultimo",
        dataCadastro: new Date("2025-06-01"),
      };

      const sortMock = vi
        .fn()
        .mockResolvedValueOnce(ultimoUsuario)
        .mockResolvedValueOnce(primeiroUsuario);
      mockUsuarioModel.findOne = vi.fn(() => ({ sort: sortMock }));

      const todosUsuarios = [
        { nome: "João", tipoUsuario: "Aluno", dataCadastro: new Date("2025-01-01") },
        { nome: "Maria", tipoUsuario: "Professor", dataCadastro: new Date("2025-02-01") },
        { nome: "Pedro", tipoUsuario: "Aluno", dataCadastro: new Date("2025-03-01") },
      ];
      mockUsuarioModel.find = vi.fn(() => ({
        sort: vi.fn(() => ({
          lean: vi.fn().mockResolvedValue(todosUsuarios),
        })),
      }));

      await controller.gerarRelatorio(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        dados: expect.objectContaining({
          dataRelatorio: expect.any(Date),
          totalCadastros: 200,
          totalVerificacoes: 100,
          usuariosOrganizados: [
            { tipo: "Aluno", quantidade: 2, usuarios: expect.any(Array) },
            { tipo: "Professor", quantidade: 1, usuarios: expect.any(Array) },
          ],
        }),
      });
    });

    it("deve retornar 500 em caso de erro", async () => {
      mockEstatisticaModel.getInstance.mockRejectedValue(new Error("Erro DB"));

      await controller.gerarRelatorio(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });
});
