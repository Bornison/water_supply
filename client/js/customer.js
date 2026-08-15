/**
 * Bashi Khong Water Supply - Customer Multi-Item Order Flow
 * Handles multiple item selection, quantities, UI interactions, and API communication.
 */

const API_HOST = window.location.port === "5500" ? "http://localhost:5000" : window.location.origin;
const API_BASE = `${API_HOST}/api/customer-order`;

// Asset Mapping for products based on name and volume
const PRODUCT_IMAGE_MAP = {
    "20L Jar": "../assets/images/20litre.png",
    "10L Jar": "../assets/images/20litre.png",
    "2L Bottle": "../assets/images/2litre.png",
    "1L Bottle": "../assets/images/1litre.png",
    "750ml Bottle": "../assets/images/750ml.png"
};

// Fallback products in case API is loading
const DEFAULT_PRODUCTS = [
    { id: 1, product_name: "20L Jar", volume: 20, unit: "Liter", active: true, popular: true },
    { id: 2, product_name: "10L Jar", volume: 10, unit: "Liter", active: true },
    { id: 3, product_name: "2L Bottle", volume: 2, unit: "Liter", active: true },
    { id: 4, product_name: "1L Bottle", volume: 1, unit: "Liter", active: true },
    { id: 5, product_name: "750ml Bottle", volume: 750, unit: "Milliliter", active: true }
];

const state = {
    customerId: null,
    customerCode: null,
    customerData: null,
    products: [],
    cart: {}, // Map of productId -> quantity (e.g. { 1: 1, 5: 2 })
    selectedProduct: null,
    emergency: false,
    currentStep: "welcome",
    stepHistory: [],
    lastOrder: null,
    submitting: false,
    businessPhone: "6009065856"
};

// DOM Elements cache
const DOM = {
    headerBackBtn: document.getElementById("headerBackBtn"),
    headerHelpBtn: document.getElementById("headerHelpBtn"),
    
    // Steps
    stepWelcome: document.getElementById("stepWelcome"),
    stepWaterType: document.getElementById("stepWaterType"),
    stepQuantity: document.getElementById("stepQuantity"),
    stepSummary: document.getElementById("stepSummary"),
    stepSupport: document.getElementById("stepSupport"),
    stepSuccess: document.getElementById("stepSuccess"),
    stepDetails: document.getElementById("stepDetails"),
    stepStatus: document.getElementById("stepStatus"),
    
    // Step 1: Welcome
    startOrderBtn: document.getElementById("startOrderBtn"),
    
    // Step 2: Water Types & Multi-Item Cart Bar
    waterTypeList: document.getElementById("waterTypeList"),
    waterTypeBottomReviewBar: document.getElementById("waterTypeBottomReviewBar"),
    cartTotalItemsCount: document.getElementById("cartTotalItemsCount"),
    cartReviewOrderBtn: document.getElementById("cartReviewOrderBtn"),
    
    // Step 3: Single Item Quantity Stepper
    qtyProductImg: document.getElementById("qtyProductImg"),
    qtyMinusBtn: document.getElementById("qtyMinusBtn"),
    qtyPlusBtn: document.getElementById("qtyPlusBtn"),
    qtyNumber: document.getElementById("qtyNumber"),
    qtyProductName: document.getElementById("qtyProductName"),
    qtyHelperText: document.getElementById("qtyHelperText"),
    qtyAddMoreBtn: document.getElementById("qtyAddMoreBtn"),
    proceedToSummaryBtn: document.getElementById("proceedToSummaryBtn"),
    
    // Step 4: Summary
    summaryItemsContainer: document.getElementById("summaryItemsContainer"),
    addMoreItemsBtn: document.getElementById("addMoreItemsBtn"),
    summaryTotalCount: document.getElementById("summaryTotalCount"),
    emergencyCheckbox: document.getElementById("emergencyCheckbox"),
    emergencyToggleCard: document.getElementById("emergencyToggleCard"),
    submitOrderBtn: document.getElementById("submitOrderBtn"),
    orderErrorMessage: document.getElementById("orderErrorMessage"),
    
    // Step 5: Support
    callSupplierDirectLink: document.getElementById("callSupplierDirectLink"),
    supportPhoneDisplay: document.getElementById("supportPhoneDisplay"),
    closeSupportBtn: document.getElementById("closeSupportBtn"),
    
    // Step 6: Success
    viewDetailsBtn: document.getElementById("viewDetailsBtn"),
    trackStatusBtn: document.getElementById("trackStatusBtn"),
    successHomeBtn: document.getElementById("successHomeBtn"),
    
    // Step 7: Details
    detailOrderId: document.getElementById("detailOrderId"),
    detailWaterType: document.getElementById("detailWaterType"),
    detailQuantity: document.getElementById("detailQuantity"),
    detailOrderTime: document.getElementById("detailOrderTime"),
    detailStatusBadge: document.getElementById("detailStatusBadge"),
    detailsTrackBtn: document.getElementById("detailsTrackBtn"),
    detailsHomeBtn: document.getElementById("detailsHomeBtn"),
    
    // Step 8: Status
    statusEmergencyAlert: document.getElementById("statusEmergencyAlert"),
    statusTimeline: document.getElementById("statusTimeline"),
    statusHomeBtn: document.getElementById("statusHomeBtn"),
    
    // Bottom Bar
    bottomBar: document.getElementById("bottomBar"),
    bottomCallLink: document.getElementById("bottomCallLink"),
    bottomHelpBtn: document.getElementById("bottomHelpBtn")
};

/**
 * Get product image URL
 */
function getImageForProduct(product) {
    if (!product) return "../assets/images/20litre.png";
    if (PRODUCT_IMAGE_MAP[product.product_name]) {
        return PRODUCT_IMAGE_MAP[product.product_name];
    }
    const name = (product.product_name || "").toLowerCase();
    if (name.includes("20")) return "../assets/images/20litre.png";
    if (name.includes("10")) return "../assets/images/20litre.png";
    if (name.includes("2l")) return "../assets/images/2litre.png";
    if (name.includes("1l")) return "../assets/images/1litre.png";
    if (name.includes("750")) return "../assets/images/750ml.png";
    return "../assets/images/20litre.png";
}

/**
 * Calculate total items count in cart
 */
function getCartTotalItems() {
    return Object.values(state.cart).reduce((sum, qty) => sum + Number(qty || 0), 0);
}

/**
 * Get quantity for a specific product ID
 */
function getItemQuantity(productId) {
    return Number(state.cart[productId] || 0);
}

/**
 * Set quantity for a specific product ID
 */
function setItemQuantity(productId, quantity) {
    const qty = Math.max(0, Math.min(99, Number(quantity || 0)));
    if (qty > 0) {
        state.cart[productId] = qty;
    } else {
        delete state.cart[productId];
    }
    updateCartFloatingBar();
}

/**
 * Switch active step view
 */
function navigateTo(stepName, addToHistory = true) {
    if (addToHistory && state.currentStep && state.currentStep !== stepName) {
        state.stepHistory.push(state.currentStep);
    }
    state.currentStep = stepName;

    // Hide all step views
    const allSteps = [
        DOM.stepWelcome, DOM.stepWaterType, DOM.stepQuantity,
        DOM.stepSummary, DOM.stepSupport, DOM.stepSuccess,
        DOM.stepDetails, DOM.stepStatus
    ];
    allSteps.forEach(el => {
        if (el) el.classList.remove("active");
    });

    // Show current step view
    const currentView = document.getElementById(`step${stepName.charAt(0).toUpperCase() + stepName.slice(1)}`);
    if (currentView) {
        currentView.classList.add("active");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Header Back button visibility
    const isRootStep = (stepName === "welcome");
    DOM.headerBackBtn.classList.toggle("hidden", isRootStep);

    // Bottom Bar visibility
    DOM.bottomBar.classList.toggle("hidden", stepName === "support");

    // Specific step setup actions
    if (stepName === "waterType") {
        renderWaterTypeList();
        updateCartFloatingBar();
    } else if (stepName === "quantity") {
        updateQuantityUI();
    } else if (stepName === "summary") {
        updateSummaryUI();
    }
}

/**
 * Handle Back Button
 */
function handleBackNavigation() {
    if (state.stepHistory.length > 0) {
        const prevStep = state.stepHistory.pop();
        navigateTo(prevStep, false);
    } else {
        navigateTo("welcome", false);
    }
}

/**
 * Render Water Types List with Multi-Item Quantity Steppers
 */
function renderWaterTypeList() {
    const productsToRender = state.products.length > 0 ? state.products : DEFAULT_PRODUCTS;

    DOM.waterTypeList.innerHTML = productsToRender.map(product => {
        const qty = getItemQuantity(product.id);
        const isSelected = qty > 0;
        const isPopular = product.popular || (product.product_name && product.product_name.includes("20L"));
        const imgUrl = getImageForProduct(product);

        return `
            <div class="water-card ${isSelected ? 'selected' : ''}" data-product-id="${product.id}">
                <div class="water-card-thumb">
                    <img src="${imgUrl}" alt="${product.product_name}">
                </div>
                <div class="water-card-info">
                    <div class="water-card-name">
                        <span>${product.product_name}</span>
                        ${isPopular ? `<span class="popular-badge">👑 Popular</span>` : ''}
                    </div>
                </div>
                <div class="card-stepper-wrap">
                    ${qty === 0 ? `
                        <button class="card-btn-add" data-add-id="${product.id}" type="button">
                            + Add
                        </button>
                    ` : `
                        <div class="card-qty-stepper">
                            <button class="card-qty-btn card-minus" data-minus-id="${product.id}" type="button">−</button>
                            <span class="card-qty-val">${qty}</span>
                            <button class="card-qty-btn card-plus" data-plus-id="${product.id}" type="button">+</button>
                        </div>
                    `}
                </div>
            </div>
        `;
    }).join("");

    // Attach listeners for + Add, Minus, Plus
    DOM.waterTypeList.querySelectorAll(".card-btn-add").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const prodId = Number(btn.dataset.addId);
            setItemQuantity(prodId, 1);
            renderWaterTypeList();
        });
    });

    DOM.waterTypeList.querySelectorAll(".card-minus").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const prodId = Number(btn.dataset.minusId);
            setItemQuantity(prodId, getItemQuantity(prodId) - 1);
            renderWaterTypeList();
        });
    });

    DOM.waterTypeList.querySelectorAll(".card-plus").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const prodId = Number(btn.dataset.plusId);
            setItemQuantity(prodId, getItemQuantity(prodId) + 1);
            renderWaterTypeList();
        });
    });

    // Clicking card opens detailed quantity stepper
    DOM.waterTypeList.querySelectorAll(".water-card").forEach(card => {
        card.addEventListener("click", (e) => {
            if (e.target.closest(".card-stepper-wrap")) return;
            const prodId = Number(card.dataset.productId);
            const found = productsToRender.find(p => Number(p.id) === prodId);
            if (found) {
                state.selectedProduct = found;
                if (getItemQuantity(prodId) === 0) {
                    setItemQuantity(prodId, 1);
                }
                navigateTo("quantity");
            }
        });
    });

    updateCartFloatingBar();
}

/**
 * Update the bottom floating review cart bar
 */
function updateCartFloatingBar() {
    const totalItems = getCartTotalItems();
    if (!DOM.waterTypeBottomReviewBar) return;

    if (totalItems > 0 && state.currentStep === "waterType") {
        DOM.cartTotalItemsCount.textContent = `${totalItems} ${totalItems === 1 ? 'Item' : 'Items'}`;
        DOM.waterTypeBottomReviewBar.classList.remove("hidden");
    } else {
        DOM.waterTypeBottomReviewBar.classList.add("hidden");
    }
}

/**
 * Update Single-Product Quantity Screen UI (Step 3)
 */
function updateQuantityUI() {
    if (!state.selectedProduct && state.products.length > 0) {
        state.selectedProduct = state.products[0];
    }
    const product = state.selectedProduct || DEFAULT_PRODUCTS[0];
    const currentQty = getItemQuantity(product.id) || 1;

    DOM.qtyProductImg.src = getImageForProduct(product);
    DOM.qtyNumber.textContent = currentQty;
    DOM.qtyProductName.textContent = product.product_name;

    const isJar = product.product_name.toLowerCase().includes("jar");
    DOM.qtyHelperText.textContent = isJar
        ? "You can order multiple jars and bottle sizes together."
        : "You can order multiple bottles and jar sizes together.";
}

/**
 * Change Quantity in Step 3
 */
function changeStepQuantity(delta) {
    if (!state.selectedProduct) return;
    const prodId = state.selectedProduct.id;
    const nextQty = Math.max(1, Math.min(99, (getItemQuantity(prodId) || 1) + delta));
    setItemQuantity(prodId, nextQty);
    updateQuantityUI();
}

/**
 * Update Order Summary Screen UI (Step 4 - Multi-Item List)
 */
function updateSummaryUI() {
    const products = state.products.length > 0 ? state.products : DEFAULT_PRODUCTS;
    const selectedEntries = Object.entries(state.cart).filter(([_, qty]) => Number(qty) > 0);

    // If cart is empty, add default product
    if (selectedEntries.length === 0) {
        const defaultProd = state.selectedProduct || products[0];
        setItemQuantity(defaultProd.id, 1);
    }

    const activeEntries = Object.entries(state.cart).filter(([_, qty]) => Number(qty) > 0);

    DOM.summaryItemsContainer.innerHTML = activeEntries.map(([prodId, qty]) => {
        const product = products.find(p => Number(p.id) === Number(prodId)) || {
            id: prodId,
            product_name: "Water Item"
        };
        const imgUrl = getImageForProduct(product);

        return `
            <div class="summary-item-row" data-product-id="${product.id}">
                <div class="summary-item-info">
                    <img src="${imgUrl}" alt="${product.product_name}" class="summary-item-thumb">
                    <span class="summary-item-name">${product.product_name}</span>
                </div>
                <div class="summary-item-controls">
                    <div class="summary-stepper">
                        <button type="button" class="summary-step-btn summary-minus" data-prod-id="${product.id}">−</button>
                        <span class="summary-step-val">${qty}</span>
                        <button type="button" class="summary-step-btn summary-plus" data-prod-id="${product.id}">+</button>
                    </div>
                    <button type="button" class="btn-remove-item" data-remove-id="${product.id}" title="Remove item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join("");

    // Bind item steppers in summary
    DOM.summaryItemsContainer.querySelectorAll(".summary-minus").forEach(btn => {
        btn.addEventListener("click", () => {
            const prodId = Number(btn.dataset.prodId);
            setItemQuantity(prodId, getItemQuantity(prodId) - 1);
            updateSummaryUI();
        });
    });

    DOM.summaryItemsContainer.querySelectorAll(".summary-plus").forEach(btn => {
        btn.addEventListener("click", () => {
            const prodId = Number(btn.dataset.prodId);
            setItemQuantity(prodId, getItemQuantity(prodId) + 1);
            updateSummaryUI();
        });
    });

    DOM.summaryItemsContainer.querySelectorAll(".btn-remove-item").forEach(btn => {
        btn.addEventListener("click", () => {
            const prodId = Number(btn.dataset.removeId);
            setItemQuantity(prodId, 0);
            updateSummaryUI();
        });
    });

    const totalCount = getCartTotalItems();
    DOM.summaryTotalCount.textContent = `${totalCount} ${totalCount === 1 ? 'Item' : 'Items'}`;
    DOM.emergencyCheckbox.checked = state.emergency;
    DOM.orderErrorMessage.classList.add("hidden");
    DOM.submitOrderBtn.disabled = state.submitting || totalCount === 0;
}

/**
 * Format Date & Time matching mockup (e.g., "24 May 2025, 09:41 AM")
 */
function formatOrderDateTime(dateString) {
    const date = dateString ? new Date(dateString) : new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = String(date.getDate()).padStart(2, "0");
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? String(hours).padStart(2, "0") : "12";

    return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
}

/**
 * Format Order ID matching mockup (e.g., "#ORD000001")
 */
function formatOrderId(orderId, orderNumber) {
    if (orderNumber) return `#${orderNumber}`;
    if (!orderId) return "#ORD000001";
    return `#ORD${String(orderId).padStart(6, "0")}`;
}

/**
 * Load Active Products from Backend
 */
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE}/products`);
        const payload = await response.json();

        if (response.ok && payload.success && Array.isArray(payload.data) && payload.data.length > 0) {
            state.products = payload.data;
            state.selectedProduct = state.products.find(p => p.product_name.includes("20L")) || state.products[0];
        } else {
            state.products = DEFAULT_PRODUCTS;
            state.selectedProduct = DEFAULT_PRODUCTS[0];
        }
    } catch (error) {
        console.warn("Could not load products from API, using default items:", error);
        state.products = DEFAULT_PRODUCTS;
        state.selectedProduct = DEFAULT_PRODUCTS[0];
    }
    renderWaterTypeList();
}

/**
 * Identify Customer from URL / Storage / Default
 */
async function identifyCustomer() {
    const params = new URLSearchParams(window.location.search);
    let code = params.get("customerCode") || params.get("customer_code") || params.get("code") || params.get("c") || sessionStorage.getItem("customerCode");
    let id = params.get("customerId") || params.get("customer_id") || params.get("id") || sessionStorage.getItem("customerId");

    // Extract code if user passed full URL in code
    if (code && code.includes("customerCode=")) {
        const match = code.match(/customerCode=([^&]+)/);
        if (match) code = match[1];
    }

    // 1. Try by Code
    if (code) {
        state.customerCode = code;
        try {
            const response = await fetch(`${API_BASE}/customer/${encodeURIComponent(code)}`);
            const payload = await response.json();
            if (response.ok && payload.success && payload.data) {
                state.customerId = Number(payload.data.id);
                state.customerData = payload.data;
                sessionStorage.setItem("customerId", String(state.customerId));
                sessionStorage.setItem("customerCode", code);
                return;
            }
        } catch (err) {
            console.warn("Customer identification by code failed:", err);
        }
    }

    // 2. Try by Numeric ID
    if (id && /^\d+$/.test(id)) {
        state.customerId = Number(id);
        sessionStorage.setItem("customerId", String(state.customerId));
        return;
    }

    // 3. Fallback: Automatically connect to the most recently registered active customer in database
    try {
        const response = await fetch(`${API_BASE}/default-customer`);
        const payload = await response.json();
        if (response.ok && payload.success && payload.data) {
            state.customerId = Number(payload.data.id);
            state.customerCode = payload.data.customer_code;
            state.customerData = payload.data;
            sessionStorage.setItem("customerId", String(state.customerId));
            sessionStorage.setItem("customerCode", state.customerCode);
        }
    } catch (e) {
        console.warn("Default customer lookup failed:", e);
    }
}

/**
 * Place Order to Backend with Multiple Items Support
 */
async function placeOrder() {
    if (state.submitting) return;

    if (!state.customerId) {
        await identifyCustomer();
    }

    const customerId = state.customerId;
    if (!customerId) {
        DOM.orderErrorMessage.textContent = "Please scan your QR sticker or register first to place an order.";
        DOM.orderErrorMessage.classList.remove("hidden");
        return;
    }

    // Gather all line items
    const items = Object.entries(state.cart)
        .filter(([_, qty]) => Number(qty) > 0)
        .map(([prodId, qty]) => ({
            product_id: Number(prodId),
            quantity: Number(qty)
        }));

    if (items.length === 0) {
        DOM.orderErrorMessage.textContent = "Please select at least one item to place an order.";
        DOM.orderErrorMessage.classList.remove("hidden");
        return;
    }

    state.submitting = true;
    DOM.submitOrderBtn.disabled = true;
    DOM.submitOrderBtn.textContent = "Placing Order...";
    DOM.orderErrorMessage.classList.add("hidden");

    try {
        const orderPayload = {
            customer_id: customerId,
            items: items,
            emergency: Boolean(state.emergency)
        };

        const response = await fetch(`${API_BASE}/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderPayload)
        });

        const payload = await response.json();

        if (!response.ok || !payload.success) {
            throw new Error(payload.message || "Failed to place order. Please check server.");
        }

        state.lastOrder = payload.data;

        populateOrderDetailsUI();
        navigateTo("success");
    } catch (error) {
        console.error("Order placement error:", error);
        DOM.orderErrorMessage.textContent = error.message || "Server error while placing order. Please ensure server is running.";
        DOM.orderErrorMessage.classList.remove("hidden");
    } finally {
        state.submitting = false;
        DOM.submitOrderBtn.disabled = false;
        DOM.submitOrderBtn.textContent = "Place Order";
    }
}

/**
 * Populate Order Details and Status Views for Multi-Item Orders
 */
function populateOrderDetailsUI() {
    const order = state.lastOrder || {};
    const products = state.products.length > 0 ? state.products : DEFAULT_PRODUCTS;
    const orderTimeFormatted = formatOrderDateTime(order.ordered_at);
    const orderIdFormatted = formatOrderId(order.order_id, order.order_number);

    // Build multi-item product summary string
    const itemsSummary = Object.entries(state.cart)
        .filter(([_, qty]) => Number(qty) > 0)
        .map(([prodId, qty]) => {
            const p = products.find(prod => Number(prod.id) === Number(prodId));
            return `${qty}x ${p ? p.product_name : 'Water Item'}`;
        })
        .join(", ");

    const totalQty = getCartTotalItems();

    // Populate Details Screen (Step 7)
    DOM.detailOrderId.textContent = orderIdFormatted;
    DOM.detailWaterType.textContent = itemsSummary || "Water Supply";
    DOM.detailQuantity.textContent = totalQty;
    DOM.detailOrderTime.textContent = orderTimeFormatted;
    DOM.detailStatusBadge.textContent = "Placed";

    // Populate Timeline Status Screen (Step 8)
    renderStatusTimeline(order.status || "Pending", orderTimeFormatted);
}

/**
 * Render 4-stage Order Status Timeline
 */
function renderStatusTimeline(currentStatus = "Pending", placedTime = "") {
    const stages = [
        {
            key: "placed",
            title: "Order Placed",
            time: placedTime || formatOrderDateTime(),
            activeMatches: ["Pending", "Confirmed", "Out for Delivery", "Delivered"],
            completedMatches: ["Confirmed", "Out for Delivery", "Delivered"]
        },
        {
            key: "confirmed",
            title: "Order Confirmed",
            time: currentStatus === "Pending" ? "Pending" : "Confirmed",
            activeMatches: ["Confirmed", "Out for Delivery", "Delivered"],
            completedMatches: ["Out for Delivery", "Delivered"]
        },
        {
            key: "delivery",
            title: "Out for Delivery",
            time: ["Out for Delivery", "Delivered"].includes(currentStatus) ? "On the way" : "Pending",
            activeMatches: ["Out for Delivery", "Delivered"],
            completedMatches: ["Delivered"]
        },
        {
            key: "delivered",
            title: "Delivered",
            time: currentStatus === "Delivered" ? "Delivered" : "Pending",
            activeMatches: ["Delivered"],
            completedMatches: []
        }
    ];

    DOM.statusEmergencyAlert.classList.toggle("hidden", !state.emergency);

    DOM.statusTimeline.innerHTML = stages.map((stage, index) => {
        const isCurrent = (index === 0 && currentStatus === "Pending") ||
                          (index === 1 && currentStatus === "Confirmed") ||
                          (index === 2 && currentStatus === "Out for Delivery") ||
                          (index === 3 && currentStatus === "Delivered");
        
        const isCompleted = stage.completedMatches.includes(currentStatus) || (index === 0);

        return `
            <div class="timeline-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'active' : ''}">
                ${index < stages.length - 1 ? '<div class="timeline-line"></div>' : ''}
                <div class="timeline-icon-wrap">
                    ${isCompleted ? `
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    ` : (index + 1)}
                </div>
                <div class="timeline-body">
                    <h4 class="timeline-step-title">${stage.title}</h4>
                    <p class="timeline-step-time">${stage.time}</p>
                </div>
            </div>
        `;
    }).join("");
}

/**
 * Fetch latest order status from backend
 */
async function refreshOrderStatus() {
    if (!state.lastOrder || !state.lastOrder.order_id) return;
    try {
        const response = await fetch(`${API_BASE}/orders/${state.lastOrder.order_id}/status`);
        const payload = await response.json();
        if (response.ok && payload.success && payload.data) {
            state.lastOrder.status = payload.data.status;
            renderStatusTimeline(payload.data.status, formatOrderDateTime(state.lastOrder.ordered_at));
        }
    } catch (e) {
        console.warn("Status refresh error:", e);
    }
}

/**
 * Setup Event Listeners
 */
function initEventListeners() {
    // Navigation / Header
    DOM.headerBackBtn.addEventListener("click", handleBackNavigation);
    DOM.headerHelpBtn.addEventListener("click", () => navigateTo("support"));
    
    // Step 1: Welcome
    DOM.startOrderBtn.addEventListener("click", () => navigateTo("waterType"));
    
    // Step 2: Review Cart Floating Bar
    if (DOM.cartReviewOrderBtn) {
        DOM.cartReviewOrderBtn.addEventListener("click", () => navigateTo("summary"));
    }

    // Step 3: Single Item Quantity Controls
    DOM.qtyMinusBtn.addEventListener("click", () => changeStepQuantity(-1));
    DOM.qtyPlusBtn.addEventListener("click", () => changeStepQuantity(1));
    
    if (DOM.qtyAddMoreBtn) {
        DOM.qtyAddMoreBtn.addEventListener("click", () => navigateTo("waterType"));
    }
    DOM.proceedToSummaryBtn.addEventListener("click", () => navigateTo("summary"));
    
    // Step 4: Summary / Add More & Place Order
    if (DOM.addMoreItemsBtn) {
        DOM.addMoreItemsBtn.addEventListener("click", () => navigateTo("waterType"));
    }

    DOM.emergencyCheckbox.addEventListener("change", (e) => {
        state.emergency = e.target.checked;
    });
    DOM.submitOrderBtn.addEventListener("click", placeOrder);
    
    // Step 5: Support
    DOM.closeSupportBtn.addEventListener("click", handleBackNavigation);
    
    // Step 6: Success
    DOM.viewDetailsBtn.addEventListener("click", () => navigateTo("details"));
    DOM.trackStatusBtn.addEventListener("click", () => {
        refreshOrderStatus();
        navigateTo("status");
    });
    DOM.successHomeBtn.addEventListener("click", () => {
        state.cart = {};
        state.stepHistory = [];
        navigateTo("welcome", false);
    });
    
    // Step 7: Details
    DOM.detailsTrackBtn.addEventListener("click", () => {
        refreshOrderStatus();
        navigateTo("status");
    });
    DOM.detailsHomeBtn.addEventListener("click", () => {
        state.cart = {};
        state.stepHistory = [];
        navigateTo("welcome", false);
    });
    
    // Step 8: Status
    DOM.statusHomeBtn.addEventListener("click", () => {
        state.cart = {};
        state.stepHistory = [];
        navigateTo("welcome", false);
    });
    
    // Bottom Bar
    DOM.bottomHelpBtn.addEventListener("click", () => navigateTo("support"));
}

/**
 * Initialize on page load
 */
window.addEventListener("DOMContentLoaded", async () => {
    initEventListeners();
    await Promise.all([
        identifyCustomer(),
        loadProducts()
    ]);
});


