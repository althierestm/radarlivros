window.tentarLogin = async function() {
  const user = document.getElementById('admin-user').value.trim();
  const pass = document.getElementById('admin-pass').value;
  const msgDiv = document.getElementById('login-msg');

  const tentativaHash = await gerarHash(user + pass);
  
  // === CÓDIGO TEMPORÁRIO PARA DESCOBRIR O HASH REAL ===
  if (user === "Althieres" && pass === "@radarlivros26") {
      msgDiv.innerHTML = `<span style="color: yellow; word-break: break-all; user-select: all;">Copie este código: ${tentativaHash}</span>`;
      return;
  }
  // ====================================================

  const hashAutorizado = "739546059c118cd9bebc1b2ddc5c404cf939632832960fdf6e689db3163eb077"; // Hash antigo

  if (tentativaHash === hashAutorizado) {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('dashboard-section').classList.remove('hidden');
    sessionStorage.setItem('admin_auth', 'true');
  } else {
    msgDiv.textContent = "Usuário ou senha incorretos.";
  }
}
