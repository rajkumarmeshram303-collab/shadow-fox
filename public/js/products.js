const productsGrid = document.getElementById('productsGrid');
const categoryFilter = document.getElementById('categoryFilter');
const sortSelect = document.getElementById('sortSelect');
const minPriceInput = document.getElementById('minPrice');
const maxPriceInput = document.getElementById('maxPrice');

const categories = ['Electronics', 'Fashion', 'Footwear', 'Accessories', 'Home & Kitchen'];

document.addEventListener('DOMContentLoaded', () => {
    renderCategoryFilters();
    
    // Check URL params for initial category
    const urlParams = new URLSearchParams(window.location.search);
    const initialCategory = urlParams.get('category');
    if (initialCategory) {
        const safeCatId = initialCategory.split(' ').join('-').split('&').join('and');
        const checkbox = document.getElementById(`cat_${safeCatId}`);
        if(checkbox) checkbox.checked = true;
    }
    
    applyFilters();
});

function renderCategoryFilters() {
    categoryFilter.innerHTML = categories.map(cat => {
        const safeCatId = cat.split(' ').join('-').split('&').join('and');
        return `
        <label>
            <input type="checkbox" id="cat_${safeCatId}" value="${cat}" class="cat-checkbox" onchange="applyFilters()">
            ${cat}
        </label>
        `;
    }).join('');
}

async function applyFilters() {
    const selectedCategories = Array.from(document.querySelectorAll('.cat-checkbox:checked')).map(cb => cb.value);
    const sort = sortSelect.value;
    const minPrice = minPriceInput.value;
    const maxPrice = maxPriceInput.value;

    productsGrid.innerHTML = '<p>Loading...</p>';

    try {
        let url = `/api/products?sort=${sort}`;
        if (minPrice) url += `&minPrice=${minPrice}`;
        if (maxPrice) url += `&maxPrice=${maxPrice}`;
        
        const res = await fetch(url);
        let products = await res.json();

        // Handle multiple categories filtering on client side if API doesn't support array easily, 
        // or just filter here since we only pass single category in our simple API.
        if (selectedCategories.length > 0) {
            products = products.filter(p => selectedCategories.includes(p.category));
        }

        renderProducts(products);
    } catch (error) {
        console.error('Error:', error);
        productsGrid.innerHTML = '<p>Error loading products.</p>';
    }
}

function renderProducts(products) {
    if (products.length === 0) {
        productsGrid.innerHTML = '<p>No products found matching your criteria.</p>';
        return;
    }

    productsGrid.innerHTML = products.map(p => {
        const inWishlist = isInWishlist(p._id);
        const wishlistIcon = inWishlist ? 'fas' : 'far';
        const wishlistActive = inWishlist ? 'active' : '';

        return `
        <div class="product-card">
            <a href="product.html?id=${p._id}">
                <img src="${p.image}" alt="${p.name}" class="product-image">
            </a>
            <div class="product-info">
                <div class="product-category">${p.category}</div>
                <a href="product.html?id=${p._id}">
                    <h3 class="product-title">${p.name}</h3>
                </a>
                <div class="product-rating">
                    ${renderStars(p.rating)}
                    <span style="color: var(--text-secondary); font-size: 0.8rem">(${p.numReviews})</span>
                </div>
                <div class="product-price">${formatPrice(p.price, p.discountPercentage)}</div>
                <div class="product-actions">
                    <button class="btn-cart" onclick='addToCart(${JSON.stringify(p).replace(/'/g, "&#39;")})'>Add to Cart</button>
                    <button class="btn-wishlist ${wishlistActive}" onclick='toggleWishlist(${JSON.stringify(p).replace(/'/g, "&#39;")}, this)'>
                        <i class="${wishlistIcon} fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
    `}).join('');
}
