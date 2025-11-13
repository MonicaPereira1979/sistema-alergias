// notificacoes.js - exibe notificações e permite excluir (remove aluno)
(function(){
  const KEY_NOTIF = "sca_notificacoes";
  const KEY_ALUNOS = "sca_alunos";
  const KEY_SESSION = "sca_session";

  const sess = JSON.parse(localStorage.getItem(KEY_SESSION) || "null");
  if(!sess){ location.href = "/index.html"; return; }
  document.getElementById("userInfo").innerText = `${sess.name} (${sess.role})`;

  const listaEl = document.getElementById("listaNotif");
  function getNotifs(){ return JSON.parse(localStorage.getItem(KEY_NOTIF) || "[]"); }
  function saveNotifs(n){ localStorage.setItem(KEY_NOTIF, JSON.stringify(n)); }
  function getAlunos(){ return JSON.parse(localStorage.getItem(KEY_ALUNOS) || "[]"); }
  function saveAlunos(a){ localStorage.setItem(KEY_ALUNOS, JSON.stringify(a)); }

  // Only prof/nutri/admin can see
  const allowed = ["Professor","Nutricionista","Admin"];
  if(!allowed.includes(sess.role)){
    listaEl.innerHTML = "<i>Notificações disponíveis apenas para Professor, Nutricionista e Admin.</i>";
    return;
  }

  function render(){
    const all = getNotifs().slice().sort((a,b)=> new Date(b.data)-new Date(a.data));
    if(all.length === 0){ listaEl.innerHTML = "<i>Sem notificações.</i>"; return; }
    listaEl.innerHTML = `<div class="table-responsive"><table class="table table-sm table-striped">
      <thead><tr><th>Data</th><th>Aluno</th><th>Turma</th><th>Alergia</th><th>Gravidade</th><th>Responsável</th><th>Ações</th></tr></thead>
      <tbody>${all.map(n=>`<tr data-id="${n.id}">
        <td>${new Date(n.data).toLocaleString()}</td>
        <td>${n.nomeAluno}</td>
        <td>${n.turma || '-'}</td>
        <td>${n.alergias}</td>
        <td>${n.gravidade}</td>
        <td>${n.responsavelNome}<br><small>${n.responsavelEmail}</small></td>
        <td>
          <a class="btn btn-sm btn-outline-primary me-1" href="/aluno_historico.html?id=${n.alunoId}">Ver histórico</a>
          <button class="btn btn-sm btn-outline-danger btn-del" data-alunoid="${n.alunoId}" data-notifid="${n.id}">Excluir</button>
        </td>
      </tr>`).join('')}</tbody></table></div>`;
    // bind delete
    listaEl.querySelectorAll('.btn-del').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const alunoId = Number(btn.dataset.alunoid);
        if(!confirm('Excluir este aluno e notificação?')) return;
        // remove aluno
        let alunos = getAlunos();
        alunos = alunos.filter(a=>a.id !== alunoId);
        saveAlunos(alunos);
        // remove all notifs for aluno
        let notifs = getNotifs();
        notifs = notifs.filter(n=>n.alunoId !== alunoId);
        saveNotifs(notifs);
        // sinaliza update (dashboard/alunos)
        localStorage.setItem('sca_update', new Date().toISOString());
        render();
      });
    });
  }

  render();

  // listen to other updates
  window.addEventListener('storage', (e)=>{
    if(e.key === 'sca_update') render();
  });

})();
