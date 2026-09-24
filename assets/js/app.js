(() => {
  const cartKey = 'mira-cart';
  const watchlistKey = 'mira-watchlist';
  const count = document.querySelector('#cart-count');
  const getCart = () => JSON.parse(localStorage.getItem(cartKey) || '[]');
  const updateCount = () => { if (count) count.textContent = getCart().reduce((total, item) => total + item.quantity, 0); };
  const toast = (message) => {
    const box = document.querySelector('#toast');
    if (!box) return;
    box.textContent = message;
    box.classList.add('show');
    window.setTimeout(() => box.classList.remove('show'), 2200);
  };
  document.querySelectorAll('.menu-trigger').forEach((trigger) => trigger.addEventListener('click', () => {
    const menu = trigger.closest('.header-menu, .category-menu');
    const isOpen = menu.classList.toggle('open');
    trigger.setAttribute('aria-expanded', isOpen);
  }));
  const getWatchlist = () => JSON.parse(localStorage.getItem(watchlistKey) || '[]');
  const saveWatchlist = (items) => localStorage.setItem(watchlistKey, JSON.stringify(items));
  document.querySelectorAll('.heart').forEach((button) => {
    const card = button.closest('.product-card');
    const title = card?.querySelector('h3')?.textContent.trim();
    if (!title) return;
    const saved = getWatchlist().some((item) => item.title === title);
    button.classList.toggle('saved', saved);
    button.setAttribute('aria-pressed', saved);
    button.addEventListener('click', () => {
      const items = getWatchlist();
      const index = items.findIndex((item) => item.title === title);
      if (index >= 0) {
        items.splice(index, 1);
        button.classList.remove('saved');
        button.setAttribute('aria-pressed', 'false');
        toast('Removed from your watchlist');
      } else {
        const price = Number((card.querySelector('.price')?.textContent.match(/[\d.]+/) || ['0'])[0]);
        items.push({ title, price, image: card.querySelector('img')?.getAttribute('src') || '', type: card.querySelector('.condition')?.textContent.trim() || 'Saved item' });
        button.classList.add('saved');
        button.setAttribute('aria-pressed', 'true');
        toast('Added to your watchlist');
      }
      saveWatchlist(items);
    });
  });
  document.querySelectorAll('.add-cart').forEach((button) => button.addEventListener('click', () => {
    const card = button.closest('.product-card');
    const title = button.dataset.product || card.querySelector('h3').textContent.trim();
    const price = Number((card.querySelector('.price').textContent.match(/[\d.]+/) || ['0'])[0]);
    const image = card.querySelector('img').getAttribute('src');
    const cart = getCart();
    const item = cart.find((product) => product.title === title);
    if (item) item.quantity += 1;
    else cart.push({ title, price, image, quantity: 1 });
    localStorage.setItem(cartKey, JSON.stringify(cart));
    button.textContent = 'Added to cart';
    button.classList.add('added');
    updateCount(); toast(`${title} added to cart`);
  }));
  const signals = {
    surprise: { text: 'unexpected finds with a story.', href: 'views/browse.html?signal=surprise', label: 'Follow this Signal' },
    upgrade: { text: 'small upgrades that make every day feel better.', href: 'views/browse.html?signal=upgrade', label: 'Explore upgrades' },
    gift: { text: 'thoughtful finds worth giving twice.', href: 'views/browse.html?signal=gift', label: 'Find a gift' },
    weekend: { text: 'a little more fun for your next two days.', href: 'views/browse.html?signal=weekend', label: 'Catch the vibe' }
  };
  document.querySelectorAll('.signal-option').forEach((button) => button.addEventListener('click', () => {
    const signal = signals[button.dataset.signal];
    if (!signal) return;
    document.querySelectorAll('.signal-option').forEach((option) => {
      const selected = option === button;
      option.classList.toggle('active', selected);
      option.setAttribute('aria-pressed', selected);
    });
    const result = document.querySelector('#signal-result-text');
    const cta = document.querySelector('#signal-cta');
    if (result) result.innerHTML = `<strong>Your Signal:</strong> ${signal.text}`;
    if (cta) { cta.href = signal.href; cta.childNodes[0].textContent = `${signal.label} `; }
  }));
  document.querySelector('#search-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = document.querySelector('#search-input')?.value.trim();
    if (!query) { toast('Type something to search'); return; }
    location.href = `views/browse.html?search=${encodeURIComponent(query)}`;
  });
  updateCount();
  const topButton = document.createElement('button');
  topButton.className = 'back-to-top';
  topButton.type = 'button';
  topButton.setAttribute('aria-label', 'Back to top');
  topButton.innerHTML = '<span class="material-symbols-outlined">arrow_upward</span><span>Top</span>';
  document.body.append(topButton);
  window.addEventListener('scroll', () => topButton.classList.toggle('visible', window.scrollY > 420), { passive: true });
  topButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();
