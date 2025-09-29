import { useCadastroFacial } from '../hooks/frontend/useCadastro';
import '../styles/index.css';


function Cadastrar() {
  const {
    nome,
    tipoUsuario,
    statusMessage,
    canSave,
    isLoading,
    isDetecting,
    videoReady,
    setNome,
    setTipoUsuario,
    videoRef,
    canvasRef,
    handleIniciarReconhecimento,
    handlePararReconhecimento,
    handleSalvarCadastro
  } = useCadastroFacial();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      {/* Título */}
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        📝 Cadastro de Usuário
      </h1>

      {/* Formulário */}
      <form
        id="cadastroForm"
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-2xl"
        onSubmit={handleSalvarCadastro}
      >
        {/* Nome */}
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

        {/* Tipo de Usuário */}
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

        {/* Vídeo + Canvas */}
        <div className="relative mb-6 bg-gray-200 rounded-lg overflow-hidden">
          <video
            id="video"
            width="640"
            height="480"
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`w-full ${!videoReady ? 'opacity-0' : 'opacity-100'} transition-opacity`}
          ></video>

          <canvas
            ref={canvasRef}
            id="canvas"
            className="absolute top-0 left-0 w-full h-full"
          ></canvas>
          
          {!videoReady && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-gray-600">Carregando câmera...</div>
            </div>
          )}
        </div>

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