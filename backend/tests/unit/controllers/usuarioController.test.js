import { describe, it, expect, vi, beforeEach } from "vitest";
import { UsuarioController } from "../../../controllers/usuarioController.js";
import {
  usuarioMock,
  usuarioBloqueadoMock,
  usuarioInput,
  matchResult,
} from "../../fixtures/usuarios.ts";

vi.mock("../../../models/Usuario.js", () => ({
  default: {
    find: vi.fn(),
    findOne: vi.fn(),
    findById: vi.fn(),
    findByIdAndDelete: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    deleteMany: vi.fn(),
  },
}));

vi.mock("../../../models/LogEntrada.js", () => ({
  default: {
    create: vi.fn(),
  },
}));

vi.mock("../../../models/AlunoMatricula.js", () => ({
  default: {
    findOne: vi.fn(),
  },
}));

vi.mock("../../../services/faceRecognitionService.js", () => ({
  FaceRecognitionService: vi.fn().mockImplementation(() => ({
    verificarRostoExistente: vi.fn(),
    encontrarUsuarioPorSimilaridade: vi.fn(),
  })),
}));

vi.mock("../../../models/Estatistica.js", () => ({
  default: {
    incrementarVerificacoes: vi.fn(),
    incrementarEntrada: vi.fn(),
    incrementarSaida: vi.fn(),
    incrementarMerenda: vi.fn(),
    getInstance: vi.fn(),
  },
}));

import Usuario from "../../../models/Usuario.js";
import LogEntrada from "../../../models/LogEntrada.js";
import AlunoMatricula from "../../../models/AlunoMatricula.js";

describe("UsuarioController", () => {
  let controller;
  let mockFaceRecognitionService;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockFaceRecognitionService = {
      verificarRostoExistente: vi.fn(),
      encontrarUsuarioPorSimilaridade: vi.fn(),
    };

    const mockEstatistica = {
      incrementarVerificacoes: vi.fn().mockResolvedValue(true),
      incrementarEntrada: vi.fn().mockResolvedValue(true),
      incrementarSaida: vi.fn().mockResolvedValue(true),
      incrementarMerenda: vi.fn().mockResolvedValue(true),
    };

    controller = new UsuarioController(mockFaceRecognitionService, mockEstatistica);
    controller.Usuario = Usuario;
    controller.LogEntrada = LogEntrada;
    controller.AlunoMatricula = AlunoMatricula;

    mockReq = {
      body: {},
      params: {},
      query: {},
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    vi.clearAllMocks();
  });

  describe("cadastrarUsuario", () => {
    it("deve retornar 409 quando rosto já existe", async () => {
      mockReq.body = usuarioInput;
      mockFaceRecognitionService.verificarRostoExistente.mockResolvedValue(usuarioMock);

      await controller.cadastrarUsuario(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Rosto já cadastrado",
        usuarioExistente: usuarioMock.nome,
      });
    });

    it("deve retornar 500 em caso de erro", async () => {
      mockReq.body = usuarioInput;
      mockFaceRecognitionService.verificarRostoExistente.mockRejectedValue(new Error("DB Error"));

      await controller.cadastrarUsuario(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe("verificarRosto", () => {
    it("deve encontrar usuário com rosto similar", async () => {
      mockReq.body = { descriptor: usuarioInput.descriptor, contexto: "verificacao" };
      mockFaceRecognitionService.encontrarUsuarioPorSimilaridade.mockResolvedValue(matchResult);

      await controller.verificarRosto(mockReq, mockRes);

      expect(mockFaceRecognitionService.encontrarUsuarioPorSimilaridade).toHaveBeenCalledWith(
        usuarioInput.descriptor,
        0.96,
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        encontrado: true,
        usuario: expect.objectContaining({
          nome: usuarioMock.nome,
          tipoUsuario: usuarioMock.tipoUsuario,
        }),
        bloqueado: false,
        similaridade: 0.98,
      });
    });

    it("deve retornar não encontrado quando rosto não existe", async () => {
      mockReq.body = { descriptor: usuarioInput.descriptor, contexto: "verificacao" };
      mockFaceRecognitionService.encontrarUsuarioPorSimilaridade.mockResolvedValue(null);

      await controller.verificarRosto(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ encontrado: false });
    });

    it("deve bloquear usuário para merenda se já bloqueado", async () => {
      const matchBloqueado = {
        usuario: usuarioBloqueadoMock,
        similaridade: 0.98,
      };
      mockReq.body = { descriptor: usuarioInput.descriptor, contexto: "merenda" };
      mockFaceRecognitionService.encontrarUsuarioPorSimilaridade.mockResolvedValue(matchBloqueado);

      await controller.verificarRosto(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          encontrado: true,
          bloqueado: true,
        }),
      );
    });

    it("deve incrementar estatísticas quando contexto não é cadastro", async () => {
      mockReq.body = { descriptor: usuarioInput.descriptor, contexto: "verificacao" };
      mockFaceRecognitionService.encontrarUsuarioPorSimilaridade.mockResolvedValue(matchResult);

      await controller.verificarRosto(mockReq, mockRes);

      expect(mockFaceRecognitionService.encontrarUsuarioPorSimilaridade).toHaveBeenCalled();
    });

    it("deve registrar log de entrada para contexto entrada", async () => {
      mockReq.body = { descriptor: usuarioInput.descriptor, contexto: "entrada" };
      mockFaceRecognitionService.encontrarUsuarioPorSimilaridade.mockResolvedValue(matchResult);

      await controller.verificarRosto(mockReq, mockRes);

      expect(LogEntrada.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tipo: "entrada",
          usuarioId: usuarioMock._id,
        }),
      );
    });

    it("deve registrar log de saída para contexto saida", async () => {
      mockReq.body = { descriptor: usuarioInput.descriptor, contexto: "saida" };
      mockFaceRecognitionService.encontrarUsuarioPorSimilaridade.mockResolvedValue(matchResult);

      await controller.verificarRosto(mockReq, mockRes);

      expect(LogEntrada.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tipo: "saida",
        }),
      );
    });

    it("deve retornar 500 em caso de erro", async () => {
      mockReq.body = { descriptor: usuarioInput.descriptor, contexto: "verificacao" };
      mockFaceRecognitionService.encontrarUsuarioPorSimilaridade.mockRejectedValue(
        new Error("DB Error"),
      );

      await controller.verificarRosto(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe("listarUsuarios", () => {
    it("deve listar todos os usuários quando sem filtro", async () => {
      const usuarios = [usuarioMock, usuarioBloqueadoMock];
      Usuario.find.mockReturnValue({
        sort: vi.fn().mockResolvedValue(usuarios),
      });

      await controller.listarUsuarios(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(usuarios);
    });

    it("deve filtrar usuários por nome usando regex", async () => {
      mockReq.query = { nome: "João" };
      const usuarios = [usuarioMock];
      Usuario.find.mockReturnValue({
        sort: vi.fn().mockResolvedValue(usuarios),
      });

      await controller.listarUsuarios(mockReq, mockRes);

      expect(Usuario.find).toHaveBeenCalled();
    });

    it("deve retornar erro 500 em caso de falha", async () => {
      Usuario.find.mockReturnValue({
        sort: vi.fn().mockRejectedValue(new Error("DB Error")),
      });

      await controller.listarUsuarios(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe("removerUsuario", () => {
    it("deve remover usuário com sucesso", async () => {
      mockReq.params = { id: usuarioMock._id };
      Usuario.findByIdAndDelete.mockResolvedValue(usuarioMock);

      await controller.removerUsuario(mockReq, mockRes);

      expect(Usuario.findByIdAndDelete).toHaveBeenCalledWith(usuarioMock._id);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: `Usuário ${usuarioMock.nome} removido com sucesso`,
      });
    });
  });

  describe("removerTodosOsUsuarios", () => {
    it("deve remover todos os usuários e retornar mensagem de sucesso", async () => {
      controller.Usuario.deleteMany.mockResolvedValue({ deletedCount: 5 });

      await controller.removerTodosOsUsuarios(mockReq, mockRes);

      expect(controller.Usuario.deleteMany).toHaveBeenCalledWith({});
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Todos os usuários foram removidos com sucesso!",
      });
    });

    it("deve retornar mensagem quando não há usuários", async () => {
      controller.Usuario.deleteMany.mockResolvedValue({ deletedCount: 0 });

      await controller.removerTodosOsUsuarios(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Não há usuários cadastrados no sistema para remover.",
      });
    });
  });

  describe("bloquearUsuario", () => {
    it("deve bloquear usuário com sucesso", async () => {
      mockReq.params = { id: usuarioMock._id };
      const usuarioAtualizado = { ...usuarioMock, status: "bloqueado" };
      Usuario.findByIdAndUpdate.mockResolvedValue(usuarioAtualizado);

      await controller.bloquearUsuario(mockReq, mockRes);

      expect(Usuario.findByIdAndUpdate).toHaveBeenCalledWith(
        usuarioMock._id,
        expect.objectContaining({ status: "bloqueado" }),
        { new: true },
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        }),
      );
    });
  });

  describe("agendarDesbloqueio", () => {
    it("deve chamar setTimeout para desbloquear", async () => {
      vi.useFakeTimers();
      Usuario.findByIdAndUpdate.mockResolvedValue({ ...usuarioBloqueadoMock, status: "liberado" });

      const promise = controller.agendarDesbloqueio(usuarioMock._id, 1000);

      vi.advanceTimersByTime(1000);
      await promise;

      expect(Usuario.findByIdAndUpdate).toHaveBeenCalledWith(
        usuarioMock._id,
        expect.objectContaining({ status: "liberado" }),
      );
      vi.useRealTimers();
    });
  });
});
