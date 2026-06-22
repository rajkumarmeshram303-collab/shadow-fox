// Global State
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

// DOM Elements
const themeToggle = document.getElementById('themeToggle');
const cartBadge = document.getElementById('cartBadge');
const toast = document.getElementById('toast');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updateCartBadge();
    setupSearch();
    
    // Auth State
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const authText = document.getElementById('authText');
    const authLink = document.getElementById('authLink');
    if (userInfo && authText && authLink) {
        authText.innerText = 'Profile';
        authLink.href = 'profile.html';
    }

    // Inject Global Modal
    injectModal();
});

function injectModal() {
    const modalHTML = `
        <div class="modal-overlay" id="globalModal">
            <div class="modal-content">
                <div class="modal-icon" id="modalIcon"><i class="fas fa-info-circle"></i></div>
                <h2 class="modal-title" id="modalTitle">Message</h2>
                <p class="modal-text" id="modalText">Something happened.</p>
                <div class="modal-actions" id="modalActions">
                    <button class="btn btn-primary" onclick="closeModal()">Close</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function showPopup(title, message, type = 'info', actionText = 'Login', actionUrl = 'login.html') {
    const modal = document.getElementById('globalModal');
    const titleEl = document.getElementById('modalTitle');
    const textEl = document.getElementById('modalText');
    const iconEl = document.getElementById('modalIcon');
    const actionsEl = document.getElementById('modalActions');

    titleEl.innerText = title;
    textEl.innerText = message;

    if (type === 'auth') {
        iconEl.innerHTML = '<i class="fas fa-lock"></i>';
        actionsEl.innerHTML = `
            <button class="btn" onclick="closeModal()" style="border:1px solid var(--border-color)">Cancel</button>
            <button class="btn btn-primary" onclick="window.location.href='${actionUrl}'">${actionText}</button>
        `;
    } else {
        iconEl.innerHTML = '<i class="fas fa-info-circle"></i>';
        actionsEl.innerHTML = `<button class="btn btn-primary" onclick="closeModal()">OK</button>`;
    }

    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('globalModal').style.display = 'none';
}

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    });
}

// Cart Management
function addToCart(product) {
    const existingItem = cart.find(item => item._id === product._id);
    if (existingItem) {
        existingItem.qty += 1;
    } else {
        const finalPrice = getFinalPrice(product.price, product.discountPercentage);
        cart.push({ ...product, price: finalPrice, qty: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    showToast('Added to Cart');
}

function updateCartBadge() {
    if(cartBadge) {
        const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
        cartBadge.innerText = totalItems;
    }
}

// Wishlist Management
function toggleWishlist(product, btnElement) {
    const index = wishlist.findIndex(item => item._id === product._id);
    if (index >= 0) {
        wishlist.splice(index, 1);
        btnElement.classList.remove('active');
        btnElement.innerHTML = '<i class="far fa-heart"></i>';
        showToast('Removed from Wishlist');
    } else {
        wishlist.push(product);
        btnElement.classList.add('active');
        btnElement.innerHTML = '<i class="fas fa-heart"></i>';
        showToast('Added to Wishlist');
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

function isInWishlist(id) {
    return wishlist.some(item => item._id === id);
}

// Toast Notification
function showToast(message) {
    toast.innerText = message;
    toast.className = 'toast show';
    setTimeout(() => {
        toast.className = toast.className.replace('show', '');
    }, 3000);
}

// Live Search
function setupSearch() {
    if(!searchInput) return;
    
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }

        debounceTimer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/products?keyword=${query}`);
                const products = await res.json();
                
                if (products.length > 0) {
                    searchResults.innerHTML = products.map(p => `
                        <div class="search-item" onclick="window.location.href='product.html?id=${p._id}'">
                            <img src="${p.image}" alt="${p.name}">
                            <div class="search-item-info">
                                <h4>${p.name}</h4>
                                <p>Rs. ${p.price.toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                    `).join('');
                    searchResults.style.display = 'block';
                } else {
                    searchResults.innerHTML = '<div class="search-item"><p>No products found</p></div>';
                    searchResults.style.display = 'block';
                }
            } catch (err) {
                console.error(err);
            }
        }, 300);
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            searchResults.style.display = 'none';
        }
    });
}

// Utility: Render Stars
function renderStars(rating) {
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
        if (rating >= i) {
            starsHtml += '<i class="fas fa-star"></i>';
        } else if (rating >= i - 0.5) {
            starsHtml += '<i class="fas fa-star-half-alt"></i>';
        } else {
            starsHtml += '<i class="far fa-star"></i>';
        }
    }
    return starsHtml;
}

// Utility: Format Price
function formatPrice(price, discountPercentage) {
    if (!discountPercentage) {
        return `<span style="font-weight: 700; color: var(--text-primary);">Rs. ${price.toLocaleString('en-IN')}</span>`;
    }
    const discountedPrice = Math.round(price * (1 - discountPercentage / 100));
    return `
        <span style="font-weight: 700; color: var(--text-primary);">Rs. ${discountedPrice.toLocaleString('en-IN')}</span>
        <del style="color: var(--text-secondary); font-size: 0.85em; margin: 0 0.4rem;">Rs. ${price.toLocaleString('en-IN')}</del>
        <span style="color: #ff905a; font-weight: 700; font-size: 0.85em;">(${discountPercentage}% OFF)</span>
    `;
}

function getFinalPrice(price, discountPercentage) {
    if (!discountPercentage) return price;
    return Math.round(price * (1 - discountPercentage / 100));
}
