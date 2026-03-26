(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lincones_js_1 = require("@designliquido/lincones-js");
window.lexador = new lincones_js_1.Lexador();
window.avaliadorSintatico = new lincones_js_1.AvaliadorSintatico();
window.tradutorSqlAnsi = new lincones_js_1.TradutorSqlAnsi();

},{"@designliquido/lincones-js":28}],2:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvaliadorSintaticoBase = void 0;
const comandos_1 = require("../comandos");
const erro_avaliador_sintatico_1 = require("./erro-avaliador-sintatico");
const construtos_1 = require("../construtos");
const tipos_de_simbolos_1 = __importDefault(require("../tipos-de-simbolos"));
class AvaliadorSintaticoBase {
    consumir(tipo, mensagemDeErro) {
        if (this.verificarTipoSimboloAtual(tipo))
            return this.avancarEDevolverAnterior();
        throw this.erro(this.simbolos[this.atual], mensagemDeErro);
    }
    estaNoFinal() {
        return this.atual === this.simbolos.length;
    }
    verificarTipoSimboloAtual(tipo) {
        if (this.estaNoFinal())
            return false;
        return this.simbolos[this.atual].tipo === tipo;
    }
    verificaSeLexemaSimboloAtual(lexama) {
        if (this.estaNoFinal())
            return false;
        return this.simbolos[this.atual].lexema === lexama;
    }
    avancarEDevolverAnterior() {
        if (!this.estaNoFinal())
            this.atual++;
        return this.simbolos[this.atual - 1];
    }
    erro(simbolo, mensagemDeErro) {
        const excecao = new erro_avaliador_sintatico_1.ErroAvaliadorSintatico(simbolo, mensagemDeErro);
        return excecao;
    }
    verificarSeSimboloAtualEIgualA(...argumentos) {
        for (let i = 0; i < argumentos.length; i++) {
            const tipoAtual = argumentos[i];
            if (this.verificarTipoSimboloAtual(tipoAtual)) {
                this.avancarEDevolverAnterior();
                return true;
            }
        }
        return false;
    }
    avancar() {
        if (!this.estaNoFinal()) {
            this.atual++;
        }
    }
    logicaManipulacaoColuna(simboloOperacao) {
        const simboloNomeDaColuna = this.consumir(tipos_de_simbolos_1.default.IDENTIFICADOR, 'Esperado identificador de nome de tabela após palavra reservada "TABELA".');
        switch (simboloOperacao.tipo) {
            case tipos_de_simbolos_1.default.ADICIONAR:
            case tipos_de_simbolos_1.default.ALTERAR:
                return this.logicaAdicionarOuAlterarColuna(simboloNomeDaColuna);
            case tipos_de_simbolos_1.default.REMOVER:
                return this.logicaRemocaoColuna(simboloNomeDaColuna);
            case tipos_de_simbolos_1.default.RENOMEAR:
                break;
        }
        return undefined;
    }
    logicaManipulacaoRestricao(simboloNomeTabela, simboloOperacao) {
        const simboloNomeDaRestricao = this.consumir(tipos_de_simbolos_1.default.IDENTIFICADOR, 'Esperado identificador de nome de restrição após palavra reservada "RESTRIÇÃO".');
        switch (simboloOperacao.tipo) {
            case tipos_de_simbolos_1.default.ADICIONAR:
            case tipos_de_simbolos_1.default.ALTERAR:
                return this.logicaAdicionarOuAlterarRestricao(simboloNomeTabela, simboloNomeDaRestricao);
            case tipos_de_simbolos_1.default.EXCLUIR:
                break;
            case tipos_de_simbolos_1.default.RENOMEAR:
                break;
        }
        return undefined;
    }
    logicaChavePrimaria() {
        let chavePrimaria = false;
        let autoIncremento = false;
        if (this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.CHAVE)) {
            switch (this.simbolos[this.atual].tipo) {
                case tipos_de_simbolos_1.default.PRIMARIA:
                    chavePrimaria = true;
                    this.avancar();
                    if (this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.AUTO)) {
                        this.consumir(tipos_de_simbolos_1.default.INCREMENTO, 'Esperado palavra reservada "INCREMENTO" após palavra reservada "AUTO" em declaração de coluna em comando de criação de tabela.');
                        autoIncremento = true;
                    }
                    break;
                default:
                    throw this.erro(this.simbolos[this.atual], 'Esperado palavra reservada "PRIMARIA" após palavra reservada "CHAVE" na definição de coluna em comando de criação de tabela.');
            }
        }
        return [chavePrimaria, autoIncremento];
    }
    logicaAdicionarOuAlterarColuna(simboloNomeDaColuna) {
        // Tipo de dados
        const simboloTipoElemento = this.avancarEDevolverAnterior();
        let tamanhoElemento = null;
        if (![
            tipos_de_simbolos_1.default.CARACTERES,
            tipos_de_simbolos_1.default.INTEIRO,
            tipos_de_simbolos_1.default.LOGICO,
            tipos_de_simbolos_1.default.NUMERO,
            tipos_de_simbolos_1.default.TEXTO
        ].includes(simboloTipoElemento.tipo)) {
            throw this.erro(simboloTipoElemento, `Tipo de coluna inválido para operação de adição ou alteração de coluna. Tipos válidos: inteiro, lógico ou texto. Obtido: ${simboloTipoElemento.tipo}.`);
        }
        if (simboloTipoElemento.tipo === tipos_de_simbolos_1.default.CARACTERES) {
            if (this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.PARENTESE_ESQUERDO)) {
                tamanhoElemento = this.consumir(tipos_de_simbolos_1.default.NUMERO, 'Esperado tamanho de texto de coluna em comando de criação de tabela.');
                this.consumir(tipos_de_simbolos_1.default.PARENTESE_DIREITO, 'Esperado parêntese direito após declaração de tamanho de coluna em comando de criação de tabela.');
            }
        }
        // Nulo/Não Nulo
        let nulo = true;
        if (this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.NAO, tipos_de_simbolos_1.default.NULO)) {
            const simboloAnterior = this.simbolos[this.atual - 1];
            switch (simboloAnterior.tipo) {
                case tipos_de_simbolos_1.default.NAO:
                    this.consumir(tipos_de_simbolos_1.default.NULO, 'Esperado palavra reservada "NULO" após palavra reservada "NÃO" em declaração de coluna em comando de criação de tabela.');
                    nulo = false;
                    break;
                case tipos_de_simbolos_1.default.NULO:
                default:
                    break;
            }
        }
        // Chave primária?
        const [chavePrimaria, autoIncremento] = this.logicaChavePrimaria();
        return new construtos_1.Coluna(simboloNomeDaColuna.lexema, simboloTipoElemento.lexema, tamanhoElemento ? tamanhoElemento : undefined, nulo, chavePrimaria, false, autoIncremento);
    }
    logicaAdicionarOuAlterarRestricao(simboloNomeDaTabela, simboloNomeDaRestricao) {
        // Tipo de restrição
        const simboloTipoRestricao = this.avancarEDevolverAnterior();
        switch (simboloTipoRestricao.tipo) {
            case tipos_de_simbolos_1.default.CHAVE:
                return this.logicaRestricaoChave(simboloNomeDaTabela, simboloNomeDaRestricao);
            case tipos_de_simbolos_1.default.UNICA:
                break;
        }
        return undefined;
    }
    logicaRemocaoColuna(simboloNomeDaColuna) {
        // Ponto-e-vírgula opcional após declaração de remoção de coluna
        this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.PONTO_VIRGULA);
        // Retorna uma instância de Coluna contendo apenas o nome.
        // O código que processa a operação de remoção deve interpretar
        // a presença desta Coluna como pedido de remoção.
        return new construtos_1.Coluna(simboloNomeDaColuna.lexema);
    }
    logicaRestricaoChave(simboloNomeDaTabela, simboloNomeDaRestricao) {
        const simboloTipoChave = this.avancarEDevolverAnterior();
        switch (simboloTipoChave.tipo) {
            case tipos_de_simbolos_1.default.PRIMARIA:
                break;
            case tipos_de_simbolos_1.default.ESTRANGEIRA:
                this.consumir(tipos_de_simbolos_1.default.PARENTESE_ESQUERDO, 'Esperado abertura de parêntese após palavra reservada "ESTRANGEIRA".');
                const nomeColunaChave = this.consumir(tipos_de_simbolos_1.default.IDENTIFICADOR, 'Esperado nome de coluna para restrição do tipo chave estrangeira.');
                this.consumir(tipos_de_simbolos_1.default.PARENTESE_DIREITO, 'Esperado fechamento de parêntese após nome de coluna para restrição do tipo chave estrangeira.');
                this.consumir(tipos_de_simbolos_1.default.REFERENCIA, 'Esperado palavra reservada "REFERENCIA" após definição de coluna para restrição do tipo chave estrangeira.');
                const nomeTabelaReferenciada = this.consumir(tipos_de_simbolos_1.default.IDENTIFICADOR, 'Esperado nome da tabela referenciada por restrição do tipo chave estrangeira.');
                this.consumir(tipos_de_simbolos_1.default.PARENTESE_ESQUERDO, 'Esperado abertura de parêntese após palavra reservada "REFERENCIA".');
                const nomeColunaReferenciada = this.consumir(tipos_de_simbolos_1.default.IDENTIFICADOR, 'Esperado nome de coluna referenciada para restrição do tipo chave estrangeira.');
                this.consumir(tipos_de_simbolos_1.default.PARENTESE_DIREITO, 'Esperado fechamento de parêntese após nome de coluna referenciada para restrição do tipo chave estrangeira.');
                this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.PONTO_VIRGULA);
                return new construtos_1.Restricao(simboloNomeDaRestricao.lexema, "CHAVE_ESTRANGEIRA", simboloNomeDaTabela.lexema, [nomeColunaChave.lexema], nomeTabelaReferenciada.lexema, [nomeColunaReferenciada.lexema]);
        }
    }
    //https://pgdocptbr.sourceforge.io/pg80/ddl-alter.html
    //ALTER TABLE produtos ADD COLUMN descricao text => alterar tabela produtos adicionar coluna descricao texto(50)
    //ALTER TABLE produtos DROP COLUMN descricao;
    //ALTER TABLE produtos RENAME COLUMN cod_prod TO cod_produto;
    //ALTER TABLE produtos RENAME TO equipamentos;
    comandoAlterar() {
        const simboloAlterar = this.consumir(tipos_de_simbolos_1.default.ALTERAR, 'Esperado palavra reservada "ALTERAR".');
        if (!this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.TABELA, tipos_de_simbolos_1.default.VISAO)) {
            throw this.erro(this.simbolos[this.atual], 'Esperado palavra reservada "TABELA" ou "VISÃO".');
        }
        const simboloTipoEntidade = this.simbolos[this.atual - 1];
        const nomeDaTabela = this.consumir(tipos_de_simbolos_1.default.IDENTIFICADOR, 'Esperado identificador de nome de tabela após palavra reservada "IDENTIFICADOR".');
        const operacoes = [];
        while (this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.ADICIONAR, tipos_de_simbolos_1.default.ALTERAR, tipos_de_simbolos_1.default.EXCLUIR, tipos_de_simbolos_1.default.RENOMEAR)) {
            const simboloOperacao = this.simbolos[this.atual - 1];
            let elemento;
            switch (this.simbolos[this.atual].tipo) {
                case tipos_de_simbolos_1.default.COLUNA:
                    this.avancar();
                    elemento = this.logicaManipulacaoColuna(simboloOperacao);
                    break;
                case tipos_de_simbolos_1.default.RESTRICAO:
                    this.avancar();
                    elemento = this.logicaManipulacaoRestricao(nomeDaTabela, simboloOperacao);
                    break;
                default:
                    throw this.erro(this.simbolos[this.atual], `Tipo de elemento de tabela ou visão inválido para operação "${simboloOperacao.lexema}": ${this.simbolos[this.atual].lexema}.`);
            }
            operacoes.push(new construtos_1.OperacaoAlteracaoTabela(simboloOperacao.lexema, elemento));
        }
        if (operacoes.length <= 0) {
            throw this.erro(this.simbolos[this.atual - 1], `Esperado pelo menos uma operação em um comando de alteração de tabela.`);
        }
        return new comandos_1.Alterar(simboloAlterar.linha, nomeDaTabela.lexema, simboloTipoEntidade.lexema, operacoes);
    }
    comandoAtualizar() {
        // Essa linha nunca deve retornar erro.
        const simboloAtualizar = this.consumir(tipos_de_simbolos_1.default.ATUALIZAR, 'Esperado palavra reservada "ATUALIZAR".');
        const nomeDaTabela = this.consumir(tipos_de_simbolos_1.default.IDENTIFICADOR, 'Esperado identificador de nome de tabela após palavra reservada "ATUALIZAR".');
        this.consumir(tipos_de_simbolos_1.default.DEFINIR, 'Esperado palavra reservada "DEFINIR". após palavra reservada "ATUALIZAR".');
        // Relação de colunas para atualização
        const colunasAtualizacao = [];
        do {
            const esquerda = this.consumir(tipos_de_simbolos_1.default.IDENTIFICADOR, `Esperado nome de coluna ou literal em descrição de atualização.`);
            this.consumir(tipos_de_simbolos_1.default.IGUAL, 'Esperado operador válido após identificador em descrição de atualização.');
            if (![
                tipos_de_simbolos_1.default.DOIS_PONTOS,
                tipos_de_simbolos_1.default.IDENTIFICADOR,
                tipos_de_simbolos_1.default.INTERROGACAO,
                tipos_de_simbolos_1.default.NUMERO,
                tipos_de_simbolos_1.default.TEXTO,
                tipos_de_simbolos_1.default.VERDADEIRO,
                tipos_de_simbolos_1.default.FALSO
            ].includes(this.simbolos[this.atual].tipo)) {
                throw this.erro(this.simbolos[this.atual], `Esperado operador válido após identificador em descrição de atualização.`);
            }
            const direita = this.logicaComumOperando();
            colunasAtualizacao.push(new construtos_1.ColunaEValor(new construtos_1.ReferenciaColuna(esquerda.lexema), direita));
        } while (this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.VIRGULA));
        // Condições
        const condicoes = this.logicaComumCondicoes('seleção');
        // Ponto-e-vírgula opcional
        this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.PONTO_VIRGULA);
        return new comandos_1.Atualizar(simboloAtualizar.linha, nomeDaTabela.lexema, colunasAtualizacao, condicoes);
    }
    comandoCriacaoColuna() {
        // Nome
        const nomeDaColuna = this.consumir(tipos_de_simbolos_1.default.IDENTIFICADOR, 'Esperado identificador de nome de coluna em comando de criação de tabela.');
        // Tipo de dados
        let tipoColuna = null;
        let tamanhoColuna = null;
        switch (this.simbolos[this.atual].tipo) {
            case tipos_de_simbolos_1.default.INTEIRO:
                tipoColuna = tipos_de_simbolos_1.default.INTEIRO;
                this.avancar();
                break;
            case tipos_de_simbolos_1.default.LOGICO:
                tipoColuna = tipos_de_simbolos_1.default.LOGICO;
                this.avancar();
                break;
            case tipos_de_simbolos_1.default.TEXTO:
                tipoColuna = tipos_de_simbolos_1.default.TEXTO;
                this.avancar();
                if (this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.PARENTESE_ESQUERDO)) {
                    tamanhoColuna = this.consumir(tipos_de_simbolos_1.default.NUMERO, 'Esperado tamanho de texto de coluna em comando de criação de tabela.');
                    this.consumir(tipos_de_simbolos_1.default.PARENTESE_DIREITO, 'Esperado parêntese direito após declaração de tamanho de coluna em comando de criação de tabela.');
                }
                break;
            case tipos_de_simbolos_1.default.CARACTERES:
                tipoColuna = tipos_de_simbolos_1.default.CARACTERES;
                this.avancar();
                if (this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.PARENTESE_ESQUERDO)) {
                    tamanhoColuna = this.consumir(tipos_de_simbolos_1.default.NUMERO, 'Esperado tamanho de caracteres de coluna em comando de criação de tabela.');
                    this.consumir(tipos_de_simbolos_1.default.PARENTESE_DIREITO, 'Esperado parêntese direito após declaração de tamanho de coluna em comando de criação de tabela.');
                }
                break;
            default:
                throw this.erro(this.simbolos[this.atual], 'Esperado tipo de dados válido na definição de coluna em comando de criação de tabela.');
        }
        // Nulo/Não Nulo
        let nulo = true;
        if (this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.NAO, tipos_de_simbolos_1.default.NULO)) {
            const simboloAnterior = this.simbolos[this.atual - 1];
            switch (simboloAnterior.tipo) {
                case tipos_de_simbolos_1.default.NAO:
                    this.consumir(tipos_de_simbolos_1.default.NULO, 'Esperado palavra reservada "NULO" após palavra reservada "NÃO" em declaração de coluna em comando de criação de tabela.');
                    nulo = false;
                    break;
                case tipos_de_simbolos_1.default.NULO:
                default:
                    break;
            }
        }
        // Chave primária?
        let chavePrimaria = false;
        let autoIncremento = false;
        if (this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.CHAVE)) {
            switch (this.simbolos[this.atual].tipo) {
                case tipos_de_simbolos_1.default.PRIMARIA:
                    chavePrimaria = true;
                    this.avancar();
                    if (this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.AUTO)) {
                        this.consumir(tipos_de_simbolos_1.default.INCREMENTO, 'Esperado palavra reservada "INCREMENTO" após palavra reservada "AUTO" em declaração de coluna em comando de criação de tabela.');
                        autoIncremento = true;
                    }
                    break;
                default:
                    throw this.erro(this.simbolos[this.atual], 'Esperado palavra reservada "PRIMARIA" após palavra reservada "CHAVE" na definição de coluna em comando de criação de tabela.');
            }
        }
        return new construtos_1.Coluna(nomeDaColuna.lexema, tipoColuna, tamanhoColuna, nulo, chavePrimaria, false, autoIncremento);
    }
    comandoCriar() {
        // Essa linha nunca deve retornar erro.
        this.consumir(tipos_de_simbolos_1.default.CRIAR, 'Esperado palavra reservada "CRIAR".');
        switch (this.simbolos[this.atual].tipo) {
            case 'TABELA':
            default:
                return this.comandoCriarTabela();
        }
    }
    comandoCriarTabela() {
        // Essa linha nunca deve retornar erro.
        const simboloTabela = this.consumir(tipos_de_simbolos_1.default.TABELA, 'Esperado palavra reservada "TABELA".');
        let seNaoExistir = false;
        if (this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.SE)) {
            this.consumir(tipos_de_simbolos_1.default.NAO, 'Esperado palavra reservada "NÃO" após palavra reservada "SE".');
            this.consumir(tipos_de_simbolos_1.default.EXISTIR, 'Esperado palavra reservada "EXISTIR" após palavra reservada "NÃO".');
            seNaoExistir = true;
        }
        const nomeDaTabela = this.consumir(tipos_de_simbolos_1.default.IDENTIFICADOR, 'Esperado identificador de nome de tabela após palavra reservada "TABELA".');
        this.consumir(tipos_de_simbolos_1.default.PARENTESE_ESQUERDO, 'Esperado abertura de parênteses após nome da tabela');
        const colunas = [];
        do {
            colunas.push(this.comandoCriacaoColuna());
        } while (this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.VIRGULA));
        this.consumir(tipos_de_simbolos_1.default.PARENTESE_DIREITO, 'Esperado fechamento de parênteses após nome da tabela');
        this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.PONTO_VIRGULA);
        return new comandos_1.Criar(simboloTabela.linha, nomeDaTabela.lexema, colunas, seNaoExistir);
    }
    comandoRemoverEntidade() {
        // Essa linha nunca deve retornar erro.
        this.consumir(tipos_de_simbolos_1.default.REMOVER, 'Esperado palavra reservada "REMOVER".');
        if (!this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.TABELA, tipos_de_simbolos_1.default.VISAO)) {
            throw this.erro(this.simbolos[this.atual], `Esperado palavras reservadas "TABELA" ou "VISÃO" após palavra reservada "REMOVER".`);
        }
        const simboloTipoEntidade = this.simbolos[this.atual - 1];
        const nomeDaEntidade = this.consumir(tipos_de_simbolos_1.default.IDENTIFICADOR, 'Esperado identificador de nome de tabela após palavras reservadas "TABELA" ou "VISÃO".');
        this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.PONTO_VIRGULA);
        return new comandos_1.RemoverEntidade(nomeDaEntidade.linha, nomeDaEntidade.lexema, simboloTipoEntidade.lexema.toUpperCase());
    }
    comandoExcluir() {
        // Essa linha nunca deve retornar erro.
        const simboloExcluir = this.consumir(tipos_de_simbolos_1.default.EXCLUIR, 'Esperado palavra reservada "EXCLUIR".');
        if (!this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.DE, tipos_de_simbolos_1.default.EM)) {
            throw this.erro(this.simbolos[this.atual], 'Esperado palavra reservada "DE" ou "EM" após palavra reservada "EXCLUIR".');
        }
        const nomeDaTabela = this.consumir(tipos_de_simbolos_1.default.IDENTIFICADOR, 'Esperado identificador de nome de tabela após palavra reservada "TABELA".');
        const condicoes = this.logicaComumCondicoes('exclusão');
        this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.PONTO_VIRGULA);
        return new comandos_1.Excluir(simboloExcluir.linha, nomeDaTabela.lexema, condicoes);
    }
    comandoInserir() {
        // Essa linha nunca deve retornar erro.
        const simboloInserir = this.consumir(tipos_de_simbolos_1.default.INSERIR, 'Esperado palavra reservada "INSERIR".');
        this.consumir(tipos_de_simbolos_1.default.EM, 'Esperado palavra reservada "EM" após palavra reservada "INSERIR".');
        const nomeDaTabela = this.consumir(tipos_de_simbolos_1.default.IDENTIFICADOR, 'Esperado identificador de nome de tabela após palavra reservada "EM" em declaração "INSERIR".');
        // Colunas (opcional)
        const colunas = [];
        if (this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.PARENTESE_ESQUERDO)) {
            do {
                const nomeDaColuna = this.consumir(tipos_de_simbolos_1.default.IDENTIFICADOR, 'Esperado identificador de nome de coluna após identificador de nome de tabela em comando "INSERIR".');
                colunas.push(nomeDaColuna.lexema);
            } while (this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.VIRGULA));
            this.consumir(tipos_de_simbolos_1.default.PARENTESE_DIREITO, 'Esperado fechamento de parênteses após declaração de colunas em comando "INSERIR".');
        }
        this.consumir(tipos_de_simbolos_1.default.VALORES, 'Esperado palavra reservada "VALORES" após nome de tabela em comando "INSERIR".');
        this.consumir(tipos_de_simbolos_1.default.PARENTESE_ESQUERDO, 'Esperado abertura de parênteses após palavra reservada "VALORES" em comando "INSERIR".');
        // Valores
        const valores = [];
        do {
            if (![
                tipos_de_simbolos_1.default.IDENTIFICADOR,
                tipos_de_simbolos_1.default.FALSO,
                tipos_de_simbolos_1.default.NUMERO,
                tipos_de_simbolos_1.default.TEXTO,
                tipos_de_simbolos_1.default.VERDADEIRO,
                tipos_de_simbolos_1.default.INTERROGACAO,
                tipos_de_simbolos_1.default.DOIS_PONTOS
            ].includes(this.simbolos[this.atual].tipo)) {
                throw this.erro(this.simbolos[this.atual], `Esperado valor válido para inserção em comando "INSERIR".`);
            }
            const operando = this.logicaComumOperando();
            valores.push(operando);
        } while (this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.VIRGULA));
        this.consumir(tipos_de_simbolos_1.default.PARENTESE_DIREITO, 'Esperado fechamento de parênteses após declaração de valores em comando "INSERIR".');
        if (colunas.length > 0 && valores.length !== colunas.length) {
            throw this.erro(simboloInserir, 'Número de colunas não correspondente ao número de valores em comando "INSERIR".');
        }
        return new comandos_1.Inserir(simboloInserir.linha, nomeDaTabela.lexema, colunas, valores);
    }
    inferirTipoOperando(tipoOperando) {
        switch (tipoOperando) {
            case tipos_de_simbolos_1.default.VERDADEIRO:
            case tipos_de_simbolos_1.default.FALSO:
            case tipos_de_simbolos_1.default.LOGICO:
                return 'LOGICO';
            default:
                return tipoOperando;
        }
    }
    logicaComumOperando() {
        const simboloOperando = this.avancarEDevolverAnterior();
        switch (simboloOperando.tipo) {
            case tipos_de_simbolos_1.default.IDENTIFICADOR:
                return new construtos_1.ReferenciaColuna(simboloOperando.lexema);
            case tipos_de_simbolos_1.default.CARACTERES:
            case tipos_de_simbolos_1.default.NUMERO:
            case tipos_de_simbolos_1.default.TEXTO:
            case tipos_de_simbolos_1.default.VERDADEIRO:
            case tipos_de_simbolos_1.default.FALSO:
                return new construtos_1.Literal(simboloOperando.literal || simboloOperando.lexema, this.inferirTipoOperando(simboloOperando.tipo));
            case tipos_de_simbolos_1.default.INTERROGACAO:
                return new construtos_1.ParametroAnonimo();
            case tipos_de_simbolos_1.default.DOIS_PONTOS:
                if (!this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.IDENTIFICADOR)) {
                    throw this.erro(simboloOperando, 'Esperado identificador após dois pontos em condição, para definição de parâmetro.');
                }
                const simboloParametro = this.simbolos[this.atual - 1];
                return new construtos_1.ParametroNomeado(simboloParametro.lexema);
            default:
                throw this.erro(simboloOperando, `Esperado identificador, número, texto, verdadeiro, falso ou parâmetro anônimo após operador em condição. Obtido: ${simboloOperando.tipo}.`);
        }
    }
    logicaComumCondicoes(operacao) {
        const condicoes = [];
        if (this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.ONDE)) {
            do {
                const esquerda = this.consumir(tipos_de_simbolos_1.default.IDENTIFICADOR, `Esperado nome de coluna ou literal em condição de ${operacao}.`);
                if (![
                    tipos_de_simbolos_1.default.IGUAL,
                    tipos_de_simbolos_1.default.MAIOR,
                    tipos_de_simbolos_1.default.MAIOR_IGUAL,
                    tipos_de_simbolos_1.default.MENOR,
                    tipos_de_simbolos_1.default.MENOR_IGUAL
                ].includes(this.simbolos[this.atual].tipo)) {
                    throw this.erro(this.simbolos[this.atual], `Esperado operador válido após identificador em condição de ${operacao}.`);
                }
                const operador = this.simbolos[this.atual].tipo;
                this.avancar();
                if (![
                    tipos_de_simbolos_1.default.DOIS_PONTOS,
                    tipos_de_simbolos_1.default.INTERROGACAO,
                    tipos_de_simbolos_1.default.IDENTIFICADOR,
                    tipos_de_simbolos_1.default.NUMERO,
                    tipos_de_simbolos_1.default.TEXTO
                ].includes(this.simbolos[this.atual].tipo)) {
                    throw this.erro(this.simbolos[this.atual], `Esperado operando válido após identificador em condição de ${operacao}.`);
                }
                const direita = this.logicaComumOperando();
                condicoes.push(new construtos_1.Condicao(new construtos_1.ReferenciaColuna(esquerda.lexema), operador, direita));
            } while (this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.E));
        }
        return condicoes;
    }
    comandoSelecionar() {
        // Essa linha idealmente nunca deve retornar erro.
        const simboloSelecionar = this.consumir(tipos_de_simbolos_1.default.SELECIONAR, 'Esperado palavra reservada "SELECIONAR".');
        // Colunas
        let tudo = false;
        const colunas = [];
        if (this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.TUDO)) {
            tudo = true;
        }
        else {
            do {
                colunas.push(this.simbolos[this.atual].lexema);
                this.avancar();
            } while (this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.VIRGULA));
        }
        // De
        this.consumir(tipos_de_simbolos_1.default.DE, 'Esperado palavra reservada "de" após definição das colunas em comando de seleção.');
        const nomeTabela = this.consumir(tipos_de_simbolos_1.default.IDENTIFICADOR, 'Esperado nome de coluna ou literal em condição de seleção.');
        // Condições
        const condicoes = this.logicaComumCondicoes('seleção');
        // Ponto-e-vírgula opcional.
        this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.PONTO_VIRGULA);
        return new comandos_1.Selecionar(simboloSelecionar.linha, nomeTabela.lexema, colunas, condicoes, tudo);
    }
    declaracao() {
        try {
            switch (this.simbolos[this.atual].tipo) {
                case tipos_de_simbolos_1.default.ALTERAR:
                    return this.comandoAlterar();
                case tipos_de_simbolos_1.default.ATUALIZAR:
                    return this.comandoAtualizar();
                case tipos_de_simbolos_1.default.CRIAR:
                    return this.comandoCriar();
                case tipos_de_simbolos_1.default.EXCLUIR:
                    return this.comandoExcluir();
                case tipos_de_simbolos_1.default.INSERIR:
                    return this.comandoInserir();
                case tipos_de_simbolos_1.default.REMOVER:
                    return this.comandoRemoverEntidade();
                case tipos_de_simbolos_1.default.SELECIONAR:
                    return this.comandoSelecionar();
                default:
                    this.avancar();
                    return null;
            }
        }
        catch (erro) {
            this.erros.push(erro);
            return null;
        }
    }
    /**
     * Ponto de entrada da avaliação sintática base de LinConEs.
     * @param retornoLexador O retorno da execução do Lexador.
     * @returns Um retorno com o resultado da avaliação sintática, contendo
     *          comandos e erros, quando houverem.
     */
    analisar(retornoLexador) {
        this.erros = [];
        this.atual = 0;
        this.bloco = 0;
        this.simbolos = (retornoLexador === null || retornoLexador === void 0 ? void 0 : retornoLexador.simbolos) || [];
        const declaracoes = [];
        while (!this.estaNoFinal()) {
            declaracoes.push(this.declaracao());
        }
        return {
            comandos: declaracoes,
            erros: this.erros
        };
    }
}
exports.AvaliadorSintaticoBase = AvaliadorSintaticoBase;

},{"../comandos":12,"../construtos":20,"../tipos-de-simbolos":40,"./erro-avaliador-sintatico":5}],3:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvaliadorSintaticoSqlAnsi = void 0;
const avaliador_sintatico_base_1 = require("./avaliador-sintatico-base");
const comandos_1 = require("../comandos");
const construtos_1 = require("../construtos");
const tipos_de_simbolos_1 = __importDefault(require("../tipos-de-simbolos"));
/**
 * O Avaliador Sintático SQL ANSI analisa _tokens_ em inglês (CREATE, SELECT, etc.)
 * e produz as mesmas estruturas de comando que o avaliador sintático base.
 */
class AvaliadorSintaticoSqlAnsi extends avaliador_sintatico_base_1.AvaliadorSintaticoBase {
    traduzirTipoDeDados(tipoSql) {
        const tipoUpper = tipoSql.toUpperCase();
        switch (tipoUpper) {
            case 'INTEGER':
            case 'INT':
                return 'INTEIRO';
            case 'BOOLEAN':
            case 'BOOL':
                return 'LOGICO';
            case 'VARCHAR':
            case 'CHAR':
                return 'CARACTERES';
            case 'TEXT':
                return 'TEXTO';
            case 'NUMBER':
            case 'NUMERIC':
            case 'DECIMAL':
                return 'NUMERO';
            default:
                return tipoSql;
        }
    }
    logicaAdicionarOuAlterarColuna(simboloNomeDaColuna) {
        // Tipo de dados
        const simboloTipoElemento = this.avancarEDevolverAnterior();
        let tamanhoElemento = null;
        if (![
            tipos_de_simbolos_1.default.CARACTERES,
            tipos_de_simbolos_1.default.INTEIRO,
            tipos_de_simbolos_1.default.LOGICO,
            tipos_de_simbolos_1.default.NUMERO,
            tipos_de_simbolos_1.default.TEXTO
        ].includes(simboloTipoElemento.tipo)) {
            throw this.erro(simboloTipoElemento, `Tipo de coluna inválido para operação de adição ou alteração de coluna. Tipos válidos: inteiro, lógico ou texto. Obtido: ${simboloTipoElemento.tipo}.`);
        }
        if (simboloTipoElemento.tipo === tipos_de_simbolos_1.default.CARACTERES) {
            if (this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.PARENTESE_ESQUERDO)) {
                tamanhoElemento = this.consumir(tipos_de_simbolos_1.default.NUMERO, 'Esperado tamanho de texto de coluna em comando de criação de tabela.');
                this.consumir(tipos_de_simbolos_1.default.PARENTESE_DIREITO, 'Esperado parêntese direito após declaração de tamanho de coluna em comando de criação de tabela.');
            }
        }
        // Nulo/Não Nulo
        let nulo = true;
        if (this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.NAO, tipos_de_simbolos_1.default.NULO)) {
            const simboloAnterior = this.simbolos[this.atual - 1];
            switch (simboloAnterior.tipo) {
                case tipos_de_simbolos_1.default.NAO:
                    this.consumir(tipos_de_simbolos_1.default.NULO, 'Esperado palavra reservada "NULO" após palavra reservada "NÃO" em declaração de coluna em comando de criação de tabela.');
                    nulo = false;
                    break;
                case tipos_de_simbolos_1.default.NULO:
                default:
                    break;
            }
        }
        // Chave primária?
        const [chavePrimaria, autoIncremento] = this.logicaChavePrimaria();
        return new construtos_1.Coluna(simboloNomeDaColuna.lexema, simboloTipoElemento.tipo, tamanhoElemento ? tamanhoElemento : undefined, nulo, chavePrimaria, false, autoIncremento);
    }
    logicaChavePrimaria() {
        let chavePrimaria = false;
        const autoIncremento = false;
        if (this.verificarTipoSimboloAtual(tipos_de_simbolos_1.default.PRIMARIA)) {
            this.avancar();
            switch (this.simbolos[this.atual].tipo) {
                case tipos_de_simbolos_1.default.CHAVE:
                    chavePrimaria = true;
                    this.avancar();
                    // TODO: Aparentemente, SQL ANSI não é padronizado na questão de
                    // auto incremento.
                    /* if (
                        this.verificarSeSimboloAtualEIgualA(
                            tiposDeSimbolos.AUTO
                        )
                    ) {
                        this.consumir(
                            tiposDeSimbolos.INCREMENTO,
                            'Esperado palavra reservada "INCREMENTO" após palavra reservada "AUTO" em declaração de coluna em comando de criação de tabela.'
                        );
                        autoIncremento = true;
                    } */
                    break;
                default:
                    throw this.erro(this.simbolos[this.atual], 'Esperado palavra reservada "PRIMARIA" após palavra reservada "CHAVE" na definição de coluna em comando de criação de tabela.');
            }
        }
        return [chavePrimaria, autoIncremento];
    }
    logicaComumOperando() {
        const simboloOperando = this.avancarEDevolverAnterior();
        switch (simboloOperando.tipo) {
            case tipos_de_simbolos_1.default.IDENTIFICADOR:
                return new construtos_1.ReferenciaColuna(simboloOperando.lexema);
            case tipos_de_simbolos_1.default.CARACTERES:
            case tipos_de_simbolos_1.default.NUMERO:
            case tipos_de_simbolos_1.default.TEXTO:
                return new construtos_1.Literal(simboloOperando.literal || simboloOperando.lexema, this.inferirTipoOperando(simboloOperando.tipo));
            case tipos_de_simbolos_1.default.VERDADEIRO:
            case tipos_de_simbolos_1.default.FALSO:
                return new construtos_1.Literal(simboloOperando.lexema === 'TRUE' ? 'VERDADEIRO' : 'FALSO', this.inferirTipoOperando(simboloOperando.tipo));
            case tipos_de_simbolos_1.default.INTERROGACAO:
                return new construtos_1.ParametroAnonimo();
            case tipos_de_simbolos_1.default.DOIS_PONTOS:
                if (!this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.IDENTIFICADOR)) {
                    throw this.erro(simboloOperando, 'Esperado identificador após dois pontos em condição, para definição de parâmetro.');
                }
                const simboloParametro = this.simbolos[this.atual - 1];
                return new construtos_1.ParametroNomeado(simboloParametro.lexema);
            default:
                throw this.erro(simboloOperando, `Esperado identificador, número, texto, verdadeiro, falso ou parâmetro anônimo após operador em condição. Obtido: ${simboloOperando.tipo}.`);
        }
    }
    comandoCriacaoColuna() {
        // Nome da coluna
        const nomeDaColuna = this.consumir(tipos_de_simbolos_1.default.IDENTIFICADOR, 'Esperado identificador de nome de coluna em comando de criação de tabela.');
        // Tipo de dados - pode vir como IDENTIFICADOR (VARCHAR, INTEGER, etc.)
        const simboloTipo = this.avancarEDevolverAnterior();
        const tipoColuna = this.traduzirTipoDeDados(simboloTipo.lexema);
        let tamanhoColuna = null;
        // Tamanho (VARCHAR(120), CHAR(50), etc.)
        if (this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.PARENTESE_ESQUERDO)) {
            tamanhoColuna = this.consumir(tipos_de_simbolos_1.default.NUMERO, 'Esperado tamanho de texto de coluna em comando de criação de tabela.');
            this.consumir(tipos_de_simbolos_1.default.PARENTESE_DIREITO, 'Esperado parêntese direito após declaração de tamanho de coluna em comando de criação de tabela.');
        }
        // NOT NULL / NULL
        let nulo = true;
        if (this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.NAO, tipos_de_simbolos_1.default.NULO)) {
            const simboloAnterior = this.simbolos[this.atual - 1];
            switch (simboloAnterior.tipo) {
                case tipos_de_simbolos_1.default.NAO:
                    this.consumir(tipos_de_simbolos_1.default.NULO, 'Esperado palavra reservada "NULO" após palavra reservada "NÃO" em declaração de coluna em comando de criação de tabela.');
                    nulo = false;
                    break;
                case tipos_de_simbolos_1.default.NULO:
                default:
                    break;
            }
        }
        // Chave primária?
        const [chavePrimaria, autoIncremento] = this.logicaChavePrimaria();
        return new construtos_1.Coluna(nomeDaColuna.lexema, tipoColuna, tamanhoColuna, nulo, chavePrimaria, false, autoIncremento);
    }
    comandoCriar() {
        // CREATE
        this.consumir(tipos_de_simbolos_1.default.CRIAR, 'Esperado palavra reservada "CREATE".');
        // TABLE
        const simboloTabela = this.consumir(tipos_de_simbolos_1.default.TABELA, 'Esperado palavra reservada "TABLE".');
        // IF NOT EXISTS (opcional)
        let seNaoExistir = false;
        if (this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.SE)) {
            this.consumir(tipos_de_simbolos_1.default.NAO, 'Esperado palavra "NOT" após palavra "IF".');
            this.consumir(tipos_de_simbolos_1.default.EXISTIR, 'Esperado palavra "EXISTS" após palavra "NOT".');
            seNaoExistir = true;
        }
        const nomeDaTabela = this.consumir(tipos_de_simbolos_1.default.IDENTIFICADOR, 'Esperado identificador de nome de tabela após palavra reservada "TABLE".');
        this.consumir(tipos_de_simbolos_1.default.PARENTESE_ESQUERDO, 'Esperado abertura de parênteses após nome da tabela');
        const colunas = [];
        do {
            colunas.push(this.comandoCriacaoColuna());
        } while (this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.VIRGULA));
        this.consumir(tipos_de_simbolos_1.default.PARENTESE_DIREITO, 'Esperado fechamento de parênteses após definição das colunas');
        this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.PONTO_VIRGULA);
        return new comandos_1.Criar(simboloTabela.linha, nomeDaTabela.lexema, colunas, seNaoExistir);
    }
    comandoInserir() {
        // INSERT
        const simboloInserir = this.consumir(tipos_de_simbolos_1.default.INSERIR, 'Esperado palavra reservada "INSERT".');
        // INTO
        this.consumir(tipos_de_simbolos_1.default.EM, 'Esperado palavra reservada "INTO" após palavra reservada "INSERT".');
        const nomeDaTabela = this.consumir(tipos_de_simbolos_1.default.IDENTIFICADOR, 'Esperado identificador de nome de tabela após palavra reservada "INTO" em declaração "INSERT".');
        // Colunas (opcional)
        const colunas = [];
        if (this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.PARENTESE_ESQUERDO)) {
            do {
                const nomeDaColuna = this.consumir(tipos_de_simbolos_1.default.IDENTIFICADOR, 'Esperado identificador de nome de coluna após identificador de nome de tabela em comando "INSERT".');
                colunas.push(nomeDaColuna.lexema);
            } while (this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.VIRGULA));
            this.consumir(tipos_de_simbolos_1.default.PARENTESE_DIREITO, 'Esperado fechamento de parênteses após declaração de colunas em comando "INSERT".');
        }
        this.consumir(tipos_de_simbolos_1.default.VALORES, 'Esperado palavra reservada "VALUES" após nome de tabela em comando "INSERT".');
        this.consumir(tipos_de_simbolos_1.default.PARENTESE_ESQUERDO, 'Esperado abertura de parênteses após palavra reservada "VALUES" em comando "INSERT".');
        // Valores
        const valores = [];
        do {
            if (![
                tipos_de_simbolos_1.default.IDENTIFICADOR,
                tipos_de_simbolos_1.default.FALSO,
                tipos_de_simbolos_1.default.NUMERO,
                tipos_de_simbolos_1.default.TEXTO,
                tipos_de_simbolos_1.default.VERDADEIRO,
                tipos_de_simbolos_1.default.INTERROGACAO,
                tipos_de_simbolos_1.default.DOIS_PONTOS
            ].includes(this.simbolos[this.atual].tipo)) {
                throw this.erro(this.simbolos[this.atual], `Esperado valor válido para inserção em comando "INSERT".`);
            }
            const operando = this.logicaComumOperando();
            valores.push(operando);
        } while (this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.VIRGULA));
        this.consumir(tipos_de_simbolos_1.default.PARENTESE_DIREITO, 'Esperado fechamento de parênteses após declaração de valores em comando "INSERT".');
        if (colunas.length > 0 && valores.length !== colunas.length) {
            throw this.erro(simboloInserir, 'Número de colunas não correspondente ao número de valores em comando "INSERT".');
        }
        this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.PONTO_VIRGULA);
        return new comandos_1.Inserir(simboloInserir.linha, nomeDaTabela.lexema, colunas, valores);
    }
    comandoAtualizar() {
        // UPDATE
        const simboloAtualizar = this.consumir(tipos_de_simbolos_1.default.ATUALIZAR, 'Esperado palavra reservada "UPDATE".');
        const nomeDaTabela = this.consumir(tipos_de_simbolos_1.default.IDENTIFICADOR, 'Esperado identificador de nome de tabela após palavra reservada "UPDATE".');
        // SET
        this.consumir(tipos_de_simbolos_1.default.DEFINIR, 'Esperado palavra reservada "SET" após palavra reservada "UPDATE".');
        // Relação de colunas para atualização
        const colunasAtualizacao = [];
        do {
            const esquerda = this.consumir(tipos_de_simbolos_1.default.IDENTIFICADOR, `Esperado nome de coluna ou literal em descrição de atualização.`);
            this.consumir(tipos_de_simbolos_1.default.IGUAL, 'Esperado operador válido após identificador em descrição de atualização.');
            if (![
                tipos_de_simbolos_1.default.DOIS_PONTOS,
                tipos_de_simbolos_1.default.IDENTIFICADOR,
                tipos_de_simbolos_1.default.INTERROGACAO,
                tipos_de_simbolos_1.default.NUMERO,
                tipos_de_simbolos_1.default.TEXTO,
                tipos_de_simbolos_1.default.VERDADEIRO,
                tipos_de_simbolos_1.default.FALSO
            ].includes(this.simbolos[this.atual].tipo)) {
                throw this.erro(this.simbolos[this.atual], `Esperado operador válido após identificador em descrição de atualização.`);
            }
            const direita = this.logicaComumOperando();
            colunasAtualizacao.push(new construtos_1.ColunaEValor(new construtos_1.ReferenciaColuna(esquerda.lexema), direita));
        } while (this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.VIRGULA));
        // WHERE
        const condicoes = this.logicaComumCondicoes('atualização');
        // Ponto-e-vírgula opcional
        this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.PONTO_VIRGULA);
        return new comandos_1.Atualizar(simboloAtualizar.linha, nomeDaTabela.lexema, colunasAtualizacao, condicoes);
    }
    comandoRemoverEntidade() {
        // Essa linha nunca deve retornar erro.
        this.consumir(tipos_de_simbolos_1.default.REMOVER, 'Esperado palavra reservada "REMOVER".');
        if (!this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.TABELA, tipos_de_simbolos_1.default.VISAO)) {
            throw this.erro(this.simbolos[this.atual], `Esperado palavras reservadas "TABELA" ou "VISÃO" após palavra reservada "REMOVER".`);
        }
        const simboloTipoEntidade = this.simbolos[this.atual - 1];
        const nomeDaEntidade = this.consumir(tipos_de_simbolos_1.default.IDENTIFICADOR, 'Esperado identificador de nome de tabela após palavras reservadas "TABELA" ou "VISÃO".');
        this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.PONTO_VIRGULA);
        return new comandos_1.RemoverEntidade(nomeDaEntidade.linha, nomeDaEntidade.lexema, simboloTipoEntidade.tipo.toUpperCase());
    }
    comandoSelecionar() {
        // SELECT
        const simboloSelecionar = this.consumir(tipos_de_simbolos_1.default.SELECIONAR, 'Esperado palavra reservada "SELECT".');
        // Colunas
        let tudo = false;
        const colunas = [];
        if (this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.TUDO)) {
            tudo = true;
        }
        else {
            do {
                colunas.push(this.simbolos[this.atual].lexema);
                this.avancar();
            } while (this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.VIRGULA));
        }
        // FROM
        this.consumir(tipos_de_simbolos_1.default.DE, 'Esperado palavra reservada "FROM" após definição das colunas em comando de seleção.');
        const nomeTabela = this.consumir(tipos_de_simbolos_1.default.IDENTIFICADOR, 'Esperado nome de tabela após palavra reservada "FROM".');
        // WHERE
        const condicoes = this.logicaComumCondicoes('seleção');
        // Ponto-e-vírgula opcional.
        this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.PONTO_VIRGULA);
        return new comandos_1.Selecionar(simboloSelecionar.linha, nomeTabela.lexema, colunas, condicoes, tudo);
    }
    logicaManipulacaoColunaOuRestricao(simboloOperacao, simboloDaTabelaOuVisao) {
        switch (this.simbolos[this.atual].tipo) {
            case tipos_de_simbolos_1.default.COLUNA:
                this.avancar();
                return this.logicaManipulacaoColuna(simboloOperacao);
            case tipos_de_simbolos_1.default.RESTRICAO:
                this.avancar();
                return this.logicaManipulacaoRestricao(simboloDaTabelaOuVisao, simboloOperacao);
            default:
                throw this.erro(this.simbolos[this.atual], `Tipo de elemento de tabela ou visão inválido para operação "${simboloOperacao.lexema}": ${this.simbolos[this.atual].lexema}.`);
        }
    }
    comandoAlterar() {
        // ALTER
        const simboloAlterar = this.consumir(tipos_de_simbolos_1.default.ALTERAR, 'Esperado palavra reservada "ALTER".');
        // TABLE ou VIEW
        if (!this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.TABELA, tipos_de_simbolos_1.default.VISAO)) {
            throw this.erro(this.simbolos[this.atual], 'Esperado palavra reservada "TABLE" ou "VIEW".');
        }
        const simboloTipoEntidade = this.simbolos[this.atual - 1];
        const nomeDaEntidade = this.consumir(tipos_de_simbolos_1.default.IDENTIFICADOR, `Esperado identificador de nome de tabela ou visão após palavra reservada '${simboloTipoEntidade.lexema}'.`);
        const operacoes = [];
        // Processar operações em SQL: ADD, DROP, ALTER COLUMN, RENAME COLUMN
        while (this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.ADICIONAR, tipos_de_simbolos_1.default.ALTERAR, tipos_de_simbolos_1.default.REMOVER, tipos_de_simbolos_1.default.RENOMEAR)) {
            const simboloOperacao = this.simbolos[this.atual - 1];
            const elemento = this.logicaManipulacaoColunaOuRestricao(simboloOperacao, nomeDaEntidade);
            if (elemento) {
                operacoes.push(new construtos_1.OperacaoAlteracaoTabela(simboloOperacao.tipo, elemento));
            }
            this.verificarSeSimboloAtualEIgualA(tipos_de_simbolos_1.default.VIRGULA);
        }
        if (operacoes.length <= 0) {
            throw this.erro(this.simbolos[this.atual - 1], `Esperado pelo menos uma operação em um comando de alteração de tabela.`);
        }
        return new comandos_1.Alterar(simboloAlterar.linha, nomeDaEntidade.lexema, simboloTipoEntidade.lexema, operacoes);
    }
    declaracao() {
        try {
            switch (this.simbolos[this.atual].tipo) {
                case tipos_de_simbolos_1.default.ALTERAR:
                    return this.comandoAlterar();
                case tipos_de_simbolos_1.default.ATUALIZAR:
                    return this.comandoAtualizar();
                case tipos_de_simbolos_1.default.CRIAR:
                    return this.comandoCriar();
                case tipos_de_simbolos_1.default.EXCLUIR:
                    return this.comandoExcluir();
                case tipos_de_simbolos_1.default.INSERIR:
                    return this.comandoInserir();
                case tipos_de_simbolos_1.default.REMOVER:
                    return this.comandoRemoverEntidade();
                case tipos_de_simbolos_1.default.SELECIONAR:
                    return this.comandoSelecionar();
                default:
                    this.avancar();
                    return null;
            }
        }
        catch (erro) {
            this.erros.push(erro);
            return null;
        }
    }
}
exports.AvaliadorSintaticoSqlAnsi = AvaliadorSintaticoSqlAnsi;

},{"../comandos":12,"../construtos":20,"../tipos-de-simbolos":40,"./avaliador-sintatico-base":2}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvaliadorSintatico = void 0;
const avaliador_sintatico_base_1 = require("./avaliador-sintatico-base");
/**
 * A única função desta classe é poder ser instanciada, seja para
 * testes unitários, seja para outras funções.
 */
class AvaliadorSintatico extends avaliador_sintatico_base_1.AvaliadorSintaticoBase {
}
exports.AvaliadorSintatico = AvaliadorSintatico;

},{"./avaliador-sintatico-base":2}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErroAvaliadorSintatico = void 0;
class ErroAvaliadorSintatico extends Error {
    constructor(simbolo, mensagem) {
        super(mensagem);
        this.simbolo = simbolo;
        Object.setPrototypeOf(this, ErroAvaliadorSintatico.prototype);
    }
}
exports.ErroAvaliadorSintatico = ErroAvaliadorSintatico;

},{}],6:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./avaliador-sintatico"), exports);
__exportStar(require("./avaliador-sintatico-base"), exports);
__exportStar(require("./avaliador-sintatico-sql-ansi"), exports);
__exportStar(require("./erro-avaliador-sintatico"), exports);

},{"./avaliador-sintatico":4,"./avaliador-sintatico-base":2,"./avaliador-sintatico-sql-ansi":3,"./erro-avaliador-sintatico":5}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Alterar = void 0;
const comando_1 = require("./comando");
class Alterar extends comando_1.Comando {
    constructor(linha, nomeEntidade, tipoEntidade, operacoes) {
        super(linha);
        this.nomeEntidade = nomeEntidade;
        this.tipoEntidade = tipoEntidade;
        this.operacoes = operacoes;
    }
}
exports.Alterar = Alterar;

},{"./comando":9}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Atualizar = void 0;
const comando_1 = require("./comando");
class Atualizar extends comando_1.Comando {
    constructor(linha, tabela, colunasEValores, condicoes) {
        super(linha);
        this.tabela = tabela;
        this.colunasEValores = colunasEValores;
        this.condicoes = condicoes;
    }
}
exports.Atualizar = Atualizar;

},{"./comando":9}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comando = void 0;
class Comando {
    constructor(linha) {
        this.linha = linha;
        this.assinaturaMetodo = '<principal>';
        this.parametros = [];
    }
    async aceitar(visitante) {
        return Promise.reject(new Error('Este método não deveria ser chamado.'));
    }
}
exports.Comando = Comando;

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Criar = void 0;
const comando_1 = require("./comando");
class Criar extends comando_1.Comando {
    constructor(linha, nomeEntidade, colunas, seNaoExistir = false) {
        super(linha);
        this.nomeEntidade = nomeEntidade;
        this.colunas = colunas;
        this.seNaoExistir = seNaoExistir;
    }
}
exports.Criar = Criar;

},{"./comando":9}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Excluir = void 0;
const comando_1 = require("./comando");
class Excluir extends comando_1.Comando {
    constructor(linha, tabela, condicoes) {
        super(linha);
        this.tabela = tabela;
        this.condicoes = condicoes;
    }
}
exports.Excluir = Excluir;

},{"./comando":9}],12:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./alterar"), exports);
__exportStar(require("./atualizar"), exports);
__exportStar(require("./comando"), exports);
__exportStar(require("./criar"), exports);
__exportStar(require("./excluir"), exports);
__exportStar(require("./remover-entidade"), exports);
__exportStar(require("./inserir"), exports);
__exportStar(require("./selecionar"), exports);

},{"./alterar":7,"./atualizar":8,"./comando":9,"./criar":10,"./excluir":11,"./inserir":13,"./remover-entidade":14,"./selecionar":15}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inserir = void 0;
const comando_1 = require("./comando");
class Inserir extends comando_1.Comando {
    constructor(linha, tabela, colunas, valores) {
        super(linha);
        this.tabela = tabela;
        this.colunas = colunas;
        this.valores = valores;
    }
}
exports.Inserir = Inserir;

},{"./comando":9}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoverEntidade = void 0;
const comando_1 = require("./comando");
class RemoverEntidade extends comando_1.Comando {
    constructor(linha, nomeEntidade, tipoEntidade) {
        super(linha);
        this.nomeEntidade = nomeEntidade;
        this.tipoEntidade = tipoEntidade;
    }
}
exports.RemoverEntidade = RemoverEntidade;

},{"./comando":9}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Selecionar = void 0;
const comando_1 = require("./comando");
class Selecionar extends comando_1.Comando {
    constructor(linha, tabela, colunas, condicoes, tudo = false, juncoes = []) {
        super(linha);
        this.tabela = tabela;
        this.tudo = tudo;
        this.colunas = colunas;
        this.condicoes = condicoes;
        this.juncoes = juncoes;
    }
}
exports.Selecionar = Selecionar;

},{"./comando":9}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColunaEValor = void 0;
const construto_1 = require("./construto");
class ColunaEValor extends construto_1.Construto {
    constructor(coluna, valor) {
        super();
        this.coluna = coluna;
        this.valor = valor;
    }
    toString() {
        return `<ColunaEValor coluna=${this.coluna.nomeColuna} valor=${this.valor.toString()}>`;
    }
}
exports.ColunaEValor = ColunaEValor;

},{"./construto":19}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Coluna = void 0;
const construto_1 = require("./construto");
class Coluna extends construto_1.Construto {
    constructor(nomeColuna, tipo, tamanho, nulo, chavePrimaria, chaveEstrangeira, autoIncremento) {
        super();
        this.nomeColuna = nomeColuna;
        if (tipo) {
            const tipoColunaResolvido = tipo.toUpperCase();
            if (!['CARACTERES', 'INTEIRO', 'LOGICO', 'NUMERO', 'TEXTO'].includes(tipoColunaResolvido)) {
                throw new Error(`Tipo de dados de coluna inválido: ${tipoColunaResolvido}`);
            }
            this.tipo = tipoColunaResolvido;
        }
        this.tamanho = tamanho;
        this.nulo = nulo === true ? true : false;
        this.chavePrimaria = chavePrimaria || false;
        this.chaveEstrangeira = chaveEstrangeira || false;
        this.autoIncremento = autoIncremento || false;
    }
    toString() {
        let retorno = `<Coluna nome=${this.nomeColuna} tipo=${this.tipo}`;
        if (this.tamanho) {
            retorno += ` tamanho=${this.tamanho.lexema}`;
        }
        retorno += ` nulo=${this.nulo ? 'Sim' : 'Não'}`;
        if (this.chavePrimaria) {
            retorno += ` chave primária;`;
        }
        if (this.chaveEstrangeira) {
            retorno += ` chave estrangeira;`;
        }
        if (this.autoIncremento) {
            retorno += ` auto incremento;`;
        }
        retorno += `>`;
        return retorno;
    }
}
exports.Coluna = Coluna;

},{"./construto":19}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Condicao = void 0;
const construto_1 = require("./construto");
class Condicao extends construto_1.Construto {
    constructor(esquerda, operador, direita) {
        super();
        this.esquerda = esquerda;
        this.direita = direita;
        this.operador = operador;
    }
    toString() {
        let retorno = `<Condição`;
        retorno += ` operando esquerdo=${this.esquerda.toString()}`;
        retorno += ` operador=${this.operador}`;
        retorno += ` operando direito=${this.direita.toString()}`;
        retorno += `>`;
        return retorno;
    }
}
exports.Condicao = Condicao;

},{"./construto":19}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Construto = void 0;
class Construto {
}
exports.Construto = Construto;

},{}],20:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./coluna"), exports);
__exportStar(require("./coluna-e-valor"), exports);
__exportStar(require("./condicao"), exports);
__exportStar(require("./construto"), exports);
__exportStar(require("./juncao"), exports);
__exportStar(require("./literal"), exports);
__exportStar(require("./operacao-alteracao-tabela"), exports);
__exportStar(require("./parametro-anonimo"), exports);
__exportStar(require("./parametro-nomeado"), exports);
__exportStar(require("./referencia-coluna"), exports);
__exportStar(require("./restricao"), exports);

},{"./coluna":17,"./coluna-e-valor":16,"./condicao":18,"./construto":19,"./juncao":21,"./literal":22,"./operacao-alteracao-tabela":23,"./parametro-anonimo":24,"./parametro-nomeado":25,"./referencia-coluna":26,"./restricao":27}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Juncao = void 0;
const construto_1 = require("./construto");
class Juncao extends construto_1.Construto {
    constructor(tipo, tabela, condicoes = [], alias) {
        super();
        this.tipo = tipo;
        this.tabela = tabela;
        this.condicoes = condicoes;
        this.alias = alias;
    }
    toString() {
        const condicoes = this.condicoes.map((c) => c.toString()).join(", ");
        const alias = this.alias ? ` alias=${this.alias}` : "";
        return `<Juncao tipo=${this.tipo} tabela=${this.tabela}${alias} condicoes=[${condicoes}]>`;
    }
}
exports.Juncao = Juncao;

},{"./construto":19}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Literal = void 0;
const construto_1 = require("./construto");
class Literal extends construto_1.Construto {
    constructor(valor, tipoPresumido = 'CARACTERES') {
        super();
        this.valor = valor;
        this.tipoPresumido = tipoPresumido;
    }
    toString() {
        return `<Literal valor=${String(this.valor)} tipo presumido=${this.tipoPresumido}>`;
    }
}
exports.Literal = Literal;

},{"./construto":19}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperacaoAlteracaoTabela = void 0;
const construto_1 = require("./construto");
class OperacaoAlteracaoTabela extends construto_1.Construto {
    constructor(tipo, elemento) {
        super();
        const tipoOperacaoResolvido = tipo.toUpperCase();
        if (!['ADICIONAR', 'ALTERAR', 'REMOVER', 'RENOMEAR'].includes(tipoOperacaoResolvido)) {
            throw new Error(`Tipo de operação de alteração de tabela inválido: ${tipoOperacaoResolvido}`);
        }
        this.tipo = tipoOperacaoResolvido;
        this.elemento = elemento;
    }
    toString() {
        return `<OperaçãoAlteraçãoTabela tipo=${this.tipo} elemento=${this.elemento.toString()}>`;
    }
}
exports.OperacaoAlteracaoTabela = OperacaoAlteracaoTabela;

},{"./construto":19}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParametroAnonimo = void 0;
const construto_1 = require("./construto");
class ParametroAnonimo extends construto_1.Construto {
    toString() {
        return `<ParâmetroAnônimo>`;
    }
}
exports.ParametroAnonimo = ParametroAnonimo;

},{"./construto":19}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParametroNomeado = void 0;
const construto_1 = require("./construto");
class ParametroNomeado extends construto_1.Construto {
    constructor(nome) {
        super();
        this.nome = nome;
    }
    toString() {
        return `<ParâmetroNomeado nome=${this.nome}>`;
    }
}
exports.ParametroNomeado = ParametroNomeado;

},{"./construto":19}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferenciaColuna = void 0;
const construto_1 = require("./construto");
class ReferenciaColuna extends construto_1.Construto {
    constructor(nomeColuna) {
        super();
        this.nomeColuna = nomeColuna;
    }
    toString() {
        return `<ReferênciaColuna nome da coluna=${this.nomeColuna}>`;
    }
}
exports.ReferenciaColuna = ReferenciaColuna;

},{"./construto":19}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Restricao = void 0;
const construto_1 = require("./construto");
/**
 * Uma restrição cria uma regra em uma tabela ou visão, que trabalha com uma ou mais colunas
 * da mesma tabela e/ou de outras tabelass relacionadas.
 */
class Restricao extends construto_1.Construto {
    constructor(nome, tipo, tabela, colunas, tabelaReferenciada, colunasReferenciadas) {
        super();
        this.nome = nome;
        this.tipo = tipo;
        this.tabela = tabela;
        this.colunas = colunas;
        this.tabelaReferenciada = tabelaReferenciada;
        this.colunasReferenciadas = colunasReferenciadas;
    }
    toString() {
        let retorno = `<Restrição nome=${this.nome} tabela=${this.tabela} colunas=[`;
        for (const coluna of this.colunas) {
            retorno += coluna + `, `;
        }
        retorno = retorno.slice(0, -2);
        retorno += `]`;
        if (this.tabelaReferenciada) {
            retorno += ` tabela referenciada=${this.tabelaReferenciada}`;
        }
        if (this.colunasReferenciadas) {
            retorno += ` colunas referenciadas=[`;
            for (const coluna of this.colunasReferenciadas) {
                retorno += coluna + `, `;
            }
            retorno = retorno.slice(0, -2);
            retorno += `]`;
        }
        retorno += `>`;
        return retorno;
    }
}
exports.Restricao = Restricao;

},{"./construto":19}],28:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./avaliador-sintatico"), exports);
__exportStar(require("./comandos"), exports);
__exportStar(require("./construtos"), exports);
__exportStar(require("./interfaces"), exports);
__exportStar(require("./lexador"), exports);
__exportStar(require("./tipos-de-simbolos"), exports);
__exportStar(require("./tradutor"), exports);

},{"./avaliador-sintatico":6,"./comandos":12,"./construtos":20,"./interfaces":30,"./lexador":33,"./tipos-de-simbolos":40,"./tradutor":41}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],30:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./avaliador-sintatico-interface"), exports);
__exportStar(require("./simbolo-interface"), exports);
__exportStar(require("./tecnologia-lincones-interface"), exports);

},{"./avaliador-sintatico-interface":29,"./simbolo-interface":31,"./tecnologia-lincones-interface":32}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],33:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./lexador"), exports);
__exportStar(require("./lexador-sql-ansi"), exports);

},{"./lexador":36,"./lexador-sql-ansi":35}],34:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LexadorBase = void 0;
const simbolo_1 = require("./simbolo");
const lincones_1 = __importDefault(require("./palavras-reservadas/lincones"));
const tipos_de_simbolos_1 = __importDefault(require("../tipos-de-simbolos"));
class LexadorBase {
    eDigito(caractere) {
        return caractere >= '0' && caractere <= '9';
    }
    eAlfabeto(caractere) {
        const acentuacoes = [
            'á',
            'Á',
            'ã',
            'Ã',
            'â',
            'Â',
            'à',
            'À',
            'é',
            'É',
            'ê',
            'Ê',
            'í',
            'Í',
            'ó',
            'Ó',
            'õ',
            'Õ',
            'ô',
            'Ô',
            'ú',
            'Ú',
            'ç',
            'Ç',
            '_'
        ];
        return ((caractere >= 'a' && caractere <= 'z') ||
            (caractere >= 'A' && caractere <= 'Z') ||
            acentuacoes.includes(caractere));
    }
    eAlfabetoOuDigito(caractere) {
        return this.eDigito(caractere) || this.eAlfabeto(caractere);
    }
    eFinalDoCodigo() {
        return (this.eUltimaLinha() &&
            this.codigo[this.codigo.length - 1].length <= this.atual);
    }
    eUltimaLinha() {
        return this.linha >= this.codigo.length - 1;
    }
    eFinalDaLinha() {
        if (this.codigo.length === this.linha) {
            return true;
        }
        return this.atual >= this.codigo[this.linha].length;
    }
    simboloAtual() {
        if (this.eFinalDaLinha())
            return '\0';
        return this.codigo[this.linha].charAt(this.atual);
    }
    avancar() {
        this.atual += 1;
        if (this.eFinalDaLinha() && !this.eUltimaLinha()) {
            this.linha++;
            this.atual = 0;
        }
    }
    proximoSimbolo() {
        return this.codigo[this.linha].charAt(this.atual + 1);
    }
    simboloAnterior() {
        return this.codigo[this.linha].charAt(this.atual - 1);
    }
    analisarNumero() {
        while (this.eDigito(this.simboloAtual())) {
            this.avancar();
        }
        if (this.simboloAtual() == '.' && this.eDigito(this.proximoSimbolo())) {
            this.avancar();
            while (this.eDigito(this.simboloAtual())) {
                this.avancar();
            }
        }
        const numeroCompleto = this.codigo[this.linha].substring(this.inicioSimbolo, this.atual);
        this.adicionarSimbolo(tipos_de_simbolos_1.default.NUMERO, parseFloat(numeroCompleto));
    }
    analisarTexto(delimitador = '"') {
        while (this.simboloAtual() !== delimitador && !this.eFinalDoCodigo()) {
            this.avancar();
        }
        if (this.eFinalDoCodigo()) {
            this.erros.push({
                linha: this.linha + 1,
                caractere: this.simboloAnterior(),
                mensagem: 'Texto não finalizado.'
            });
            return;
        }
        const valor = this.codigo[this.linha].substring(this.inicioSimbolo + 1, this.atual);
        this.adicionarSimbolo(tipos_de_simbolos_1.default.TEXTO, valor);
    }
    adicionarSimbolo(tipo, literal = null) {
        const texto = this.codigo[this.linha].substring(this.inicioSimbolo, this.atual);
        this.simbolos.push(new simbolo_1.Simbolo(tipo, literal || texto, literal, this.linha + 1));
    }
    identificarPalavraChave() {
        while (this.eAlfabetoOuDigito(this.simboloAtual())) {
            this.avancar();
        }
        const codigo = this.codigo[this.linha].substring(this.inicioSimbolo, this.atual).toLowerCase();
        const tipo = codigo in lincones_1.default
            ? lincones_1.default[codigo]
            : tipos_de_simbolos_1.default.IDENTIFICADOR;
        this.adicionarSimbolo(tipo);
    }
    analisarToken() {
        const caractere = this.simboloAtual();
        switch (caractere) {
            // Esta sessão ignora espaços em branco na tokenização.
            case ' ':
            case '\0':
            case '\r':
            case '\t':
                this.avancar();
                break;
            case ';':
                this.adicionarSimbolo(tipos_de_simbolos_1.default.PONTO_VIRGULA, ';');
                this.avancar();
                break;
            case '"':
                this.avancar();
                this.analisarTexto('"');
                this.avancar();
                break;
            case "'":
                this.avancar();
                this.analisarTexto("'");
                this.avancar();
                break;
            case '(':
                this.adicionarSimbolo(tipos_de_simbolos_1.default.PARENTESE_ESQUERDO, '(');
                this.avancar();
                break;
            case ')':
                this.adicionarSimbolo(tipos_de_simbolos_1.default.PARENTESE_DIREITO, ')');
                this.avancar();
                break;
            case ',':
                this.adicionarSimbolo(tipos_de_simbolos_1.default.VIRGULA, ',');
                this.avancar();
                break;
            case '=':
                this.adicionarSimbolo(tipos_de_simbolos_1.default.IGUAL, '=');
                this.avancar();
                break;
            case '*':
                this.adicionarSimbolo(tipos_de_simbolos_1.default.TUDO, '*');
                this.avancar();
                break;
            case '<':
                this.avancar();
                if (this.simboloAtual() === '=') {
                    this.adicionarSimbolo(tipos_de_simbolos_1.default.MENOR_IGUAL);
                    this.avancar();
                }
                else {
                    this.adicionarSimbolo(tipos_de_simbolos_1.default.MENOR);
                }
                break;
            case '>':
                this.avancar();
                if (this.simboloAtual() === '=') {
                    this.adicionarSimbolo(tipos_de_simbolos_1.default.MAIOR_IGUAL);
                    this.avancar();
                }
                else {
                    this.adicionarSimbolo(tipos_de_simbolos_1.default.MAIOR);
                }
                break;
            case ':':
                this.adicionarSimbolo(tipos_de_simbolos_1.default.DOIS_PONTOS, ':');
                this.avancar();
                break;
            case '?':
                this.adicionarSimbolo(tipos_de_simbolos_1.default.INTERROGACAO, '?');
                this.avancar();
                break;
            default:
                if (this.eDigito(caractere))
                    this.analisarNumero();
                else if (this.eAlfabeto(caractere))
                    this.identificarPalavraChave();
                else {
                    this.erros.push({
                        linha: this.linha + 1,
                        caractere: caractere,
                        mensagem: 'Caractere inesperado.'
                    });
                    this.avancar();
                }
        }
    }
}
exports.LexadorBase = LexadorBase;

},{"../tipos-de-simbolos":40,"./palavras-reservadas/lincones":37,"./simbolo":39}],35:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LexadorSqlAnsi = void 0;
const lexador_base_1 = require("./lexador-base");
const sql_1 = __importDefault(require("./palavras-reservadas/sql"));
const tipos_de_simbolos_1 = __importDefault(require("../tipos-de-simbolos"));
/**
 * O Lexador SQL ANSI transforma código SQL ANSI em um
 * vetor de símbolos, a serem passados para o avaliador sintático
 * correspondente.
 */
class LexadorSqlAnsi extends lexador_base_1.LexadorBase {
    identificarPalavraChave() {
        while (this.eAlfabetoOuDigito(this.simboloAtual())) {
            this.avancar();
        }
        const codigo = this.codigo[this.linha].substring(this.inicioSimbolo, this.atual).toLowerCase();
        const tipo = codigo in sql_1.default
            ? sql_1.default[codigo]
            : tipos_de_simbolos_1.default.IDENTIFICADOR;
        this.adicionarSimbolo(tipo);
    }
    mapear(codigo) {
        this.inicioSimbolo = 0;
        this.atual = 0;
        this.linha = 0;
        this.codigo = codigo || [''];
        this.simbolos = [];
        this.erros = [];
        for (let iterador = 0; iterador < this.codigo.length; iterador++) {
            this.codigo[iterador] += '\0';
        }
        while (!this.eFinalDoCodigo()) {
            this.inicioSimbolo = this.atual;
            this.analisarToken();
        }
        return {
            simbolos: this.simbolos,
            erros: this.erros
        };
    }
}
exports.LexadorSqlAnsi = LexadorSqlAnsi;

},{"../tipos-de-simbolos":40,"./lexador-base":34,"./palavras-reservadas/sql":38}],36:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lexador = void 0;
const lexador_base_1 = require("./lexador-base");
class Lexador extends lexador_base_1.LexadorBase {
    mapear(codigo) {
        this.inicioSimbolo = 0;
        this.atual = 0;
        this.linha = 0;
        this.codigo = codigo || [''];
        this.simbolos = [];
        this.erros = [];
        for (let iterador = 0; iterador < this.codigo.length; iterador++) {
            this.codigo[iterador] += '\0';
        }
        while (!this.eFinalDoCodigo()) {
            this.inicioSimbolo = this.atual;
            this.analisarToken();
        }
        return {
            simbolos: this.simbolos,
            erros: this.erros
        };
    }
}
exports.Lexador = Lexador;

},{"./lexador-base":34}],37:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tipos_de_simbolos_1 = __importDefault(require("../../tipos-de-simbolos"));
exports.default = {
    adicionar: tipos_de_simbolos_1.default.ADICIONAR,
    agrupar: tipos_de_simbolos_1.default.AGRUPAR,
    alterar: tipos_de_simbolos_1.default.ALTERAR,
    atualizar: tipos_de_simbolos_1.default.ATUALIZAR,
    auto: tipos_de_simbolos_1.default.AUTO,
    caracteres: tipos_de_simbolos_1.default.CARACTERES,
    coluna: tipos_de_simbolos_1.default.COLUNA,
    chave: tipos_de_simbolos_1.default.CHAVE,
    criar: tipos_de_simbolos_1.default.CRIAR,
    de: tipos_de_simbolos_1.default.DE,
    definir: tipos_de_simbolos_1.default.DEFINIR,
    distinto: tipos_de_simbolos_1.default.DISTINTO,
    e: tipos_de_simbolos_1.default.E,
    entre: tipos_de_simbolos_1.default.ENTRE,
    em: tipos_de_simbolos_1.default.EM,
    estrangeira: tipos_de_simbolos_1.default.ESTRANGEIRA,
    excluir: tipos_de_simbolos_1.default.EXCLUIR,
    existir: tipos_de_simbolos_1.default.EXISTIR,
    falso: tipos_de_simbolos_1.default.FALSO,
    identidade: tipos_de_simbolos_1.default.IDENTIDADE,
    incremento: tipos_de_simbolos_1.default.INCREMENTO,
    inserir: tipos_de_simbolos_1.default.INSERIR,
    inteiro: tipos_de_simbolos_1.default.INTEIRO,
    logico: tipos_de_simbolos_1.default.LOGICO,
    lógico: tipos_de_simbolos_1.default.LOGICO,
    media: tipos_de_simbolos_1.default.MEDIA,
    nao: tipos_de_simbolos_1.default.NAO,
    não: tipos_de_simbolos_1.default.NAO,
    nulo: tipos_de_simbolos_1.default.NULO,
    onde: tipos_de_simbolos_1.default.ONDE,
    ordenar: tipos_de_simbolos_1.default.ORDENAR,
    para: tipos_de_simbolos_1.default.PARA,
    por: tipos_de_simbolos_1.default.POR,
    primaria: tipos_de_simbolos_1.default.PRIMARIA,
    primária: tipos_de_simbolos_1.default.PRIMARIA,
    referencia: tipos_de_simbolos_1.default.REFERENCIA,
    renomear: tipos_de_simbolos_1.default.RENOMEAR,
    remover: tipos_de_simbolos_1.default.REMOVER,
    restricao: tipos_de_simbolos_1.default.RESTRICAO,
    restrição: tipos_de_simbolos_1.default.RESTRICAO,
    se: tipos_de_simbolos_1.default.SE,
    selecionar: tipos_de_simbolos_1.default.SELECIONAR,
    tabela: tipos_de_simbolos_1.default.TABELA,
    texto: tipos_de_simbolos_1.default.TEXTO,
    unica: tipos_de_simbolos_1.default.UNICA,
    única: tipos_de_simbolos_1.default.UNICA,
    valores: tipos_de_simbolos_1.default.VALORES,
    verdadeiro: tipos_de_simbolos_1.default.VERDADEIRO,
    visao: tipos_de_simbolos_1.default.VISAO,
    visão: tipos_de_simbolos_1.default.VISAO
};

},{"../../tipos-de-simbolos":40}],38:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tipos_de_simbolos_1 = __importDefault(require("../../tipos-de-simbolos"));
exports.default = {
    add: tipos_de_simbolos_1.default.ADICIONAR,
    alter: tipos_de_simbolos_1.default.ALTERAR,
    and: tipos_de_simbolos_1.default.E,
    auto: tipos_de_simbolos_1.default.AUTO,
    between: tipos_de_simbolos_1.default.ENTRE,
    by: tipos_de_simbolos_1.default.POR,
    column: tipos_de_simbolos_1.default.COLUNA,
    constraint: tipos_de_simbolos_1.default.RESTRICAO,
    create: tipos_de_simbolos_1.default.CRIAR,
    default: tipos_de_simbolos_1.default.PADRAO,
    delete: tipos_de_simbolos_1.default.EXCLUIR,
    distinct: tipos_de_simbolos_1.default.DISTINTO,
    drop: tipos_de_simbolos_1.default.REMOVER,
    exists: tipos_de_simbolos_1.default.EXISTIR,
    false: tipos_de_simbolos_1.default.FALSO,
    foreign: tipos_de_simbolos_1.default.ESTRANGEIRA,
    from: tipos_de_simbolos_1.default.DE,
    group: tipos_de_simbolos_1.default.AGRUPAR,
    identity: tipos_de_simbolos_1.default.IDENTIDADE,
    if: tipos_de_simbolos_1.default.SE,
    increment: tipos_de_simbolos_1.default.INCREMENTO,
    insert: tipos_de_simbolos_1.default.INSERIR,
    integer: tipos_de_simbolos_1.default.INTEIRO,
    into: tipos_de_simbolos_1.default.EM,
    key: tipos_de_simbolos_1.default.CHAVE,
    not: tipos_de_simbolos_1.default.NAO,
    null: tipos_de_simbolos_1.default.NULO,
    numeric: tipos_de_simbolos_1.default.NUMERO,
    order: tipos_de_simbolos_1.default.ORDENAR,
    primary: tipos_de_simbolos_1.default.PRIMARIA,
    references: tipos_de_simbolos_1.default.REFERENCIA,
    rename: tipos_de_simbolos_1.default.RENOMEAR,
    select: tipos_de_simbolos_1.default.SELECIONAR,
    set: tipos_de_simbolos_1.default.DEFINIR,
    string: tipos_de_simbolos_1.default.TEXTO,
    table: tipos_de_simbolos_1.default.TABELA,
    text: tipos_de_simbolos_1.default.TEXTO,
    true: tipos_de_simbolos_1.default.VERDADEIRO,
    unique: tipos_de_simbolos_1.default.UNICA,
    update: tipos_de_simbolos_1.default.ATUALIZAR,
    varchar: tipos_de_simbolos_1.default.CARACTERES,
    values: tipos_de_simbolos_1.default.VALORES,
    view: tipos_de_simbolos_1.default.VISAO,
    where: tipos_de_simbolos_1.default.ONDE
};

},{"../../tipos-de-simbolos":40}],39:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Simbolo = void 0;
class Simbolo {
    constructor(tipo, lexema, literal, linha) {
        this.tipo = tipo;
        this.lexema = lexema;
        this.literal = literal;
        this.linha = linha;
    }
    paraTexto() {
        return this.tipo + ' ' + this.lexema + ' ' + this.literal;
    }
}
exports.Simbolo = Simbolo;

},{}],40:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    ADICIONAR: 'ADICIONAR',
    AGRUPAR: 'AGRUPAR',
    ALTERAR: 'ALTERAR',
    ATUALIZAR: 'ATUALIZAR',
    AUTO: 'AUTO',
    CARACTERES: 'CARACTERES',
    COLUNA: 'COLUNA',
    CHAVE: 'CHAVE',
    CRIAR: 'CRIAR',
    DE: 'DE',
    DEFINIR: 'DEFINIR',
    DISTINTO: 'DISTINTO',
    DOIS_PONTOS: 'DOIS_PONTOS',
    E: 'E',
    ENTRE: 'ENTRE',
    EM: 'EM',
    ESTRANGEIRA: 'ESTRANGEIRA',
    EXCLUIR: 'EXCLUIR',
    EXISTIR: 'EXISTIR',
    FALSO: 'FALSO',
    IDENTIDADE: 'IDENTIDADE',
    IDENTIFICADOR: 'IDENTIFICADOR',
    IGUAL: 'IGUAL',
    INCREMENTO: 'INCREMENTO',
    INSERIR: 'INSERIR',
    INTEIRO: 'INTEIRO',
    INTERROGACAO: 'INTERROGACAO',
    LOGICO: 'LOGICO',
    MAIOR: 'MAIOR',
    MAIOR_IGUAL: 'MAIOR_IGUAL',
    MEDIA: 'MEDIA',
    MENOR: 'MENOR',
    MENOR_IGUAL: 'MENOR_IGUAL',
    NAO: 'NAO',
    NULO: 'NULO',
    NUMERO: 'NUMERO',
    ONDE: 'ONDE',
    ORDENAR: 'ORDENAR',
    PADRAO: 'PADRAO',
    PARA: 'PARA',
    PARENTESE_DIREITO: 'PARENTESE_DIREITO',
    PARENTESE_ESQUERDO: 'PARENTESE_ESQUERDO',
    PONTO_VIRGULA: 'PONTO_VIRGULA',
    POR: 'POR',
    PRIMARIA: 'PRIMARIA',
    REFERENCIA: 'REFERENCIA',
    RENOMEAR: 'RENOMEAR',
    REMOVER: 'REMOVER',
    RESTRICAO: 'RESTRICAO',
    SE: 'SE',
    SELECIONAR: 'SELECIONAR',
    TABELA: 'TABELA',
    TEXTO: 'TEXTO',
    TUDO: 'TUDO',
    UNICA: 'UNICA',
    VALORES: 'VALORES',
    VERDADEIRO: 'VERDADEIRO',
    VIRGULA: 'VIRGULA',
    VISAO: 'VISAO'
};

},{}],41:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./tradutor-reverso-sql-ansi"), exports);
__exportStar(require("./tradutor-sql-ansi"), exports);

},{"./tradutor-reverso-sql-ansi":42,"./tradutor-sql-ansi":43}],42:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradutorReversoSqlAnsi = void 0;
const construtos_1 = require("../construtos");
const tipos_de_simbolos_1 = __importDefault(require("../tipos-de-simbolos"));
/**
 * Este tradutor traduz comandos de alto nível em LinConEs,
 * normalmente lendo um arquivo em SQL ANSI e produzindo estruturas de alto
 * nível sobre eles.
 */
class TradutorReversoSqlAnsi {
    constructor(tamanhoIndentacao = 4) {
        this.dicionarioComandos = {
            Alterar: this.traduzirComandoAlterar.bind(this),
            Atualizar: this.traduzirComandoAtualizar.bind(this),
            Criar: this.traduzirComandoCriar.bind(this),
            Excluir: this.traduzirComandoExcluir.bind(this),
            Inserir: this.traduzirComandoInserir.bind(this),
            RemoverEntidade: this.traduzirComandoRemoverEntidade.bind(this),
            Selecionar: this.traduzirComandoSelecionar.bind(this)
        };
        this.tamanhoIndentacao = tamanhoIndentacao;
    }
    traduzirIdentificador(nome) {
        if (!nome)
            return "";
        return `${String(nome).replace(/"/g, '""')} `;
    }
    traduzirValor(valor) {
        if (valor === null || valor === undefined) {
            return "NULO";
        }
        if (typeof valor === "number" || typeof valor === "bigint") {
            return String(valor);
        }
        if (typeof valor === "boolean") {
            return valor ? "VERDADEIRO" : "FALSO";
        }
        return `'${String(valor).replace(/'/g, "''")}'`;
    }
    traduzirCondicoes(condicoes) {
        if (!condicoes)
            return "";
        if (typeof condicoes === "string") {
            return condicoes;
        }
        if (Array.isArray(condicoes)) {
            return condicoes
                .map((c) => (typeof c === "string" ? c : this.traduzirCondicaoObjeto(c)))
                .filter((s) => s)
                .join(" E ");
        }
        return this.traduzirCondicaoObjeto(condicoes);
    }
    traduzirCondicaoObjeto(obj) {
        if (!obj)
            return "";
        const partes = [];
        for (const chave of Object.keys(obj)) {
            const val = obj[chave];
            if (val && typeof val === "object" && "op" in val) {
                const op = (val.op || "=").toUpperCase();
                partes.push(`${this.traduzirIdentificador(chave)} ${op} ${this.traduzirValor(val.valor)}`);
            }
            else if (val === null) {
                partes.push(`${this.traduzirIdentificador(chave)} É NULO`);
            }
            else {
                partes.push(`${this.traduzirIdentificador(chave)} = ${this.traduzirValor(val)}`);
            }
        }
        return partes.join(" E ");
    }
    traduzirComandoInserir(comando) {
        const cmd = comando;
        const tabela = this.traduzirIdentificador(cmd.tabela || cmd.nome || cmd.table || "");
        const valores = cmd.valores || cmd.registro || cmd.rows;
        if (!tabela)
            return "";
        if (!valores) {
            return `INSERIR EM ${tabela} VALORES PADRÃO`;
        }
        if (Array.isArray(valores)) {
            if (valores.length === 0) {
                return `INSERIR EM ${tabela} VALORES PADRÃO`;
            }
            const cols = Object.keys(valores[0]);
            const colList = cols.map((c) => this.traduzirIdentificador(c)).join(", ");
            const rows = valores
                .map((r) => `(${cols.map((c) => this.traduzirValor(r[c])).join(", ")})`)
                .join(", ");
            return `INSERIR EM ${tabela} (${colList})\nVALORES ${rows}`;
        }
        const cols = Object.keys(valores);
        const colList = cols.map((c) => this.traduzirIdentificador(c)).join(", ");
        const vals = cols.map((c) => this.traduzirValor(valores[c])).join(", ");
        return `INSERIR EM ${tabela} (${colList})\nVALORES (${vals})`;
    }
    traduzirComandoAtualizar(comando) {
        let resultado = `ATUALIZAR ${comando.tabela}\n`;
        resultado += `DEFINIR`;
        for (const valorAtualizacao of comando.colunasEValores) {
            resultado += ` ${this.traduzirConstruto(valorAtualizacao.coluna)} = ${this.traduzirConstruto(valorAtualizacao.valor)}, \n`;
        }
        resultado = resultado.slice(0, -3);
        if (comando.condicoes.length > 0) {
            resultado += `\nONDE`;
            for (const condicao of comando.condicoes) {
                resultado += ` ${this.traduzirConstruto(condicao.esquerda)} ${this.traduzirOperador(condicao.operador)} ${this.traduzirConstruto(condicao.direita)}\nE`;
            }
            resultado = resultado.slice(0, -4);
        }
        return resultado;
    }
    traduzirComandoExcluir(comando) {
        const cmd = comando;
        const tabela = this.traduzirIdentificador(cmd.tabela || cmd.nome || cmd.table || "");
        const condicoes = this.traduzirCondicoes(cmd.condicoes || cmd.where);
        if (!tabela)
            return "";
        let resultado = `EXCLUIR DE ${tabela}`;
        if (condicoes) {
            resultado += `\nONDE ${condicoes}`;
        }
        return resultado;
    }
    traduzirComandoRemoverEntidade(comandoRemoverEntidade) {
        return `REMOVER ${comandoRemoverEntidade.tipoEntidade} ${comandoRemoverEntidade.nomeEntidade}`;
    }
    traduzirComandoSelecionar(comando) {
        const cmd = comando;
        const colunas = cmd.colunas || cmd.fields || cmd.campos || ["*"];
        const tabela = cmd.tabela || cmd.nome || cmd.from || cmd.table;
        const condicoes = this.traduzirCondicoes(cmd.condicoes || cmd.where);
        const orderBy = cmd.orderBy;
        const limit = cmd.limit;
        const offset = cmd.offset;
        let resultado = "SELECIONAR ";
        if (Array.isArray(colunas) && colunas.length > 0) {
            resultado += colunas
                .map((c) => (typeof c === "string" ? c : String(c)))
                .join(", ");
        }
        else {
            resultado += "*";
        }
        if (tabela) {
            const tabelaFormatada = Array.isArray(tabela)
                ? tabela.join(", ")
                : tabela;
            resultado += `\nDE ${tabelaFormatada}`;
        }
        if (condicoes) {
            resultado += `\nONDE ${condicoes}`;
        }
        if (orderBy) {
            resultado += ` ORDENAR POR ${orderBy}`;
        }
        if (typeof limit !== "undefined") {
            resultado += ` LIMITE ${Number(limit)}`;
        }
        if (typeof offset !== "undefined") {
            resultado += ` DESLOCAMENTO ${Number(offset)}`;
        }
        return resultado;
    }
    traduzirColunaComTipo(coluna, indentar = true) {
        let resultado = "";
        if (indentar) {
            resultado += `${' '.repeat(this.tamanhoIndentacao)}`;
        }
        resultado += `${this.traduzirIdentificador(coluna.nomeColuna)}`;
        if (coluna.tipo) {
            resultado += `${String(coluna.tipo)} `;
        }
        if (coluna.nulo) {
            resultado += `NULO `;
        }
        else {
            resultado += `NÃO NULO `;
        }
        // TODO: Implementar mais futuramente.
        /* if (typeof coluna.default !== "undefined") {
            resultado += `PADRÃO ${this.traduzirValor(coluna.default)} `;
        }

        if (coluna.unique) {
            resultado += `ÚNICA `;
        } */
        return resultado;
    }
    traduzirComandoCriar(comando) {
        let resultado = `CRIAR TABELA `;
        resultado += `${comando.nomeEntidade} (\n`;
        for (const coluna of comando.colunas) {
            resultado += this.traduzirColunaComTipo(coluna);
            if (coluna.chavePrimaria) {
                resultado += 'CHAVE PRIMÁRIA ';
                if (coluna.autoIncremento) {
                    resultado += 'AUTO INCREMENTO ';
                }
            }
            resultado = resultado.slice(0, -1);
            resultado += ',\n';
        }
        resultado = resultado.slice(0, -2);
        resultado += `\n)`;
        return resultado;
    }
    traduzirConstruto(construto) {
        switch (construto.constructor) {
            case construtos_1.Literal:
                const construtoLiteral = construto;
                switch (construtoLiteral.tipoPresumido) {
                    case tipos_de_simbolos_1.default.LOGICO:
                        return construtoLiteral.valor.toUpperCase();
                    case tipos_de_simbolos_1.default.CARACTERES:
                    case tipos_de_simbolos_1.default.TEXTO:
                        return `'${construtoLiteral.valor}'`;
                    default:
                        return `${String(construtoLiteral.valor)}`;
                }
            case construtos_1.ParametroAnonimo:
                return `?`;
            case construtos_1.ParametroNomeado:
                const construtoParametroNomeado = construto;
                return `:${construtoParametroNomeado.nome}`;
            case construtos_1.ReferenciaColuna:
                const construtoReferenciaColuna = construto;
                return construtoReferenciaColuna.nomeColuna;
        }
    }
    traduzirOperador(operador) {
        switch (operador) {
            case tipos_de_simbolos_1.default.IGUAL:
                return '=';
            case tipos_de_simbolos_1.default.VERDADEIRO:
                return true;
            case tipos_de_simbolos_1.default.FALSO:
                return false;
        }
    }
    traduzirTipoDeRestricao(tipo) {
        switch (tipo) {
            case 'CHAVE_PRIMARIA':
                return 'PRIMARY KEY';
            case 'CHAVE_ESTRANGEIRA':
                return 'FOREIGN KEY';
            case 'ÚNICA':
                return 'UNIQUE';
        }
    }
    logicaManipulacaoColunasOuRestricoes(elemento) {
        if (elemento instanceof construtos_1.Coluna) {
            const formatacaoColuna = `COLUNA ${this.traduzirColunaComTipo(elemento, false)}`;
            return formatacaoColuna;
        }
        if (elemento instanceof construtos_1.Restricao) {
            let formatacaoRestricao = `RESTRIÇÃO ${elemento.nome} ${this.traduzirTipoDeRestricao(elemento.tipo)} (`;
            for (const coluna of elemento.colunas) {
                formatacaoRestricao += coluna + ', ';
            }
            formatacaoRestricao = formatacaoRestricao.slice(0, -2);
            formatacaoRestricao += `) REFERENCES ${elemento.tabelaReferenciada} (`;
            for (const colunaReferenciada of elemento.colunasReferenciadas) {
                formatacaoRestricao += colunaReferenciada + ', ';
            }
            formatacaoRestricao = formatacaoRestricao.slice(0, -2);
            formatacaoRestricao += `) `;
            return formatacaoRestricao;
        }
    }
    traduzirAlteracaoColuna(operacao) {
        switch (operacao.tipo) {
            case "ADICIONAR":
                return `ADICIONAR ${this.logicaManipulacaoColunasOuRestricoes(operacao.elemento)}`;
            case "REMOVER":
                if (operacao.elemento instanceof construtos_1.Coluna) {
                    return `REMOVER COLUNA ${operacao.elemento.nomeColuna} `;
                }
                /* if (operacao.coluna) {
                    
                }
                if (operacao.constraint) {
                    return `REMOVER RESTRIÇÃO ${this.traduzirIdentificador(operacao.constraint)}`;
                } */
                break;
            case "RENOMEAR":
                // return `RENOMEAR COLUNA ${this.traduzirIdentificador(operacao.de || operacao.from)} PARA ${this.traduzirIdentificador(operacao.para || operacao.to)}`;
                break;
            case "ALTERAR":
                return `ALTERAR ${this.logicaManipulacaoColunasOuRestricoes(operacao.elemento)}`;
        }
    }
    traduzirComandoAlterar(comando) {
        const tabela = this.traduzirIdentificador(comando.nomeEntidade);
        let resultado = `ALTERAR TABELA ${tabela} `;
        const partes = comando.operacoes
            .map((a) => this.traduzirAlteracaoColuna(a))
            .filter((s) => s);
        if (partes.length === 0)
            return "";
        resultado += partes.join(", ");
        return resultado;
    }
    traduzir(comandos) {
        let resultado = '';
        for (const comando of comandos.filter((c) => c)) {
            resultado += `${this.dicionarioComandos[comando.constructor.name](comando)} \n`;
        }
        return resultado;
    }
}
exports.TradutorReversoSqlAnsi = TradutorReversoSqlAnsi;

},{"../construtos":20,"../tipos-de-simbolos":40}],43:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradutorSqlAnsi = void 0;
const construtos_1 = require("../construtos");
const literal_1 = require("../construtos/literal");
const referencia_coluna_1 = require("../construtos/referencia-coluna");
const restricao_1 = require("../construtos/restricao");
const tipos_de_simbolos_1 = __importDefault(require("../tipos-de-simbolos"));
/**
 * Este tradutor traduz comandos de alto nível em SQL ANSI, e a ideia é poder
 * utilizar para outros tradutores futuros, com pequenas nuances em
 * alguns comandos quando for o caso.
 */
class TradutorSqlAnsi {
    constructor(tamanhoIndentacao = 4) {
        this.dicionarioComandos = {
            Alterar: this.traduzirComandoAlterar.bind(this),
            Atualizar: this.traduzirComandoAtualizar.bind(this),
            Criar: this.traduzirComandoCriar.bind(this),
            Excluir: this.traduzirComandoExcluir.bind(this),
            Inserir: this.traduzirComandoInserir.bind(this),
            RemoverEntidade: this.traduzirComandoRemoverEntidade.bind(this),
            Selecionar: this.traduzirComandoSelecionar.bind(this)
        };
        this.tamanhoIndentacao = tamanhoIndentacao;
    }
    traduzirOperador(operador) {
        switch (operador) {
            case tipos_de_simbolos_1.default.IGUAL:
                return '=';
            case tipos_de_simbolos_1.default.MAIOR:
                return '>';
            case tipos_de_simbolos_1.default.MAIOR_IGUAL:
                return '>=';
            case tipos_de_simbolos_1.default.MENOR:
                return '<';
            case tipos_de_simbolos_1.default.MENOR_IGUAL:
                return '<=';
            case tipos_de_simbolos_1.default.VERDADEIRO:
                return true;
            case tipos_de_simbolos_1.default.FALSO:
                return false;
        }
    }
    traduzirTipoJuncao(tipo) {
        const tipoNormalizado = String(tipo || '').toUpperCase();
        switch (tipoNormalizado) {
            case 'INTERNA':
            case 'INNER':
                return 'INNER';
            case 'ESQUERDA':
            case 'LEFT':
                return 'LEFT';
            case 'DIREITA':
            case 'RIGHT':
                return 'RIGHT';
            case 'COMPLETA':
            case 'FULL':
                return 'FULL';
            case 'CRUZADA':
            case 'CROSS':
                return 'CROSS';
            default:
                return 'INNER';
        }
    }
    traduzirJuncao(juncao) {
        const tipoJuncao = this.traduzirTipoJuncao(juncao.tipo);
        let resultado = `${tipoJuncao} JOIN ${juncao.tabela}`;
        if (juncao.alias) {
            resultado += ` AS ${juncao.alias}`;
        }
        if (juncao.condicoes && juncao.condicoes.length > 0) {
            resultado += `\nON `;
            for (const condicao of juncao.condicoes) {
                resultado += ` ${this.traduzirConstruto(condicao.esquerda)} ${this.traduzirOperador(condicao.operador)} ${this.traduzirConstruto(condicao.direita)}\nAND`;
            }
            resultado = resultado.slice(0, -4);
        }
        return resultado;
    }
    traduzirTipoDeDados(tipo) {
        switch (tipo) {
            case 'INTEIRO':
                return 'INTEGER';
            case 'LOGICO':
                return 'BOOLEAN';
            case 'NUMERO':
                return 'INT';
            case 'CARACTERES':
                return 'VARCHAR';
            case 'TEXTO':
                return 'TEXT';
        }
    }
    traduzirTipoDeRestricao(tipo) {
        switch (tipo) {
            case 'CHAVE_PRIMARIA':
                return 'PRIMARY KEY';
            case 'CHAVE_ESTRANGEIRA':
                return 'FOREIGN KEY';
            case 'ÚNICA':
                return 'UNIQUE';
        }
    }
    traduzirConstruto(construto) {
        switch (construto.constructor) {
            case literal_1.Literal:
                const construtoLiteral = construto;
                switch (construtoLiteral.tipoPresumido) {
                    case tipos_de_simbolos_1.default.LOGICO:
                        return construtoLiteral.valor.toUpperCase() === 'VERDADEIRO' ? 'TRUE' : 'FALSE';
                    case tipos_de_simbolos_1.default.TEXTO:
                        return `'${construtoLiteral.valor}'`;
                    case tipos_de_simbolos_1.default.INTEIRO:
                    default:
                        return `${String(construtoLiteral.valor)}`;
                }
            case construtos_1.ParametroAnonimo:
                return `?`;
            case construtos_1.ParametroNomeado:
                const construtoParametroNomeado = construto;
                return `:${construtoParametroNomeado.nome}`;
            case referencia_coluna_1.ReferenciaColuna:
                const construtoReferenciaColuna = construto;
                return construtoReferenciaColuna.nomeColuna;
        }
    }
    traduzirColunaComTipo(coluna) {
        let resultado = `${' '.repeat(this.tamanhoIndentacao)}${coluna.nomeColuna} ${this.traduzirTipoDeDados(coluna.tipo)}`;
        if (coluna.tamanho) {
            resultado += `(${coluna.tamanho.lexema}) `;
        }
        if (coluna.nulo) {
            resultado += `NULL `;
        }
        else {
            resultado += `NOT NULL `;
        }
        return resultado;
    }
    traduzirComandoAtualizar(comandoAtualizar) {
        let resultado = `UPDATE ${comandoAtualizar.tabela}\n`;
        resultado += `SET`;
        for (const valorAtualizacao of comandoAtualizar.colunasEValores) {
            resultado += ` ${this.traduzirConstruto(valorAtualizacao.coluna)} = ${this.traduzirConstruto(valorAtualizacao.valor)}, \n`;
        }
        resultado = resultado.slice(0, -3);
        resultado += `\nWHERE`;
        if (comandoAtualizar.condicoes.length > 0) {
            for (const condicao of comandoAtualizar.condicoes) {
                resultado += ` ${this.traduzirConstruto(condicao.esquerda)} ${this.traduzirOperador(condicao.operador)} ${this.traduzirConstruto(condicao.direita)}\nAND`;
            }
            resultado = resultado.slice(0, -4);
        }
        return resultado;
    }
    traduzirComandoCriar(comandoCriar) {
        let resultado = 'CREATE TABLE ';
        resultado += `${comandoCriar.nomeEntidade} (\n`;
        for (const coluna of comandoCriar.colunas) {
            resultado += this.traduzirColunaComTipo(coluna);
            if (coluna.chavePrimaria) {
                resultado += 'PRIMARY KEY ';
                if (coluna.autoIncremento) {
                    resultado += 'AUTOINCREMENT ';
                }
            }
            resultado = resultado.slice(0, -1);
            resultado += ',\n';
        }
        resultado = resultado.slice(0, -2);
        resultado += `\n)`;
        return resultado;
    }
    traduzirComandoExcluir(comandoExcluir) {
        let resultado = 'DELETE FROM ';
        resultado += `${comandoExcluir.tabela}`;
        // Condições
        if (comandoExcluir.condicoes.length > 0) {
            resultado += '\nWHERE ';
            for (const condicao of comandoExcluir.condicoes) {
                resultado += ` ${this.traduzirConstruto(condicao.esquerda)} ${this.traduzirOperador(condicao.operador)} ${this.traduzirConstruto(condicao.direita)}\nAND`;
            }
            resultado = resultado.slice(0, -4);
        }
        return resultado;
    }
    traduzirComandoInserir(comandoInserir) {
        let resultado = 'INSERT INTO ';
        resultado += `${comandoInserir.tabela} (`;
        for (const coluna of comandoInserir.colunas) {
            resultado += `${coluna}, `;
        }
        resultado = resultado.slice(0, -2);
        resultado += `)\nVALUES (`;
        for (const valor of comandoInserir.valores) {
            resultado += `${this.traduzirConstruto(valor)}, `;
        }
        resultado = resultado.slice(0, -2);
        resultado += `)`;
        return resultado;
    }
    traduzirComandoRemoverEntidade(comandoRemoverEntidade) {
        let resultado = 'DROP ';
        switch (comandoRemoverEntidade.tipoEntidade) {
            case 'TABELA':
                resultado += `TABLE ${comandoRemoverEntidade.nomeEntidade}`;
                break;
            case 'VISÃO':
                resultado += `VIEW ${comandoRemoverEntidade.nomeEntidade}`;
                break;
        }
        return resultado;
    }
    traduzirComandoSelecionar(comandoSelecionar) {
        let resultado = 'SELECT ';
        // Colunas
        if (comandoSelecionar.tudo) {
            resultado += '*';
        }
        else {
            for (const coluna of comandoSelecionar.colunas) {
                resultado += coluna + ', ';
            }
            resultado = resultado.slice(0, -2);
        }
        resultado += `\nFROM ${comandoSelecionar.tabela}`;
        if (comandoSelecionar.juncoes && comandoSelecionar.juncoes.length > 0) {
            for (const juncao of comandoSelecionar.juncoes) {
                resultado += `\n${this.traduzirJuncao(juncao)}`;
            }
        }
        // Condições
        if (comandoSelecionar.condicoes.length > 0) {
            resultado += '\nWHERE ';
            for (const condicao of comandoSelecionar.condicoes) {
                resultado += ` ${this.traduzirConstruto(condicao.esquerda)} ${this.traduzirOperador(condicao.operador)} ${this.traduzirConstruto(condicao.direita)}\nAND`;
                /* resultado += `${
                    condicao.esquerda.lexema
                } ${this.traduzirOperador(condicao.operador)} ${
                    condicao.direita
                } AND `; */
            }
            resultado = resultado.slice(0, -4);
        }
        return resultado;
    }
    logicaManipulacaoColunas(elemento) {
        if (elemento instanceof construtos_1.Coluna) {
            let formatacaoColuna = `COLUMN ${elemento.nomeColuna} ${this.traduzirTipoDeDados(elemento.tipo)}`;
            if (elemento.tipo === 'CARACTERES') {
                formatacaoColuna += `(${elemento.tamanho.lexema})`;
            }
            formatacaoColuna += ` `;
            return formatacaoColuna;
        }
        if (elemento instanceof restricao_1.Restricao) {
            let formatacaoRestricao = `CONSTRAINT ${elemento.nome} ${this.traduzirTipoDeRestricao(elemento.tipo)} (`;
            for (const coluna of elemento.colunas) {
                formatacaoRestricao += coluna + ', ';
            }
            formatacaoRestricao = formatacaoRestricao.slice(0, -2);
            formatacaoRestricao += `) REFERENCES ${elemento.tabelaReferenciada} (`;
            for (const colunaReferenciada of elemento.colunasReferenciadas) {
                formatacaoRestricao += colunaReferenciada + ', ';
            }
            formatacaoRestricao = formatacaoRestricao.slice(0, -2);
            formatacaoRestricao += `) `;
            return formatacaoRestricao;
        }
    }
    traduzirTipoEntidade(tipoEntidade) {
        switch (tipoEntidade.toUpperCase()) {
            case 'TABELA':
                return 'TABLE';
            case 'VISÃO':
            case 'VISAO':
                return 'VIEW';
        }
    }
    traduzirComandoAlterar(comandoAlterar) {
        let resultado = `ALTER ${this.traduzirTipoEntidade(comandoAlterar.tipoEntidade)} ${comandoAlterar.nomeEntidade} `;
        for (const operacao of comandoAlterar.operacoes) {
            switch (operacao.tipo) {
                case 'ADICIONAR':
                    resultado += `ADD ${this.logicaManipulacaoColunas(operacao.elemento)}`;
                    break;
                case 'ALTERAR':
                    resultado += `ALTER ${this.logicaManipulacaoColunas(operacao.elemento)}`;
                    break;
                case 'REMOVER':
                    resultado += 'BIT';
                    break;
                case 'RENOMEAR':
                    break;
            }
        }
        return resultado;
    }
    traduzir(comandos) {
        let resultado = '';
        for (const comando of comandos.filter((c) => c)) {
            resultado += `${this.dicionarioComandos[comando.constructor.name](comando)} \n`;
        }
        return resultado;
    }
}
exports.TradutorSqlAnsi = TradutorSqlAnsi;

},{"../construtos":20,"../construtos/literal":22,"../construtos/referencia-coluna":26,"../construtos/restricao":27,"../tipos-de-simbolos":40}]},{},[1]);
