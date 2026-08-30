// ============================================================
// Navbar — scroll state + mobile toggle
// ============================================================
const nav = document.querySelector('.nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 30);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}
const burger = document.querySelector('.nav-burger');
const navLinks = document.querySelector('.nav-links');
if (burger && navLinks) {
  burger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    burger.innerHTML = open ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    burger.innerHTML = '<i class="fa-solid fa-bars"></i>';
  }));
}

// ============================================================
// Scroll reveal
// ============================================================
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach((el, i) => {
    el.style.setProperty('--i', i % 6);
    io.observe(el);
  });
}

// ============================================================
// Animated counters
// ============================================================
const counters = document.querySelectorAll('[data-count]');
if (counters.length) {
  const counted = new WeakSet();
  const cio = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !counted.has(entry.target)) {
        counted.add(entry.target);
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const duration = 1400;
        const start = performance.now();
        function tick(now) {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = target < 100 ? (target * eased).toFixed(1) : Math.floor(target * eased);
          el.textContent = val + suffix;
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = target + suffix;
        }
        requestAnimationFrame(tick);
      }
    });
  }, { threshold: 0.4 });
  counters.forEach(el => cio.observe(el));
}

// ============================================================
// Footer live clock (EAT)
// ============================================================
const clockEl = document.querySelector('[data-clock]');
if (clockEl) {
  const update = () => {
    const now = new Date();
    const opts = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    clockEl.textContent = now.toLocaleString('en-GB', opts) + ' EAT';
  };
  update();
  setInterval(update, 1000);
}

// ============================================================
// FAQ accordion
// ============================================================
document.querySelectorAll('.faq-item').forEach(item => {
  const q = item.querySelector('.faq-q');
  const a = item.querySelector('.faq-a');
  q.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(other => {
      other.classList.remove('open');
      other.querySelector('.faq-a').style.maxHeight = null;
    });
    if (!isOpen) {
      item.classList.add('open');
      a.style.maxHeight = a.scrollHeight + 'px';
    }
  });
});

// ============================================================
// Contact form validation + fake submit
// ============================================================
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  const successBox = document.getElementById('form-success');
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    contactForm.querySelectorAll('[required]').forEach(input => {
      const field = input.closest('.field');
      const emailOk = input.type !== 'email' || /^\S+@\S+\.\S+$/.test(input.value);
      if (!input.value.trim() || !emailOk) {
        field.classList.add('error');
        valid = false;
      } else {
        field.classList.remove('error');
      }
    });
    if (!valid) return;
    const btn = contactForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending…';
    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = 'Send Message <i class="fa-solid fa-arrow-right"></i>';
      contactForm.reset();
      successBox.classList.add('show');
      successBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setTimeout(() => successBox.classList.remove('show'), 5000);
    }, 900);
  });
}

// ============================================================
// Login — multi-step (login / forgot / verify / reset) + password toggle
// ============================================================
document.querySelectorAll('[data-goto]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const target = btn.getAttribute('data-goto');
    document.querySelectorAll('.auth-step').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(target);
    if (el) el.classList.add('active');
  });
});

document.querySelectorAll('.pass-toggle').forEach(toggle => {
  toggle.addEventListener('click', () => {
    const input = toggle.previousElementSibling;
    const isPass = input.type === 'password';
    input.type = isPass ? 'text' : 'password';
    toggle.innerHTML = isPass ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
  });
});

// OTP inputs auto-advance
const otpInputs = document.querySelectorAll('.otp-row input');
otpInputs.forEach((input, idx) => {
  input.addEventListener('input', () => {
    input.value = input.value.replace(/[^0-9]/g, '').slice(0, 1);
    if (input.value && otpInputs[idx + 1]) otpInputs[idx + 1].focus();
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && !input.value && otpInputs[idx - 1]) otpInputs[idx - 1].focus();
  });
});

// Reset-password mismatch check
const newPass = document.getElementById('new-password');
const confirmPass = document.getElementById('confirm-password');
const mismatchNote = document.getElementById('mismatch-note');
const resetForm = document.getElementById('reset-form');
if (resetForm) {
  resetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (newPass.value !== confirmPass.value || !newPass.value) {
      mismatchNote.classList.add('show');
      return;
    }
    mismatchNote.classList.remove('show');
    showToast('Password updated — you can now log in.');
    document.querySelectorAll('.auth-step').forEach(s => s.classList.remove('active'));
    document.getElementById('step-login').classList.add('active');
  });
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = loginForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing in…';
    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = 'Log In <i class="fa-solid fa-arrow-right"></i>';
      showToast('This is a demo — no live account has been connected yet.');
    }, 900);
  });
}

const sendCodeForm = document.getElementById('send-code-form');
if (sendCodeForm) {
  sendCodeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    document.querySelectorAll('.auth-step').forEach(s => s.classList.remove('active'));
    document.getElementById('step-verify').classList.add('active');
    showToast('Verification code sent to your email.');
  });
}

const verifyForm = document.getElementById('verify-form');
if (verifyForm) {
  verifyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    document.querySelectorAll('.auth-step').forEach(s => s.classList.remove('active'));
    document.getElementById('step-reset').classList.add('active');
  });
}

function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i><span></span>`;
    document.body.appendChild(toast);
  }
  toast.querySelector('span').textContent = msg;
  toast.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 3800);
}
