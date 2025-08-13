class ValidationMiddleware {

    validateCadastroUsuario(req, res, next) {
        const { nome, tipoUsuario, descriptor } = req.body;
        
        if (!nome || !tipoUsuario || !descriptor) {
            return res.status(400).json({ error: 'Dados incompletos' });
        }

        if (!Array.isArray(descriptor) || descriptor.length === 0) {
            return res.status(400).json({ error: 'Descritor facial inválido' });
        }

        next();
    }

    validateVerificacaoRosto(req, res, next) {
        const { descriptor } = req.body;
        
        if (!descriptor || !Array.isArray(descriptor)) {
            return res.status(400).json({ error: 'Descritor facial não fornecido ou inválido' });
        }

        next();
    }
}

module.exports = new ValidationMiddleware();