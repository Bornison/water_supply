/* ==========================================
   ORDERS PAGE
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    if (!requireAuth()) {
        return;
    }
    initializeOrders();
});

let currentOrders = [];
let currentStatus = "all";

/* ==========================================
   INITIALIZE
========================================== */
function initializeOrders() {
    bindSearch();
    bindStatusFilters();
    bindRefreshButton();
    loadOrders();
}

/* ==========================================
   LOAD ORDERS
========================================== */
async function loadOrders() {
    const ordersTableBody = document.getElementById("ordersTableBody");
    const ordersMessage = document.getElementById("ordersMessage");
    const titleEl = document.getElementById("ordersTableTitle");

    if (!ordersTableBody || !ordersMessage) return;

    if (titleEl) {
        if (currentStatus === "due") {
            titleEl.textContent = "Due List (Payment Pending)";
        } else if (currentStatus === "pending") {
            titleEl.textContent = "Pending Orders";
        } else if (currentStatus === "delivered") {
            titleEl.textContent = "Delivered Orders";
        } else {
            titleEl.textContent = "Order List";
        }
    }

    showLoading();

    try {
        let response = null;

        if (currentStatus === "pending") {
            response = await authGet("/api/orders/pending");
        } else if (currentStatus === "due") {
            response = await authGet("/api/orders/due");
        } else if (currentStatus === "delivered") {
            response = await authGet("/api/orders/history");
        } else {
            response = await authGet("/api/orders");
        }

        if (!response) {
            showError("Unable to load orders.");
            return;
        }

        if (!response.success) {
            showError(response.message || "Unable to load orders.");
            return;
        }

        let orders = response.data || [];

        if (currentStatus === "cancelled") {
            orders = orders.filter(order => String(order.status || "").toLowerCase() === "cancelled");
        }

        currentOrders = orders;

        if (orders.length === 0) {
            showEmptyState();
            return;
        }

        renderOrders(orders);
    } catch (error) {
        console.error(error);
        showError("Server error while loading orders.");
    }
}

/* ==========================================
   RENDER ORDERS
========================================== */
function renderOrders(orders) {
    const ordersTableBody = document.getElementById("ordersTableBody");
    const ordersMessage = document.getElementById("ordersMessage");

    if (!ordersTableBody || !ordersMessage) return;

    hideLoading();
    ordersMessage.textContent = "";

    const rows = orders.map(order => {
        const status = order.status || "Unknown";
        const normalizedStatus = status.toLowerCase();
        const quantity = order.quantity ?? order.qty ?? "-";
        const orderedAt = order.ordered_at ? new Date(order.ordered_at).toLocaleString() : "-";
        const address = order.address || "-";

        let actionButtons = "";

        if (normalizedStatus === "pending") {
            actionButtons = `
                <button type="button" class="action-button deliver-action" data-order-id="${order.id}">Deliver</button>
                <button type="button" class="action-button due-action" data-order-id="${order.id}">Not Pay</button>
            `;
        } else if (normalizedStatus === "due") {
            actionButtons = `
                <button type="button" class="action-button paid-action" data-order-id="${order.id}">Mark Paid</button>
            `;
        } else if (normalizedStatus === "delivered") {
            actionButtons = `<span style="color: #15803d; font-weight: 700; font-size: 13px;">✓ Paid & Delivered</span>`;
        } else {
            actionButtons = `<span style="color: #94a3b8; font-weight: 600; font-size: 13px;">—</span>`;
        }

        return `
            <tr>
                <td><strong>${escapeHtml(order.order_number || order.id || "-")}</strong></td>
                <td>${escapeHtml(order.name || order.customer_name || "-")}</td>
                <td>${escapeHtml(order.phone || "-")}</td>
                <td>${escapeHtml(address)}</td>
                <td>${escapeHtml(order.product || order.remarks || "-")}</td>
                <td>${quantity}</td>
                <td><span class="status-pill ${getStatusClass(status)}">${status}</span></td>
                <td>${orderedAt}</td>
                <td>
                    <div class="table-actions">
                        ${actionButtons}
                    </div>
                </td>
            </tr>
        `;
    }).join("");

    ordersTableBody.innerHTML = rows;

    if (!rows.trim()) {
        showEmptyState();
        return;
    }

    bindActionButtons();
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getStatusClass(status) {
    const normalized = String(status || "").toLowerCase();
    if (normalized === "delivered") return "delivered";
    if (normalized === "pending") return "pending";
    if (normalized === "due") return "due";
    if (normalized === "cancelled") return "cancelled";
    return "status-default";
}

/* ==========================================
   SEARCH ORDERS
========================================== */
function bindSearch() {
    const searchInput = document.getElementById("searchOrder");
    if (!searchInput) return;

    searchInput.addEventListener("input", () => {
        const searchTerm = searchInput.value.trim().toLowerCase();

        if (!searchTerm) {
            renderOrders(currentOrders);
            return;
        }

        const filtered = currentOrders.filter(order => {
            return [
                order.order_number,
                order.name,
                order.customer_name,
                order.phone,
                order.address,
                order.product,
                order.remarks,
                order.status
            ]
                .filter(Boolean)
                .some(value => value.toString().toLowerCase().includes(searchTerm));
        });

        if (filtered.length === 0) {
            showEmptyState();
            return;
        }

        renderOrders(filtered);
    });
}

/* ==========================================
   FILTER ORDERS
========================================== */
function bindStatusFilters() {
    document.querySelectorAll(".status-btn").forEach(button => {
        button.addEventListener("click", () => {
            const status = button.dataset.status;
            if (!status || status === currentStatus) return;
            currentStatus = status;
            setActiveStatusButton(status);
            loadOrders();
        });
    });
}

function setActiveStatusButton(status) {
    document.querySelectorAll(".status-btn").forEach(button => {
        button.classList.toggle("active", button.dataset.status === status);
    });
}

/* ==========================================
   REFRESH ORDERS
========================================== */
function bindRefreshButton() {
    const refreshButton = document.getElementById("refreshBtn");
    if (!refreshButton) return;

    refreshButton.addEventListener("click", () => {
        loadOrders();
    });
}

/* ==========================================
   ACTION BUTTONS
========================================== */
function bindActionButtons() {
    // Deliver & Paid
    document.querySelectorAll(".deliver-action").forEach(button => {
        button.addEventListener("click", async () => {
            const orderId = button.dataset.orderId;
            if (!orderId) return;

            button.disabled = true;
            button.textContent = "Delivering...";
            await deliverOrder(orderId);
        });
    });

    // Deliver But Not Pay (Move to Due List)
    document.querySelectorAll(".due-action").forEach(button => {
        button.addEventListener("click", async () => {
            const orderId = button.dataset.orderId;
            if (!orderId) return;

            button.disabled = true;
            button.textContent = "Updating...";
            await markOrderDue(orderId);
        });
    });

    // Mark Paid (From Due List)
    document.querySelectorAll(".paid-action").forEach(button => {
        button.addEventListener("click", async () => {
            const orderId = button.dataset.orderId;
            if (!orderId) return;

            button.disabled = true;
            button.textContent = "Updating...";
            await deliverOrder(orderId);
        });
    });
}

/* ==========================================
   DELIVER ORDER (PAID)
========================================== */
async function deliverOrder(orderId) {
    try {
        const response = await authPut(`/api/orders/${orderId}/deliver`);
        if (!response || !response.success) {
            showError(response?.message || "Unable to update order.");
            return;
        }
        loadOrders();
    } catch (error) {
        console.error(error);
        showError("Server error while updating order.");
    }
}

/* ==========================================
   MARK ORDER DUE (NOT PAID)
========================================== */
async function markOrderDue(orderId) {
    try {
        const response = await authPut(`/api/orders/${orderId}/due`);
        if (!response || !response.success) {
            showError(response?.message || "Unable to move order to Due list.");
            return;
        }
        loadOrders();
    } catch (error) {
        console.error(error);
        showError("Server error while updating order status.");
    }
}

/* ==========================================
   LOADING / STATES
========================================== */
function showLoading() {
    const ordersMessage = document.getElementById("ordersMessage");
    const ordersTableBody = document.getElementById("ordersTableBody");
    if (!ordersMessage || !ordersTableBody) return;

    ordersTableBody.innerHTML = "";
    ordersMessage.textContent = "Loading orders...";
    ordersMessage.className = "orders-message loading";
}

function hideLoading() {
    const ordersMessage = document.getElementById("ordersMessage");
    if (!ordersMessage) return;
    ordersMessage.textContent = "";
    ordersMessage.className = "orders-message";
}

function showEmptyState() {
    const ordersMessage = document.getElementById("ordersMessage");
    const ordersTableBody = document.getElementById("ordersTableBody");
    if (!ordersMessage || !ordersTableBody) return;

    ordersTableBody.innerHTML = "";
    ordersMessage.textContent = currentStatus === "due"
        ? "No due orders found. All deliveries are paid!"
        : "No orders found.";
    ordersMessage.className = "orders-message empty";
}

function showError(message) {
    const ordersMessage = document.getElementById("ordersMessage");
    const ordersTableBody = document.getElementById("ordersTableBody");
    if (!ordersMessage || !ordersTableBody) return;

    ordersTableBody.innerHTML = "";
    ordersMessage.textContent = message;
    ordersMessage.className = "orders-message error";
}
