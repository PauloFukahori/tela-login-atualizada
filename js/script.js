document.addEventListener('DOMContentLoaded', () => {

  function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const icons = {
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
      error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
    };

    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.innerHTML = `${icons[type]}<span>${message}</span>`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }

  function setLoading(btn, loading) {
    btn.disabled = loading;
    btn.classList.toggle('loading', loading);
  }

  function shakeElement(el) {
    el.classList.add('shake');
    setTimeout(() => el.classList.remove('shake'), 400);
  }

  function validateField(input, errorId, rules) {
    const errorEl = document.getElementById(errorId);
    const group = input.closest('.input-group');
    let message = '';
    const value = input.value.trim();

    for (const rule of rules) {
      if (!rule.test(value)) {
        message = rule.message;
        break;
      }
    }

    if (message) {
      errorEl.textContent = message;
      errorEl.classList.add('show');
      group.classList.add('error');
      group.classList.remove('success');
      return false;
    } else {
      errorEl.textContent = '';
      errorEl.classList.remove('show');
      group.classList.remove('error');
      group.classList.add('success');
      return true;
    }
  }

  // ==========================================
  //    GERENCIAMENTO DE USUÁRIOS E SESSÕES  
  // ==========================================

  const STORAGE_KEY = 'premium_auth_users';
  const SESSION_KEY = 'premium_auth_session';
  const LOGIN_COUNT_KEY = 'premium_auth_login_count';

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch { return []; }
  }

  function saveUsers(users) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }

  function addUser(user) {
    const users = getUsers();
    users.push({
      ...user,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      createdAt: new Date().toISOString(),
      loginCount: 0,
      lastLogin: null
    });
    saveUsers(users);
  }

  function findUserByEmail(email) {
    return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  function findUserByUsername(username) {
    return getUsers().find(u => u.username.toLowerCase() === username.toLowerCase());
  }

  function updateUser(email, updates) {
    const users = getUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      saveUsers(users);
      return true;
    }
    return false;
  }

  function setSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      loggedInAt: new Date().toISOString()
    }));
  }

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY));
    } catch { return null; }
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function incrementLoginCount(email) {
    const key = LOGIN_COUNT_KEY + '_' + email;
    const count = parseInt(localStorage.getItem(key) || '0') + 1;
    localStorage.setItem(key, count.toString());
    return count;
  }

  function getLoginCount(email) {
    return parseInt(localStorage.getItem(LOGIN_COUNT_KEY + '_' + email) || '0');
  }

  // ==========================================
  //         VERIFICADOR DE FORÇA DE SENHA    
  // ==========================================

  function checkStrength(password) {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    const levels = [
      { label: 'Muito fraca', color: '#ef4444', width: '20%' },
      { label: 'Fraca', color: '#f97316', width: '40%' },
      { label: 'Média', color: '#f59e0b', width: '60%' },
      { label: 'Boa', color: '#22c55e', width: '80%' },
      { label: 'Forte', color: '#16a34a', width: '100%' }
    ];

    return levels[Math.min(score, 4)];
  }

  function setupStrengthMeter(inputId, barId, fillId, textId) {
    const input = document.getElementById(inputId);
    const bar = document.getElementById(barId);
    const fill = document.getElementById(fillId);
    const text = document.getElementById(textId);
    if (!input || !bar || !fill || !text) return;

    input.addEventListener('input', () => {
      const val = input.value;
      if (val.length === 0) {
        bar.classList.remove('show');
        text.classList.remove('show');
        return;
      }
      bar.classList.add('show');
      text.classList.add('show');
      const strength = checkStrength(val);
      fill.style.width = strength.width;
      fill.style.background = strength.color;
      text.textContent = strength.label;
      text.style.color = strength.color;
    });
  }

  // ==========================================
  //         TOGGLE DE VISIBILIDADE DE SENHA  
  // ==========================================

  function setupToggle(inputId, btnId) {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    if (!input || !btn) return;

    btn.addEventListener('click', () => {
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.classList.toggle('show', isPassword);
      btn.setAttribute('aria-label', isPassword ? 'Ocultar senha' : 'Mostrar senha');
    });
  }

  // ==========================================
  //        PÁGINA: LOGIN (index.html)  
  // ==========================================

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    const usuarioInput = document.getElementById('usuario');
    const senhaInput = document.getElementById('senha');
    const btnEntrar = document.getElementById('btnEntrar');

    setupToggle('senha', 'toggleSenha');

    const savedUser = localStorage.getItem('premium_auth_remember');
    if (savedUser) {
      usuarioInput.value = savedUser;
      document.getElementById('lembrar').checked = true;
    }

    const usuarioRules = [
      { test: v => v.length > 0, message: 'O usuário/e-mail é obrigatório.' },
      { test: v => v.length >= 3, message: 'Mínimo de 3 caracteres.' },
    ];

    const senhaRules = [
      { test: v => v.length > 0, message: 'A senha é obrigatória.' },
      { test: v => v.length >= 6, message: 'Mínimo de 6 caracteres.' },
    ];

    usuarioInput.addEventListener('blur', () => validateField(usuarioInput, 'error-usuario', usuarioRules));
    usuarioInput.addEventListener('input', () => {
      if (usuarioInput.closest('.input-group').classList.contains('error')) {
        validateField(usuarioInput, 'error-usuario', usuarioRules);
      }
    });

    senhaInput.addEventListener('blur', () => validateField(senhaInput, 'error-senha', senhaRules));
    senhaInput.addEventListener('input', () => {
      if (senhaInput.closest('.input-group').classList.contains('error')) {
        validateField(senhaInput, 'error-senha', senhaRules);
      }
    });

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const isUsuarioValid = validateField(usuarioInput, 'error-usuario', usuarioRules);
      const isSenhaValid = validateField(senhaInput, 'error-senha', senhaRules);

      if (!isUsuarioValid || !isSenhaValid) {
        const firstError = loginForm.querySelector('.input-group.error');
        if (firstError) shakeElement(firstError);
        return;
      }

      setLoading(btnEntrar, true);
      await new Promise(r => setTimeout(r, 1500));

      const identifier = usuarioInput.value.trim();
      const senha = senhaInput.value;

      let user = findUserByEmail(identifier) || findUserByUsername(identifier);

      if (!user) {
        setLoading(btnEntrar, false);
        showToast('Usuário não encontrado. Verifique ou cadastre-se.', 'error');
        const group = usuarioInput.closest('.input-group');
        group.classList.add('error');
        shakeElement(group);
        return;
      }

      if (user.password !== senha) {
        setLoading(btnEntrar, false);
        showToast('Senha incorreta. Tente novamente.', 'error');
        const group = senhaInput.closest('.input-group');
        group.classList.add('error');
        shakeElement(group);
        return;
      }

      // Login bem-sucedido
      const loginCount = incrementLoginCount(user.email);
      updateUser(user.email, { loginCount: loginCount, lastLogin: new Date().toISOString() });
      setSession(user);

      const lembrar = document.getElementById('lembrar');
      if (lembrar && lembrar.checked) {
        localStorage.setItem('premium_auth_remember', identifier);
      } else {
        localStorage.removeItem('premium_auth_remember');
      }

      setLoading(btnEntrar, false);
      btnEntrar.querySelector('.btn-text').textContent = 'Sucesso!';
      btnEntrar.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
      showToast(`Bem-vindo de volta, ${user.name.split(' ')[0]}!`, 'success');

      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1500);
    });

    // Botões sociais — abrem OAuth em nova aba
    document.querySelectorAll('.social-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Se for <a> com href real, deixa o navegador lidar
        if (btn.tagName === 'A' && btn.getAttribute('href') && !btn.getAttribute('href').includes('SEU_')) {
          return; // Link OAuth real configurado
        }
        // Se for placeholder, mostra toast
        e.preventDefault();
        const provider = btn.classList.contains('google') ? 'Google' :
                        btn.classList.contains('apple') ? 'Apple' :
                        btn.classList.contains('facebook') ? 'Facebook' : 'Microsoft';
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => btn.style.transform = '', 150);
        showToast(`Configure seu Client ID do ${provider} no HTML`, 'info');
      });
    });

    // Verificar se já está logado
    const session = getSession();
    if (session && !window.location.search.includes('logged=true')) {
      showToast(`Você já está logado! Redirecionando...`, 'info');
      setTimeout(() => window.location.href = 'dashboard.html', 2000);
    }

    setTimeout(() => usuarioInput.focus(), 600);
  }

  // ==========================================
  //        PÁGINA: CADASTRO (cadastro.html)  
  // ==========================================

  const cadastroForm = document.getElementById('cadastroForm');
  if (cadastroForm) {
    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const usuarioCadInput = document.getElementById('usuarioCad');
    const senhaCadInput = document.getElementById('senhaCad');
    const confirmarInput = document.getElementById('confirmarSenha');
    const termosInput = document.getElementById('termos');
    const btnCadastrar = document.getElementById('btnCadastrar');

    setupToggle('senhaCad', 'toggleSenhaCad');
    setupToggle('confirmarSenha', 'toggleConfirmar');
    setupStrengthMeter('senhaCad', 'strengthBar', 'strengthFill', 'strengthText');

    const nomeRules = [
      { test: v => v.length > 0, message: 'O nome é obrigatório.' },
      { test: v => v.length >= 3, message: 'Mínimo de 3 caracteres.' },
      { test: v => /^[a-zA-Z\s]+$/.test(v), message: 'Apenas letras e espaços.' },
    ];

    const emailRules = [
      { test: v => v.length > 0, message: 'O e-mail é obrigatório.' },
      { test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), message: 'E-mail inválido.' },
    ];

    const usuarioCadRules = [
      { test: v => v.length > 0, message: 'O usuário é obrigatório.' },
      { test: v => v.length >= 3, message: 'Mínimo de 3 caracteres.' },
      { test: v => /^[a-zA-Z0-9_]+$/.test(v), message: 'Apenas letras, números e underline.' },
    ];

    const senhaCadRules = [
      { test: v => v.length > 0, message: 'A senha é obrigatória.' },
      { test: v => v.length >= 6, message: 'Mínimo de 6 caracteres.' },
    ];

    const confirmarRules = [
      { test: v => v.length > 0, message: 'Confirme sua senha.' },
    ];

    function setupLiveValidation(input, errorId, rules) {
      input.addEventListener('blur', () => validateField(input, errorId, rules));
      input.addEventListener('input', () => {
        if (input.closest('.input-group').classList.contains('error')) {
          validateField(input, errorId, rules);
        }
      });
    }

    setupLiveValidation(nomeInput, 'error-nome', nomeRules);
    setupLiveValidation(emailInput, 'error-email', emailRules);
    setupLiveValidation(usuarioCadInput, 'error-usuarioCad', usuarioCadRules);
    setupLiveValidation(senhaCadInput, 'error-senhaCad', senhaCadRules);
    setupLiveValidation(confirmarInput, 'error-confirmarSenha', confirmarRules);

    cadastroForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const vNome = validateField(nomeInput, 'error-nome', nomeRules);
      const vEmail = validateField(emailInput, 'error-email', emailRules);
      const vUser = validateField(usuarioCadInput, 'error-usuarioCad', usuarioCadRules);
      const vSenha = validateField(senhaCadInput, 'error-senhaCad', senhaCadRules);
      const vConfirmar = validateField(confirmarInput, 'error-confirmarSenha', confirmarRules);

      let vMatch = true;
      if (senhaCadInput.value !== confirmarInput.value) {
        const err = document.getElementById('error-confirmarSenha');
        err.textContent = 'As senhas não coincidem.';
        err.classList.add('show');
        confirmarInput.closest('.input-group').classList.add('error');
        vMatch = false;
      }

      let vTermos = true;
      if (!termosInput.checked) {
        const err = document.getElementById('error-termos');
        err.textContent = 'Você precisa aceitar os termos.';
        err.classList.add('show');
        vTermos = false;
      } else {
        document.getElementById('error-termos').classList.remove('show');
      }

      if (!vNome || !vEmail || !vUser || !vSenha || !vConfirmar || !vMatch || !vTermos) {
        const firstError = cadastroForm.querySelector('.input-group.error, .terms-group .error-msg.show');
        if (firstError) {
          const group = firstError.closest('.input-group') || firstError.closest('.terms-group');
          if (group) shakeElement(group);
        }
        return;
      }

      const email = emailInput.value.trim();
      const username = usuarioCadInput.value.trim();

      if (findUserByEmail(email)) {
        showToast('Este e-mail já está cadastrado.', 'error');
        const group = emailInput.closest('.input-group');
        group.classList.add('error');
        shakeElement(group);
        return;
      }

      if (findUserByUsername(username)) {
        showToast('Este nome de usuário já está em uso.', 'error');
        const group = usuarioCadInput.closest('.input-group');
        group.classList.add('error');
        shakeElement(group);
        return;
      }

      setLoading(btnCadastrar, true);
      await new Promise(r => setTimeout(r, 2000));

      addUser({
        name: nomeInput.value.trim(),
        email: email,
        username: username,
        password: senhaCadInput.value
      });

      setLoading(btnCadastrar, false);
      btnCadastrar.querySelector('.btn-text').textContent = 'Conta criada!';
      btnCadastrar.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
      showToast('Cadastro realizado com sucesso!', 'success');

      setTimeout(() => {
        window.location.href = 'index.html?registered=true';
      }, 2000);
    });

    termosInput.addEventListener('change', () => {
      document.getElementById('error-termos').classList.remove('show');
    });

    setTimeout(() => nomeInput.focus(), 600);
  }

  // ==========================================
  //   PÁGINA: RECUPERAR SENHA (recuperar.html) 
  // ==========================================

  const recuperarForm = document.getElementById('recuperarForm');
  if (recuperarForm) {
    const emailRecInput = document.getElementById('emailRec');
    const btnRecuperar = document.getElementById('btnRecuperar');
    const codigoForm = document.getElementById('codigoForm');
    const novaSenhaForm = document.getElementById('novaSenhaForm');

    setupToggle('novaSenha', 'toggleNovaSenha');
    setupToggle('confirmarNovaSenha', 'toggleConfirmarNova');
    setupStrengthMeter('novaSenha', 'strengthBarRec', 'strengthFillRec', 'strengthTextRec');

    let recoveryEmail = '';
    let generatedCode = '';
    let resendTimer = null;

    const emailRecRules = [
      { test: v => v.length > 0, message: 'O e-mail é obrigatório.' },
      { test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), message: 'E-mail inválido.' },
    ];

    emailRecInput.addEventListener('blur', () => validateField(emailRecInput, 'error-emailRec', emailRecRules));
    emailRecInput.addEventListener('input', () => {
      if (emailRecInput.closest('.input-group').classList.contains('error')) {
        validateField(emailRecInput, 'error-emailRec', emailRecRules);
      }
    });

    recuperarForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!validateField(emailRecInput, 'error-emailRec', emailRecRules)) {
        shakeElement(emailRecInput.closest('.input-group'));
        return;
      }

      const email = emailRecInput.value.trim();
      const user = findUserByEmail(email);

      if (!user) {
        showToast('E-mail não encontrado em nossa base.', 'error');
        shakeElement(emailRecInput.closest('.input-group'));
        return;
      }

      setLoading(btnRecuperar, true);
      await new Promise(r => setTimeout(r, 1500));

      recoveryEmail = email;
      generatedCode = Math.floor(100000 + Math.random() * 900000).toString();

      console.log(`[SIMULAÇÃO] Código de recuperação para ${email}: ${generatedCode}`);
      showToast(`Código enviado! (simulação: ${generatedCode})`, 'success');

      setLoading(btnRecuperar, false);

      recuperarForm.classList.add('hidden');
      codigoForm.classList.remove('hidden');
      codigoForm.style.animation = 'fadeInUp 0.5s ease';

      const firstDigit = codigoForm.querySelector('.code-digit');
      if (firstDigit) firstDigit.focus();

      startResendTimer();
    });

    const codeInputs = document.querySelectorAll('.code-digit');
    codeInputs.forEach((input, index) => {
      input.addEventListener('input', (e) => {
        const val = e.target.value.replace(/\D/g, '');
        e.target.value = val;

        if (val) {
          e.target.classList.add('filled');
          if (index < codeInputs.length - 1) {
            codeInputs[index + 1].focus();
          }
        } else {
          e.target.classList.remove('filled');
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && index > 0) {
          codeInputs[index - 1].focus();
        }
        if (e.key === 'ArrowLeft' && index > 0) {
          codeInputs[index - 1].focus();
        }
        if (e.key === 'ArrowRight' && index < codeInputs.length - 1) {
          codeInputs[index + 1].focus();
        }
      });

      input.addEventListener('paste', (e) => {
        e.preventDefault();
        const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        paste.split('').forEach((char, i) => {
          if (codeInputs[i]) {
            codeInputs[i].value = char;
            codeInputs[i].classList.add('filled');
          }
        });
        const nextEmpty = Array.from(codeInputs).find(inp => !inp.value);
        if (nextEmpty) nextEmpty.focus();
        else if (codeInputs[5]) codeInputs[5].focus();
      });
    });

    const btnVerificar = document.getElementById('btnVerificar');
    codigoForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const code = Array.from(codeInputs).map(i => i.value).join('');
      const errorEl = document.getElementById('error-codigo');

      if (code.length !== 6) {
        errorEl.textContent = 'Digite o código completo de 6 dígitos.';
        errorEl.classList.add('show');
        shakeElement(document.querySelector('.code-inputs'));
        return;
      }

      if (code !== generatedCode) {
        errorEl.textContent = 'Código incorreto. Tente novamente.';
        errorEl.classList.add('show');
        shakeElement(document.querySelector('.code-inputs'));
        return;
      }

      setLoading(btnVerificar, true);
      await new Promise(r => setTimeout(r, 1000));

      errorEl.classList.remove('show');
      setLoading(btnVerificar, false);
      showToast('Código verificado!', 'success');

      codigoForm.classList.add('hidden');
      novaSenhaForm.classList.remove('hidden');
      novaSenhaForm.style.animation = 'fadeInUp 0.5s ease';

      setTimeout(() => document.getElementById('novaSenha').focus(), 300);
    });

    function startResendTimer() {
      const timerText = document.getElementById('timerText');
      const btnReenviar = document.getElementById('btnReenviar');
      let seconds = 60;

      if (resendTimer) clearInterval(resendTimer);
      btnReenviar.classList.add('hidden');
      timerText.classList.remove('hidden');

      resendTimer = setInterval(() => {
        seconds--;
        timerText.textContent = `Reenviar em ${seconds}s`;
        if (seconds <= 0) {
          clearInterval(resendTimer);
          timerText.classList.add('hidden');
          btnReenviar.classList.remove('hidden');
        }
      }, 1000);
    }

    document.getElementById('btnReenviar')?.addEventListener('click', () => {
      generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`[SIMULAÇÃO] Novo código para ${recoveryEmail}: ${generatedCode}`);
      showToast(`Novo código: ${generatedCode}`, 'success');
      codeInputs.forEach(i => { i.value = ''; i.classList.remove('filled'); });
      codeInputs[0].focus();
      startResendTimer();
    });

    const btnSalvar = document.getElementById('btnSalvarSenha');
    novaSenhaForm?.addEventListener('submit', async (e) => {
      e.preventDefault();

      const novaSenha = document.getElementById('novaSenha');
      const confirmarNova = document.getElementById('confirmarNovaSenha');

      const novaRules = [
        { test: v => v.length > 0, message: 'A nova senha é obrigatória.' },
        { test: v => v.length >= 6, message: 'Mínimo de 6 caracteres.' },
      ];

      const confirmRules = [
        { test: v => v.length > 0, message: 'Confirme a nova senha.' },
      ];

      const vNova = validateField(novaSenha, 'error-novaSenha', novaRules);
      const vConfirm = validateField(confirmarNova, 'error-confirmarNovaSenha', confirmRules);

      let vMatch = true;
      if (novaSenha.value !== confirmarNova.value) {
        document.getElementById('error-confirmarNovaSenha').textContent = 'As senhas não coincidem.';
        document.getElementById('error-confirmarNovaSenha').classList.add('show');
        confirmarNova.closest('.input-group').classList.add('error');
        vMatch = false;
      }

      if (!vNova || !vConfirm || !vMatch) {
        const firstError = novaSenhaForm.querySelector('.input-group.error');
        if (firstError) shakeElement(firstError);
        return;
      }

      setLoading(btnSalvar, true);
      await new Promise(r => setTimeout(r, 1500));

      updateUser(recoveryEmail, { password: novaSenha.value });

      setLoading(btnSalvar, false);
      btnSalvar.querySelector('.btn-text').textContent = 'Senha redefinida!';
      btnSalvar.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
      showToast('Senha redefinida com sucesso!', 'success');

      setTimeout(() => {
        window.location.href = 'index.html?reset=true';
      }, 2000);
    });

    setTimeout(() => emailRecInput.focus(), 600);
  }

  // ==========================================
  //     PÁGINA: DASHBOARD (dashboard.html) 
  // ==========================================

  const dashboardPage = document.querySelector('.main-content');
  if (dashboardPage) {
    const session = getSession();

    // Proteção: redireciona se não estiver logado
    if (!session) {
      showToast('Você precisa fazer login primeiro.', 'error');
      setTimeout(() => window.location.href = 'index.html', 2000);
      return;
    }

    const user = findUserByEmail(session.email);
    if (!user) {
      clearSession();
      showToast('Sessão inválida. Faça login novamente.', 'error');
      setTimeout(() => window.location.href = 'index.html', 2000);
      return;
    }

    // Preencher dados do usuário
    document.getElementById('dashboardUserName').textContent = user.name;
    document.getElementById('dashboardUserEmail').textContent = user.email;
    document.getElementById('welcomeName').textContent = user.name.split(' ')[0];
    document.getElementById('infoName').textContent = user.name;
    document.getElementById('infoEmail').textContent = user.email;
    document.getElementById('infoUsername').textContent = '@' + user.username;
    document.getElementById('infoId').textContent = user.id;

    // Avatar com iniciais
    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    document.getElementById('avatarInitials').textContent = initials;

    // Estatísticas
    document.getElementById('statLoginCount').textContent = getLoginCount(user.email);

    const createdDate = new Date(user.createdAt);
    document.getElementById('statMemberSince').textContent = createdDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });

    const lastLogin = user.lastLogin ? new Date(user.lastLogin) : createdDate;
    document.getElementById('statLastLogin').textContent = lastLogin.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

    document.getElementById('activityCreated').textContent = createdDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

    // Saudação baseada no horário
    const hour = new Date().getHours();
    let greeting = 'Boa noite';
    if (hour >= 5 && hour < 12) greeting = 'Bom dia';
    else if (hour >= 12 && hour < 18) greeting = 'Boa tarde';
    document.getElementById('greetingText').textContent = `${greeting}, ${user.name.split(' ')[0]}!`;
    document.getElementById('welcomeTitle').textContent = `${greeting}, ${user.name.split(' ')[0]}!`;

    // Sidebar mobile toggle
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const menuToggle = document.getElementById('menuToggle');
    const sidebarToggle = document.getElementById('sidebarToggle');

    function openSidebar() {
      sidebar.classList.add('open');
      sidebarOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    menuToggle?.addEventListener('click', openSidebar);
    sidebarToggle?.addEventListener('click', closeSidebar);
    sidebarOverlay?.addEventListener('click', closeSidebar);

    // ==========================================
    // LOGOUT COM MODAL DE CONFIRMAÇÃO
    // ==========================================

    const logoutModal = document.getElementById('logoutModal');
    const btnLogout = document.getElementById('btnLogout');
    const btnCancelLogout = document.getElementById('btnCancelLogout');
    const btnConfirmLogout = document.getElementById('btnConfirmLogout');

    function openLogoutModal() {
      logoutModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeLogoutModal() {
      logoutModal.classList.remove('active');
      document.body.style.overflow = '';
    }

    btnLogout?.addEventListener('click', openLogoutModal);
    btnCancelLogout?.addEventListener('click', closeLogoutModal);

    // Fechar ao clicar no overlay
    logoutModal?.addEventListener('click', (e) => {
      if (e.target === logoutModal) closeLogoutModal();
    });

    // Confirmar logout
    btnConfirmLogout?.addEventListener('click', async () => {
      setLoading(btnConfirmLogout, true);
      await new Promise(r => setTimeout(r, 1000));

      clearSession();
      setLoading(btnConfirmLogout, false);
      closeLogoutModal();
      showToast('Você saiu da conta. Até logo!', 'success');

      setTimeout(() => {
        window.location.href = 'index.html?logout=true';
      }, 1500);
    });

    // Tecla ESC fecha modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && logoutModal.classList.contains('active')) {
        closeLogoutModal();
      }
    });
  }

  // =============================================================================
  //   MENSAGENS DE TOAST PARA AÇÕES DE USUÁRIO (CADASTRO, RECUPERAÇÃO, LOGOUT) 
  // =============================================================================

  const params = new URLSearchParams(window.location.search);
  if (params.get('registered') === 'true') {
    showToast('Conta criada! Faça login para continuar.', 'success');
    history.replaceState(null, '', window.location.pathname);
  }
  if (params.get('reset') === 'true') {
    showToast('Senha redefinida! Faça login com a nova senha.', 'success');
    history.replaceState(null, '', window.location.pathname);
  }
  if (params.get('logout') === 'true') {
    showToast('Você saiu da conta com sucesso.', 'info');
    history.replaceState(null, '', window.location.pathname);
  }

});