
class ValidationMiddleware {

    validateLogin(req, res, next) {
        const { nome, senha } = req.body;

        if (!nome || !senha) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios '});
        }

        next();
    }

    validateCadastroUsuario(req, res, next) {
        const { nome, tipoUsuario, descriptor } = req.body;
        
        if (!nome || !tipoUsuario || !descriptor) {
            return res.status(400).json({ error: 'Dados incompletos.' });
        }

        next();
    }

    validateVerificacaoRosto(req, res, next) {
        const { descriptor, contexto } = req.body;
        const errors = [];

        if (!descriptor) {
            errors.push('Descritor facial não fornecido' );
        }
        
        if (!Array.isArray(descriptor)) {
            errors.push('Formato do descritor facial inválido');
        }

        if (contexto && !['cadastro', 'verificacao', 'merenda'].includes(contexto)) {
            errors.push('Contexto inválido');
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                errors: errors
            });
        }

        next();
    }

    validateCadastroAdmin(req, res, next) {
        const { nome, senha, funcao } = req.body;
        const errors = [];

        if (!nome || !senha || !funcao) {
            errors.push('Todos os campos são obrigatórios');
        }

        if (senha.length < 8) {
            errors.push('A senha deve ter mínimo de 8 caracteres');
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                errors: errors
            });
        }

        next();
    }

    validateId(req, res, next) {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Id obrigatório para realizar a operação' });
        }

        next();
    }

    validateMudancaDeSenha(req, res, next) {
        const { id, novaSenha, confirmarSenha } = req.body;
        const errors = [];

        if (!id || !novaSenha) {
            errors.push('Todos os campos são obrigatórios');
        }

        if (novaSenha !== confirmarSenha) {
            errors.push('As senhas nova e de confirmação estão diferentes');
        }

        if (novaSenha.length < 8) {
            errors.push('A senha deve ter mínimo de 8 caracteres');
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                errors: errors
            });
        }

        next();

    }
}

export default new ValidationMiddleware();