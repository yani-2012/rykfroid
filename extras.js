// RYKFROID – Animations, boutons Appeler / WhatsApp / retour en haut, formulaire de contact amélioré
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Compteurs : « 20+ », « 500+ », « 100% » défilent depuis 0 ──
  const counters = [...document.querySelectorAll('.hero-stat-number')]
    .map(el => ({ el, match: el.textContent.trim().match(/^(\d+)(.*)$/) }))
    .filter(c => c.match);

  if (counters.length && !reduceMotion && 'IntersectionObserver' in window) {
    counters.forEach(({ el, match }) => {
      el.setAttribute('aria-label', el.textContent.trim());
      el.textContent = '0' + match[2];
    });

    const run = ({ el, match }) => {
      const target = Number(match[1]);
      const suffix = match[2];
      const duration = 1600;
      const start = performance.now();
      const step = now => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        counters.filter(c => c.el === entry.target).forEach(run);
        counterObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(c => counterObserver.observe(c.el));
  }

  // ── Apparition décalée des cartes dans les grilles ──
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const GRIDS = '.services-grid, .process-steps, .why-grid, .marques-grid, .content-grid';
    const staggerObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const grid = entry.target;
        staggerObserver.unobserve(grid);
        grid.classList.add('st-go');
        // Une fois l'entrée terminée, on rend aux cartes leurs effets de survol normaux
        const items = [...grid.children];
        setTimeout(() => items.forEach(item => {
          item.classList.remove('st-item');
          item.style.removeProperty('--st-delay');
        }), Math.min(items.length, 9) * 90 + 700);
      });
    }, { threshold: 0.08 });

    document.querySelectorAll(GRIDS).forEach(grid => {
      const items = [...grid.children];
      if (!grid.classList.contains('reveal') || items.length < 2) return;

      grid.classList.add('stagger');
      items.forEach((item, i) => {
        item.classList.add('st-item');
        item.style.setProperty('--st-delay', Math.min(i, 8) * 90 + 'ms');
      });
      staggerObserver.observe(grid);
    });
  }

  // ── Bouton « Appeler » + WhatsApp (barre fixe sur mobile, bulle sur ordinateur) ──
  const PHONE_ICON = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
  const WA_ICON = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.66.15-.2.3-.76.96-.93 1.16-.17.2-.34.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.34.44-.52.15-.17.2-.3.3-.49.1-.2.05-.37-.02-.52-.08-.15-.66-1.6-.91-2.19-.24-.58-.48-.5-.66-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.87 1.21 3.07c.15.2 2.09 3.19 5.07 4.47.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.04 21.5h-.01a9.45 9.45 0 0 1-4.82-1.32l-.35-.21-3.58.94.96-3.49-.23-.36a9.43 9.43 0 0 1-1.45-5.03c0-5.21 4.24-9.45 9.46-9.45 2.53 0 4.9.99 6.69 2.78a9.4 9.4 0 0 1 2.77 6.68c0 5.22-4.24 9.46-9.44 9.46zm8.04-17.5A11.32 11.32 0 0 0 12.04.67C5.77.67.67 5.77.67 12.04c0 2 .52 3.96 1.52 5.68L.57 23.33l5.74-1.5a11.34 11.34 0 0 0 5.73 1.46h.01c6.27 0 11.37-5.1 11.37-11.37 0-3.04-1.18-5.89-3.34-8.04z"/></svg>';
  const WA_URL = 'https://wa.me/33652597941?text=' + encodeURIComponent(
    "Bonjour, j'ai un problème avec mon équipement frigorifique. Voici une photo et quelques détails :");

  const bar = document.createElement('div');
  bar.className = 'call-bar';
  bar.innerHTML =
    '<a class="call-main" href="tel:+33652597941" aria-label="Appeler RYKFroid au 06 52 59 79 41">' + PHONE_ICON
    + 'Appeler <small>· 06 52 59 79 41</small></a>'
    + '<a class="call-wa" href="' + WA_URL + '" target="_blank" rel="noopener" aria-label="Écrire à RYKFroid sur WhatsApp">' + WA_ICON + '</a>';
  document.body.appendChild(bar);
  document.body.classList.add('has-call-bar');

  const waFloat = document.createElement('a');
  waFloat.className = 'wa-float';
  waFloat.href = WA_URL;
  waFloat.target = '_blank';
  waFloat.rel = 'noopener';
  waFloat.setAttribute('aria-label', 'Écrire à RYKFroid sur WhatsApp');
  waFloat.innerHTML = WA_ICON + '<span class="wa-tip">Envoyez une photo de la panne</span>';
  document.body.appendChild(waFloat);

  // ── Bouton « retour en haut » ──
  const toTop = document.createElement('button');
  toTop.type = 'button';
  toTop.className = 'to-top';
  toTop.setAttribute('aria-label', 'Revenir en haut de la page');
  toTop.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"/></svg>';
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  document.body.appendChild(toTop);

  // Les boutons apparaissent après la première partie de la page ; la barre s'efface au niveau du formulaire de contact
  const contact = document.getElementById('contact');
  let contactVisible = false;
  if (contact && 'IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      contactVisible = entries[0].isIntersecting;
      update();
    }, { threshold: 0.15 }).observe(contact);
  }
  function update() {
    const y = window.scrollY;
    bar.classList.toggle('show', y > 320 && !contactVisible);
    waFloat.classList.toggle('show', y > 320);
    toTop.classList.toggle('show', y > window.innerHeight * 1.5);
    toTop.classList.toggle('above-bar', bar.classList.contains('show'));
  }
  window.addEventListener('scroll', update, { passive: true });
  update();

  // ── Formulaire de contact : numéro mis en forme, erreurs claires, brouillon conservé ──
  const form = document.getElementById('contactForm');
  if (form) enhanceForm(form);

  function enhanceForm(form) {
    const DRAFT_KEY = 'ryk_contact_draft';
    const FIELDS = ['name', 'phone', 'email', 'type', 'modele', 'message'];
    const field = name => form.elements[name];

    // 0612345678 → 06 12 34 56 78 ; +33612345678 → +33 6 12 34 56 78
    function formatPhone(value) {
      const plus = value.trim().startsWith('+');
      const digits = value.replace(/\D/g, '');
      if (plus && digits.startsWith('33')) {
        const rest = digits.slice(2, 11);
        return ('+33 ' + rest.slice(0, 1) + ' ' + (rest.slice(1).match(/.{1,2}/g) || []).join(' ')).trim();
      }
      if (plus) return '+' + digits;
      return (digits.slice(0, 10).match(/.{1,2}/g) || []).join(' ');
    }
    const phone = field('phone');
    phone.setAttribute('inputmode', 'tel');
    phone.setAttribute('autocomplete', 'tel');
    field('name').setAttribute('autocomplete', 'name');
    field('email').setAttribute('autocomplete', 'email');
    phone.addEventListener('input', () => {
      // On ne reformate que si l'on tape en fin de champ, pour ne pas faire sauter le curseur
      if (phone.selectionStart !== phone.value.length) return;
      const formatted = formatPhone(phone.value);
      if (formatted !== phone.value) phone.value = formatted;
    });
    phone.addEventListener('blur', () => { phone.value = formatPhone(phone.value); });

    const RULES = {
      name: v => v.trim().length >= 2 || 'Indiquez votre nom.',
      phone: v => {
        const d = v.replace(/\D/g, '');
        if (!d) return 'Indiquez un numéro pour que nous puissions vous rappeler.';
        if (v.trim().startsWith('+')) return (d.length >= 10 && d.length <= 15) || 'Ce numéro semble incomplet.';
        return /^0[1-9]\d{8}$/.test(d) || 'Le numéro doit contenir 10 chiffres et commencer par 0.';
      },
      email: v => !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || "Cette adresse e-mail n'est pas valide.",
      type: v => !!v || "Choisissez le type d'équipement.",
      message: v => v.trim().length >= 10 || 'Décrivez la panne en quelques mots (10 caractères minimum).'
    };

    function showError(name, msg) {
      const input = field(name);
      const slot = form.querySelector('[data-fs-error="' + name + '"]');
      input.classList.toggle('field-error', !!msg);
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (!slot) return;
      if (!slot.id) slot.id = 'err-' + name;
      slot.textContent = msg || '';
      slot.style.display = msg ? 'block' : 'none';
      if (msg) input.setAttribute('aria-describedby', slot.id);
      else input.removeAttribute('aria-describedby');
    }
    function validate(name) {
      const result = RULES[name](field(name).value);
      showError(name, result === true ? '' : result);
      return result === true;
    }

    Object.keys(RULES).forEach(name => {
      const input = field(name);
      // Pas d'erreur pendant la première saisie : on vérifie en quittant le champ, puis on corrige en direct
      input.addEventListener('blur', () => { if (input.value) validate(name); });
      input.addEventListener('input', () => { if (input.classList.contains('field-error')) validate(name); });
      input.addEventListener('change', () => { if (input.classList.contains('field-error')) validate(name); });
    });

    // S'exécute avant l'envoi existant : si un champ est faux, on bloque et on montre l'erreur
    form.addEventListener('submit', e => {
      phone.value = formatPhone(phone.value);
      const invalid = Object.keys(RULES).filter(name => !validate(name));
      if (invalid.length) {
        e.preventDefault();
        e.stopImmediatePropagation();
        field(invalid[0]).focus();
      }
    }, true);

    // Brouillon gardé sur l'appareil du visiteur (7 jours) si la page est fermée par erreur
    const draftStore = {
      get() { try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null'); } catch (e) { return null; } },
      set(v) { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(v)); } catch (e) {} },
      clear() { try { localStorage.removeItem(DRAFT_KEY); } catch (e) {} }
    };
    const draft = draftStore.get();
    if (draft && Date.now() - (draft.t || 0) < 7 * 864e5) {
      FIELDS.forEach(name => { if (draft[name] && !field(name).value) field(name).value = draft[name]; });
    } else if (draft) {
      draftStore.clear();
    }

    let saveTimer;
    function saveDraft() {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        const data = { t: Date.now() };
        FIELDS.forEach(name => { data[name] = field(name).value; });
        if (FIELDS.some(name => data[name])) draftStore.set(data);
        else draftStore.clear();
      }, 400);
    }
    form.addEventListener('input', saveDraft);
    form.addEventListener('change', saveDraft);

    // Le formulaire n'est vidé (reset) qu'après un envoi réussi : on efface alors le brouillon
    form.addEventListener('reset', () => {
      clearTimeout(saveTimer);
      draftStore.clear();
      Object.keys(RULES).forEach(name => showError(name, ''));
    });
  }
})();
