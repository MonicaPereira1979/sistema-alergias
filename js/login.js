// login.js - controla cadastro, login e sessão
(function(){
  const KEY_USERS = "sca_users";
  const KEY_SESSION = "sca_session";

  function getUsers(){ return JSON.parse(localStorage.getItem(KEY_USERS) || "[]"); }
  function saveUsers(u){ localStorage.setItem(KEY_USERS, JSON.stringify(u)); }

  function ensureSampleUsers(){
    let u = getUsers();
    if(u.length === 0){
      u = [
        { name: "Escola (Admin)", email: "escola@teste.com", password: "123456", role: "Admin" },
        { name: "Nutricionista", email: "nutri@teste.com", password: "123456", role: "Nutricionista" },
        { name: "Responsável João", email: "pai.joao@teste.com", password: "123456", role: "Responsavel", cpf: "111.222.333-44" },
        { name: "Prof. Maria", email: "prof.maria@teste.com", password: "123456", role: "Professor" }
      ];
      saveUsers(u);
    }
  }
  ensureSampleUsers();

  function renderExamples(){
    const el = document.getElementById("examples");
    const users = getUsers();
    if(!el) return;
    el.innerHTML = users.map(u => `<div class="mb-1 small-text">${u.email} / ${u.password} (${u.role})</div>`).join("");
  }
  renderExamples();

  const registerModalEl = document.getElementById("registerModal");
  const registerModal = registerModalEl ? new bootstrap.Modal(registerModalEl) : null;
  document.getElementById("openRegister").addEventListener("click", e => {
    e.preventDefault();
    document.getElementById("registerForm").reset();
    registerModal && registerModal.show();
  });

  document.getElementById("registerForm").addEventListener("submit", e => {
    e.preventDefault();
    const name = document.getElementById("regName").value.trim();
    const cpf = document.getElementById("regCPF").value.trim();
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const password = document.getElementById("regPassword").value;
    const role = document.getElementById("regRole").value;
    if(!name || !email || !password) return alert("Preencha nome, e-mail e senha!");
    const users = getUsers();
    if(users.some(x => x.email === email)) return alert("E-mail já cadastrado!");
    users.push({ name, cpf, email, password, role });
    saveUsers(users);
    alert("Cadastro realizado com sucesso. Faça login.");
    registerModal && registerModal.hide();
    renderExamples();
  });

  document.getElementById("loginForm").addEventListener("submit", e => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const user = getUsers().find(u => u.email === email && u.password === password);
    if(!user) return alert("E-mail ou senha incorretos.");
    // salva sessão
    const session = { name: user.name, email: user.email, role: user.role, cpf: user.cpf || "" };
    localStorage.setItem(KEY_SESSION, JSON.stringify(session));
    location.href = "home.html";
  });

})();
