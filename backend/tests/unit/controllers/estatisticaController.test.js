import { describe, it, expect, vi, beforeEach } from "vitest";
import { EstatisticaController } from "../../../controllers/estatisticaController.js";

describe("EstatisticaController", () => {
  let controller;
  let mockEstatisticaModel;
  let mockUsuarioModel;
  let mockReq;
  let mockRes;
  let estatisticaAtual;

  function criarEstatistica() {
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

    controller = new EstatisticaController(mockEstatisticaModel, mockUsuarioModel);

    mockReq = {};
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
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
