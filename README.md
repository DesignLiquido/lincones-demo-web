# 🇧🇷 Editor LinConEs - SQL em Português

![LinConEs](https://img.shields.io/badge/LinConEs-SQL%20em%20Portugu%C3%AAs-blue)
![License](https://img.shields.io/badge/License-MIT-green)

Uma demonstração interativa do **LinConEs** — a Linguagem de Consulta Estruturada em português — rodando no navegador com suporte a banco de dados usando **IndexedDB**.

## 📋 Sobre

O **Editor LinConEs** é uma aplicação web que permite escrever, traduzir e executar comandos SQL completamente em português. Este projeto exemplifica como a **Design Líquido** trabalha para democratizar o acesso à tecnologia, quebrando a barreira do idioma inglês e tornando a programação mais acessível para falantes da língua portuguesa.

### Missão

Alinhado com a missão da [Design Líquido](https://github.com/DesignLiquido), este projeto visa:

- ✅ **Melhorar o acesso a leigos** - Programação em português natural
- ✅ **Quebrar a barreira do inglês** - Comandos SQL em português
- ✅ **Educação acessível** - Ferramenta de aprendizado interativa

## 🎯 Funcionalidades

- **Editor de Código** - Interface moderna com syntax highlighting
- **Tradução em Tempo Real** - Visualize como LinConEs se traduz para SQL
- **Execução de Comandos** - Execute operações de banco de dados no navegador
- **Gerenciamento de Banco de Dados** - Crie, insira, selecione, atualize e delete dados
- **IndexedDB** - Persistência de dados no navegador sem servidor
- **Tema Dark** - Interface inspirada no VS Code para melhor experiência

## 🛠️ Tecnologias

- **HTML5** - Estrutura semântica
- **CSS3** - Estilização responsiva
- **JavaScript (Vanilla)** - Lógica de aplicação
- **Monaco Editor** - Editor de código profissional
- **Dexie.js** - ORM para IndexedDB
- **IndexedDB** - Banco de dados no navegador

## 📚 Exemplos de Uso

### Criar uma Tabela

```sql
CRIAR TABELA usuarios (
    ID INTEIRO NAO NULO CHAVE PRIMARIA AUTO INCREMENTO,
    NOME TEXTO(100) NAO NULO,
    EMAIL TEXTO(255) NULO
);
```

### Inserir Dados

```sql
INSERIR EM usuarios (NOME, EMAIL)
VALORES ("João Silva", "joao@exemplo.com");
```

### Selecionar Dados

```sql
SELECIONAR * DE usuarios;
```

### Atualizar Dados

```sql
ATUALIZAR usuarios
DEFINIR EMAIL = "novo@email.com"
ONDE ID = 1;
```

### Excluir Dados

```sql
EXCLUIR DE usuarios
ONDE ID = 1;
```

## 🗺️ Referência de Tradução

| LinConEs | SQL |
|----------|-----|
| SELECIONAR | SELECT |
| DE | FROM |
| ONDE | WHERE |
| INSERIR | INSERT |
| EM | INTO |
| VALORES | VALUES |
| ATUALIZAR | UPDATE |
| DEFINIR | SET |
| EXCLUIR | DELETE |
| CRIAR | CREATE |
| TABELA | TABLE |
| INTEIRO | INT |
| TEXTO | VARCHAR |
| REAL | REAL |
| LOGICO | BOOLEAN |
| DATA | DATE |
| E | AND |
| OU | OR |

## 🚀 Como Usar

1. **Abra o arquivo** `index.html` em um navegador web moderno
2. **Digite sua consulta** em LinConEs no editor à esquerda
3. **Pressione "Executar"** ou use `Ctrl+Enter`
4. **Veja os resultados** no painel à direita
5. **Use "Resetar Banco"** para limpar todos os dados

### Atalhos de Teclado

- `Ctrl+Enter` - Executar consulta
- `Ctrl+S` - Salvar (padrão do navegador)

## 📊 Interface

A aplicação segue o design do VS Code com:

- **Painel do Editor** - Escreva seus comandos LinConEs
- **Painel de Resultados** - Visualize a tradução e os resultados
- **Tradução Visual** - Veja exatamente como LinConEs vira SQL
- **Tabelas Interativas** - Resultados exibidos em formato legível

## 🔧 Recursos Técnicos

### Persistência de Dados

Os dados são armazenados no **IndexedDB** do navegador, permitindo:

- Múltiplas tabelas
- Consultas rápidas
- Sem necessidade de servidor
- Dados persistem entre sessões

### Compatibilidade

- ✅ Chrome/Chromium 60+
- ✅ Firefox 57+
- ✅ Safari 11+
- ✅ Edge 79+

## 🌐 Ecosistema Design Líquido

Este projeto faz parte do ecossistema de linguagens em português da Design Líquido:

- **[Delégua](https://github.com/DesignLiquido/delegua)** - Linguagem de programação em português
- **[LinConEs](https://github.com/DesignLiquido/LinConEs)** - SQL em português
- **[LMHT](https://github.com/DesignLiquido/LMHT)** - HTML em português
- **[FolEs](https://github.com/DesignLiquido/FolEs)** - CSS em português
- **[VS Code Extension](https://github.com/DesignLiquido/vscode)** - Ferramentas para todas as linguagens

## 📖 Aprenda Mais

- [Especificação LinConEs](https://github.com/DesignLiquido/LinConEs)
- [Design Líquido](https://github.com/DesignLiquido)
- [Site Oficial](https://www.designliquido.com.br)

## 📝 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo `LICENSE` para mais detalhes.

**Desenvolvido com ❤️ pela comunidade Design Líquido**

🌍 🇵🇹 🇧🇷 🇦🇴 🇲🇿 🇹🇱 🇸🇹 🇬🇼
