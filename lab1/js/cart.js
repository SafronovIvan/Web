// ==================== СОСТОЯНИЕ КОРЗИНЫ ====================
// Корзина хранится как объект: { id: quantity }
let cart = {};

const STORAGE_KEY = "shop_cart";

// ==================== ЗАГРУЗКА И СОХРАНЕНИЕ ====================
function loadCart() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        cart = saved ? JSON.parse(saved) : {};
    } catch (e) {
        cart = {};
    }
}

function saveCart() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

// ==================== ОПЕРАЦИИ С КОРЗИНОЙ ====================
function addToCart(id) {
    cart[id] = (cart[id] || 0) + 1;
    saveCart();
}

function removeFromCart(id) {
    delete cart[id];
    saveCart();
}

function increaseQty(id) {
    cart[id] = (cart[id] || 0) + 1;
    saveCart();
}

function decreaseQty(id) {
    if (!cart[id]) return;
    cart[id] -= 1;
    if (cart[id] <= 0) {
        delete cart[id];
    }
    saveCart();
}

function clearCart() {
    cart = {};
    saveCart();
}

// ==================== ПОДСЧЕТЫ ====================
function getCartCount() {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}

function getCartTotal() {
    let total = 0;
    for (const id in cart) {
        const product = products.find(p => p.id === Number(id));
        if (product) {
            total += product.price * cart[id];
        }
    }
    return total;
}

// ==================== ВСПОМОГАТЕЛЬНОЕ ====================
function getCartItems() {
    const items = [];
    for (const id in cart) {
        const product = products.find(p => p.id === Number(id));
        if (product) {
            items.push({
                ...product,
                qty: cart[id]
            });
        }
    }
    return items;
}