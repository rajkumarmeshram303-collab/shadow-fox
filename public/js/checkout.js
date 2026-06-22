const addressForm = document.getElementById('addressForm');
let shippingAddress = {};
let paymentMethod = 'CreditCard';

document.addEventListener('DOMContentLoaded', () => {
    if (cart.length === 0) {
        window.location.href = 'cart.html';
    }
});

addressForm.addEventListener('submit', (e) => {
    e.preventDefault();
    shippingAddress = {
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        postalCode: document.getElementById('postalCode').value,
        country: document.getElementById('country').value,
    };
    goToStep(2);
});

function goToStep(step) {
    // Hide all sections
    document.querySelectorAll('.checkout-section').forEach(el => el.classList.remove('active'));
    
    // Show target section
    document.getElementById(`section${step}`).classList.add('active');

    // Update indicators
    if (step <= 3) {
        document.querySelectorAll('.step').forEach((el, index) => {
            if (index + 1 < step) {
                el.classList.add('completed');
                el.classList.remove('active');
            } else if (index + 1 === step) {
                el.classList.add('active');
                el.classList.remove('completed');
            } else {
                el.classList.remove('active', 'completed');
            }
        });
    }

    if (step === 3) {
        const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked').value;
        paymentMethod = selectedPayment;
        renderReview();
    }
}

function renderReview() {
    const container = document.getElementById('orderReviewContainer');
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
    const cartTotal = localStorage.getItem('cartTotal');
    const finalSubtotal = cartTotal ? parseFloat(cartTotal) : subtotal;
    const tax = finalSubtotal * 0.1; // 10% tax for demo
    const total = finalSubtotal + tax;

    container.innerHTML = `
        <div style="margin-bottom: 1.5rem;">
            <h4>Shipping</h4>
            <p style="color: var(--text-secondary); margin-top: 0.5rem;">
                ${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.postalCode}, ${shippingAddress.country}
            </p>
        </div>
        <div style="margin-bottom: 1.5rem;">
            <h4>Payment Method</h4>
            <p style="color: var(--text-secondary); margin-top: 0.5rem;">${paymentMethod}</p>
        </div>
        <div style="margin-bottom: 1.5rem;">
            <h4>Order Items</h4>
            ${cart.map(item => `
                <div style="display: flex; justify-content: space-between; margin-top: 0.5rem; color: var(--text-secondary);">
                    <span>${item.qty} x ${item.name}</span>
                    <span>Rs. ${(item.price * item.qty).toLocaleString('en-IN')}</span>
                </div>
            `).join('')}
        </div>
        <hr style="border: none; border-top: 1px solid var(--border-color); margin: 1rem 0;">
        <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 1.2rem;">
            <span>Total</span>
            <span>Rs. ${total.toLocaleString('en-IN')}</span>
        </div>
    `;
}

function placeOrder() {
    // Simulate order placement
    setTimeout(() => {
        // Save to profile
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
        const cartTotal = localStorage.getItem('cartTotal');
        const finalSubtotal = cartTotal ? parseFloat(cartTotal) : subtotal;
        const total = finalSubtotal + (finalSubtotal * 0.1);
        
        const newOrder = {
            id: 'SN-' + Math.floor(Math.random() * 1000000),
            date: new Date().toISOString(),
            items: [...cart],
            total: total,
            status: 'Ordered'
        };
        
        let userOrders = JSON.parse(localStorage.getItem('userOrders')) || [];
        userOrders.push(newOrder);
        localStorage.setItem('userOrders', JSON.stringify(userOrders));

        // Clear cart
        localStorage.removeItem('cart');
        localStorage.removeItem('cartTotal');
        cart = [];
        updateCartBadge();
        
        // Hide step indicator
        document.querySelector('.step-indicator').style.display = 'none';
        
        goToStep(4); // Success animation
        if (typeof simulateTracking === 'function') {
            simulateTracking();
        }
    }, 1000);
}
