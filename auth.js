// ========== АВТОРИЗАЦИЯ ЧЕРЕЗ API ==========

const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:3000/api';

// Переключение вкладок
document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.form-panel').forEach(p => p.classList.remove('active'));
            const panel = document.getElementById(tab === 'login' ? 'loginPanel' : 'registerPanel');
            if (panel) panel.classList.add('active');
            hideMessages();
        });
    });

    // Обработчик формы входа
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleLogin();
        });
    }

    // Обработчик формы регистрации
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleRegister();
        });
    }

    // Восстановление пароля
    const forgotLinks = document.querySelectorAll('#forgotLinkBtn, #forgotLinkRegBtn');
    forgotLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.form-panel').forEach(p => p.classList.remove('active'));
            document.getElementById('tabButtons').style.display = 'none';
            const resetPanel = document.getElementById('resetPanel');
            if (resetPanel) resetPanel.classList.add('active');
        });
    });

    const backBtn = document.getElementById('backToLoginBtn');
    if (backBtn) {
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('tabButtons').style.display = 'flex';
            document.getElementById('resetPanel').classList.remove('active');
            document.getElementById('loginPanel').classList.add('active');
            document.querySelector('[data-tab="login"]').classList.add('active');
            document.querySelector('[data-tab="register"]').classList.remove('active');
        });
    }

    const resetBtn = document.getElementById('resetPasswordBtnNew');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            const email = document.getElementById('resetEmailInput').value.trim();
            if (!email) {
                showError('Введите email для восстановления пароля');
                return;
            }
            showSuccess('Если такой email зарегистрирован, инструкции будут отправлены.');
        });
    }
});

function hideMessages() {
    const err = document.getElementById('errorMessage');
    const suc = document.getElementById('successMessage');
    if (err) { err.style.display = 'none'; err.textContent = ''; }
    if (suc) { suc.style.display = 'none'; suc.textContent = ''; }
}

function showError(message) {
    const el = document.getElementById('errorMessage');
    if (el) {
        el.textContent = message;
        el.style.display = 'block';
    }
}

function showSuccess(message) {
    const el = document.getElementById('successMessage');
    if (el) {
        el.textContent = message;
        el.style.display = 'block';
    }
}

async function handleLogin() {
    hideMessages();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const btn = document.querySelector('#loginForm .btn-submit');

    if (!email || !password) {
        showError('Введите email и пароль');
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Входим...';

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (!res.ok) {
            showError(data.error || 'Ошибка входа');
            return;
        }

        sessionStorage.setItem('currentUser', JSON.stringify(data));

        const returnUrl = sessionStorage.getItem('returnUrl');
        sessionStorage.removeItem('returnUrl');
        window.location.href = returnUrl || 'cabinet.html';
    } catch (err) {
        showError('Ошибка соединения с сервером');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Войти';
    }
}

async function handleRegister() {
    hideMessages();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const phone = document.getElementById('regPhone').value.trim();
    const btn = document.querySelector('#registerForm .btn-submit');

    if (!name || !email || !password || !phone) {
        showError('Пожалуйста, заполните все обязательные поля');
        return;
    }

    if (password.length < 6) {
        showError('Пароль должен содержать минимум 6 символов');
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Регистрируемся...';

    try {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, phone })
        });
        const data = await res.json();

        if (!res.ok) {
            showError(data.error || 'Ошибка регистрации');
            return;
        }

        sessionStorage.setItem('currentUser', JSON.stringify(data));
        window.location.href = 'cabinet.html';
    } catch (err) {
        showError('Ошибка соединения с сервером');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Зарегистрироваться';
    }
}
