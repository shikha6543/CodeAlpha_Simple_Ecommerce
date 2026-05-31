const productsContainer = document.getElementById('products-container');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const cartCounter = document.getElementById('cart-counter');
const checkoutBtn = document.getElementById('checkout-btn');
const cartSidebar = document.getElementById('cart-sidebar');
const openCartBtn = document.getElementById('open-cart-btn');
const closeCartBtn = document.getElementById('close-cart-btn');
const userWelcome = document.getElementById('user-welcome');
const authLink = document.getElementById('auth-link');

let cart = [];

// Check if user is logged in
const loggedInUser = localStorage.getItem('username');
if (loggedInUser) {
    userWelcome.textContent = `Hello, ${loggedInUser} | `;
    authLink.textContent = "Logout";
    authLink.href = "#";
    authLink.onclick = () => {
        localStorage.clear();
        window.location.reload();
    };
}

// Sidebar toggle
openCartBtn.onclick = () => cartSidebar.classList.add('open');
closeCartBtn.onclick = () => cartSidebar.classList.remove('open');

// 1. Fetch Products from Backend API[cite: 1]
async function fetchProducts() {
    try {
        const response = await fetch('http://localhost:5000/api/products');
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        productsContainer.innerHTML = "<p style='color:red;'>Backend server is offline! Start it using 'node server.js'</p>";
    }
}

// 2. Render Products into Grid
function displayProducts(products) {
    productsContainer.innerHTML = '';
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style = "background:#fff; border-radius:8px; padding:15px; box-shadow:0 2px 10px rgba(0,0,0,0.05); text-align:center; display:inline-block; margin:15px; width:220px;";
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" style="width:100%; height:150px; object-fit:cover; border-radius:5px;">
            <h3 style="font-size:16px; margin:10px 0 5px 0;">${product.name}</h3>
            <p style="font-size:12px; color:#777; height:35px; overflow:hidden;">${product.description}</p>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
                <span style="font-weight:600; color:#333;">$${product.price}</span>
                <button onclick="addToCart('${product._id}', '${product.name}', ${product.price})" style="background:#2f3542; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;"><i class="fas fa-plus"></i></button>
            </div>
        `;
        productsContainer.appendChild(card);
    });
}

// 3. Add to Cart Logic[cite: 1]
window.addToCart = function(id, name, price) {
    cart.push({ id, name, price });
    updateCartUI();
    cartSidebar.classList.add('open');
}

function updateCartUI() {
    cartItemsContainer.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
        const li = document.createElement('li');
        li.style = "display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #eee; font-size:14px;";
        li.innerHTML = `<span>${item.name}</span> <strong>$${item.price}</strong>`;
        cartItemsContainer.appendChild(li);
        total += item.price;
    });
    cartTotalElement.textContent = total;
    cartCounter.textContent = cart.length;
}

// 4. Order Processing (Checkout)[cite: 1]
checkoutBtn.onclick = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert("Please login first to place an order!");
        window.location.href = 'auth.html';
        return;
    }
    if (cart.length === 0) return alert("Your cart is empty!");

    const orderData = {
        userId: userId,
        items: cart,
        totalAmount: parseInt(cartTotalElement.textContent)
    };

    try {
        const res = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        if (res.ok) {
            alert("🎉 Order Placed Successfully and Saved in Database!");
            cart = [];
            updateCartUI();
            cartSidebar.classList.remove('open');
        }
    } catch (err) { alert("Checkout failed!"); }
};

fetchProducts();