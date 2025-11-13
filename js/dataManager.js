// dataManager.js
function exportData(){
  const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
  const alunos = JSON.parse(localStorage.getItem('alunos')) || [];
  const notificacoes = JSON.parse(localStorage.getItem('notificacoes')) || [];
  const payload = { usuarios, alunos, notificacoes, exportedAt: new Date().toISOString() };
  return JSON.stringify(payload, null, 2);
}

function importData(json){
  try {
    const obj = JSON.parse(json);
    if (!obj || typeof obj !== 'object') throw 'invalid';
    if (Array.isArray(obj.usuarios)) localStorage.setItem('usuarios', JSON.stringify(obj.usuarios));
    if (Array.isArray(obj.alunos)) localStorage.setItem('alunos', JSON.stringify(obj.alunos));
    if (Array.isArray(obj.notificacoes)) localStorage.setItem('notificacoes', JSON.stringify(obj.notificacoes));
    return true;
  } catch(e) {
    alert('JSON inválido.');
    return false;
  }
}
