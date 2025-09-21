import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";


export const useLogin = () => {
    const [nome, setNome] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState('');
    const [mostrarSenha, setMostrarSenha] = useState(false);
    
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        try {
            const result = await login(nome, senha);

            if (result.success) {
                navigate('/home');   
            }
            else {
                setError("Acesso não autorizado! Verifique o nome e senha.");
            }

        } catch (error) {
            setError('Erro inesperado. Tente novamente.');
            console.error('Erro no login:', error);
        }
    }
    const toggleMostrarSenha = () => {
        setMostrarSenha(!mostrarSenha);
    };

    return {
        nome,
        setNome,
        senha,
        setSenha,
        mostrarSenha,
        setMostrarSenha,
        error,
        setError,
        login, 
        loading,
        handleLogin,
        toggleMostrarSenha
    }
}

