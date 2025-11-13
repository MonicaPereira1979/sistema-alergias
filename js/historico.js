// historico.js - mostra histórico e permite o responsável editar/excluir (com modal estilizado)
(function(){
  const KEY_ALUNOS = "sca_alunos";
  const KEY_SESSION = "sca_session";

  function getAlunos(){ return JSON.parse(localStorage.getItem(KEY_ALUNOS) || "[]"); }
  function saveAlunos(a){ localStorage.setItem(KEY_ALUNOS, JSON.stringify(a)); }

  const sess = JSON.parse(localStorage.getItem(KEY_SESSION) || "null");
  if(!sess){ location.href = "/index.html"; return; }

  // Mostra usuário logado
  const userInfoEl = document.getElementById("userInfo");
  if(userInfoEl) userInfoEl.innerHTML = `
    <div class="d-flex justify-content-between align-items-center">
      <div>${sess.name} (${sess.role})</div>    
    </div>
    <div class="mt-2"><button id="btnLogoutHHist" class="btn btn-outline-primary btn-lg">Voltar</button></div>
  `;

  // Botão voltar
  const btnLogout = document.getElementById("btnLogoutHHist");
  if(btnLogout){
    btnLogout.addEventListener("click", ()=>{
      location.href = "/home.html";
    });
  }

  // Elementos
  const alunoSelectArea = document.getElementById("alunoSelectArea");
  const alunoInfoEl = document.getElementById("alunoInfo");
  const historyList = document.getElementById("historyList");
  const addNoteArea = document.getElementById("addNoteArea");
  const formAddNote = document.getElementById("formAddNote");
  const noteTextEl = document.getElementById("noteText");

  let currentAlunoId = null;
  let alunos = getAlunos();
  let editingIndex = null;

  function findAlunoById(id){
    id = Number(id);
    return alunos.find(a => Number(a.id) === id) || null;
  }

  function renderAlunoInfo(aluno){
    if(!aluno){
      if(alunoInfoEl) alunoInfoEl.innerHTML = "<i>Aluno não selecionado.</i>";
      if(historyList) historyList.innerHTML = "";
      return;
    }
    if(alunoInfoEl) alunoInfoEl.innerHTML = `
      <div>
        <strong>${aluno.nome}</strong> — ${aluno.turma || '-'} — ${aluno.alergias || '-'} (${aluno.gravidade || '-'})
        <br><small>Responsável: ${aluno.responsavel?.name || '-'} — ${aluno.responsavel?.email || '-'}</small>
      </div>`;
  }

  function renderHistoryForAluno(aluno){
    if(!historyList) return;
    const h = (aluno && aluno.history) ? aluno.history : [];
    if(!h || h.length===0){
      historyList.innerHTML = "<i>Sem histórico.</i>";
      return;
    }

    const canEdit = sess.role === "Responsavel";

historyList.innerHTML = h.slice().reverse().map((it, index)=>`
  <div class="card mb-2 p-3 shadow-sm">
    <div class="d-flex justify-content-between align-items-start">
      <div>
        <small class="text-muted">${new Date(it.date).toLocaleString()} — ${it.author}</small>
        <div class="mt-2">${it.text}</div>
      </div>
      ${canEdit ? `
        <div class="text-end">
          <button class="btn btn-outline-primary me-2" onclick="editarNota(${index})">
            <i class="bi bi-pencil me-1"></i> Editar
          </button>
          <button class="btn btn-outline-danger" onclick="excluirNota(${index})">
            <i class="bi bi-trash me-1"></i> Excluir
          </button>
        </div>` : ""}
    </div>
  </div>
`).join('');

  }

  function populateSelect(){
    if(!alunoSelectArea) return;
    const options = alunos
      .filter(a => sess.role === "Responsavel" ? (a.responsavel && a.responsavel.email === sess.email) : true)
      .map(a => `<option value="${a.id}">${a.nome} — ${a.turma || ''}</option>`)
      .join("");
    alunoSelectArea.innerHTML = `
      <label class="form-label small">Selecione o aluno</label>
      <select id="alunoSelect" class="form-select mb-2">
        <option value="">-- Escolha --</option>
        ${options}
      </select>
    `;
    const sel = document.getElementById("alunoSelect");
    if(sel){
      sel.addEventListener("change", ()=>{
        const val = sel.value;
        if(!val){
          currentAlunoId = null;
          renderAlunoInfo(null);
          renderHistoryForAluno(null);
          return;
        }
        currentAlunoId = Number(val);
        const aluno = findAlunoById(currentAlunoId);
        renderAlunoInfo(aluno);
        renderHistoryForAluno(aluno);
      });
    }
  }

  const params = new URLSearchParams(window.location.search);
  const idParam = params.get('id');
  if(idParam) currentAlunoId = Number(idParam);

  alunos = getAlunos();

  if(!currentAlunoId){
    populateSelect();
    renderAlunoInfo(null);
    renderHistoryForAluno(null);
  } else {
    const aluno = findAlunoById(currentAlunoId);
    if(!aluno){
      alunoInfoEl.innerHTML = "<i>Aluno não encontrado.</i>";
      renderHistoryForAluno(null);
    } else {
      renderAlunoInfo(aluno);
      renderHistoryForAluno(aluno);
    }
    populateSelect();
    const selAfter = document.getElementById("alunoSelect");
    if(selAfter) selAfter.value = String(currentAlunoId);
  }

  const allowed = ["Responsavel"];
  if(!allowed.includes(sess.role)){
    if(addNoteArea) addNoteArea.style.display = "none";
  }

  if(formAddNote){
    formAddNote.addEventListener("submit", e=>{
      e.preventDefault();
      const text = noteTextEl.value.trim();
      if(!text) return alert("Digite uma anotação.");
      if(!currentAlunoId) return alert("Selecione um aluno antes de salvar.");

      alunos = getAlunos();
      const idx = alunos.findIndex(a => Number(a.id) === Number(currentAlunoId));
      if(idx === -1) return alert("Aluno não encontrado.");

      const note = { date: new Date().toISOString(), author: `${sess.name} (${sess.role})`, text };
      alunos[idx].history = alunos[idx].history || [];
      alunos[idx].history.push(note);

      saveAlunos(alunos);
      localStorage.setItem('sca_update', new Date().toISOString());
      noteTextEl.value = "";
      renderHistoryForAluno(alunos[idx]);
      alert("Anotação salva para " + alunos[idx].nome);
    });
  }

  // ====== EDIÇÃO / EXCLUSÃO COM MODAL ======

  window.editarNota = function(index){
    const aluno = findAlunoById(currentAlunoId);
    if(!aluno) return alert("Aluno não encontrado.");
    const nota = aluno.history.slice().reverse()[index];
    if(!nota) return alert("Nota não encontrada.");
    editingIndex = index;
    $("#editNoteText").val(nota.text);
    $("#editModal").modal("show");
  }

  $("#saveEditBtn").on("click", ()=>{
    const aluno = findAlunoById(currentAlunoId);
    if(!aluno || editingIndex === null) return;
    const novoTexto = $("#editNoteText").val().trim();
    if(!novoTexto) return alert("Digite a anotação.");
    const realIndex = aluno.history.length - 1 - editingIndex;
    aluno.history[realIndex].text = novoTexto;
    aluno.history[realIndex].date = new Date().toISOString();
    aluno.history[realIndex].author = `${sess.name} (${sess.role})`;

    const idxAluno = alunos.findIndex(a => a.id === aluno.id);
    if(idxAluno >= 0){
      alunos[idxAluno] = aluno;
      saveAlunos(alunos);
    }

    renderHistoryForAluno(aluno);
    $("#editModal").modal("hide");
    alert("Histórico atualizado com sucesso!");
  });

  window.excluirNota = function(index){
    const aluno = findAlunoById(currentAlunoId);
    if(!aluno) return alert("Aluno não encontrado.");
    $("#confirmDeleteModal").modal("show");

    $("#confirmDeleteBtn").off("click").on("click", ()=>{
      const realIndex = aluno.history.length - 1 - index;
      aluno.history.splice(realIndex, 1);
      const idxAluno = alunos.findIndex(a => a.id === aluno.id);
      if(idxAluno >= 0){
        alunos[idxAluno] = aluno;
        saveAlunos(alunos);
      }
      renderHistoryForAluno(aluno);
      $("#confirmDeleteModal").modal("hide");
      alert("Anotação excluída com sucesso!");
    });
  }

  window.__historico_currentAlunoId = () => currentAlunoId;

})();
