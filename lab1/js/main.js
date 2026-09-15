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

// ==================== РЕНДЕР ТОВАРОВ ====================
function renderProducts() {
    productsEl.innerHTML = "";

    products.forEach(product => {
        const article = document.createElement("article");
        article.className = "product";

        article.innerHTML = `
            <img class="product__image" src="${product.image}" alt="${product.name}" loading="lazy">
            <div class="product__body">
                <h3 class="product__name">${product.name}</h3>
                <p class="product__price">${product.price.toLocaleString("ru-RU")} ₽</p>
                <button class="btn btn--primary product__btn" data-id="${product.id}">
                    Добавить в корзину
                </button>
            </div>
        `;

        productsEl.appendChild(article);
    });
}

// ==================== РЕНДЕР КОРЗИНЫ ====================
function renderCart() {
    const items = getCartItems();

    // Обновляем счетчик
    cartCountEl.textContent = getCartCount();

    // Обновляем итоговую сумму
    cartTotalEl.textContent = getCartTotal().toLocaleString("ru-RU");

    // Если корзина пуста
    if (items.length === 0) {
        cartListEl.innerHTML = `<li class="cart__empty">Корзина пуста</li>`;
        return;
    }

    // Рендерим товары
    cartListEl.innerHTML = "";
    items.forEach(item => {
        const li = document.createElement("li");
        li.className = "cart-item";

        li.innerHTML = `
            <img class="cart-item__image" src="${item.image}" alt="${item.name}">
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

// Добавление товара (делегирование)
productsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".product__btn");
    if (!btn) return;

    const id = Number(btn.dataset.id);
    addToCart(id);
    renderCart();
    showToast("Товар добавлен в корзину");
});

// Управление корзиной (делегирование)
cartListEl.addEventListener("click", (e) => {
    const target = e.target;

    if (target.dataset.plus) {
        increaseQty(Number(target.dataset.plus));
    } else if (target.dataset.minus) {
        decreaseQty(Number(target.dataset.minus));
    } else if (target.dataset.remove) {
        removeFromCart(Number(target.dataset.remove));
    } else {
        return;
    }

    renderCart();
});

// Открытие корзины
cartBtn.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

// Оформление заказа
checkoutBtn.addEventListener("click", () => {
    closeCart();
    openModal();
});

modalClose.addEventListener("click", closeModal);

// Закрытие модалки по клику на фон
modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Отправка формы
orderForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name");
    const surname = document.getElementById("surname");
    const address = document.getElementById("address");
    const phone = document.getElementById("phone");

    let isValid = true;

    // Сброс ошибок
    [name, surname, address, phone].forEach(input => {
        input.classList.remove("is-error");
    });

    // Проверка полей
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

    // Успех
    showToast("Заказ создан!");
    orderForm.reset();
    clearCart();
    renderCart();

    setTimeout(closeModal, 1500);
});

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
loadCart();
renderProducts();
renderCart();