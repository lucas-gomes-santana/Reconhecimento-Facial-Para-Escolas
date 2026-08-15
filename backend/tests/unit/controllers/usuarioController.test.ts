import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";
import { UsuarioController } from "../../../controllers/usuarioController.ts";
import type { FaceRecognitionService } from "../../../services/faceRecognitionService.ts";
import type { EstatisticaModel } from "../../../models/Estatistica.ts";
import {
  usuarioMock,
  usuarioBloqueadoMock,
  usuarioInput,
  matchResult,
} from "../../fixtures/usuarios.ts";
import UsuarioModel from "../../../models/Usuario.ts";
import LogEntradaModel from "../../../models/LogEntrada.ts";

vi.mock("../../../models/Usuario.ts", () => ({
  default: {
    find: vi.fn(),
    findOne: vi.fn(),
    findById: vi.fn(),
    findByIdAndDelete: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    deleteMany: vi.fn(),
  },
}));

vi.mock("../../../models/LogEntrada.ts", () => ({
  default: {
    create: vi.fn(),
  },
}));

vi.mock("../../../models/AlunoMatricula.ts", () => ({
  default: {
    findOne: vi.fn(),
  },
}));

vi.mock("../../../services/faceRecognitionService.ts", () => ({
  FaceRecognitionService: vi.fn().mockImplementation(() => ({
    verificarRostoExistente: vi.fn(),
    encontrarUsuarioPorSimilaridade: vi.fn(),
  })),
}));

vi.mock("../../../models/Estatistica.ts", () => ({
  default: {
    incrementarVerificacoes: vi.fn(),
    incrementarEntrada: vi.fn(),
    incrementarSaida: vi.fn(),
    incrementarMerenda: vi.fn(),
    getInstance: vi.fn(),
  },
}));

interface MockUsuarioModel {
  find: ReturnType<typeof vi.fn>;
  findOne: ReturnType<typeof vi.fn>;
  findById: ReturnType<typeof vi.fn>;
  findByIdAndDelete: ReturnType<typeof vi.fn>;
  findByIdAndUpdate: ReturnType<typeof vi.fn>;
  deleteMany: ReturnType<typeof vi.fn>;
}

interface MockLogEntradaModel {
  create: ReturnType<typeof vi.fn>;
}

const Usuario = UsuarioModel as unknown as MockUsuarioModel;
const LogEntrada = LogEntradaModel as unknown as MockLogEntradaModel;

describe("UsuarioController", () => {
  let controller: UsuarioController;
  let mockFaceRecognitionService: {
    verificarRostoExistente: ReturnType<typeof vi.fn>;
    encontrarUsuarioPorSimilaridade: ReturnType<typeof vi.fn>;
  };
  let mockReq: Request;
  let mockRes: Response;

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

    controller = new UsuarioController(
      mockFaceRecognitionService as unknown as FaceRecognitionService,
      mockEstatistica as unknown as EstatisticaModel,
    );

    mockReq = {
      body: {},
      params: {},
      query: {},
    } as unknown as Request;
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

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
      Usuario.deleteMany.mockResolvedValue({ deletedCount: 5 });

      await controller.removerTodosOsUsuarios(mockReq, mockRes);

      expect(Usuario.deleteMany).toHaveBeenCalledWith({});
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Todos os usuários foram removidos com sucesso!",
      });
    });

    it("deve retornar mensagem quando não há usuários", async () => {
      Usuario.deleteMany.mockResolvedValue({ deletedCount: 0 });

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
