(() => {
  const cartKey = 'mira-cart';
  const watchlistKey = 'mira-watchlist';
  // Every product photo is stored locally in assets/images so Signal collections work offline too.
  const inventory = [
    ['Wireless noise cancelling headphones', 89.99, 'Electronics', '../assets/images/headphones.jpg', ['surprise', 'upgrade', 'gift']],
    ['Unlocked 128GB smartphone', 269, 'Electronics', '../assets/images/phone.jpg', ['surprise', 'upgrade']],
    ['Classic stainless steel watch', 124.5, 'Fashion', '../assets/images/watch.jpg', ['surprise', 'upgrade', 'gift']],
    ['Everyday running sneakers', 64.99, 'Fashion', '../assets/images/sneakers.jpg', ['weekend', 'surprise']],
    ['Modern home accent', 39.99, 'Home & Garden', '../assets/images/home.jpg', ['surprise', 'gift']],
    ['Beauty essentials set', 28.5, 'Home & Garden', '../assets/images/beauty.jpg', ['gift', 'weekend']],
    ['Ready-to-give surprise box', 42, 'Gifts', '../assets/images/gift-box.jpg', ['gift', 'surprise']],
    ['Vintage camera kit', 219, 'Collectibles', '../assets/images/camera.jpg', ['gift', 'surprise']],
    ['Everyday city backpack', 55, 'Fashion', '../assets/images/backpack.jpg', ['weekend', 'surprise']],
    ['Glow portable speaker', 69.99, 'Electronics', '../assets/images/speaker.jpg', ['upgrade', 'weekend', 'gift']],
    ['Desk refresh essentials', 49.99, 'Home & Garden', '../assets/images/home.jpg', ['upgrade']],
    ['Everyday tech upgrade', 119, 'Electronics', '../assets/images/headphones.jpg', ['upgrade', 'weekend']],
    ['Pocket-ready phone find', 199, 'Electronics', '../assets/images/phone.jpg', ['surprise', 'gift']]
  ];
  const getCart = () => JSON.parse(localStorage.getItem(cartKey) || '[]');
  const getWatchlist = () => JSON.parse(localStorage.getItem(watchlistKey) || '[]');
  const saveWatchlist = (items) => localStorage.setItem(watchlistKey, JSON.stringify(items));
  const saveCart = (cart) => localStorage.setItem(cartKey, JSON.stringify(cart));
  const updateCount = () => { document.querySelectorAll('#cart-count').forEach((el) => el.textContent = getCart().reduce((n, item) => n + item.quantity, 0)); };
  const money = (value) => `$${value.toFixed(2)}`;
  const imgSrc = (image) => (image && image.startsWith('assets/') ? `../${image}` : image);
  const add = (product) => { const cart = getCart(); const item = cart.find((entry) => entry.title === product.title); if (item) item.quantity++; else cart.push({ ...product, quantity:1 }); saveCart(cart); updateCount(); };
  const results = document.querySelector('#results');
  if (results) {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    const signal = params.get('signal');
    const search = params.get('search')?.trim();
    const signalNames = { surprise: 'Surprise me', upgrade: 'A little upgrade', gift: 'Gift ideas', weekend: 'Weekend energy' };
    const title = document.querySelector('#result-title');
    const count = document.querySelector('#results-count');
    const renderProducts = (items) => {
      results.innerHTML = items.map(([itemTitle, price, type, image]) => `<article class="mini-product"><button class="heart" type="button" aria-label="Save ${itemTitle}" aria-pressed="false"><span class="material-symbols-outlined">favorite</span></button><img src="${image}" alt="${itemTitle}"><p class="product-type">${type}</p><h3>${itemTitle}</h3><p>${money(price)}</p><button class="add-cart" type="button">Add to cart</button></article>`).join('') || '<p class="empty-results">No items found. Try another search.</p>';
      results.querySelectorAll('.add-cart').forEach((button, index) => button.addEventListener('click', () => { const [itemTitle, price, type, image] = items[index]; add({title:itemTitle, price, type, image}); button.textContent='Added to cart'; button.classList.add('added'); }));
      results.querySelectorAll('.heart').forEach((button, index) => {
        const [title, price, type, image] = items[index];
        const isSaved = getWatchlist().some((item) => item.title === title);
        button.classList.toggle('saved', isSaved); button.setAttribute('aria-pressed', isSaved);
        button.addEventListener('click', () => {
          const saved = getWatchlist(); const itemIndex = saved.findIndex((item) => item.title === title);
          if (itemIndex >= 0) saved.splice(itemIndex, 1); else saved.push({ title, price, type, image });
          saveWatchlist(saved); button.classList.toggle('saved', itemIndex < 0); button.setAttribute('aria-pressed', itemIndex < 0);
        });
      });
    };
    const showLocalResults = () => {
      const items = signal ? inventory.filter((item) => item[4].includes(signal)) : (!category || category === 'All Categories' ? inventory : inventory.filter((item) => item[2] === category));
      title.textContent = signal ? `${signalNames[signal] || 'Your Signal'} picks` : (category && category !== 'All Categories' ? `${category} picks` : 'Explore items');
      count.textContent = signal ? `${items.length} finds matched to your Signal.` : `${items.length} curated finds waiting for you.`;
      renderProducts(items);
    };
    const showSearchResults = async () => {
      title.textContent = `Results for “${search}”`;
      count.textContent = 'Searching live products…';
      results.innerHTML = '<p class="search-loading">Finding the best matches…</p>';
      try {
        const response = await fetch(`https://dummyjson.com/products/search?q=${encodeURIComponent(search)}&limit=18`);
        if (!response.ok) throw new Error('Search service unavailable');
        const data = await response.json();
        const items = data.products.map((product) => [product.title, product.price, product.category, product.thumbnail || product.images?.[0]]);
        count.textContent = `${data.total} live product matches found.`;
        renderProducts(items);
      } catch (error) {
        const term = search.toLowerCase();
        const items = inventory.filter((item) => `${item[0]} ${item[2]}`.toLowerCase().includes(term));
        count.textContent = `Live search is unavailable. Showing ${items.length} local matches instead.`;
        renderProducts(items);
      }
    };
    if (search) showSearchResults(); else showLocalResults();
  }
  const watchlistItems = document.querySelector('#watchlist-items');
  if (watchlistItems) {
    const renderWatchlist = () => {
      const saved = getWatchlist();
      watchlistItems.innerHTML = saved.length ? `<div class="watchlist-grid">${saved.map((item, index) => `<article class="mini-product"><button class="heart saved" type="button" data-remove="${index}" aria-label="Remove ${item.title} from watchlist"><span class="material-symbols-outlined">favorite</span></button><img src="${imgSrc(item.image)}" alt="${item.title}"><p class="product-type">${item.type || 'Saved item'}</p><h2>${item.title}</h2><p>${money(Number(item.price))}</p><button class="add-cart" type="button" data-add="${index}">Add to cart</button></article>`).join('')}</div>` : '<section class="content-card empty-state"><span class="material-symbols-outlined">favorite</span><h2>Nothing saved yet</h2><p>Explore the marketplace and tap the heart on an item you love.</p><a class="primary-button" href="browse.html">Explore items</a></section>';
      watchlistItems.querySelectorAll('[data-remove]').forEach((button) => button.addEventListener('click', () => { const saved = getWatchlist(); saved.splice(Number(button.dataset.remove), 1); saveWatchlist(saved); renderWatchlist(); }));
      watchlistItems.querySelectorAll('[data-add]').forEach((button) => button.addEventListener('click', () => { const item = getWatchlist()[Number(button.dataset.add)]; add({ ...item }); button.textContent = 'Added to cart'; button.classList.add('added'); }));
    };
    renderWatchlist();
  }
  const cartItems = document.querySelector('#cart-items');
  if (cartItems) {
    const render = () => { const cart = getCart(); const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0); cartItems.innerHTML = cart.length ? cart.map((item, index) => `<article class="cart-item"><img src="${imgSrc(item.image)}" alt="${item.title}"><div><h3>${item.title}</h3><p>${money(item.price)} · Free shipping</p><div class="quantity-control"><button data-change="-1" data-index="${index}" aria-label="Remove one">−</button><span>${item.quantity}</span><button data-change="1" data-index="${index}" aria-label="Add one">+</button><button class="remove-item" data-remove="${index}">Remove</button></div></div><strong>${money(item.price * item.quantity)}</strong></article>`).join('') : '<div class="empty-state"><span class="material-symbols-outlined">shopping_cart</span><h2>Your cart is empty</h2><p>Find something special and it will appear here.</p><a class="primary-button" href="browse.html">Explore items</a></div>';
      document.querySelector('#cart-total').textContent = money(total); document.querySelector('#cart-total-copy').textContent = money(total);
      cartItems.querySelectorAll('[data-change]').forEach((button) => button.addEventListener('click', () => { const next = getCart(); const i = Number(button.dataset.index); next[i].quantity += Number(button.dataset.change); if (next[i].quantity < 1) next.splice(i, 1); saveCart(next); updateCount(); render(); }));
      cartItems.querySelectorAll('[data-remove]').forEach((button) => button.addEventListener('click', () => { const next = getCart(); next.splice(Number(button.dataset.remove), 1); saveCart(next); updateCount(); render(); }));
    }; render();
  }
  document.querySelector('.demo-form')?.addEventListener('submit', (event) => { event.preventDefault(); alert('Your listing has been saved as a demo.'); });
  document.querySelector('#checkout')?.addEventListener('click', () => alert('Checkout is ready for your payment integration.'));
  updateCount();
  const topButton = document.createElement('button');
  topButton.className = 'back-to-top'; topButton.type = 'button'; topButton.setAttribute('aria-label', 'Back to top');
  topButton.innerHTML = '<span class="material-symbols-outlined">arrow_upward</span><span>Top</span>';
  document.body.append(topButton);
  window.addEventListener('scroll', () => topButton.classList.toggle('visible', window.scrollY > 320), { passive: true });
  topButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();
