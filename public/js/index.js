document.addEventListener('DOMContentLoaded', async () => {
    const featuredProductsContainer = document.getElementById('featuredProducts');

    try {
        // Fetch 8 random/newest products for the home page
        const res = await fetch('/api/products?sort=newest');
        const products = await res.json();
        
        // Display only first 8 products
        const featured = products.slice(0, 8);
        
        featuredProductsContainer.innerHTML = featured.map(p => {
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

    } catch (error) {
        console.error('Error fetching products:', error);
        featuredProductsContainer.innerHTML = '<p>Error loading products. Please try again later.</p>';
    }
});
