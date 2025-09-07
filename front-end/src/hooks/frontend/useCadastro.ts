import { useState, useEffect, useCallback } from 'react';
import { useFaceDetection } from '../detection/useFaceDetection';
import { useApi } from '../api/useApi';
import { useValidation } from '../validation/useValidation';
import type { UseCadastroFacialReturn } from '../../types/cadastro.types';


export const useCadastroFacial = (): UseCadastroFacialReturn => {
  // Estados do formulário
  const [nome, setNome] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('');
  const [statusMessage, setStatusMessage] = useState('Sistema pronto - Preencha os dados e inicie o reconhecimento');
  const [canSave, setCanSave] = useState(false);
  const [isCameraStarting, setIsCameraStarting] = useState(false);

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

  const isLoading = faceLoading || apiLoading || isVideoLoading || isCameraStarting;

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, [stopDetection]);

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

  const handleIniciarReconhecimento = useCallback(async () => {
    clearError();
    
    // Valida formulário primeiro
    const formValidation = validateCadastroForm(nome, tipoUsuario);
    if (!formValidation.isValid) {
      showValidationErrors(formValidation.errors);
      return;
    }

    try {
      setIsCameraStarting(true);
      setStatusMessage('Iniciando câmera...');
      await startDetection();
      setStatusMessage('Posicione seu rosto na câmera');

    } catch (error) {
      console.error('Erro ao iniciar reconhecimento:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setStatusMessage(`Erro ao iniciar câmera: ${errorMessage}`);
      
    } finally {
      setIsCameraStarting(false);
    }
  }, [clearError, validateCadastroForm, nome, tipoUsuario, showValidationErrors, startDetection]);

  const handleSalvarCadastro = useCallback(async (e: React.FormEvent) => {
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
  }, [
    nome, 
    tipoUsuario, 
    validateCadastroForm, 
    showValidationErrors, 
    validateDescriptor, 
    currentDescriptor, 
    isAtIdealDistance, 
    verificarRosto, 
    cadastrarUsuario
  ]);

  const handlePararReconhecimento = useCallback(() => {
    stopDetection();
    setStatusMessage('Reconhecimento parado');
    setCanSave(false);
  }, [stopDetection]);

  return {
    // Estados
    nome,
    tipoUsuario,
    statusMessage,
    canSave,
    isLoading,
    isDetecting,
    videoReady,
    
    // Setters
    setNome,
    setTipoUsuario,
    
    // Refs
    videoRef,
    canvasRef,
    
    // Funções
    handleIniciarReconhecimento,
    handlePararReconhecimento,
    handleSalvarCadastro
  };
};