const API_BASE = "/api/customer-order";
const PRODUCT_IMAGE_MAP = {
    "20L Jar": "../assets/images/20litre.png",
    "2L Bottle": "../assets/images/2litre.png",
    "1L Bottle": "../assets/images/1litre.png",
    "750ml Bottle": "../assets/images/750ml.png"
};
const ALLOWED_PRODUCTS = ["20L Jar", "2L Bottle", "1L Bottle", "750ml Bottle"];
const state = { customerId: null, cart: {}, emergency: false, orderId: null, submitting: false, products: [] };
const elements = {
    main: document.querySelector(".customer-main"), productGrid: document.getElementById("productGrid"),
    cartSection: document.getElementById("cartSection"), cartItems: document.getElementById("cartItems"), totalItems: document.getElementById("totalItems"),
    emergencySection: document.getElementById("emergencySection"), toggleEmergencyBtn: document.getElementById("toggleEmergencyBtn"),
    placeOrderBtn: document.getElementById("placeOrderBtn"), orderMessage: document.getElementById("orderMessage"),
    successScreen: document.getElementById("successScreen"), statusScreen: document.getElementById("statusScreen"),
    viewStatusBtn: document.getElementById("viewStatusBtn"), statusEmergencyBadge: document.getElementById("statusEmergencyBadge"),
    timelineSteps: document.getElementById("timelineSteps"), statusDetailText: document.getElementById("statusDetailText")
};

function imageFor(product) { return PRODUCT_IMAGE_MAP[product.product_name] || "../assets/images/20litre.png"; }
function quantityFor(id) { return state.cart[id]?.quantity || 0; }
function setMessage(message = "") { elements.orderMessage.textContent = message; elements.orderMessage.classList.toggle("hidden", !message); }

function renderProducts() {
    elements.productGrid.innerHTML = state.products.map(product => {
        const quantity = quantityFor(product.id);
        return `<article class="product-card ${quantity ? "selected" : ""}">
            <img src="${imageFor(product)}" alt="${product.product_name}">
            <div class="product-info"><h2>${product.product_name}</h2></div>
            <div class="quantity-control" aria-label="${product.product_name} quantity">
                <button class="quantity-button" type="button" data-action="minus" data-id="${product.id}" aria-label="Remove one ${product.product_name}">−</button>
                <span class="quantity-value">${quantity}</span>
                <button class="quantity-button plus" type="button" data-action="plus" data-id="${product.id}" aria-label="Add one ${product.product_name}">+</button>
            </div>
        </article>`;
    }).join("");
    elements.productGrid.querySelectorAll("button[data-action]").forEach(button => button.addEventListener("click", () => changeQuantity(button.dataset.id, button.dataset.action === "plus" ? 1 : -1)));
}

function renderCart() {
    const items = Object.values(state.cart), total = items.reduce((sum, item) => sum + item.quantity, 0);
    elements.cartSection.classList.toggle("hidden", items.length === 0);
    elements.totalItems.textContent = total;
    elements.placeOrderBtn.disabled = total === 0 || state.submitting;
    elements.cartItems.innerHTML = items.map(({ product, quantity }) => `<div class="cart-item">
        <img src="${imageFor(product)}" alt="${product.product_name}"><div class="cart-info"><strong>${product.product_name}</strong>
        <div class="cart-controls"><button class="quantity-button" type="button" data-cart-action="minus" data-id="${product.id}" aria-label="Remove one">−</button><span class="quantity-value">${quantity}</span><button class="quantity-button plus" type="button" data-cart-action="plus" data-id="${product.id}" aria-label="Add one">+</button></div></div></div>`).join("");
    elements.cartItems.querySelectorAll("button[data-cart-action]").forEach(button => button.addEventListener("click", () => changeQuantity(button.dataset.id, button.dataset.cartAction === "plus" ? 1 : -1)));
}

function changeQuantity(id, delta) {
    const product = state.products.find(item => String(item.id) === String(id));
    if (!product) return;
    const next = quantityFor(product.id) + delta;
    if (next <= 0) delete state.cart[product.id];
    else state.cart[product.id] = { product, quantity: next };
    renderProducts(); renderCart();
}

function updateEmergencyUI() {
    elements.emergencySection.classList.toggle("emergency-active", state.emergency);
    elements.toggleEmergencyBtn.textContent = state.emergency ? "Emergency ON" : "Emergency OFF";
    elements.toggleEmergencyBtn.setAttribute("aria-pressed", String(state.emergency));
}

async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE}/products`), payload = await response.json();
        if (!response.ok || !payload?.success || !Array.isArray(payload.data)) throw new Error("Invalid products response");
        state.products = ALLOWED_PRODUCTS.map(name => payload.data.find(product => product.product_name === name)).filter(Boolean);
        renderProducts();
        if (state.products.length !== ALLOWED_PRODUCTS.length) setMessage("Some water products are currently unavailable.");
    } catch (error) { console.error(error); setMessage("Unable to load water products. Please try again later."); }
}

async function identifyCustomer() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("customerCode") || params.get("customer_code") || sessionStorage.getItem("customerCode");
    const id = params.get("customerId") || params.get("customer_id") || sessionStorage.getItem("customerId");
    if (id && /^\d+$/.test(id)) { state.customerId = Number(id); return; }
    if (!code) { setMessage("Customer identification is missing. Please scan your supplied QR code again."); return; }
    try {
        const response = await fetch(`${API_BASE}/customer/${encodeURIComponent(code)}`), payload = await response.json();
        if (!response.ok || !payload?.success || !payload.data?.id) throw new Error("Customer not found");
        state.customerId = payload.data.id;
        sessionStorage.setItem("customerId", String(state.customerId));
        sessionStorage.setItem("customerCode", code);
    } catch (error) { console.error(error); setMessage("Customer identification could not be confirmed. Please scan your QR code again."); }
}

async function placeOrder() {
    const items = Object.values(state.cart);
    if (state.submitting || !state.customerId || !items.length) return;
    state.submitting = true; renderCart(); setMessage("");
    try {
        const response = await fetch(`${API_BASE}/orders`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customer_id: state.customerId, items: items.map(({ product, quantity }) => ({ product_id: product.id, quantity })), emergency: state.emergency }) });
        const payload = await response.json();
        if (!response.ok || !payload?.success || !payload.data?.order_id) throw new Error(payload?.message || "Unable to place order");
        state.orderId = payload.data.order_id;
        elements.main.classList.add("hidden"); elements.successScreen.classList.remove("hidden");
    } catch (error) { console.error(error); setMessage(error.message || "Unable to place order. Please try again."); }
    finally { state.submitting = false; renderCart(); }
}

function renderStatusTimeline(status) {
    const steps = [{ label: "Order Placed", values: ["Pending", "Confirmed", "Out for Delivery", "Delivered"] }, { label: "Order Confirmed", values: ["Confirmed", "Out for Delivery", "Delivered"] }, { label: "Out for Delivery", values: ["Out for Delivery", "Delivered"] }, { label: "Delivered", values: ["Delivered"] }];
    elements.timelineSteps.innerHTML = steps.map((step, index) => `<div class="timeline-step ${step.values.includes(status) ? "active" : ""}"><div class="timeline-marker">${step.values.includes(status) ? "✓" : index + 1}</div><div class="timeline-text"><strong>${step.label}</strong><span>${step.values.includes(status) ? "Active" : "Pending"}</span></div></div>`).join("");
}

async function showOrderStatus() {
    try {
        const response = await fetch(`${API_BASE}/orders/${state.orderId}`), payload = await response.json();
        if (!response.ok || !payload?.success || !payload.data) throw new Error("Unable to load order status");
        const order = payload.data, status = order.status || "Pending";
        elements.statusEmergencyBadge.classList.toggle("hidden", !order.emergency);
        elements.statusDetailText.textContent = status === "Delivered" ? "Your water has been delivered. Thank you." : "We will update your order as soon as the supplier confirms it.";
        renderStatusTimeline(status); elements.successScreen.classList.add("hidden"); elements.statusScreen.classList.remove("hidden");
    } catch (error) { console.error(error); alert("Unable to load order status. Please try again."); }
}

document.getElementById("customerBackBtn").addEventListener("click", () => { if (document.referrer && /customer-order/i.test(document.referrer)) history.back(); });
elements.toggleEmergencyBtn.addEventListener("click", () => { state.emergency = !state.emergency; updateEmergencyUI(); });
elements.placeOrderBtn.addEventListener("click", placeOrder);
elements.viewStatusBtn.addEventListener("click", showOrderStatus);
document.getElementById("helpBtn").addEventListener("click", () => window.location.href = "tel:6009065856");
window.addEventListener("DOMContentLoaded", async () => { updateEmergencyUI(); renderCart(); await Promise.all([identifyCustomer(), loadProducts()]); });
