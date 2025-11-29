/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from 'react';
import { useFaceDetection } from '../detection/useFaceDetection';
import { useApi } from '../api/useApi';
import { useValidation } from '../validation/useValidation';
import { useAuth } from '../auth/useAuth';
import { useVerificacao } from '../auth/useVerificacao';
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
  const { verificarRosto } = useVerificacao();

  const isLoading = faceLoading || apiLoading || isVideoLoading || isCameraStarting;

  // Cleanup ao desmontar o componente
  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, [stopDetection]);

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

  useEffect(() => {
    if (isVideoLoading) {
      setStatusMessage('Iniciando câmera...');
    }
  }, [isVideoLoading]);

  const handleIniciarReconhecimento = useCallback(async () => {
    clearError();
    
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
      setStatusMessage('Verificando se o nome já está cadastrado...');
      
      const verificacao = await verificarRosto(currentDescriptor, 'cadastro');
      
      if (verificacao.existe) {
        const nomeExistente = (verificacao.dados?.usuario as { nome?: string })?.nome || 'Usuário desconhecido';
        
        setStatusMessage(`Rosto já cadastrado para: ${nomeExistente}`);
        alert(`Este rosto já está cadastrado para: ${nomeExistente}`);
        return;
      }

      const response = await authenticatedFetch(`${baseURL}/usuarios/listar?nome=${encodeURIComponent(nome.trim())}`, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao verificar nome: ${response.status}`);
      }

      const usuarios = await response.json();
      const nomeJaExiste = Array.isArray(usuarios) && usuarios.some(usuario => 
        usuario.nome.toLowerCase() === nome.trim().toLowerCase()
      );

      if (nomeJaExiste) {
        setStatusMessage(`Nome "${nome}" já cadastrado no sistema`);
        alert(`Já existe um usuário com o nome "${nome}"`);
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
      handleApiError(error);
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
    clearError,
    handleApiError,
    authenticatedFetch, // ← Não esqueça de adicionar esta dependência
    baseURL // ← E esta também
  ]);

  const cadastrarUsuario = useCallback(async (userData: UsuarioData) => {
    setLoading(true);
    setError('');
    
    try {
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

      console.log('Cadastro realizado com sucesso:');
      return data;

    } catch (error) {
      const apiError = handleApiError(error);
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
    distanceStatus,
    isAtIdealDistance,
    handleIniciarReconhecimento,
    handlePararReconhecimento,
    handleSalvarCadastro,
  };
};