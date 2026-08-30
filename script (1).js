// Shared across all pages: reveal ".reveal" elements once they enter
// the viewport, then stop watching them so the animation plays once.
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      entry.target.classList.add('in-view');
      entry.target.querySelectorAll('.bar i').forEach(bar => { bar.style.width = bar.dataset.width; });
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
revealEls.forEach(el => observer.observe(el));

// =========================================================
// CONTACT FORM — built with JS instead of a raw form-mailto
// action. Form-level mailto (action="mailto:..." enctype=
// "text/plain") is unreliable across browsers, especially on
// machines with no default mail app configured, and can fail
// silently. Building the mailto: URL ourselves and opening it
// on submit is the more dependable version of the same trick.
// A real contact form that sends mail without opening the
// visitor's email client needs a backend or a service like
// Formspree — this is still a front-end-only simulation.
// =========================================================
const contactForm = document.getElementById('contact-form');
if (contactForm){
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('cf-name').value.trim();
    const email = document.getElementById('cf-email').value.trim();
    const message = document.getElementById('cf-message').value.trim();
    if (!name || !email || !message) return;

    const subject = encodeURIComponent(`Message from ${name} (via website)`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:annika.kanungo@example.edu?subject=${subject}&body=${body}`;
  });
}

// =========================================================
// ARTICLES PAGE — rendering, filtering, and REAL admin auth.
// Everything below is guarded on #article-list existing, so
// this file stays safe to include on every page.
//
// TEACHING NOTE: articles now live in Firestore (a real shared
// database), not localStorage. Anyone can read them (public
// blog). Only the account whose UID is hardcoded in
// firestore.rules can write — that check happens on Google's
// servers, so a student cannot post even by opening dev tools
// and calling these functions directly, because Firestore will
// reject the write without a matching authenticated UID.
// =========================================================
const articleList = document.getElementById('article-list');
if (articleList && typeof db !== 'undefined'){

  const template = document.getElementById('article-template');
  const tagLabel = { code:'Code', case:'Case', both:'Both' };

  function buildCard(id, article){
    const node = template.content.cloneNode(true);
    const card = node.querySelector('.article-card');
    card.dataset.tag = article.tag;
    card.dataset.id = id;
    node.querySelector('.article-num').textContent = article.num ? 'No. ' + article.num : '';
    node.querySelector('h3').textContent = article.title;
    node.querySelector('p').textContent = article.excerpt;
    const pill = node.querySelector('.pill');
    pill.textContent = tagLabel[article.tag] || article.tag;
    pill.classList.add(article.tag);
    node.querySelector('.date').textContent = article.date || '';
    node.querySelector('.read').textContent = article.read || '';
    return node;
  }

  function renderArticles(docs){
    articleList.innerHTML = '';
    if (docs.length === 0){
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'No articles filed yet — check back soon.';
      articleList.appendChild(empty);
    } else {
      docs.forEach(doc => articleList.appendChild(buildCard(doc.id, doc.data())));
    }
    attachFilter();
  }

  function loadArticles(){
    db.collection('articles').orderBy('createdAt', 'desc').get()
      .then(snapshot => renderArticles(snapshot.docs))
      .catch(err => {
        console.error('Could not load articles:', err);
        articleList.innerHTML = '<p class="empty-state">Could not load articles right now.</p>';
      });
  }

  function attachFilter(){
    const cards = articleList.querySelectorAll('.article-card');
    const activeBtn = document.querySelector('.filter-bar .filter-btn.active');
    const filter = activeBtn ? activeBtn.dataset.filter : 'all';
    cards.forEach(card => { card.hidden = !(filter === 'all' || card.dataset.tag === filter); });
  }

  document.querySelectorAll('.filter-bar .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-bar .filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      attachFilter();
    });
  });

  loadArticles();

  // ---- REAL admin login (Firebase Authentication) ----
  const toggleBtn = document.getElementById('admin-toggle');
  const loginPanel = document.getElementById('admin-login');
  const formPanel = document.getElementById('admin-form-panel');
  const emailInput = document.getElementById('admin-email');
  const passwordInput = document.getElementById('admin-password');
  const submitBtn = document.getElementById('admin-submit');
  const errorMsg = document.getElementById('admin-error');
  const publishBtn = document.getElementById('publish-article');
  const logoutBtn = document.getElementById('admin-logout');

  // Reflects the real, server-verified login state — not a
  // client-side flag like the old demo used.
  auth.onAuthStateChanged(user => {
    if (user){
      loginPanel.hidden = true;
      formPanel.hidden = false;
    } else {
      formPanel.hidden = true;
    }
  });

  toggleBtn.addEventListener('click', () => {
    const isOpen = !loginPanel.hidden || !formPanel.hidden;
    if (isOpen){
      loginPanel.hidden = true;
      formPanel.hidden = true;
    } else if (auth.currentUser){
      formPanel.hidden = false;
    } else {
      loginPanel.hidden = false;
    }
  });

  submitBtn.addEventListener('click', () => {
    errorMsg.hidden = true;
    auth.signInWithEmailAndPassword(emailInput.value.trim(), passwordInput.value)
      .then(() => {
        passwordInput.value = '';
      })
      .catch(() => {
        errorMsg.hidden = false;
      });
  });

  logoutBtn.addEventListener('click', () => {
    auth.signOut();
    formPanel.hidden = true;
  });

  publishBtn.addEventListener('click', () => {
    const title = document.getElementById('new-title').value.trim();
    const excerpt = document.getElementById('new-excerpt').value.trim();
    const tag = document.getElementById('new-tag').value;
    const date = document.getElementById('new-date').value.trim() || 'Just now';
    const read = document.getElementById('new-read').value.trim() || '—';
    if (!title || !excerpt) return;

    db.collection('articles').add({
      title, excerpt, tag, date, read,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
      document.getElementById('new-title').value = '';
      document.getElementById('new-excerpt').value = '';
      document.getElementById('new-date').value = '';
      document.getElementById('new-read').value = '';
      loadArticles();
    }).catch(err => {
      // Firestore rejects this if the logged-in user's UID doesn't
      // match the one in firestore.rules — the real enforcement.
      alert('Could not publish: ' + err.message);
    });
  });
}
