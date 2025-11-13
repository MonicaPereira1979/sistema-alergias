# Sistema de Controle de Alergias - v2 (Dashboard + Histórico)

Estrutura:
- index.html
- pages/
  - dashboard.html
  - alunos.html
  - notificacoes.html
  - aluno_historico.html
- js/
  - login.js
  - dashboard.js
  - alunos.js
  - notificacoes.js
  - historico.js
- css/style.css

## Como testar
1. Copie os arquivos mantendo a estrutura.
2. Abra `index.html` no navegador.
3. Usuários de exemplo:
   - escola@teste.com / 123456 (Admin)
   - nutri@teste.com / 123456 (Nutricionista)
   - pai.joao@teste.com / 123456 (Responsável)
   - prof.maria@teste.com / 123456 (Professor)

## Fluxos principais
- Responsável: cadastra alunos (formulário com bloco do responsável), edita/exclui apenas seus alunos.
- Admin: acesso total, dashboard com cards + gráfico + histórico.
- Professor/Nutricionista: veem notificações; podem abrir histórico e adicionar anotações.
- Exclusão de aluno remove também notificações relacionadas e atualiza dashboard.

## Observações
- Bootstrap, Bootstrap Icons e Chart.js são carregados via CDN.
- Dados persistem em `localStorage`.
- Comunicação entre abas/páginas para atualização imediata usa a key `sca_update` no `localStorage`.
