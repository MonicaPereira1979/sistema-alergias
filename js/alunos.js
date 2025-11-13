// alunos.js - lista, cadastro, edição via modal, filtros, history
(function(){
  const KEY_ALUNOS = "sca_alunos";
  const KEY_SESSION = "sca_session";
  const KEY_NOTIF = "sca_notificacoes";
  const KEY_USERS = "sca_users";

  const sess = JSON.parse(localStorage.getItem(KEY_SESSION) || "null");
  if(!sess){ location.href = "index.html"; return; }
  document.getElementById("userInfo").innerText = `${sess.name} (${sess.role})`;


  function getAlunos(){ return JSON.parse(localStorage.getItem(KEY_ALUNOS) || "[]"); }
  function saveAlunos(a){ localStorage.setItem(KEY_ALUNOS, JSON.stringify(a)); }
  function getNotifs(){ return JSON.parse(localStorage.getItem(KEY_NOTIF) || "[]"); }
  function saveNotifs(n){ localStorage.setItem(KEY_NOTIF, JSON.stringify(n)); }
  function saveUsers(u){ localStorage.setItem(KEY_USERS, JSON.stringify(u)); }

  // elements
  const filtroNome = document.getElementById("filtroNome");
  const filtroTurma = document.getElementById("filtroTurma");
  const filtroGravidade = document.getElementById("filtroGravidade");
  const btnLimpar = document.getElementById("btnFiltroLimpar");
  const listaEl = document.getElementById("listaAlunos");

  function renderAlunos(){
    let alunos = getAlunos();
    if(sess.role === "Responsavel"){
      alunos = alunos.filter(a => a.responsavel && a.responsavel.email === sess.email);
    }
    const nomeFiltro = filtroNome.value.trim().toLowerCase();
    const turmaFiltro = filtroTurma.value;
    const gravFiltro = filtroGravidade.value;
    if(nomeFiltro) alunos = alunos.filter(a => a.nome.toLowerCase().includes(nomeFiltro));
    if(turmaFiltro) alunos = alunos.filter(a => a.turma === turmaFiltro);
    if(gravFiltro) alunos = alunos.filter(a => a.gravidade === gravFiltro);

    if(alunos.length === 0){ listaEl.innerHTML = "<i>Nenhum aluno encontrado.</i>"; return; }

    listaEl.innerHTML = alunos.map(a=>{
      const r = a.responsavel || {};
      let actions = `<a class="btn btn-sm btn-outline-secondary me-1" href="aluno_historico.html?id=${a.id}">Histórico</a>`;
      if((sess.role==="Responsavel" && r.email===sess.email) || sess.role==="Admin"){
        actions += `<button class="btn btn-sm btn-outline-primary me-1" data-action="edit" data-id="${a.id}">Editar</button>`;
        actions += `<button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${a.id}">Excluir</button>`;
      }
      return `<div class="card mb-2 p-2">
        <div class="d-flex justify-content-between">
          <div>
            <strong>${a.nome}</strong> <small class="text-muted">(${a.turma} — ${a.idade||'-'} anos)</small><br>
            <span>${a.alergias} — <em>${a.gravidade}</em></span>
            <div class="small mt-1">Responsável: ${r.name||'-'} — CPF: ${r.cpf||'-'} — ${r.email||'-'}</div>
            <div class="small text-muted">Cadastrado: ${new Date(a.criadoEm).toLocaleString()}</div>
          </div>
          <div>${actions}</div>
        </div>
      </div>`;
    }).join("");

    // bind actions
    listaEl.querySelectorAll('button[data-action]').forEach(btn=>{
      btn.addEventListener('click', (ev)=>{
        const id = Number(btn.dataset.id);
        const action = btn.dataset.action;
        if(action==='edit') openEditar(id);
        if(action==='delete') excluirAluno(id);
      });
    });
  }

  renderAlunos();

  // visibility of form
  const formArea = document.getElementById("formArea");
  if(sess.role === "Professor" || sess.role === "Nutricionista") formArea.style.display = "none";
  else {
    if(sess.role === "Responsavel"){
      document.getElementById("respNome").value = sess.name || "";
      document.getElementById("respEmail").value = sess.email || "";
      if(sess.cpf) document.getElementById("respCPF").value = sess.cpf || "";
    }
  }

  // CPF mask
  function maskCPF(v){ return v.replace(/\D/g,'').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,'$1.$2.$3-$4').slice(0,14); }
  const respCPF = document.getElementById("respCPF");
  respCPF && respCPF.addEventListener("input", e => { e.target.value = maskCPF(e.target.value); });

  // Save aluno
  document.getElementById("formAluno").addEventListener("submit", e=>{
    e.preventDefault();
    if(sess.role !== "Responsavel" && sess.role !== "Admin") return alert("Sem permissão.");
    const nome = document.getElementById("nome").value.trim();
    const idade = document.getElementById("idade").value.trim();
    const turma = document.getElementById("turma").value;
    const alergias = document.getElementById("alergias").value.trim();
    const gravidade = document.getElementById("gravidade").value;
    const respNome = document.getElementById("respNome").value.trim();
    const respCPF = document.getElementById("respCPF").value.trim();
    const respEmail = document.getElementById("respEmail").value.trim().toLowerCase();

    if(!nome || !alergias || !respNome || !respCPF || !respEmail) return alert("Preencha os campos obrigatórios.");

    const alunos = getAlunos();
    const novo = {
      id: Date.now(),
      nome, idade, turma, alergias,
      gravidade,
      criadoEm: new Date().toISOString(),
      responsavel: { name: respNome, cpf: respCPF, email: respEmail },
      history: [] // array de prescricoes
    };
    alunos.push(novo);
    saveAlunos(alunos);

    // atualizar user se necessário
    const users = JSON.parse(localStorage.getItem(KEY_USERS) || "[]");
    const idx = users.findIndex(u => u.email === sess.email);
    if(idx !== -1){
      users[idx].name = respNome; users[idx].cpf = respCPF; users[idx].email = respEmail;
      saveUsers(users);
      localStorage.setItem('sca_session', JSON.stringify({ name: respNome, email: respEmail, role: sess.role, cpf: respCPF }));
    }

    // notificação persistente para prof & nutri
    const notifs = getNotifs();
    notifs.push({
      id: Date.now(),
      alunoId: novo.id,
      nomeAluno: novo.nome,
      turma: novo.turma,
      alergias: novo.alergias,
      gravidade: novo.gravidade,
      responsavelNome: novo.responsavel.name,
      responsavelEmail: novo.responsavel.email,
      data: new Date().toISOString()
    });
    saveNotifs(notifs);

    // sinaliza update para outras abas
    localStorage.setItem('sca_update', new Date().toISOString());
    alert("Aluno cadastrado.");
    e.target.reset();
    if(sess.role === "Responsavel"){
      document.getElementById("respNome").value = respNome;
      document.getElementById("respEmail").value = respEmail;
      document.getElementById("respCPF").value = respCPF;
    }
    renderAlunos();
  });

  // filtros
  [filtroNome,filtroTurma,filtroGravidade].forEach(el=>{
    el && el.addEventListener('input', renderAlunos);
    el && el.addEventListener('change', renderAlunos);
  });
  btnLimpar.addEventListener('click', ()=>{ filtroNome.value=''; filtroTurma.value=''; filtroGravidade.value=''; renderAlunos(); });

  // editar
  const modalEditarEl = document.getElementById("modalEditarAluno");
  const modalEditar = modalEditarEl ? new bootstrap.Modal(modalEditarEl) : null;

  function openEditar(id){
    const alunos = getAlunos();
    const a = alunos.find(x=>x.id===id);
    if(!a) return alert("Aluno não encontrado.");
    if(!(sess.role === "Admin" || (sess.role==="Responsavel" && a.responsavel && a.responsavel.email===sess.email))) return alert("Sem permissão.");
    document.getElementById("editId").value = a.id;
    document.getElementById("editNome").value = a.nome;
    document.getElementById("editIdade").value = a.idade || "";
    document.getElementById("editTurma").value = a.turma || "A";
    document.getElementById("editAlergia").value = a.alergias || "";
    document.getElementById("editGravidade").value = a.gravidade || "Leve";
    document.getElementById("editRespNome").value = (a.responsavel && a.responsavel.name) || "";
    document.getElementById("editRespCPF").value = (a.responsavel && a.responsavel.cpf) || "";
    document.getElementById("editRespEmail").value = (a.responsavel && a.responsavel.email) || "";
    modalEditar && modalEditar.show();
  }

  document.getElementById("formEditarAluno").addEventListener("submit", e=>{
    e.preventDefault();
    const id = Number(document.getElementById("editId").value);
    const nome = document.getElementById("editNome").value.trim();
    const idade = document.getElementById("editIdade").value.trim();
    const turma = document.getElementById("editTurma").value;
    const alergias = document.getElementById("editAlergia").value.trim();
    const gravidade = document.getElementById("editGravidade").value;
    const respNome = document.getElementById("editRespNome").value.trim();
    const respCPF = document.getElementById("editRespCPF").value.trim();
    const respEmail = document.getElementById("editRespEmail").value.trim().toLowerCase();

    if(!nome || !respNome || !respCPF || !respEmail) return alert("Preencha todos os campos obrigatórios.");

    const alunos = getAlunos();
    const idx = alunos.findIndex(x=>x.id===id);
    if(idx===-1) return alert("Aluno não encontrado.");
    if(!(sess.role==="Admin" || (sess.role==="Responsavel" && alunos[idx].responsavel && alunos[idx].responsavel.email===sess.email))) return alert("Sem permissão.");

    alunos[idx].nome = nome; alunos[idx].idade = idade; alunos[idx].turma = turma; alunos[idx].alergias = alergias; alunos[idx].gravidade = gravidade;
    alunos[idx].responsavel = { name: respNome, cpf: respCPF, email: respEmail };

    saveAlunos(alunos);

    // atualizar usuarios se for responsavel
    const users = JSON.parse(localStorage.getItem(KEY_USERS) || "[]");
    const uidx = users.findIndex(u=>u.email===sess.email);
    if(uidx!==-1){
      users[uidx].name = respNome; users[uidx].cpf = respCPF; users[uidx].email = respEmail; saveUsers(users);
      localStorage.setItem('sca_session', JSON.stringify({ name: respNome, email: respEmail, role: sess.role, cpf: respCPF }));
    }

    modalEditar && modalEditar.hide();
    localStorage.setItem('sca_update', new Date().toISOString());
    renderAlunos();
    alert("Aluno atualizado.");
  });

  // excluir aluno (e notificações relacionadas)
  function excluirAluno(id){
    if(!confirm("Deseja excluir este aluno?")) return;
    let alunos = getAlunos();
    const idx = alunos.findIndex(x=>x.id===id);
    if(idx===-1) return alert("Aluno não encontrado.");
    if(!(sess.role==="Admin" || (sess.role==="Responsavel" && alunos[idx].responsavel && alunos[idx].responsavel.email===sess.email))) return alert("Sem permissão.");
    // remove aluno
    const removed = alunos.splice(idx,1);
    saveAlunos(alunos);
    // remove notificações relacionadas
    let notifs = getNotifs();
    notifs = notifs.filter(n => n.alunoId !== id);
    saveNotifs(notifs);
    // sinaliza update
    localStorage.setItem('sca_update', new Date().toISOString());
    renderAlunos();
    alert("Aluno excluído.");
  }

  // storage listener (update if changes elsewhere)
  window.addEventListener('storage',(e)=>{
    if(e.key === 'sca_update') renderAlunos();
  });

  document.getElementById('btnLogout').addEventListener('click', () => {
    // Limpa dados do usuário (se estiver usando localStorage para login)
    localStorage.removeItem('usuarioTipo'); 
    localStorage.removeItem('usuarioNome'); 
    // Redireciona para a página de login
    window.location.href = 'index.html'; 
});

})();
