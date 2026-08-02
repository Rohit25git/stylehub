/* ==========================================================================
   STYLEHUB — script.js
   All product data, cart engine, auth simulation & page interactivity.
   Organized so one file safely powers every page (each init only runs
   if its page's markup is present).
   ========================================================================== */
'use strict';

/* ==========================================================================
   0. HELPERS
   ========================================================================== */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const getParam = (name) => new URLSearchParams(window.location.search).get(name);

function formatPrice(n){
  return '₹' + Number(n).toLocaleString('en-IN');
}
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[c]));
}
function starString(rating){
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  let s = '';
  for(let i=0;i<full;i++) s += '<i class="fa-solid fa-star"></i>';
  if(half) s += '<i class="fa-solid fa-star-half-stroke"></i>';
  for(let i = full + (half?1:0); i<5; i++) s += '<i class="fa-regular fa-star"></i>';
  return s;
}
function uid(prefix){
  return prefix + Date.now().toString(36).toUpperCase() + Math.floor(Math.random()*900+100);
}

/* ==========================================================================
   1. PRODUCT CATALOG
   ========================================================================== */
const CATEGORIES = [
  { slug:'men-shirts',          label:"Shirts & T-Shirts",   gender:'men',   genderLabel:'Men' },
  { slug:'men-jeans',           label:"Jeans & Trousers",    gender:'men',   genderLabel:'Men' },
  { slug:'men-suits',           label:"Suits & Blazers",     gender:'men',   genderLabel:'Men' },
  { slug:'men-footwear',        label:"Footwear",            gender:'men',   genderLabel:'Men' },
  { slug:'men-accessories',     label:"Accessories",         gender:'men',   genderLabel:'Men' },
  { slug:'women-dresses',       label:"Dresses & Gowns",     gender:'women', genderLabel:'Women' },
  { slug:'women-tops',          label:"Tops & Blouses",      gender:'women', genderLabel:'Women' },
  { slug:'women-jeans-skirts',  label:"Jeans & Skirts",      gender:'women', genderLabel:'Women' },
  { slug:'women-footwear',      label:"Footwear",            gender:'women', genderLabel:'Women' },
  { slug:'women-accessories',   label:"Accessories",         gender:'women', genderLabel:'Women' },
  { slug:'kids-boys',           label:"Boys Clothing",       gender:'kids',  genderLabel:'Kids' },
  { slug:'kids-girls',          label:"Girls Clothing",      gender:'kids',  genderLabel:'Kids' },
  { slug:'kids-infant',         label:"Infant Wear",         gender:'kids',  genderLabel:'Kids' },
  { slug:'kids-footwear',       label:"Kids Footwear",       gender:'kids',  genderLabel:'Kids' },
  { slug:'kids-accessories',    label:"Kids Accessories",    gender:'kids',  genderLabel:'Kids' },
];
function catLabel(slug){
  const c = CATEGORIES.find(c => c.slug === slug);
  return c ? `${c.genderLabel}'s ${c.label}` : slug;
}

const SIZES = {
  apparel:      ["S","M","L","XL","XXL"],
  apparelLtd:   ["S","M","L","XL"],
  footMen:      ["7","8","9","10","11"],
  footWomen:    ["5","6","7","8","9"],
  accessory:    ["One Size"],
  kidsCloth:    ["2-3Y","4-5Y","6-7Y","8-9Y"],
  infant:       ["0-3M","3-6M","6-12M","12-18M"],
  kidsFoot:     ["10","11","12","13","1"],
};
const COLOR_SWATCH = {
  Black:"#1A1A2E", White:"#FFFFFF", Navy:"#223A5E", Pink:"#E91E63", Beige:"#E8DCC8",
  Gold:"#D4AF37", Red:"#C0392B", Blue:"#2E5FAA", Green:"#2E7D32", Grey:"#9598A0",
  Maroon:"#7B241C", Mustard:"#C9A227", Brown:"#6B4423", Peach:"#F3C9B5"
};
function colorsOf(names){ return names.map(n => ({ name:n, hex: COLOR_SWATCH[n] })); }
function img(keywords,lock){ return `https://loremflickr.com/700/860/${keywords}?lock=${lock}`; }

const PRODUCTS = [
  { id:1, keywords:"mens,oxford,shirt",  name:"Classic Oxford Shirt", gender:'men', category:'men-shirts', brand:"Urbane Threads",
    price:1499, oldPrice:1899, rating:4.5, reviews:128, sizes:SIZES.apparelLtd, colors:colorsOf(["White","Navy","Blue"]),
    isNew:false, isSale:true,
    desc:"A crisp, tailored oxford shirt cut from breathable cotton for an effortlessly polished look at the office or beyond.",
    features:["100% pure cotton weave","Button-down collar","Regular tailored fit","Machine washable"] },
  { id:2, keywords:"mens,tshirt",  name:"Graphic Print Crew Tee", gender:'men', category:'men-shirts', brand:"Trend Co",
    price:799, oldPrice:0, rating:4.2, reviews:64, sizes:SIZES.apparel, colors:colorsOf(["Black","White","Grey"]),
    isNew:true, isSale:false,
    desc:"A soft cotton-blend crew tee with an original StyleHub print, made for everyday layering.",
    features:["Cotton-blend jersey","Crew neckline","Relaxed fit","Fade-resistant print"] },
  { id:3, keywords:"mens,denim,jeans",  name:"Slim Fit Denim Jeans", gender:'men', category:'men-jeans', brand:"Urbane Threads",
    price:2199, oldPrice:0, rating:4.6, reviews:210, sizes:SIZES.apparelLtd, colors:colorsOf(["Blue","Black"]),
    isNew:false, isSale:false,
    desc:"Stretch-denim jeans with a slim silhouette that moves with you from desk to dinner.",
    features:["98% cotton, 2% elastane","Slim fit, mid-rise","Five-pocket styling","Reinforced stitching"] },
  { id:4, keywords:"mens,linen,trousers",  name:"Linen Casual Trousers", gender:'men', category:'men-jeans', brand:"Heritage Craft",
    price:1799, oldPrice:2199, rating:4.3, reviews:58, sizes:SIZES.apparelLtd, colors:colorsOf(["Beige","Grey","Navy"]),
    isNew:false, isSale:true,
    desc:"Lightweight linen-blend trousers designed for warm-weather comfort without losing structure.",
    features:["Linen-cotton blend","Breathable weave","Tapered leg","Dry clean recommended"] },
  { id:5, keywords:"mens,blazer",  name:"Tailored Charcoal Blazer", gender:'men', category:'men-suits', brand:"Heritage Craft",
    price:4999, oldPrice:5999, rating:4.7, reviews:92, sizes:SIZES.apparelLtd, colors:colorsOf(["Grey","Black"]),
    isNew:false, isSale:true,
    desc:"A sharply tailored single-breasted blazer that anchors any formal or smart-casual wardrobe.",
    features:["Wool-blend fabric","Single-breasted, two-button","Half-canvas construction","Interior pockets"] },
  { id:6, keywords:"mens,suit",  name:"Formal Three-Piece Suit", gender:'men', category:'men-suits', brand:"Aria Studio",
    price:8999, oldPrice:0, rating:4.8, reviews:40, sizes:SIZES.apparelLtd, colors:colorsOf(["Navy","Black"]),
    isNew:true, isSale:false,
    desc:"Jacket, waistcoat and trouser cut as one considered silhouette for weddings and boardrooms alike.",
    features:["Jacket + waistcoat + trouser","Premium wool-blend","Slim tailored fit","Includes garment bag"] },
  { id:7, keywords:"leather,chelsea,boots",  name:"Leather Chelsea Boots", gender:'men', category:'men-footwear', brand:"Heritage Craft",
    price:3499, oldPrice:0, rating:4.5, reviews:77, sizes:SIZES.footMen, colors:colorsOf(["Black","Brown"]),
    isNew:false, isSale:false,
    desc:"Genuine leather Chelsea boots with an elastic side panel and a stacked block heel.",
    features:["Genuine leather upper","Elastic side gussets","Cushioned insole","Rubber sole"] },
  { id:8, keywords:"canvas,sneakers",  name:"Canvas Low-Top Sneakers", gender:'men', category:'men-footwear', brand:"Trend Co",
    price:2299, oldPrice:0, rating:4.4, reviews:145, sizes:SIZES.footMen, colors:colorsOf(["White","Grey","Navy"]),
    isNew:true, isSale:false,
    desc:"Everyday canvas sneakers with a cushioned footbed built for all-day wear.",
    features:["Breathable canvas upper","Cushioned footbed","Lace-up closure","Rubber outsole"] },
  { id:9, keywords:"leather,wallet",  name:"Leather Wallet & Belt Set", gender:'men', category:'men-accessories', brand:"Heritage Craft",
    price:1299, oldPrice:1599, rating:4.6, reviews:33, sizes:SIZES.accessory, colors:colorsOf(["Black","Brown"]),
    isNew:false, isSale:true,
    desc:"A matching leather wallet and belt set, gift-boxed and ready to wear.",
    features:["Genuine leather","Bi-fold wallet, 6 card slots","Reversible belt buckle","Gift box included"] },

  { id:10, keywords:"womens,maxi,dress", name:"Floral Maxi Gown", gender:'women', category:'women-dresses', brand:"Aria Studio",
    price:3299, oldPrice:3999, rating:4.7, reviews:188, sizes:SIZES.apparel, colors:colorsOf(["Pink","Peach","White"]),
    isNew:false, isSale:true,
    desc:"A flowing floor-length gown in printed georgette, made for golden-hour occasions.",
    features:["Printed georgette","Flowing maxi silhouette","Concealed back zip","Lined bodice"] },
  { id:11, keywords:"little,black,dress", name:"Little Black Dress", gender:'women', category:'women-dresses', brand:"Luxe Line",
    price:2799, oldPrice:0, rating:4.8, reviews:210, sizes:SIZES.apparel, colors:colorsOf(["Black"]),
    isNew:true, isSale:false,
    desc:"The wardrobe essential — a fitted silhouette in structured crepe that works for any evening.",
    features:["Structured crepe fabric","Fitted silhouette","Knee length","Hidden side zip"] },
  { id:12, keywords:"womens,silk,blouse", name:"Silk Wrap Blouse", gender:'women', category:'women-tops', brand:"Bloom & Co",
    price:1699, oldPrice:0, rating:4.3, reviews:52, sizes:SIZES.apparel, colors:colorsOf(["White","Beige","Pink"]),
    isNew:false, isSale:false,
    desc:"A fluid silk-blend wrap blouse that transitions easily from desk to dinner.",
    features:["Silk-blend fabric","Wrap-front tie detail","Three-quarter sleeves","Hand wash cold"] },
  { id:13, keywords:"womens,ruffle,top", name:"Ruffle Sleeve Top", gender:'women', category:'women-tops', brand:"Bloom & Co",
    price:1399, oldPrice:1699, rating:4.2, reviews:40, sizes:SIZES.apparel, colors:colorsOf(["Pink","White","Mustard"]),
    isNew:false, isSale:true,
    desc:"A playful ruffle-sleeve top in soft crepe, perfect for brunch or the studio.",
    features:["Soft crepe fabric","Ruffle sleeve detail","Relaxed fit","Machine washable"] },
  { id:14, keywords:"womens,skinny,jeans", name:"High-Waist Skinny Jeans", gender:'women', category:'women-jeans-skirts', brand:"Urbane Threads",
    price:2099, oldPrice:0, rating:4.5, reviews:165, sizes:SIZES.apparel, colors:colorsOf(["Blue","Black"]),
    isNew:false, isSale:false,
    desc:"Sculpting stretch denim with a flattering high-rise waistband.",
    features:["Stretch denim blend","High-rise waist","Skinny leg","Five-pocket styling"] },
  { id:15, keywords:"pleated,midi,skirt", name:"Pleated Midi Skirt", gender:'women', category:'women-jeans-skirts', brand:"Luxe Line",
    price:1899, oldPrice:0, rating:4.4, reviews:47, sizes:SIZES.apparel, colors:colorsOf(["Beige","Black","Mustard"]),
    isNew:true, isSale:false,
    desc:"Fine box pleats in a fluid midi length that moves beautifully with every step.",
    features:["Fine box pleats","Midi length","Elasticated back waist","Fully lined"] },
  { id:16, keywords:"womens,block,heels", name:"Strappy Block Heels", gender:'women', category:'women-footwear', brand:"Luxe Line",
    price:2599, oldPrice:2999, rating:4.5, reviews:98, sizes:SIZES.footWomen, colors:colorsOf(["Black","Gold","Beige"]),
    isNew:false, isSale:true,
    desc:"Comfort-height block heels with delicate ankle straps for all-day elegance.",
    features:["Faux-leather straps","3-inch block heel","Cushioned footbed","Buckle ankle closure"] },
  { id:17, keywords:"gold,earrings", name:"Statement Gold Earrings", gender:'women', category:'women-accessories', brand:"Aria Studio",
    price:999, oldPrice:0, rating:4.7, reviews:120, sizes:SIZES.accessory, colors:colorsOf(["Gold"]),
    isNew:true, isSale:false,
    desc:"Hand-finished statement earrings plated in 18k gold for a luxe finishing touch.",
    features:["18k gold plated","Hypoallergenic posts","Gift pouch included","Lightweight design"] },

  { id:18, keywords:"boy,polo,shirt", name:"Boys Printed Polo Tee", gender:'kids', category:'kids-boys', brand:"Comfy Kids",
    price:799, oldPrice:0, rating:4.4, reviews:30, sizes:SIZES.kidsCloth, colors:colorsOf(["Blue","White","Green"]),
    isNew:false, isSale:false,
    desc:"A breathable cotton polo with a playful print, built for playground days.",
    features:["100% cotton","Ribbed collar","Machine washable","Pre-shrunk fabric"] },
  { id:19, keywords:"boy,cargo,shorts", name:"Boys Cargo Shorts", gender:'kids', category:'kids-boys', brand:"Comfy Kids",
    price:899, oldPrice:1099, rating:4.3, reviews:22, sizes:SIZES.kidsCloth, colors:colorsOf(["Beige","Grey"]),
    isNew:false, isSale:true,
    desc:"Durable cargo shorts with an adjustable waistband for growing kids.",
    features:["Cotton-blend twill","Adjustable waist","Multiple pockets","Machine washable"] },
  { id:20, keywords:"girl,party,dress", name:"Girls Party Frock", gender:'kids', category:'kids-girls', brand:"Little Sprout",
    price:1499, oldPrice:0, rating:4.6, reviews:44, sizes:SIZES.kidsCloth, colors:colorsOf(["Pink","Peach","White"]),
    isNew:true, isSale:false,
    desc:"A twirl-worthy tulle-skirted frock for birthdays and celebrations.",
    features:["Tulle overlay skirt","Soft cotton lining","Back zip closure","Hand wash recommended"] },
  { id:21, keywords:"kids,denim,overalls", name:"Girls Denim Dungaree", gender:'kids', category:'kids-girls', brand:"Little Sprout",
    price:1299, oldPrice:0, rating:4.5, reviews:35, sizes:SIZES.kidsCloth, colors:colorsOf(["Blue"]),
    isNew:false, isSale:false,
    desc:"A classic denim dungaree that layers easily over tees for everyday adventures.",
    features:["Soft denim fabric","Adjustable straps","Front pocket detail","Machine washable"] },
  { id:22, keywords:"baby,romper", name:"Infant Cotton Romper Set", gender:'kids', category:'kids-infant', brand:"Little Sprout",
    price:999, oldPrice:0, rating:4.7, reviews:58, sizes:SIZES.infant, colors:colorsOf(["White","Peach","Green"]),
    isNew:false, isSale:false,
    desc:"A snap-easy cotton romper set designed for sensitive newborn skin.",
    features:["Organic cotton","Snap-button closure","Set of 2","Machine washable"] },
  { id:23, keywords:"baby,sleepsuit", name:"Infant Sleep Suit", gender:'kids', category:'kids-infant', brand:"Comfy Kids",
    price:849, oldPrice:999, rating:4.6, reviews:29, sizes:SIZES.infant, colors:colorsOf(["White","Grey"]),
    isNew:false, isSale:true,
    desc:"A footed sleep suit in brushed cotton to keep little ones cosy through the night.",
    features:["Brushed cotton","Footed design","Front snap closure","Machine washable"] },
  { id:24, keywords:"kids,sneakers", name:"Kids Light-Up Sneakers", gender:'kids', category:'kids-footwear', brand:"Trend Co",
    price:1599, oldPrice:0, rating:4.5, reviews:67, sizes:SIZES.kidsFoot, colors:colorsOf(["Black","Pink","Blue"]),
    isNew:true, isSale:false,
    desc:"Light-up sneakers with a hook-and-loop strap made for first walkers and playground pros alike.",
    features:["Light-up sole","Hook-and-loop strap","Cushioned insole","Non-marking outsole"] },
  { id:25, keywords:"kids,backpack", name:"Kids Cap & Backpack Set", gender:'kids', category:'kids-accessories', brand:"Comfy Kids",
    price:1199, oldPrice:0, rating:4.3, reviews:18, sizes:SIZES.accessory, colors:colorsOf(["Navy","Red"]),
    isNew:false, isSale:false,
    desc:"A matching cap and mini backpack set, sized just right for school runs and day trips.",
    features:["Cotton twill cap","Lightweight backpack","Adjustable straps","Spot clean only"] },
];
PRODUCTS.forEach(p => { p.images = [img(p.keywords, p.id*10+1), img(p.keywords, p.id*10+2), img(p.keywords, p.id*10+3)]; });

function getProductById(id){ return PRODUCTS.find(p => p.id === Number(id)); }

/* ==========================================================================
   2. STORAGE HELPERS  (all data kept in localStorage — simulated backend)
   ========================================================================== */
const STORE = {
  cart:        'stylehub_cart',
  wishlist:    'stylehub_wishlist',
  users:       'stylehub_users',
  session:     'stylehub_session',
  orders:      'stylehub_orders_',      // + email
  addresses:   'stylehub_addresses_',   // + email
  prefs:       'stylehub_prefs_',       // + email
  coupon:      'stylehub_coupon',
  saleEnd:     'stylehub_sale_end',
  reviews:     'stylehub_reviews_',     // + product id
};
function readJSON(key, fallback){
  try{ const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch(e){ return fallback; }
}
function writeJSON(key, value){
  try{ localStorage.setItem(key, JSON.stringify(value)); }catch(e){ /* storage unavailable */ }
}

/* ---- cart ---- */
function getCart(){ return readJSON(STORE.cart, []); }
function saveCart(cart){ writeJSON(STORE.cart, cart); updateHeaderBadges(); }
function addToCart(item){
  const cart = getCart();
  const existing = cart.find(c => c.productId === item.productId && c.size === item.size && c.color === item.color);
  if(existing){ existing.qty += item.qty; }
  else{ cart.push(item); }
  saveCart(cart);
}
function removeFromCart(index){
  const cart = getCart();
  cart.splice(index,1);
  saveCart(cart);
}
function setCartQty(index, qty){
  const cart = getCart();
  if(!cart[index]) return;
  cart[index].qty = Math.max(1, Math.min(10, qty));
  saveCart(cart);
}
function cartSubtotal(){
  return getCart().reduce((sum,i) => sum + i.price * i.qty, 0);
}
function cartCount(){
  return getCart().reduce((sum,i) => sum + i.qty, 0);
}

/* ---- wishlist ---- */
function getWishlist(){ return readJSON(STORE.wishlist, []); }
function toggleWishlist(id){
  let list = getWishlist();
  if(list.includes(id)) list = list.filter(x => x !== id);
  else list.push(id);
  writeJSON(STORE.wishlist, list);
  updateHeaderBadges();
  return list.includes(id);
}

/* ---- auth ---- */
function getUsers(){ return readJSON(STORE.users, []); }
function saveUsers(u){ writeJSON(STORE.users, u); }
function getSession(){ return readJSON(STORE.session, null); }
function setSession(session){ writeJSON(STORE.session, session); }
function clearSession(){ localStorage.removeItem(STORE.session); }

/* ---- coupons ---- */
const COUPONS = {
  'WELCOME10': { type:'percent', value:10, label:'10% off' },
  'FASHION20': { type:'percent', value:20, label:'20% off' },
  'FLAT200':   { type:'flat', value:200, label:'₹200 off' },
};
function getAppliedCoupon(){ return readJSON(STORE.coupon, null); }
function setAppliedCoupon(code){ writeJSON(STORE.coupon, code); }
function computeDiscount(subtotal){
  const code = getAppliedCoupon();
  if(!code || !COUPONS[code]) return 0;
  const c = COUPONS[code];
  return c.type === 'percent' ? Math.round(subtotal * c.value / 100) : Math.min(c.value, subtotal);
}
function computeShipping(subtotal){
  return subtotal === 0 ? 0 : (subtotal >= 2999 ? 0 : 99);
}

/* ==========================================================================
   3. TOAST NOTIFICATIONS
   ========================================================================== */
let toastTimer = null;
function showToast(message, icon = 'fa-circle-check'){
  let toast = qs('#globalToast');
  if(!toast){
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.id = 'globalToast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${escapeHtml(message)}</span>`;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

/* ==========================================================================
   4. SHARED HEADER / FOOTER BEHAVIOUR (runs on every page)
   ========================================================================== */
function updateHeaderBadges(){
  qsa('.cart-count').forEach(el => el.textContent = cartCount());
  qsa('.wishlist-count').forEach(el => el.textContent = getWishlist().length);
}
function updateAccountLink(){
  const link = qs('#accountLink');
  if(!link) return;
  link.href = getSession() ? 'account.html' : 'login.html';
}
function initHeaderFooter(){
  updateHeaderBadges();
  updateAccountLink();

  // mobile nav toggle
  const toggle = qs('#navToggle');
  const nav = qs('#mainNav');
  if(toggle && nav){
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      toggle.innerHTML = nav.classList.contains('open')
        ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
    });
    qsa('a', nav).forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
    }));
  }

  // header search -> redirect to listing page with query
  const searchForm = qs('#searchForm');
  if(searchForm){
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = qs('#searchInput', searchForm).value.trim();
      window.location.href = 'products.html' + (val ? `?q=${encodeURIComponent(val)}` : '');
    });
  }

  // footer year
  qsa('.current-year').forEach(el => el.textContent = new Date().getFullYear());

  // newsletter forms (home + footer)
  qsa('.newsletter-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = qs('input', form);
      if(input && input.value.trim()){
        showToast('Subscribed! Welcome to the StyleHub list.', 'fa-envelope-circle-check');
        form.reset();
      }
    });
  });

  // wishlist heart buttons anywhere (event delegation)
  document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('.wishlist-btn');
    if(!btn) return;
    e.preventDefault();
    const id = Number(btn.dataset.id);
    const active = toggleWishlist(id);
    btn.classList.toggle('is-active', active);
    btn.innerHTML = active ? '<i class="fa-solid fa-heart"></i>' : '<i class="fa-regular fa-heart"></i>';
    showToast(active ? 'Added to wishlist' : 'Removed from wishlist', 'fa-heart');
  });
}

/* ==========================================================================
   5. PRODUCT CARD RENDERER (shared by home, listing, related & wishlist)
   ========================================================================== */
function productCardHTML(p){
  const wished = getWishlist().includes(p.id);
  return `
  <div class="product-card" data-id="${p.id}">
    <div class="product-thumb">
      <a href="product.html?id=${p.id}"><img src="${p.images[0]}" alt="${escapeHtml(p.name)}" loading="lazy"></a>
      <div class="product-flags">
        ${p.isNew ? '<span class="flag new">New</span>' : ''}
        ${p.isSale ? '<span class="flag sale">Sale</span>' : ''}
      </div>
      <div class="thumb-actions">
        <button class="wishlist-btn ${wished?'is-active':''}" data-id="${p.id}" title="Add to wishlist">
          <i class="fa-${wished?'solid':'regular'} fa-heart"></i>
        </button>
      </div>
      <a href="product.html?id=${p.id}" class="quick-add">View Product</a>
    </div>
    <a href="product.html?id=${p.id}" style="display:block;">
      <div class="product-info">
        <div class="product-cat">${catLabel(p.category)}</div>
        <h3 class="product-name">${escapeHtml(p.name)}</h3>
        <div class="stars">${starString(p.rating)} <span style="color:var(--gray);font-size:.75rem;">(${p.reviews})</span></div>
        <div class="product-price">
          <span class="price-now">${formatPrice(p.price)}</span>
          ${p.oldPrice ? `<span class="price-old">${formatPrice(p.oldPrice)}</span>` : ''}
        </div>
      </div>
    </a>
  </div>`;
}

/* ==========================================================================
   6. SCROLL REVEAL (subtle, used across pages)
   ========================================================================== */
function initScrollReveal(){
  const els = qsa('.reveal');
  if(!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){ entry.target.classList.add('in'); obs.unobserve(entry.target); }
    });
  }, { threshold: .15 });
  els.forEach(el => obs.observe(el));
}

/* ==========================================================================
   7. HOME PAGE
   ========================================================================== */
function initHome(){
  const featuredGrid = qs('#featuredGrid');
  if(featuredGrid){
    const featured = PRODUCTS.filter(p => p.isNew || p.isSale).slice(0,8);
    featuredGrid.innerHTML = featured.map(productCardHTML).join('');
  }

  // countdown timer for seasonal offer, persisted so it doesn't reset on refresh
  const countdownEl = qs('#countdown');
  if(countdownEl){
    let end = Number(localStorage.getItem(STORE.saleEnd));
    if(!end || end < Date.now()){
      end = Date.now() + 1000*60*60*24*4; // 4 days from first visit
      localStorage.setItem(STORE.saleEnd, String(end));
    }
    const tick = () => {
      const diff = Math.max(0, end - Date.now());
      const d = Math.floor(diff/86400000);
      const h = Math.floor(diff%86400000/3600000);
      const m = Math.floor(diff%3600000/60000);
      const s = Math.floor(diff%60000/1000);
      qs('#cdDays', countdownEl).textContent = String(d).padStart(2,'0');
      qs('#cdHours', countdownEl).textContent = String(h).padStart(2,'0');
      qs('#cdMins', countdownEl).textContent = String(m).padStart(2,'0');
      qs('#cdSecs', countdownEl).textContent = String(s).padStart(2,'0');
    };
    tick();
    setInterval(tick, 1000);
  }
}

/* ==========================================================================
   8. PRODUCT LISTING PAGE
   ========================================================================== */
function initListingPage(){
  const grid = qs('#productGrid');
  const filtersForm = qs('#filters');
  const PAGE_SIZE = 8;
  let currentPage = 1;

  // build category checkboxes
  const catWrap = qs('#categoryFilters');
  if(catWrap){
    catWrap.innerHTML = CATEGORIES.map(c => `
      <label class="check-row">
        <input type="checkbox" value="${c.slug}" data-filter="category">
        ${c.genderLabel}'s ${c.label}
      </label>`).join('');
  }
  // brand checkboxes
  const brandWrap = qs('#brandFilters');
  if(brandWrap){
    const brands = [...new Set(PRODUCTS.map(p => p.brand))].sort();
    brandWrap.innerHTML = brands.map(b => `
      <label class="check-row"><input type="checkbox" value="${b}" data-filter="brand"> ${b}</label>`).join('');
  }
  // color dots
  const colorWrap = qs('#colorFilters');
  if(colorWrap){
    colorWrap.innerHTML = Object.entries(COLOR_SWATCH).map(([name,hex]) => `
      <span class="color-dot" data-filter="color" data-value="${name}" title="${name}" style="background:${hex};"></span>`).join('');
  }
  // size chips
  const sizeWrap = qs('#sizeFilters');
  if(sizeWrap){
    const allSizes = [...new Set(Object.values(SIZES).flat())];
    sizeWrap.innerHTML = allSizes.map(s => `
      <label class="check-row"><input type="checkbox" value="${s}" data-filter="size"> ${s}</label>`).join('');
  }

  function readFilters(){
    const genders = qsa('input[data-filter="gender"]:checked').map(i => i.value);
    const cats = qsa('input[data-filter="category"]:checked').map(i => i.value);
    const brands = qsa('input[data-filter="brand"]:checked').map(i => i.value);
    const sizes = qsa('input[data-filter="size"]:checked').map(i => i.value);
    const colors = qsa('.color-dot.active').map(i => i.dataset.value);
    const maxPrice = qs('#priceRange') ? Number(qs('#priceRange').value) : 10000;
    const q = getParam('q') || '';
    return { genders, cats, brands, sizes, colors, maxPrice, q };
  }

  function applyFilters(resetPage = true){
    const f = readFilters();
    let list = PRODUCTS.filter(p => {
      if(f.genders.length && !f.genders.includes(p.gender)) return false;
      if(f.cats.length && !f.cats.includes(p.category)) return false;
      if(f.brands.length && !f.brands.includes(p.brand)) return false;
      if(f.sizes.length && !p.sizes.some(s => f.sizes.includes(s))) return false;
      if(f.colors.length && !p.colors.some(c => f.colors.includes(c.name))) return false;
      if(p.price > f.maxPrice) return false;
      if(f.q && !(p.name.toLowerCase().includes(f.q.toLowerCase()) || p.brand.toLowerCase().includes(f.q.toLowerCase()))) return false;
      return true;
    });

    const sortVal = qs('#sortSelect') ? qs('#sortSelect').value : 'featured';
    if(sortVal === 'price-asc') list.sort((a,b) => a.price - b.price);
    else if(sortVal === 'price-desc') list.sort((a,b) => b.price - a.price);
    else if(sortVal === 'rating') list.sort((a,b) => b.rating - a.rating);
    else if(sortVal === 'newest') list.sort((a,b) => (b.isNew - a.isNew));

    if(resetPage) currentPage = 1;
    renderActiveChips(f);
    renderResults(list);
  }

  function renderResults(list){
    const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    currentPage = Math.min(currentPage, totalPages);
    const pageItems = list.slice((currentPage-1)*PAGE_SIZE, currentPage*PAGE_SIZE);

    qs('#resultCount').textContent = `Showing ${list.length ? (currentPage-1)*PAGE_SIZE+1 : 0}–${Math.min(currentPage*PAGE_SIZE,list.length)} of ${list.length} products`;

    grid.innerHTML = pageItems.length ? pageItems.map(productCardHTML).join('') : `
      <div class="empty-state" style="grid-column:1/-1;">
        <div class="icon"><i class="fa-solid fa-magnifying-glass"></i></div>
        <h3>No products match your filters</h3>
        <p>Try clearing a few filters to see more results.</p>
      </div>`;

    const pag = qs('#pagination');
    if(pag){
      let html = '';
      for(let i=1;i<=totalPages;i++){
        html += `<a href="#" data-page="${i}" class="${i===currentPage?'active':''}">${i}</a>`;
      }
      pag.innerHTML = totalPages > 1 ? html : '';
    }
  }

  function renderActiveChips(f){
    const wrap = qs('#activeFilters');
    if(!wrap) return;
    const chips = [];
    f.genders.forEach(g => chips.push({label:g, group:'gender', value:g}));
    f.cats.forEach(c => chips.push({label:catLabel(c), group:'category', value:c}));
    f.brands.forEach(b => chips.push({label:b, group:'brand', value:b}));
    f.sizes.forEach(s => chips.push({label:'Size '+s, group:'size', value:s}));
    f.colors.forEach(c => chips.push({label:c, group:'color', value:c}));
    wrap.innerHTML = chips.map(c => `
      <span class="chip" data-group="${c.group}" data-value="${escapeHtml(c.value)}">${escapeHtml(c.label)} <button aria-label="remove">&times;</button></span>`).join('');
  }

  // events
  filtersForm.addEventListener('change', (e) => {
    if(e.target.matches('input[type="checkbox"]')) applyFilters();
  });
  filtersForm.addEventListener('click', (e) => {
    const dot = e.target.closest('.color-dot');
    if(dot){ dot.classList.toggle('active'); applyFilters(); }
  });
  const priceRange = qs('#priceRange');
  if(priceRange){
    priceRange.addEventListener('input', () => {
      qs('#priceRangeValue').textContent = formatPrice(priceRange.value);
      applyFilters();
    });
  }
  const sortSelect = qs('#sortSelect');
  if(sortSelect) sortSelect.addEventListener('change', () => applyFilters(false));

  const clearBtn = qs('#clearFilters');
  if(clearBtn) clearBtn.addEventListener('click', () => {
    qsa('input[type="checkbox"]', filtersForm).forEach(i => i.checked = false);
    qsa('.color-dot.active', filtersForm).forEach(i => i.classList.remove('active'));
    if(priceRange){ priceRange.value = priceRange.max; qs('#priceRangeValue').textContent = formatPrice(priceRange.max); }
    history.replaceState(null, '', 'products.html');
    applyFilters();
  });

  qs('#activeFilters').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if(!btn) return;
    const chip = btn.closest('.chip');
    const { group, value } = chip.dataset;
    if(group === 'color'){
      const dot = qsa('.color-dot').find(d => d.dataset.value === value);
      if(dot) dot.classList.remove('active');
    } else {
      const input = qsa(`input[data-filter="${group}"]`).find(i => i.value === value);
      if(input) input.checked = false;
    }
    applyFilters();
  });

  qs('#pagination').addEventListener('click', (e) => {
    e.preventDefault();
    const a = e.target.closest('a[data-page]');
    if(!a) return;
    currentPage = Number(a.dataset.page);
    applyFilters(false);
    window.scrollTo({ top: qs('#productGrid').offsetTop - 120, behavior:'smooth' });
  });

  // preset filters from URL (?gender=men&category=women-dresses&q=...)
  const gParam = getParam('gender');
  const cParam = getParam('category');
  if(gParam){
    const box = qsa('input[data-filter="gender"]').find(i => i.value === gParam);
    if(box) box.checked = true;
  }
  if(cParam){
    const box = qsa('input[data-filter="category"]').find(i => i.value === cParam);
    if(box) box.checked = true;
  }
  const pageTitle = qs('#listingTitle');
  if(pageTitle && gParam){
    const g = { men:'Men', women:'Women', kids:'Kids' }[gParam];
    if(g) pageTitle.textContent = `${g}'s Collection`;
  }

  applyFilters();
}

/* ==========================================================================
   9. PRODUCT DETAIL PAGE
   ========================================================================== */
function initProductDetail(){
  const id = Number(getParam('id')) || PRODUCTS[0].id;
  const p = getProductById(id) || PRODUCTS[0];
  let selectedSize = null;
  let selectedColor = p.colors[0].name;
  let qty = 1;

  document.title = `${p.name} — StyleHub`;
  qs('#pdName').textContent = p.name;
  qs('#pdBrand').textContent = p.brand;
  qs('#pdBannerTitle').textContent = p.name;
  qs('#pdBreadcrumbCat').textContent = catLabel(p.category);
  qs('#pdBreadcrumbCat').href = `products.html?gender=${p.gender}`;
  qs('#pdBreadcrumbName').textContent = p.name;
  qs('#pdStars').innerHTML = starString(p.rating);
  qs('#pdReviewCount').textContent = `${p.reviews} Reviews`;
  qs('#pdPrice').textContent = formatPrice(p.price);
  qs('#pdOldPrice').textContent = p.oldPrice ? formatPrice(p.oldPrice) : '';
  qs('#pdShortDesc').textContent = p.desc;
  qs('#pdFullDesc').textContent = p.desc;
  qs('#pdMainImage').src = p.images[0];
  qs('#pdMainImage').alt = p.name;

  qs('#pdThumbs').innerHTML = p.images.map((src,i) => `<img src="${src}" class="${i===0?'active':''}" data-i="${i}" alt="${escapeHtml(p.name)} view ${i+1}">`).join('');
  qs('#pdThumbs').addEventListener('click', (e) => {
    const img = e.target.closest('img');
    if(!img) return;
    qsa('img', qs('#pdThumbs')).forEach(t => t.classList.remove('active'));
    img.classList.add('active');
    qs('#pdMainImage').src = img.src;
  });

  qs('#pdColors').innerHTML = p.colors.map(c => `
    <span class="color-dot ${c.name===selectedColor?'active':''}" data-name="${c.name}" style="background:${c.hex};" title="${c.name}"></span>`).join('');
  qs('#pdSelectedColor').textContent = selectedColor;
  qs('#pdColors').addEventListener('click', (e) => {
    const dot = e.target.closest('.color-dot');
    if(!dot) return;
    qsa('.color-dot', qs('#pdColors')).forEach(d => d.classList.remove('active'));
    dot.classList.add('active');
    selectedColor = dot.dataset.name;
    qs('#pdSelectedColor').textContent = selectedColor;
  });

  qs('#pdSizes').innerHTML = p.sizes.map(s => `<span class="size-box" data-size="${s}">${s}</span>`).join('');
  qs('#pdSizes').addEventListener('click', (e) => {
    const box = e.target.closest('.size-box');
    if(!box) return;
    qsa('.size-box', qs('#pdSizes')).forEach(b => b.classList.remove('active'));
    box.classList.add('active');
    selectedSize = box.dataset.size;
    qs('#pdSelectedSize').textContent = selectedSize;
  });

  const qtyInput = qs('#pdQty');
  qs('#pdQtyMinus').addEventListener('click', () => { qty = Math.max(1, qty-1); qtyInput.value = qty; });
  qs('#pdQtyPlus').addEventListener('click', () => { qty = Math.min(10, qty+1); qtyInput.value = qty; });
  qtyInput.addEventListener('change', () => { qty = Math.max(1, Math.min(10, Number(qtyInput.value)||1)); qtyInput.value = qty; });

  const wishBtn = qs('#pdWishlistBtn');
  const isWished = getWishlist().includes(p.id);
  wishBtn.classList.toggle('is-active', isWished);
  wishBtn.innerHTML = `<i class="fa-${isWished?'solid':'regular'} fa-heart"></i> ${isWished?'Wishlisted':'Wishlist'}`;
  wishBtn.addEventListener('click', () => {
    const active = toggleWishlist(p.id);
    wishBtn.classList.toggle('is-active', active);
    wishBtn.innerHTML = `<i class="fa-${active?'solid':'regular'} fa-heart"></i> ${active?'Wishlisted':'Wishlist'}`;
  });

  qs('#addToCartBtn').addEventListener('click', () => {
    if(!selectedSize){ showToast('Please select a size first', 'fa-triangle-exclamation'); return; }
    addToCart({ productId:p.id, name:p.name, image:p.images[0], price:p.price, size:selectedSize, color:selectedColor, qty });
    showToast(`Added to cart: ${p.name}`, 'fa-bag-shopping');
  });

  // tabs
  qs('#pdFeatures').innerHTML = p.features.map(f => `<li>${escapeHtml(f)}</li>`).join('');
  qsa('.tab-nav button').forEach(btn => btn.addEventListener('click', () => {
    qsa('.tab-nav button').forEach(b => b.classList.remove('active'));
    qsa('.tab-panel').forEach(pn => pn.classList.remove('active'));
    btn.classList.add('active');
    qs('#tab-' + btn.dataset.tab).classList.add('active');
  }));

  // reviews (persisted per product, seeded with two sample reviews)
  const reviewsKey = STORE.reviews + p.id;
  let reviews = readJSON(reviewsKey, null);
  if(!reviews){
    reviews = [
      { name:'Ananya S.', rating:5, date:'2 weeks ago', text:'Excellent quality and true to size. Would definitely buy again.' },
      { name:'Rohit K.', rating:4, date:'1 month ago', text:'Great fit and fast delivery. Colour is slightly different from photos but still nice.' },
    ];
    writeJSON(reviewsKey, reviews);
  }
  function renderReviews(){
    qs('#reviewsList').innerHTML = reviews.map(r => `
      <div class="review-item">
        <div class="review-head"><strong>${escapeHtml(r.name)}</strong><span>${escapeHtml(r.date)}</span></div>
        <div class="stars">${starString(r.rating)}</div>
        <p style="margin-top:6px;font-size:.9rem;color:#4d4d5e;">${escapeHtml(r.text)}</p>
      </div>`).join('');
  }
  renderReviews();
  const reviewForm = qs('#reviewForm');
  if(reviewForm){
    reviewForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = qs('#reviewName').value.trim() || 'Anonymous';
      const rating = Number(qs('#reviewRating').value);
      const text = qs('#reviewText').value.trim();
      if(!text){ showToast('Please write a short review first', 'fa-triangle-exclamation'); return; }
      reviews.unshift({ name, rating, date:'Just now', text });
      writeJSON(reviewsKey, reviews);
      renderReviews();
      reviewForm.reset();
      showToast('Thanks! Your review has been posted.', 'fa-comment-dots');
    });
  }

  // related products
  const related = PRODUCTS.filter(r => r.category === p.category && r.id !== p.id).slice(0,4);
  const relatedFallback = related.length ? related : PRODUCTS.filter(r => r.gender === p.gender && r.id !== p.id).slice(0,4);
  qs('#relatedGrid').innerHTML = relatedFallback.map(productCardHTML).join('');
}

/* ==========================================================================
   10. CART PAGE
   ========================================================================== */
function initCartPage(){
  function render(){
    const cart = getCart();
    const empty = qs('#cartEmpty');
    const content = qs('#cartHasItems');
    if(!cart.length){
      empty.style.display = 'block';
      content.style.display = 'none';
      return;
    }
    empty.style.display = 'none';
    content.style.display = 'grid';

    qs('#cartTableBody').innerHTML = cart.map((item, i) => `
      <tr>
        <td>
          <div class="cart-item-info">
            <img src="${item.image}" alt="${escapeHtml(item.name)}">
            <div>
              <div class="cart-item-name">${escapeHtml(item.name)}</div>
              <div class="cart-item-variant">Size: ${escapeHtml(item.size)} &nbsp;•&nbsp; Color: ${escapeHtml(item.color)}</div>
              <span class="remove-link" data-remove="${i}">Remove</span>
            </div>
          </div>
        </td>
        <td>${formatPrice(item.price)}</td>
        <td>
          <div class="qty-selector">
            <button data-qty-minus="${i}">−</button>
            <input type="number" min="1" max="10" value="${item.qty}" data-qty-input="${i}">
            <button data-qty-plus="${i}">+</button>
          </div>
        </td>
        <td><strong>${formatPrice(item.price*item.qty)}</strong></td>
      </tr>`).join('');

    const subtotal = cartSubtotal();
    const shipping = computeShipping(subtotal);
    const discount = computeDiscount(subtotal);
    const total = Math.max(0, subtotal + shipping - discount);

    qs('#sumSubtotal').textContent = formatPrice(subtotal);
    qs('#sumShipping').textContent = shipping === 0 ? 'Free' : formatPrice(shipping);
    const discRow = qs('#sumDiscountRow');
    if(discount > 0){ discRow.style.display='flex'; qs('#sumDiscount').textContent = '-' + formatPrice(discount); }
    else discRow.style.display = 'none';
    qs('#sumTotal').textContent = formatPrice(total);

    const code = getAppliedCoupon();
    if(code){ qs('#couponInput').value = code; qs('#couponMsg').textContent = `Coupon "${code}" applied (${COUPONS[code].label}).`; qs('#couponMsg').className = 'coupon-msg ok'; }
  }

  document.body.addEventListener('click', (e) => {
    if(e.target.matches('[data-remove]')){ removeFromCart(Number(e.target.dataset.remove)); render(); }
    if(e.target.matches('[data-qty-minus]')){
      const i = Number(e.target.dataset.qtyMinus);
      setCartQty(i, getCart()[i].qty - 1); render();
    }
    if(e.target.matches('[data-qty-plus]')){
      const i = Number(e.target.dataset.qtyPlus);
      setCartQty(i, getCart()[i].qty + 1); render();
    }
  });
  document.body.addEventListener('change', (e) => {
    if(e.target.matches('[data-qty-input]')){
      const i = Number(e.target.dataset.qtyInput);
      setCartQty(i, Number(e.target.value) || 1); render();
    }
  });

  qs('#applyCouponBtn').addEventListener('click', () => {
    const code = qs('#couponInput').value.trim().toUpperCase();
    const msg = qs('#couponMsg');
    if(!code){ msg.textContent = ''; return; }
    if(COUPONS[code]){
      setAppliedCoupon(code);
      msg.textContent = `Coupon "${code}" applied (${COUPONS[code].label}).`;
      msg.className = 'coupon-msg ok';
      showToast('Coupon applied successfully', 'fa-tag');
    } else {
      msg.textContent = 'Invalid coupon code. Try WELCOME10, FASHION20 or FLAT200.';
      msg.className = 'coupon-msg err';
    }
    render();
  });

  render();
}

/* ==========================================================================
   11. CHECKOUT PAGE
   ========================================================================== */
function initCheckoutPage(){
  const cart = getCart();
  const formSection = qs('#checkoutFormSection');
  const confirmSection = qs('#orderConfirmation');
  const emptySection = qs('#checkoutEmpty');

  if(!cart.length){
    formSection.style.display = 'none';
    confirmSection.style.display = 'none';
    emptySection.style.display = 'block';
    return;
  }

  function renderSummary(){
    qs('#checkoutOrderLines').innerHTML = cart.map(item => `
      <div class="order-line">
        <img src="${item.image}" alt="${escapeHtml(item.name)}">
        <div>
          <div class="order-line-name">${escapeHtml(item.name)}</div>
          <div class="order-line-meta">${escapeHtml(item.size)} / ${escapeHtml(item.color)} × ${item.qty}</div>
        </div>
        <div class="order-line-price">${formatPrice(item.price*item.qty)}</div>
      </div>`).join('');

    const subtotal = cartSubtotal();
    const shipping = computeShipping(subtotal);
    const discount = computeDiscount(subtotal);
    const total = Math.max(0, subtotal + shipping - discount);
    qs('#coSubtotal').textContent = formatPrice(subtotal);
    qs('#coShipping').textContent = shipping === 0 ? 'Free' : formatPrice(shipping);
    const discRow = qs('#coDiscountRow');
    if(discount>0){ discRow.style.display='flex'; qs('#coDiscount').textContent = '-'+formatPrice(discount); } else discRow.style.display='none';
    qs('#coTotal').textContent = formatPrice(total);
    return total;
  }
  renderSummary();

  const code = getAppliedCoupon();
  if(code) qs('#coCouponInput').value = code;
  qs('#coApplyCouponBtn').addEventListener('click', () => {
    const c = qs('#coCouponInput').value.trim().toUpperCase();
    const msg = qs('#coCouponMsg');
    if(COUPONS[c]){ setAppliedCoupon(c); msg.textContent = `Applied: ${COUPONS[c].label}`; msg.className='coupon-msg ok'; }
    else { msg.textContent = 'Invalid code.'; msg.className = 'coupon-msg err'; }
    renderSummary();
  });

  // payment method switching
  qsa('input[name="payment"]').forEach(radio => {
    radio.addEventListener('change', () => {
      qsa('.pay-method').forEach(pm => pm.classList.remove('active'));
      radio.closest('.pay-method').classList.add('active');
      qs('#cardFields').classList.toggle('show', radio.value === 'card');
    });
  });

  const form = qs('#checkoutForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    qsa('[required]', form).forEach(field => {
      const wrap = field.closest('.form-field');
      if(!wrap) return;
      const visible = field.offsetParent !== null;
      if(visible && !field.value.trim()){ wrap.classList.add('invalid'); valid = false; }
      else wrap.classList.remove('invalid');
    });
    if(!valid){ showToast('Please fill in all required fields', 'fa-triangle-exclamation'); return; }

    const total = renderSummary();
    const orderId = uid('SH');
    const session = getSession();
    const email = session ? session.email : 'guest@stylehub.com';
    const orders = readJSON(STORE.orders + email, []);
    orders.unshift({
      id: orderId,
      date: new Date().toISOString().slice(0,10),
      items: cart,
      total,
      status: 'Processing',
      address: qs('#shipAddress').value + ', ' + qs('#shipCity').value,
    });
    writeJSON(STORE.orders + email, orders);

    saveCart([]);
    setAppliedCoupon(null);

    qs('#confirmOrderId').textContent = orderId;
    const eta = new Date(Date.now() + 1000*60*60*24*5);
    qs('#confirmEta').textContent = eta.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' });
    formSection.style.display = 'none';
    confirmSection.style.display = 'block';
    window.scrollTo({ top:0, behavior:'smooth' });
  });
}

/* ==========================================================================
   12. ACCOUNT PAGE
   ========================================================================== */
function initAccountPage(){
  const session = getSession();
  if(!session){
    window.location.href = 'login.html?redirect=account';
    return;
  }
  qs('#acctName').textContent = session.name;
  qs('#acctEmail').textContent = session.email;
  qs('#acctInitial').textContent = session.name.charAt(0).toUpperCase();
  qs('#profileName').value = session.name;
  qs('#profileEmail').value = session.email;
  qs('#profilePhone').value = session.phone || '';

  // tab switching
  qsa('.account-menu button[data-panel]').forEach(btn => {
    btn.addEventListener('click', () => {
      qsa('.account-menu button').forEach(b => b.classList.remove('active'));
      qsa('.account-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      qs('#panel-' + btn.dataset.panel).classList.add('active');
    });
  });
  if(location.hash === '#wishlist'){
    qs('.account-menu button[data-panel="wishlist"]').click();
  }

  qs('.account-menu .logout').addEventListener('click', () => {
    clearSession();
    showToast('You have been logged out', 'fa-right-from-bracket');
    setTimeout(() => window.location.href = 'index.html', 800);
  });

  // profile save
  qs('#profileForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const updated = { ...session, name: qs('#profileName').value, phone: qs('#profilePhone').value };
    setSession(updated);
    qs('#acctName').textContent = updated.name;
    qs('#acctInitial').textContent = updated.name.charAt(0).toUpperCase();
    showToast('Profile updated successfully', 'fa-user-check');
  });

  // orders — seed sample history first time so the panel isn't empty
  const ordersKey = STORE.orders + session.email;
  let orders = readJSON(ordersKey, null);
  if(!orders){
    orders = [
      { id:'SH7X29K41', date:'2026-07-10', items:[{name:'Slim Fit Denim Jeans', image:getProductById(3).images[0], size:'M', color:'Blue', qty:1, price:2199}], total:2298, status:'Delivered' },
      { id:'SH8N41Q02', date:'2026-06-28', items:[{name:'Silk Wrap Blouse', image:getProductById(12).images[0], size:'S', color:'White', qty:1, price:1699}], total:1699, status:'Delivered' },
    ];
    writeJSON(ordersKey, orders);
  }
  const statusClass = { Delivered:'delivered', 'In Transit':'transit', Processing:'processing' };
  qs('#ordersList').innerHTML = orders.length ? orders.map(o => `
    <div class="order-card">
      <div class="order-card-top">
        <div><span>Order ID</span><strong>${o.id}</strong></div>
        <div><span>Date Placed</span><strong>${o.date}</strong></div>
        <div><span>Total</span><strong>${formatPrice(o.total)}</strong></div>
        <span class="status-pill ${statusClass[o.status]||'processing'}">${o.status}</span>
      </div>
      <div class="order-items-row">
        ${o.items.map(i => `<img src="${i.image}" alt="${escapeHtml(i.name)}" title="${escapeHtml(i.name)}">`).join('')}
      </div>
    </div>`).join('') : `<div class="empty-state"><div class="icon"><i class="fa-solid fa-box-open"></i></div><p>No orders yet.</p></div>`;

  // addresses
  const addrKey = STORE.addresses + session.email;
  let addresses = readJSON(addrKey, null);
  if(!addresses){
    addresses = [
      { id:1, label:'Home', name:session.name, line:'221B Baker Colony, Sector 12', city:'New Delhi', state:'Delhi', pin:'110001', phone:'+91 98765 43210', isDefault:true },
      { id:2, label:'Office', name:session.name, line:'4th Floor, Tech Park One', city:'Gurugram', state:'Haryana', pin:'122002', phone:'+91 98765 43210', isDefault:false },
    ];
    writeJSON(addrKey, addresses);
  }
  function renderAddresses(){
    qs('#addressGrid').innerHTML = addresses.map(a => `
      <div class="address-card ${a.isDefault?'default':''}">
        <h4>${escapeHtml(a.label)}</h4>
        <p>${escapeHtml(a.name)}<br>${escapeHtml(a.line)}, ${escapeHtml(a.city)}, ${escapeHtml(a.state)} - ${escapeHtml(a.pin)}<br>Phone: ${escapeHtml(a.phone)}</p>
        <div class="address-actions">
          ${!a.isDefault ? `<a href="#" data-default="${a.id}">Set as default</a>` : ''}
          <a href="#" data-delete-addr="${a.id}">Delete</a>
        </div>
      </div>`).join('');
  }
  renderAddresses();
  qs('#addressGrid').addEventListener('click', (e) => {
    e.preventDefault();
    if(e.target.matches('[data-default]')){
      const id = Number(e.target.dataset.default);
      addresses.forEach(a => a.isDefault = a.id === id);
      writeJSON(addrKey, addresses); renderAddresses();
    }
    if(e.target.matches('[data-delete-addr]')){
      const id = Number(e.target.dataset.deleteAddr);
      addresses = addresses.filter(a => a.id !== id);
      writeJSON(addrKey, addresses); renderAddresses();
    }
  });
  qs('#newAddressForm').addEventListener('submit', (e) => {
    e.preventDefault();
    addresses.push({
      id: Date.now(),
      label: qs('#addrLabel').value || 'Address',
      name: session.name,
      line: qs('#addrLine').value,
      city: qs('#addrCity').value,
      state: qs('#addrState').value,
      pin: qs('#addrPin').value,
      phone: qs('#addrPhone').value,
      isDefault: addresses.length === 0,
    });
    writeJSON(addrKey, addresses);
    renderAddresses();
    e.target.reset();
    showToast('Address added', 'fa-location-dot');
  });

  // wishlist panel
  function renderWishlist(){
    const ids = getWishlist();
    const items = ids.map(getProductById).filter(Boolean);
    qs('#wishlistGrid').innerHTML = items.length ? items.map(productCardHTML).join('') :
      `<div class="empty-state" style="grid-column:1/-1;"><div class="icon"><i class="fa-regular fa-heart"></i></div><p>Your wishlist is empty. Tap the heart icon on any product to save it here.</p></div>`;
  }
  renderWishlist();
  document.body.addEventListener('click', (e) => { if(e.target.closest('.wishlist-btn')) setTimeout(renderWishlist, 0); });

  // size preferences
  const prefsKey = STORE.prefs + session.email;
  const prefs = readJSON(prefsKey, { top:'M', bottom:'M', shoe:'8', fit:'Regular' });
  qs('#prefTop').value = prefs.top;
  qs('#prefBottom').value = prefs.bottom;
  qs('#prefShoe').value = prefs.shoe;
  qs(`input[name="prefFit"][value="${prefs.fit}"]`).checked = true;
  qs('#prefsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const updated = {
      top: qs('#prefTop').value, bottom: qs('#prefBottom').value, shoe: qs('#prefShoe').value,
      fit: qs('input[name="prefFit"]:checked').value,
    };
    writeJSON(prefsKey, updated);
    showToast('Size preferences saved', 'fa-ruler');
  });
}

/* ==========================================================================
   13. LOGIN / REGISTER PAGE
   ========================================================================== */
function initAuthPage(){
  // seed a demo account so reviewers can log in instantly
  let users = getUsers();
  if(!users.some(u => u.email === 'demo@stylehub.com')){
    users.push({ name:'Demo Shopper', email:'demo@stylehub.com', password:'demo123', phone:'' });
    saveUsers(users);
  }

  qsa('.auth-tabs button').forEach(btn => btn.addEventListener('click', () => {
    qsa('.auth-tabs button').forEach(b => b.classList.remove('active'));
    qsa('.auth-form').forEach(f => f.classList.remove('active'));
    btn.classList.add('active');
    qs('#' + btn.dataset.tab + 'Form').classList.add('active');
  }));
  qsa('[data-switch]').forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    qs(`.auth-tabs button[data-tab="${btn.dataset.switch}"]`).click();
  }));

  const redirect = getParam('redirect');

  qs('#loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = qs('#loginEmail').value.trim().toLowerCase();
    const password = qs('#loginPassword').value;
    const msg = qs('#loginMsg');
    const user = getUsers().find(u => u.email.toLowerCase() === email && u.password === password);
    if(!user){
      msg.textContent = 'Incorrect email or password. Try demo@stylehub.com / demo123.';
      msg.className = 'auth-msg err';
      return;
    }
    setSession({ name:user.name, email:user.email, phone:user.phone||'' });
    msg.textContent = 'Welcome back! Redirecting…';
    msg.className = 'auth-msg ok';
    setTimeout(() => window.location.href = redirect === 'account' ? 'account.html' : 'account.html', 700);
  });

  qs('#registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = qs('#regName').value.trim();
    const email = qs('#regEmail').value.trim().toLowerCase();
    const password = qs('#regPassword').value;
    const confirm = qs('#regConfirm').value;
    const msg = qs('#registerMsg');

    if(password !== confirm){ msg.textContent = 'Passwords do not match.'; msg.className = 'auth-msg err'; return; }
    if(password.length < 6){ msg.textContent = 'Password must be at least 6 characters.'; msg.className = 'auth-msg err'; return; }
    let list = getUsers();
    if(list.some(u => u.email.toLowerCase() === email)){
      msg.textContent = 'An account with this email already exists.'; msg.className = 'auth-msg err'; return;
    }
    list.push({ name, email, password, phone:'' });
    saveUsers(list);
    setSession({ name, email, phone:'' });
    msg.textContent = 'Account created! Redirecting…';
    msg.className = 'auth-msg ok';
    setTimeout(() => window.location.href = 'account.html', 700);
  });

  qsa('.social-auth button').forEach(btn => btn.addEventListener('click', () => {
    showToast('Social login is a demo placeholder', 'fa-circle-info');
  }));
  const forgot = qs('#forgotPasswordLink');
  if(forgot) forgot.addEventListener('click', (e) => { e.preventDefault(); showToast('Please contact support to reset your password', 'fa-circle-info'); });
}

/* ==========================================================================
   14. CONTACT PAGE
   ========================================================================== */
function initContactPage(){
  qsa('.faq-item').forEach(item => {
    qs('.faq-q', item).addEventListener('click', () => item.classList.toggle('open'));
  });
  const form = qs('#contactForm');
  if(form){
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      qsa('[required]', form).forEach(field => {
        const wrap = field.closest('.form-field');
        if(!field.value.trim()){ wrap.classList.add('invalid'); valid = false; } else wrap.classList.remove('invalid');
      });
      if(!valid){ showToast('Please complete all required fields', 'fa-triangle-exclamation'); return; }
      qs('#contactMsg').textContent = "Thanks for reaching out! Our team will get back to you within 24 hours.";
      qs('#contactMsg').className = 'auth-msg ok';
      form.reset();
      showToast('Message sent successfully', 'fa-paper-plane');
    });
  }
}

/* ==========================================================================
   15. INIT — run the right modules for whatever page is loaded
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initHeaderFooter();
  if(qs('#featuredGrid') || qs('#countdown')) initHome();
  if(qs('#productGrid')) initListingPage();
  if(qs('#pdName')) initProductDetail();
  if(qs('#cartTableBody')) initCartPage();
  if(qs('#checkoutForm')) initCheckoutPage();
  if(qs('#panel-profile')) initAccountPage();
  if(qs('#loginForm')) initAuthPage();
  if(qs('.faq-item') || qs('#contactForm')) initContactPage();
  initScrollReveal();
});
