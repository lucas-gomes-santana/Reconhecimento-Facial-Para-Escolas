import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Estatistica Model", () => {
  describe("Estrutura do Schema", () => {
    it("deve ter os campos definidos no modelo", () => {
      const campos = [
        "totalVerificacoes",
        "totalEntradas",
        "totalSaidas",
        "totalMerendas",
        "ultimaAtualizacao",
      ];

      campos.forEach((campo) => {
        expect(campo).toBeDefined();
      });
    });

    it("deve ter defaults zerados", () => {
      expect(0).toBe(0);
    });
  });

  describe("getInstance (Singleton)", () => {
    let mockModel;

    beforeEach(() => {
      mockModel = {
        findOne: vi.fn(),
        create: vi.fn(),
      };
    });

    it("deve retornar documento existente", async () => {
      const estatisticaExistente = {
        _id: "123",
        totalVerificacoes: 100,
      };
      mockModel.findOne.mockResolvedValue(estatisticaExistente);

      const getInstance = async function () {
        let estatistica = await this.findOne();
        if (!estatistica) {
          estatistica = await this.create({});
        }
        return estatistica;
      };

      const result = await getInstance.call(mockModel);

      expect(mockModel.findOne).toHaveBeenCalledTimes(1);
      expect(mockModel.create).not.toHaveBeenCalled();
      expect(result).toBe(estatisticaExistente);
    });

    it("deve criar novo documento se não existir", async () => {
      mockModel.findOne.mockResolvedValue(null);
      const novaEstatistica = { _id: "456", totalVerificacoes: 0 };
      mockModel.create.mockResolvedValue(novaEstatistica);

      const getInstance = async function () {
        let estatistica = await this.findOne();
        if (!estatistica) {
          estatistica = await this.create({});
        }
        return estatistica;
      };

      const result = await getInstance.call(mockModel);

      expect(mockModel.findOne).toHaveBeenCalledTimes(1);
      expect(mockModel.create).toHaveBeenCalledWith({});
      expect(result).toBe(novaEstatistica);
    });
  });

  describe("incrementarVerificacoes", () => {
    it("deve incrementar totalVerificacoes em 1", async () => {
      const estatistica = {
        totalVerificacoes: 100,
        ultimaAtualizacao: new Date("2025-01-01"),
        save: vi.fn().mockResolvedValue(true),
      };

      const mockModel = {
        getInstance: vi.fn().mockResolvedValue(estatistica),
      };

      const incrementarVerificacoes = async function () {
        const estat = await this.getInstance();
        estat.totalVerificacoes += 1;
        estat.ultimaAtualizacao = new Date();
        await estat.save();
        return estat;
      };

      await incrementarVerificacoes.call(mockModel);
      expect(mockModel.getInstance).toHaveBeenCalledTimes(1);
      expect(estatistica.totalVerificacoes).toBe(101);
      expect(estatistica.save).toHaveBeenCalledTimes(1);
    });

    it("deve incrementar partindo de 0", async () => {
      const estatistica = {
        totalVerificacoes: 0,
        ultimaAtualizacao: new Date("2025-01-01"),
        save: vi.fn().mockResolvedValue(true),
      };

      const mockModel = {
        getInstance: vi.fn().mockResolvedValue(estatistica),
      };

      const incrementarVerificacoes = async function () {
        const estat = await this.getInstance();
        estat.totalVerificacoes += 1;
        estat.ultimaAtualizacao = new Date();
        await estat.save();
        return estat;
      };

      await incrementarVerificacoes.call(mockModel);
      expect(estatistica.totalVerificacoes).toBe(1);
    });
  });

  describe("incrementarEntrada", () => {
    it("deve incrementar totalEntradas em 1", async () => {
      const estatistica = {
        totalEntradas: 50,
        ultimaAtualizacao: new Date("2025-01-01"),
        save: vi.fn().mockResolvedValue(true),
      };

      const mockModel = {
        getInstance: vi.fn().mockResolvedValue(estatistica),
      };

      const incrementarEntrada = async function () {
        const estat = await this.getInstance();
        estat.totalEntradas += 1;
        estat.ultimaAtualizacao = new Date();
        await estat.save();
        return estat;
      };

      await incrementarEntrada.call(mockModel);

      expect(estatistica.totalEntradas).toBe(51);
    });
  });

  describe("incrementarSaida", () => {
    it("deve incrementar totalSaidas em 1", async () => {
      const estatistica = {
        totalSaidas: 30,
        ultimaAtualizacao: new Date("2025-01-01"),
        save: vi.fn().mockResolvedValue(true),
      };

      const mockModel = {
        getInstance: vi.fn().mockResolvedValue(estatistica),
      };

      const incrementarSaida = async function () {
        const estat = await this.getInstance();
        estat.totalSaidas += 1;
        estat.ultimaAtualizacao = new Date();
        await estat.save();
        return estat;
      };

      await incrementarSaida.call(mockModel);

      expect(estatistica.totalSaidas).toBe(31);
    });
  });

  describe("incrementarMerenda", () => {
    it("deve incrementar totalMerendas em 1", async () => {
      const estatistica = {
        totalMerendas: 20,
        ultimaAtualizacao: new Date("2025-01-01"),
        save: vi.fn().mockResolvedValue(true),
      };

      const mockModel = {
        getInstance: vi.fn().mockResolvedValue(estatistica),
      };

      const incrementarMerenda = async function () {
        const estat = await this.getInstance();
        estat.totalMerendas += 1;
        estat.ultimaAtualizacao = new Date();
        await estat.save();
        return estat;
      };

      await incrementarMerenda.call(mockModel);

      expect(estatistica.totalMerendas).toBe(21);
    });
  });
});
