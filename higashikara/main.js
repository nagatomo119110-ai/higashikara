// ── Language Toggle ──
const htmlEl = document.documentElement;
const langBtn = document.getElementById('langToggle');
let currentLang = localStorage.getItem('hk-lang') || 'en';

function setLang(lang) {
  currentLang = lang;
  htmlEl.className = htmlEl.className.replace(/lang-\w+/g, '').trim();
  htmlEl.classList.add('lang-' + lang);
  if (langBtn) langBtn.textContent = lang === 'en' ? '日本語' : 'English';
  localStorage.setItem('hk-lang', lang);
}

if (langBtn) {
  langBtn.addEventListener('click', () => setLang(currentLang === 'en' ? 'ja' : 'en'));
}
setLang(currentLang);

// ── Nav Scroll ──
const navEl = document.querySelector('nav');
window.addEventListener('scroll', () => {
  if (navEl) navEl.classList.toggle('scrolled', window.scrollY > 50);
});

// ── Cart ──
let cart = JSON.parse(localStorage.getItem('hk-cart') || '[]');

const cartOverlay = document.getElementById('cartOverlay');
const cartDrawer = document.getElementById('cartDrawer');
const cartBtn = document.querySelector('.cart-btn');
const cartClose = document.getElementById('cartClose');
const cartCountEl = document.querySelector('.cart-count');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');

function saveCart() { localStorage.setItem('hk-cart', JSON.stringify(cart)); }

function updateCartUI() {
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = cart.reduce((sum, i) => sum + i.qty, 0);

  if (cartCountEl) {
    cartCountEl.textContent = count;
    cartCountEl.classList.toggle('hidden', count === 0);
  }
  if (cartTotalEl) cartTotalEl.textContent = '¥' + total.toLocaleString();
  if (!cartItemsEl) return;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `<div class="cart-empty"><span class="en">Your cart is empty.</span><span class="ja">カートは空です。</span></div>`;
    setLang(currentLang);
    return;
  }

  cartItemsEl.innerHTML = cart.map((item, i) => `
    <div class="cart-item">
      <div class="cart-item-img ${item.imgClass}"></div>
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-name" style="font-size:0.75rem;color:var(--text-muted)">${item.nameJa}</div>
        <div class="cart-item-price">¥${item.price.toLocaleString()} × ${item.qty}</div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${i})">×</button>
    </div>
  `).join('');
}

function addToCart(id, name, nameJa, price, imgClass) {
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, nameJa, price, imgClass, qty: 1 });
  }
  saveCart();
  updateCartUI();
  openCart();
}

function removeFromCart(idx) {
  cart.splice(idx, 1);
  saveCart();
  updateCartUI();
}

function openCart() {
  if (cartOverlay) cartOverlay.classList.add('open');
  if (cartDrawer) cartDrawer.classList.add('open');
}
function closeCart() {
  if (cartOverlay) cartOverlay.classList.remove('open');
  if (cartDrawer) cartDrawer.classList.remove('open');
}

if (cartBtn) cartBtn.addEventListener('click', openCart);
if (cartClose) cartClose.addEventListener('click', closeCart);
if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

// ── Stripe Checkout ──
// Replace with your Stripe Publishable Key and Price IDs
const STRIPE_PK = 'pk_test_YOUR_PUBLISHABLE_KEY';
const PRICE_IDS = {
  'bowl': 'price_YOUR_BOWL_PRICE_ID',
  'jubako': 'price_YOUR_JUBAKO_PRICE_ID',
  'tray': 'price_YOUR_TRAY_PRICE_ID',
  'teacup': 'price_YOUR_TEACUP_PRICE_ID',
};

// Option A: Stripe Buy Button (recommended for static HTML — no backend needed)
// Set up in Stripe Dashboard → Product → Buy Button, then embed per product page.

// Option B: Stripe Checkout via Payment Links (simplest)
const PAYMENT_LINKS = {
  'bowl':   'https://buy.stripe.com/YOUR_BOWL_LINK',
  'jubako': 'https://buy.stripe.com/YOUR_JUBAKO_LINK',
  'tray':   'https://buy.stripe.com/YOUR_TRAY_LINK',
  'teacup': 'https://buy.stripe.com/YOUR_TEACUP_LINK',
};

if (checkoutBtn) {
  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return;
    // For multi-item checkout, redirect to the first item's payment link.
    // For full cart checkout, a serverless function is required (see README).
    const firstItem = cart[0];
    const link = PAYMENT_LINKS[firstItem.id];
    if (link && !link.includes('YOUR_')) {
      window.location.href = link;
    } else {
      alert('Stripe payment links not configured yet.\nPlease set up your Stripe account and update main.js with your Payment Link URLs.');
    }
  });
}

// ── Fade-in on Scroll ──
const fadeEls = document.querySelectorAll('.fade-in');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
fadeEls.forEach(el => observer.observe(el));

// ── Init ──
updateCartUI();

// Expose addToCart globally
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
