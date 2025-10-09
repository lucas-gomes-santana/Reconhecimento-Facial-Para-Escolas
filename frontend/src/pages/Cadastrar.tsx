import VideoCanvasDetector from '../components/VideoAndCanvas';
import { useVerificacao } from '../hooks/auth/useVerificacao';
import { useCadastroFacial } from '../hooks/frontend/useCadastro';
import { useValidation } from '../hooks/validation/useValidation';
import '../styles/index.css';


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
  } = useCadastroFacial();

  const { distanceStatus, isDetecting } = useVerificacao();

  const { getDistanceMessage } = useValidation();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        📝 Cadastro de Usuário
      </h1>

      {/* Formulário */}
      <form
        id="cadastroForm"
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-2xl"
        onSubmit={handleSalvarCadastro}
      >
        <div className="mb-6">
          <label
            htmlFor="nome"
            className="block text-gray-800 font-semibold mb-2"
          >
            Nome Completo*
          </label>

          <input
            type="text"
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            placeholder="Digite seu nome completo"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="tipoUsuario"
            className="block text-gray-800 font-semibold mb-2"
          >
            Tipo de Usuário*
          </label>

          <select
            id="tipoUsuario"
            value={tipoUsuario}
            onChange={(e) => setTipoUsuario(e.target.value)} 
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Selecione...</option>
            <option value="Professor">Professor</option>
            <option value="Aluno">Aluno</option>
            <option value="Funcionario">Funcionário</option>
            <option value="Outro">Outro</option>
          </select>
        </div>

        <VideoCanvasDetector
          videoRef={videoRef}
          canvasRef={canvasRef}
          isDetecting={isDetecting}
          distanceStatus={distanceStatus}
          getDistanceMessage={getDistanceMessage}
        />
        

        {/* Status */}
        <div id="status" className="text-gray-700 text-center mb-6 font-medium min-h-8">
          {statusMessage}
        </div>

        <div className="flex justify-center gap-4">
          {!isDetecting ? (
            <button
              onClick={handleIniciarReconhecimento}
              type="button"
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Carregando...' : 'Iniciar Reconhecimento'}
            </button>
          ) : (
            <button
              onClick={handlePararReconhecimento}
              type="button"
              disabled={isLoading}
              className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              Parar Reconhecimento
            </button>
          )}

          <button
            type="submit"
            disabled={!canSave || isLoading}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Salvando...' : 'Salvar Cadastro'}
          </button>
        </div>
        
      </form>
    </div>
  );
}

export default Cadastrar;