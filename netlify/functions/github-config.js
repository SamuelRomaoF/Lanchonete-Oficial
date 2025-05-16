/**
 * Configuração central para acesso ao repositório GitHub
 */

// Obter o nome do repositório da variável de ambiente ou usar o valor padrão
const githubRepo = process.env.GITHUB_REPO || 'SamuelRomaoF/lanchonete-dados';

// Base URL para acessar a API do GitHub
const baseApiUrl = `https://api.github.com/repos/${githubRepo}/contents`;

/**
 * Retorna a URL completa para um arquivo no repositório
 * @param {string} path - Caminho do arquivo (ex: 'data/categories.json')
 * @returns {string} URL completa para a API do GitHub
 */
function getGithubFileUrl(path) {
  return `${baseApiUrl}/${path}`;
}

/**
 * Retorna os cabeçalhos comuns para requisições à API do GitHub
 * @param {boolean} raw - Se true, inclui o cabeçalho para obter o conteúdo bruto
 * @returns {Object} Objeto com os cabeçalhos
 */
function getGithubHeaders(raw = true) {
  return {
    'Authorization': `token ${process.env.GITHUB_TOKEN}`,
    ...(raw ? { 'Accept': 'application/vnd.github.v3.raw' } : {})
  };
}

module.exports = {
  githubRepo,
  baseApiUrl,
  getGithubFileUrl,
  getGithubHeaders
}; 