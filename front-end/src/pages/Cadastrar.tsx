import React, { useState, useEffect } from 'react';
import { useFaceDetection } from '../hooks/useFaceDetection';
import { useApi } from '../hooks/useApi';
import { useValidation } from '../hooks/useValidation';
import '../styles/index.css';

function Cadastrar() {
  // Estados do formulário
  const [nome, setNome] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('');
  const [statusMessage, setStatusMessage] = useState('Sistema pronto - Preencha os dados e inicie o reconhecimento');
  const [canSave, setCanSave] = useState(false);


  // Hooks customizados
  const {
    videoRef,
    canvasRef,
    isDetecting,
    currentDescriptor,
    isAtIdealDistance,
    distanceStatus,
    loading: faceLoading,
    error: faceError,
    videoReady,
    isVideoLoading,
    startDetection,
    stopDetection
  } = useFaceDetection();

  const {
    loading: apiLoading,
    error: apiError,
    cadastrarUsuario,
    verificarRosto,
    clearError
  } = useApi();

  const {
    validateCadastroForm,
    validateDescriptor,
    getDistanceMessage,
    showValidationErrors
  } = useValidation();

  // Inicia a câmera automaticamente ao carregar a página
  useEffect(() => {
    const iniciarCamera = async () => {
      try {
        await startDetection();
      } catch (error) {
        console.error('Erro ao iniciar câmera:', error);
        setStatusMessage('Erro ao acessar a câmera. Verifique as permissões.');
      }
    };

    iniciarCamera();

    // Cleanup ao desmontar
    return () => {
      stopDetection();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Atualiza status baseado na distância
  useEffect(() => {
    if (isDetecting) {
      const message = getDistanceMessage(distanceStatus.status);
      setStatusMessage(message);
      
      // Habilita salvar apenas se estiver na distância ideal e com descritor
      setCanSave(distanceStatus.isIdeal && currentDescriptor !== null);
    }
  }, [distanceStatus, isDetecting, currentDescriptor, getDistanceMessage]);

  // Atualiza status baseado em erros
  useEffect(() => {
    if (faceError) {
      setStatusMessage(`Erro: ${faceError}`);
    } else if (apiError) {
      setStatusMessage(`Erro da API: ${apiError}`);
    }
  }, [faceError, apiError]);

  // Atualiza status quando o vídeo está carregando
  useEffect(() => {
    if (isVideoLoading) {
      setStatusMessage('Iniciando câmera...');
    }
  }, [isVideoLoading]);

  const handleIniciarReconhecimento = async () => {
    clearError();
    
    // Valida formulário primeiro
    const formValidation = validateCadastroForm(nome, tipoUsuario);
    if (!formValidation.isValid) {
      showValidationErrors(formValidation.errors);
      return;
    }

    try {
      setStatusMessage('Iniciando câmera...');
      await startDetection();
      setStatusMessage('Posicione seu rosto na câmera');
    } catch (error) {
      console.error('Erro ao iniciar reconhecimento:', error);
      setStatusMessage('Erro ao iniciar câmera. Verifique as permissões.');
    }
  };

  const handleSalvarCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Valida formulário
    const formValidation = validateCadastroForm(nome, tipoUsuario);
    if (!formValidation.isValid) {
      showValidationErrors(formValidation.errors);
      return;
    }

    // Valida descritor
    const descriptorValidation = validateDescriptor(currentDescriptor, isAtIdealDistance);
    if (!descriptorValidation.isValid) {
      showValidationErrors(descriptorValidation.errors);
      return;
    }

    if (!currentDescriptor) {
      setStatusMessage('Erro: Descritor facial não encontrado');
      return;
    }

    try {
      setStatusMessage('Verificando se o rosto já está cadastrado...');
      
      // Verifica se o rosto já existe
      const verificacao = await verificarRosto(currentDescriptor);
      
      if (verificacao.existe) {
        const nomeExistente = verificacao.dados?.usuario?.nome || 'Usuário desconhecido';
        
        setStatusMessage(`Rosto já cadastrado para: ${nomeExistente}`);
        alert(`Este rosto já está cadastrado para: ${nomeExistente}`);
        return;
      }

      // Cadastra o usuário
      setStatusMessage('Salvando cadastro...');
      
      const userData = {
        nome: nome.trim(),
        tipoUsuario,
        descriptor: currentDescriptor
      };

      const result = await cadastrarUsuario(userData);
      
      setStatusMessage('Cadastro realizado com sucesso!');
      alert(`Usuário ${nome} cadastrado com sucesso!`);
      
      // Limpa o formulário
      setNome('');
      setTipoUsuario('');
      setCanSave(false);
      
    } catch (error) {
      console.error('Erro no cadastro:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setStatusMessage(`Erro no cadastro: ${errorMessage}`);
    }
  };

  const handlePararReconhecimento = () => {
    stopDetection();
    setStatusMessage('Reconhecimento parado');
    setCanSave(false);
  };

  const isLoading = faceLoading || apiLoading || isVideoLoading;

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