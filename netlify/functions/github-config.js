/**
 * Configuração central para acesso ao repositório GitHub
 */

// Obter o nome do repositório da variável de ambiente ou usar o valor padrão
const githubRepo = process.env.GITHUB_REPO || 'SamuelRomaoF/lanchonete-dados';

// Base URL para acessar a API do GitHub
const baseApiUrl = `https://api.github.com/repos/${githubRepo}/contents`;

// Log para ajudar na depuração (será registrado nos logs do Netlify)
console.log(`Repositório configurado: ${githubRepo}`);
console.log(`Token GitHub existe: ${!!process.env.GITHUB_TOKEN}`);

/**
 * Retorna a URL completa para um arquivo no repositório
 * @param {string} path - Caminho do arquivo (ex: 'data/categories.json')
 * @returns {string} URL completa para a API do GitHub
 */
function getGithubFileUrl(path) {
  const url = `${baseApiUrl}/${path}`;
  console.log(`Acessando URL: ${url}`);
  return url;
}

/**
 * Retorna os cabeçalhos comuns para requisições à API do GitHub
 * @param {boolean} raw - Se true, inclui o cabeçalho para obter o conteúdo bruto
 * @returns {Object} Objeto com os cabeçalhos
 */
function getGithubHeaders(raw = true) {
  if (!process.env.GITHUB_TOKEN) {
    console.error('ERRO: Token do GitHub não configurado nas variáveis de ambiente');
  }
  
  return {
    'Authorization': `token ${process.env.GITHUB_TOKEN}`,
    ...(raw ? { 'Accept': 'application/vnd.github.v3.raw' } : {}),
    // Adicionar User-Agent para evitar problemas com a API do GitHub
    'User-Agent': 'Netlify Function'
  };
}

module.exports = {
  githubRepo,
  baseApiUrl,
  getGithubFileUrl,
  getGithubHeaders
}; 