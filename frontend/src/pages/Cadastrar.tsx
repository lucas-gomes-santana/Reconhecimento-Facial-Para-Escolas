import VideoCanvasDetector from '../components/VideoAndCanvas';
import { useCadastroFacial } from '../hooks/frontend/useCadastro';
import { useValidation } from '../hooks/validation/useValidation';
import { Camera, Save } from 'lucide-react';
import '../styles/index.css';
import { useFaceDetection } from '../hooks/detection/useFaceDetection';

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
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-xl bg-white border-none shadow-xl rounded-lg">

        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <h1 className="text-center text-2xl font-semibold text-blue-700">
            Cadastro de Usuários
          </h1>
          <p className="text-center text-blue-600 text-sm mt-2">
            Sistema de Reconhecimento Facial
          </p>
        </div>
        
        {/* Formulário */}
        <form
          id="cadastroForm"
          className="px-6 pb-6 space-y-6"
          onSubmit={handleSalvarCadastro}
        >
          {/* Nome Completo */}
          <div className="space-y-2">
            <label
              htmlFor="nome"
              className="block text-sm font-medium text-gray-700"
            >
              Nome Completo
            </label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              placeholder="Digite seu nome completo"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Tipo de Usuário */}
          <div className="space-y-2">
            <label
              htmlFor="tipoUsuario"
              className="block text-sm font-medium text-gray-700"
            >
              Tipo de Usuário
            </label>
            <select
              id="tipoUsuario"
              value={tipoUsuario}
              onChange={(e) => setTipoUsuario(e.target.value)} 
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <label className="block text-sm font-medium text-gray-700">
              Captura Facial
            </label>
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
          <div className="bg-blue-700 rounded-lg p-4 text-center">
            <p className="text-white text-sm">
              {statusMessage || 'Sistema pronto - Preencha os dados e inicie o reconhecimento'}
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="grid grid-cols-2 gap-4">
            {!isDetecting ? (
              <button
                onClick={handleIniciarReconhecimento}
                type="button"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                Iniciar Reconhecimento
              </button>
            ) : (
              <button
                onClick={handlePararReconhecimento}
                type="button"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                Parar Reconhecimento
              </button>
            )}

            <button
              type="submit"
              disabled={!canSave || isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Salvando...' : 'Salvar Cadastro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Cadastrar;