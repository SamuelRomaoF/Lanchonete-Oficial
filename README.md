# Lanchonete Oficial - Sistema de Gestão

Este projeto é um sistema para gerenciamento de lanchonete incluindo cardápio, categorias, produtos e dashboard administrativo.

## Configuração para Deploy no Netlify

### Pré-requisitos
- Conta no GitHub
- Conta no Netlify
- Token de acesso pessoal do GitHub

### 1. Configuração do Token do GitHub

1. Acesse sua conta do GitHub
2. Vá para Configurações > Developer settings > Personal access tokens > Tokens (classic)
3. Clique em "Generate new token (classic)"
4. Dê um nome como "Lanchonete Netlify"
5. Selecione o escopo `repo` (acesso total ao repositório)
6. Clique em "Generate token" e **copie o token** - você não poderá vê-lo novamente!

### 2. Configuração dos Arquivos no GitHub

Você precisa criar os seguintes arquivos vazios no seu repositório:

1. `data/categories.json` - Array vazio (`[]`)
2. `data/products.json` - Array vazio (`[]`)
3. `data/users.json` - Com um usuário administrador:
   ```json
   [
     {
       "id": "1",
       "name": "Administrador",
       "email": "admin@lanchonete.com",
       "password": "$2a$10$Nn/CIW0z1YMJJlEr6QE0AOznU9XbRqP3EDZPBQvl/4BMeFEUPXpcS",
       "type": "admin",
       "createdAt": "2023-05-16T00:00:00.000Z"
     }
   ]
   ```
   OBS: A senha padrão do administrador é "admin123"

### 3. Deploy no Netlify

1. Acesse sua conta do Netlify
2. Clique em "New site from Git"
3. Selecione GitHub como provedor
4. Escolha o repositório `lanchonete-oficial`
5. Configure o build:
   - Build command: `cd client && npm install && npm run build`
   - Publish directory: `client/build`
6. Expanda "Advanced build settings" e adicione as variáveis de ambiente:
   - `GITHUB_TOKEN` com o valor do token copiado anteriormente
   - `JWT_SECRET` com um valor secreto aleatório para segurança dos tokens JWT
7. Clique em "Deploy site"

### 4. Configuração após o Deploy

1. No dashboard do Netlify, acesse seu site
2. Vá para "Functions" para verificar se as funções foram implantadas corretamente
3. Vá para "Site settings" > "Build & deploy" > "Environment" para confirmar que as variáveis estão configuradas
4. Faça um teste acessando seu site e verificando se o login de administrador funciona

## Estrutura das Funções Netlify

### Autenticação
- `login.js` - Autentica usuários e gera token JWT
- `me.js` - Verifica o token JWT e retorna dados do usuário atual

### Dados
- `getCategories.js` / `saveCategories.js` - Gerencia categorias
- `getProducts.js` / `saveProducts.js` - Gerencia produtos
- `getStats.js` - Retorna estatísticas básicas para o dashboard

## Desenvolvimento Local

Para testar localmente com as funções Netlify:

1. Instale o Netlify CLI: `npm install -g netlify-cli`
2. Crie um arquivo `.env` na raiz com:
   ```
   GITHUB_TOKEN=seu_token_do_github
   JWT_SECRET=seu_secret_jwt
   ```
3. Execute `netlify dev` na raiz do projeto

## Credenciais Padrão

- **Email:** admin@lanchonete.com
- **Senha:** admin123

---

Desenvolvido para a Lanchonete Oficial © 2023 