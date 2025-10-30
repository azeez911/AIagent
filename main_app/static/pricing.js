function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

function openModal() {
  document.getElementById('subscribe-modal').setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}
function closeModal() {
  document.getElementById('subscribe-modal').setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}
function setModalPlan(slug, name, note) {
  document.getElementById('modal-plan-slug').value = slug;
  document.getElementById('modal-plan-name').textContent = name || slug;
  if (note) document.getElementById('modal-plan-note').textContent = note;
  document.querySelectorAll('#subscribe-form .error').forEach(e=>e.textContent='');
}

function renderPricing(pricing) {
  Object.values(pricing).forEach(p => {
    document.querySelectorAll(`.plan[data-plan="${p.slug}"]`).forEach(card => {
      const current = card.querySelector('.price-current');
      const original = card.querySelector('.price-original');
      if (current) current.textContent = p.price;
      if (original) {
        if (p.discount_active) {
          original.textContent = p.original;
          original.style.display = 'block';
        } else {
          original.textContent = '';
          original.style.display = 'none';
        }
      }
      card.classList.toggle('selected', !!p.selected);
    });

    const pageBtn = document.querySelector(`.plan-choose[data-plan="${p.slug}"]`);
    if (pageBtn) {
      const wrap = pageBtn.closest('.plan-hero');
      if (wrap) {
        const cur = wrap.querySelector('.price-current');
        const og = wrap.querySelector('.price-original');
        if (cur) cur.textContent = p.price;
        if (og) {
          if (p.discount_active) {
            og.textContent = p.original;
            og.style.display = 'block';
          } else {
            og.textContent = '';
            og.style.display = 'none';
          }
        }
      }
    }
  });
}

async function choosePlan(slug, name, note) {
  try {
    const res = await fetch(`/select-plan/${slug}/`, {
      method: 'POST',
      headers: { 'X-CSRFToken': getCookie('csrftoken') || '' }
    });
    if (!res.ok) throw new Error('Bad response');
    const data = await res.json();
    if (data && data.pricing) renderPricing(data.pricing);
    setModalPlan(slug, name, note);
    openModal();
  } catch (e) { console.error(e); }
}

function wirePlanClicks() {
  document.querySelectorAll('.plan-choose').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const slug = btn.getAttribute('data-plan');
      const name = btn.getAttribute('data-plan-name') || btn.closest('.plan')?.dataset.planName;
      const note = btn.getAttribute('data-plan-note') || btn.closest('.plan')?.dataset.planNote;
      if (slug) choosePlan(slug, name, note);
    });
  });

  document.querySelectorAll('.plan[data-plan]').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target && (e.target.closest('a') || e.target.closest('.plan-choose'))) return;
      const slug = card.getAttribute('data-plan');
      const name = card.getAttribute('data-plan-name');
      const note = card.getAttribute('data-plan-note');
      choosePlan(slug, name, note);
    });
  });

  document.querySelectorAll('#subscribe-modal [data-close]').forEach(el => {
    el.addEventListener('click', () => closeModal());
  });

  const form = document.getElementById('subscribe-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      document.querySelectorAll('#subscribe-form .error').forEach(el => el.textContent = '');
      try {
        const formData = new FormData(form);
        const res = await fetch('/subscribe/', {
          method: 'POST',
          headers: { 'X-CSRFToken': getCookie('csrftoken') || '' },
          body: formData
        });
        const data = await res.json();
        if (data.ok) {
          document.getElementById('subscribe-success').style.display = 'block';
          setTimeout(() => { window.location.href = data.redirect || '/'; }, 700);
        } else if (data.errors) {
          Object.entries(data.errors).forEach(([field, msgs]) => {
            const holder = document.querySelector(`#subscribe-form [data-err="${field}"]`);
            if (holder) holder.textContent = msgs.join(' ');
          });
        }
      } catch (err) { console.error(err); }
    });
  }
}

document.addEventListener('DOMContentLoaded', wirePlanClicks);
