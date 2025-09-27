/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from 'react';
import { useFaceDetection } from '../detection/useFaceDetection';
import { useApi } from '../api/useApi';
import { useValidation } from '../validation/useValidation';
import { useAuth } from '../auth/useAuth';
import { baseURL } from '../../config/url';
import type { UseCadastroFacialReturn } from '../../types/cadastro.types';
import type { UsuarioData } from '../../types/user.types';


export const useCadastroFacial = (): UseCadastroFacialReturn => {
  const [nome, setNome] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('');
  const [statusMessage, setStatusMessage] = useState('Sistema pronto - Preencha os dados e inicie o reconhecimento');
  const [canSave, setCanSave] = useState(false);
  const [isCameraStarting, setIsCameraStarting] = useState(false);

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
    setLoading,
    error: apiError,
    setError,
    verificarRosto,
    clearError,
    handleApiError
  } = useApi();

  const {
    validateCadastroForm,
    validateDescriptor,
    getDistanceMessage,
    showValidationErrors
  } = useValidation();

  const { authenticatedFetch } = useAuth();

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
    
    const formValidation = validateCadastroForm(nome, tipoUsuario);
    if (!formValidation.isValid) {
      showValidationErrors(formValidation.errors);
      return;
    }

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
      
      const verificacao = await verificarRosto(currentDescriptor, 'cadastro'); // Verifica se o rosto durante o cadastro
      
      if (verificacao.existe) {
        const nomeExistente = (verificacao.dados?.usuario as { nome?: string })?.nome || 'Usuário desconhecido';
        
        setStatusMessage(`Rosto já cadastrado para: ${nomeExistente}`);
        alert(`Este rosto já está cadastrado para: ${nomeExistente}`);
        return;
      }

      setStatusMessage('Salvando cadastro...');
      
      const userData = {
        nome: nome.trim(),
        tipoUsuario,
        descriptor: currentDescriptor
      };

      await cadastrarUsuario(userData);
      
      setStatusMessage('Cadastro realizado com sucesso!');
      alert(`Usuário ${nome} cadastrado com sucesso!`);
      
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
  ]);

  const cadastrarUsuario = useCallback(async (userData: UsuarioData) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Enviando dados para cadastro:', { 
        nome: userData.nome, 
        tipoUsuario: userData.tipoUsuario,
        descriptorLength: userData.descriptor?.length 
      });
      
      const response = await authenticatedFetch(`${baseURL}/usuarios/cadastrar`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const responseText = await response.text();
      let data;
      
      try {
        data = responseText ? JSON.parse(responseText) : {};
        
      } catch (parseError) {
        console.error('Erro ao parsear resposta:', parseError, 'Resposta:', responseText);
        throw new Error(`Resposta inválida do servidor: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || `Erro HTTP: ${response.status}`);
      }

      console.log('Cadastro realizado com sucesso:', data);
      return data;

    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message);
      console.error('Erro no cadastro:', apiError);
      throw apiError;
      
    } finally {
      setLoading(false);
    }
  }, [baseURL, handleApiError]);

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