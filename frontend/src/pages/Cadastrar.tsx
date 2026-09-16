import { Camera, Save } from "lucide-react";
import VideoCanvasDetector from "../components/VideoAndCanvas";
import { useCadastroFacial } from "../hooks/frontend/useCadastro";
import { useValidation } from "../hooks/validation/useValidation";
import { useFaceDetection } from "../hooks/detection/useFaceDetection";
import "../styles/index.css";

function Cadastrar() {
  const {
    nome,
    tipoUsuario,
    statusMessage,
    canSave,
    isLoading,
    videoRef,
    setNome,
    setTipoUsuario,
    canvasRef,
    handleIniciarReconhecimento,
    handlePararReconhecimento,
    handleSalvarCadastro,
    distanceStatus,
    isDetecting,
  } = useCadastroFacial();

  const { getDistanceMessage } = useValidation();

  const { expressionStatus } = useFaceDetection();

  return (
    <div className="cerf-scan-bg screen-vh flex items-center justify-center">
      <div className="w-full max-w-xl cerf-surface">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <h1 className="cerf-heading text-center text-2xl">Cadastro de Usuários</h1>
        </div>

        {/* Formulário */}
        <form id="cadastroForm" className="px-6 pb-6 space-y-6" onSubmit={handleSalvarCadastro}>
          {/* Nome Completo */}
          <div className="space-y-2">
            <label htmlFor="nome" className="cerf-label block">
              Nome Completo
            </label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              placeholder="Digite seu nome completo"
              className="cerf-input px-3 py-2"
            />
          </div>

          {/* Tipo de Usuário */}
          <div className="space-y-2">
            <label htmlFor="tipoUsuario" className="cerf-label block">
              Tipo de Usuário
            </label>
            <select
              id="tipoUsuario"
              value={tipoUsuario}
              onChange={(e) => setTipoUsuario(e.target.value)}
              required
              className="cerf-input px-3 py-2"
            >
              <option value="">Selecione o tipo de usuário</option>
              <option value="Professor">Professor</option>
              <option value="Aluno">Aluno</option>
              <option value="Funcionario">Funcionário</option>
              <option value="Outro">Outros</option>
            </select>
          </div>

          {/* Captura Facial */}
          <div className="space-y-2">
            <label className="cerf-label block">Captura Facial</label>
            <VideoCanvasDetector
              videoRef={videoRef}
              canvasRef={canvasRef}
              isDetecting={isDetecting}
              distanceStatus={distanceStatus}
              expressionStatus={expressionStatus}
              getDistanceMessage={getDistanceMessage}
            />
          </div>

          {/* Mensagem do Sistema */}
          <div className="cerf-band-dark rounded-lg p-4 text-center">
            <p className="text-sm">
              {statusMessage || "Sistema pronto - Preencha os dados e inicie o reconhecimento"}
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="grid grid-cols-2 gap-4">
            {!isDetecting ? (
              <button
                onClick={handleIniciarReconhecimento}
                type="button"
                disabled={isLoading}
                className="cerf-btn-success w-full flex items-center justify-center gap-2 px-4 py-3"
              >
                <Camera className="w-4 h-4" />
                Iniciar Reconhecimento
              </button>
            ) : (
              <button
                onClick={handlePararReconhecimento}
                type="button"
                disabled={isLoading}
                className="cerf-btn-danger w-full flex items-center justify-center gap-2 px-4 py-3"
              >
                <Camera className="w-4 h-4" />
                Parar Reconhecimento
              </button>
            )}

            <button
              type="submit"
              disabled={!canSave || isLoading}
              className="cerf-btn-primary w-full flex items-center justify-center gap-2 px-4 py-3"
            >
              <Save className="w-4 h-4" />
              {isLoading ? "Salvando..." : "Salvar Cadastro"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Cadastrar;
