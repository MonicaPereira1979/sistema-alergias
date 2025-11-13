// dashboard.js
(function(){
  const KEY_ALUNOS = "sca_alunos";
  const KEY_SESSION = "sca_session";
  const KEY_NOTIF = "sca_notificacoes";

  function getAlunos(){ return JSON.parse(localStorage.getItem(KEY_ALUNOS) || "[]"); }
  function getNotifs(){ return JSON.parse(localStorage.getItem(KEY_NOTIF) || "[]"); }

  const sess = JSON.parse(localStorage.getItem(KEY_SESSION) || "null");
  if(!sess){ location.href = "/index.html"; return; }
  document.getElementById("userInfo").innerText = `${sess.name} (${sess.role})`;
  
// Pega a sessão do usuário
var scaSession = JSON.parse(localStorage.getItem("sca_session"));

// ------------------ Controle do menu lateral ------------------
var adminTab = document.getElementById("adminTab"); // pega o <li> do Dashboard
if (!scaSession || scaSession.role !== "Admin") {
    // Esconde o link do menu
    $("#adminTab").hide(); // esconde com jQuery

    // Bloqueia acesso ao conteúdo do dashboard
    alert("Acesso negado. Apenas administradores podem ver o dashboard.");
    window.location.href = "/alunos.html"; // opcional: redireciona
}
  // Chart instance
  let chart = null;

  function updateCardsAndChart(){
    const alunos = getAlunos();
    const total = alunos.length;
    const leve = alunos.filter(a => a.gravidade === "Leve").length;
    const mod = alunos.filter(a => a.gravidade === "Moderada").length;
    const grave = alunos.filter(a => a.gravidade === "Grave").length;

    document.getElementById("cardTotal").innerText = total;
    document.getElementById("cardLeve").innerText = leve;
    document.getElementById("cardModerada").innerText = mod;
    document.getElementById("cardGrave").innerText = grave;

    const ctx = document.getElementById("gravChart").getContext("2d");
    const data = { labels: ["Leve","Moderada","Grave"], datasets: [{ data: [leve,mod,grave] }] };
    if(chart) {
      chart.data = data;
      chart.update();
    } else {
      chart = new Chart(ctx, { type: 'pie', data, options: { responsive: true } });
    }
  }

  function renderMiniNotifs(){
    const all = getNotifs().slice().sort((a,b)=> new Date(b.data)-new Date(a.data)).slice(0,5);
    const el = document.getElementById("miniNotifs");
    if(all.length===0){ el.innerHTML = "<i>Sem notificações</i>"; return; }
    el.innerHTML = all.map(n=>`<div class="mb-2"><strong>${n.nomeAluno}</strong> — ${n.gravidade} — <small>${new Date(n.data).toLocaleString()}</small></div>`).join("");
  }

  // initial
  updateCardsAndChart();
  renderMiniNotifs();

  // listen to storage events (updates from other pages)
  window.addEventListener('storage', (e)=>{
    if(e.key === 'sca_update'){
      updateCardsAndChart();
      renderMiniNotifs();
    }
  });

  // expose for other scripts (not necessary but handy)
  window.__updateDashboard = function(){
    localStorage.setItem('sca_update', new Date().toISOString());
    updateCardsAndChart();
    renderMiniNotifs();
  };

// Função de logout
document.getElementById('btnLogout').addEventListener('click', () => {
    // Limpa dados do usuário (se estiver usando localStorage para login)
    localStorage.removeItem('usuarioTipo'); 
    localStorage.removeItem('usuarioNome'); 
    // Redireciona para a página de login
    window.location.href = 'index.html'; 
});

})();
