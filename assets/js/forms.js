/* ============================================================
   CANTEENCORP — FORMS JS
   Multi-step form wizard, validation, submission
   ============================================================ */

'use strict';

// ─── Form Validator ────────────────────────────────────────────
const FormValidator = (() => {
  const rules = {
    required: (val)    => val.trim().length > 0,
    email:    (val)    => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    phone:    (val)    => /^[\+\d\s\-\(\)]{7,15}$/.test(val),
    minlen:   (val, n) => val.trim().length >= parseInt(n),
    maxlen:   (val, n) => val.trim().length <= parseInt(n),
  };

  const messages = {
    required: 'This field is required.',
    email:    'Please enter a valid email address.',
    phone:    'Please enter a valid phone number.',
    minlen:   n => `Minimum ${n} characters required.`,
    maxlen:   n => `Maximum ${n} characters allowed.`,
  };

  function validateField(input) {
    const ruleStr = input.dataset.validate;
    if (!ruleStr) return true;

    const ruleList = ruleStr.split('|');
    let valid = true;
    let errorMsg = '';

    for (const rule of ruleList) {
      const [name, param] = rule.split(':');
      if (!rules[name]) continue;
      if (!rules[name](input.value, param)) {
        valid = false;
        errorMsg = typeof messages[name] === 'function' ? messages[name](param) : messages[name];
        break;
      }
    }

    const group = input.closest('.form-group');
    const errEl = group?.querySelector('.form-error');

    input.classList.toggle('error', !valid);
    if (errEl) {
      errEl.textContent = errorMsg;
      errEl.classList.toggle('visible', !valid);
    }

    return valid;
  }

  function validateForm(form) {
    let allValid = true;
    form.querySelectorAll('[data-validate]').forEach(input => {
      if (!validateField(input)) allValid = false;
    });
    return allValid;
  }

  function init() {
    // Live validation on blur
    document.querySelectorAll('[data-validate]').forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('error')) validateField(input);
      });
    });

    // Form submit
    document.querySelectorAll('form[data-validate-form]').forEach(form => {
      form.addEventListener('submit', e => {
        e.preventDefault();
        if (validateForm(form)) {
          handleSubmit(form);
        }
      });
    });
  }

  function handleSubmit(form) {
    const btn = form.querySelector('[type="submit"]');
    if (btn) {
      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Sending...';

      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = originalText;
        form.reset();
        window.CanteenCorp?.Toast.show('Message sent successfully! We\'ll be in touch soon.', 'success');
      }, 1800);
    }
  }

  return { init, validateField, validateForm };
})();

// ─── Multi-Step Form Wizard ────────────────────────────────────
const FormWizard = (() => {
  function init(formEl) {
    if (!formEl) return;

    const steps     = formEl.querySelectorAll('.wizard-step');
    const indicators = formEl.querySelectorAll('.step-indicator');
    const prevBtn   = formEl.querySelector('.wizard-prev');
    const nextBtn   = formEl.querySelector('.wizard-next');
    const submitBtn = formEl.querySelector('.wizard-submit');
    let current = 0;

    function showStep(index) {
      steps.forEach((step, i) => {
        step.classList.toggle('active', i === index);
      });
      indicators.forEach((ind, i) => {
        ind.classList.toggle('active', i === index);
        ind.classList.toggle('done', i < index);
      });

      if (prevBtn) prevBtn.style.display = index === 0 ? 'none' : '';
      if (nextBtn) nextBtn.style.display = index === steps.length - 1 ? 'none' : '';
      if (submitBtn) submitBtn.style.display = index === steps.length - 1 ? '' : 'none';
    }

    function validateCurrentStep() {
      const currentStep = steps[current];
      if (!currentStep) return true;
      let valid = true;
      currentStep.querySelectorAll('[data-validate]').forEach(input => {
        if (!FormValidator.validateField(input)) valid = false;
      });
      return valid;
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (!validateCurrentStep()) return;
        if (current < steps.length - 1) {
          current++;
          showStep(current);
        }
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (current > 0) { current--; showStep(current); }
      });
    }

    showStep(0);
  }

  return { init };
})();

// ─── Newsletter Form ───────────────────────────────────────────
function initNewsletterForms() {
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (!input || !input.value.includes('@')) {
        window.CanteenCorp?.Toast.show('Please enter a valid email.', 'error');
        return;
      }
      const btn = form.querySelector('button');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i> Subscribed!';
        btn.style.background = '#22C55E';
        setTimeout(() => { btn.disabled = false; btn.textContent = 'Subscribe'; btn.style.background = ''; }, 3000);
      }
      input.value = '';
      window.CanteenCorp?.Toast.show('Successfully subscribed to our newsletter!', 'success');
    });
  });
}

// ─── Initialize ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  FormValidator.init();

  const wizard = document.querySelector('.contact-wizard');
  if (wizard) FormWizard.init(wizard);

  initNewsletterForms();
});

window.CanteenForms = { FormValidator, FormWizard };
