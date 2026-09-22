// ==================== ЭЛЕМЕНТЫ DOM ====================
const productsEl = document.getElementById("products");
const cartEl = document.getElementById("cart");
const cartListEl = document.getElementById("cart-list");
const cartCountEl = document.getElementById("cart-count");
const cartTotalEl = document.getElementById("cart-total");
const cartBtn = document.getElementById("cart-btn");
const cartClose = document.getElementById("cart-close");
const overlay = document.getElementById("overlay");
const checkoutBtn = document.getElementById("checkout-btn");
const modal = document.getElementById("modal");
const modalClose = document.getElementById("modal-close");
const orderForm = document.getElementById("order-form");

// ==================== ЗАГЛУШКА ДЛЯ ИЗОБРАЖЕНИЙ ====================
// Если картинка не найдена — показываем SVG-заглушку
const FALLBACK_IMAGE =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
            <rect width="400" height="300" fill="#e8e8ed"/>
            <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="18"
                  fill="#86868b" text-anchor="middle" dominant-baseline="middle">
                Нет изображения
            </text>
        </svg>
    `);

// ==================== РЕНДЕР ТОВАРОВ ====================
function renderProducts() {
    productsEl.innerHTML = "";

    products.forEach(product => {
        const inCartQty = cart[product.id] || 0;
        const article = document.createElement("article");
        article.className = "product";
        article.dataset.id = product.id;

        article.innerHTML = `
            <img class="product__image"
                 src="${product.image}"
                 alt="${product.name}"
                 loading="lazy"
                 onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'">
            <div class="product__body">
                <h3 class="product__name">${product.name}</h3>
                <p class="product__price">${product.price.toLocaleString("ru-RU")} ₽</p>
                <div class="product__actions" data-actions="${product.id}">
                    ${renderProductAction(product.id, inCartQty)}
                </div>
            </div>
        `;

        productsEl.appendChild(article);
    });
}

// Возвращает HTML для блока действий товара (кнопка или счётчик)
function renderProductAction(id, qty) {
    if (qty === 0) {
        return `
            <button class="btn btn--primary product__btn" data-add="${id}">
                Добавить в корзину
            </button>
        `;
    }

    return `
        <div class="product__counter">
            <button class="product__counter-btn" data-minus="${id}" aria-label="Уменьшить">−</button>
            <span class="product__counter-text">В корзине: ${qty}</span>
            <button class="product__counter-btn" data-plus="${id}" aria-label="Увеличить">+</button>
        </div>
    `;
}

// Обновляет только блок действий конкретного товара
function updateProductAction(id) {
    const block = document.querySelector(`[data-actions="${id}"]`);
    if (!block) return;
    const qty = cart[id] || 0;
    block.innerHTML = renderProductAction(id, qty);
}

// ==================== РЕНДЕР КОРЗИНЫ ====================
function renderCart() {
    const items = getCartItems();

    cartCountEl.textContent = getCartCount();
    cartTotalEl.textContent = getCartTotal().toLocaleString("ru-RU");

    if (items.length === 0) {
        cartListEl.innerHTML = `<li class="cart__empty">Корзина пуста</li>`;
        return;
    }

    cartListEl.innerHTML = "";
    items.forEach(item => {
        const li = document.createElement("li");
        li.className = "cart-item";

        li.innerHTML = `
            <img class="cart-item__image"
                 src="${item.image}"
                 alt="${item.name}"
                 onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'">
            <div class="cart-item__info">
                <span class="cart-item__name">${item.name}</span>
                <span class="cart-item__price">${item.price.toLocaleString("ru-RU")} ₽</span>
                <button class="cart-item__remove" data-remove="${item.id}">Удалить</button>
            </div>
            <div class="cart-item__controls">
                <button class="cart-item__btn" data-minus="${item.id}">−</button>
                <span class="cart-item__qty">${item.qty}</span>
                <button class="cart-item__btn" data-plus="${item.id}">+</button>
            </div>
        `;

        cartListEl.appendChild(li);
    });
}

// ==================== УВЕДОМЛЕНИЕ ====================
function showToast(message) {
    let toast = document.querySelector(".toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.className = "toast";
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("is-visible");

    setTimeout(() => {
        toast.classList.remove("is-visible");
    }, 2500);
}

// ==================== ОТКРЫТИЕ / ЗАКРЫТИЕ КОРЗИНЫ ====================
function openCart() {
    cartEl.classList.add("is-open");
    overlay.classList.add("is-active");
    document.body.style.overflow = "hidden";
}

function closeCart() {
    cartEl.classList.remove("is-open");
    overlay.classList.remove("is-active");
    document.body.style.overflow = "";
}

// ==================== ОТКРЫТИЕ / ЗАКРЫТИЕ МОДАЛКИ ====================
function openModal() {
    if (getCartCount() === 0) {
        showToast("Корзина пуста");
        return;
    }
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
}

function closeModal() {
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
}

// ==================== ОБРАБОТЧИКИ ====================

// Клики по каталогу: добавить / + / −
productsEl.addEventListener("click", (e) => {
    const addBtn = e.target.closest("[data-add]");
    const plusBtn = e.target.closest(".product__counter-btn[data-plus]");
    const minusBtn = e.target.closest(".product__counter-btn[data-minus]");

    if (addBtn) {
        const id = Number(addBtn.dataset.add);
        addToCart(id);
        updateProductAction(id);
        renderCart();
        showToast("Товар добавлен в корзину");
        return;
    }

    if (plusBtn) {
        const id = Number(plusBtn.dataset.plus);
        increaseQty(id);
        updateProductAction(id);
        renderCart();
        return;
    }

    if (minusBtn) {
        const id = Number(minusBtn.dataset.minus);
        decreaseQty(id);
        updateProductAction(id);
        renderCart();
        return;
    }
});

// Клики внутри корзины: + / − / удалить
cartListEl.addEventListener("click", (e) => {
    const target = e.target;
    let id = null;

    if (target.dataset.plus) {
        id = Number(target.dataset.plus);
        increaseQty(id);
    } else if (target.dataset.minus) {
        id = Number(target.dataset.minus);
        decreaseQty(id);
    } else if (target.dataset.remove) {
        id = Number(target.dataset.remove);
        removeFromCart(id);
    } else {
        return;
    }

    renderCart();
    if (id !== null) updateProductAction(id);
});

cartBtn.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

checkoutBtn.addEventListener("click", () => {
    closeCart();
    openModal();
});

modalClose.addEventListener("click", closeModal);

modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Отправка формы заказа
orderForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name");
    const surname = document.getElementById("surname");
    const address = document.getElementById("address");
    const phone = document.getElementById("phone");

    let isValid = true;

    [name, surname, address, phone].forEach(input => {
        input.classList.remove("is-error");
    });

    if (!name.value.trim()) {
        name.classList.add("is-error");
        isValid = false;
    }
    if (!surname.value.trim()) {
        surname.classList.add("is-error");
        isValid = false;
    }
    if (!address.value.trim()) {
        address.classList.add("is-error");
        isValid = false;
    }
    if (!phone.value.trim()) {
        phone.classList.add("is-error");
        isValid = false;
    }

    if (!isValid) {
        showToast("Заполните все поля");
        return;
    }

    showToast("Заказ создан!");
    orderForm.reset();
    clearCart();
    renderProducts();
    renderCart();

    setTimeout(closeModal, 1500);
});

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
loadCart();
renderProducts();
renderCart();