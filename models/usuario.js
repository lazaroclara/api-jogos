class Usuario {
    constructor(id, nome, email) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.criadoEm = new Date();
        this.atualizadoEm = new Date();
    }

    atualizar(nome, email) {
        this.nome = nome;
        this.email = email;
        this.atualizadoEm = new Date();

        return this;
    }

    possuiEmail(email) {
        if (typeof email !== 'string') {
            return false;
        }

        return this.email === email.trim().toLowerCase();
    }

    nomeValido() {
        return (
            typeof this.nome === 'string' &&
            this.nome.trim().length >= 2
        );
    }

    emailValido() {
        return (
            typeof this.email === 'string' &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)
        );
    }

    toJSON() {
        return {
            id: this.id,
            nome: this.nome,
            email: this.email,
            criadoEm: this.criadoEm,
            atualizadoEm: this.atualizadoEm
        };
    }
}

module.exports = Usuario;