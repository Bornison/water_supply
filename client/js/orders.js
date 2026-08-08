/* ==========================================
   ORDERS PAGE
========================================= */

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
========================================= */

function initializeOrders() {

    bindSearch();
    bindStatusFilters();
    bindRefreshButton();
    loadOrders();

}

/* ==========================================
   LOAD ORDERS
========================================= */

async function loadOrders() {

    const ordersTableBody = document.getElementById("ordersTableBody");
    const ordersMessage = document.getElementById("ordersMessage");

    if (!ordersTableBody || !ordersMessage) return;

    showLoading();

    try {

        let response = null;

        if (currentStatus === "pending") {
            response = await authGet("/api/orders/pending");
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
========================================= */

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

        return `
            <tr>
                <td>${order.order_number || order.id || "-"}</td>
                <td>${order.customer_code || "-"}</td>
                <td>${order.name || order.customer_name || "-"}</td>
                <td>${order.phone || "-"}</td>
                <td>${order.product || order.remarks || "-"}</td>
                <td>${quantity}</td>
                <td><span class="status-pill ${getStatusClass(status)}">${status}</span></td>
                <td>${orderedAt}</td>
                <td>
                    <div class="table-actions">
                        <button type="button" class="action-button view-btn" data-order-id="${order.id}">View</button>
                        ${normalizedStatus === "pending" ? `<button type="button" class="action-button deliver-action" data-order-id="${order.id}">Deliver</button>` : ""}
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

function getStatusClass(status) {
    const normalized = String(status || "").toLowerCase();
    if (normalized === "delivered") return "delivered";
    if (normalized === "pending") return "pending";
    if (normalized === "cancelled") return "cancelled";
    return "status-default";
}

/* ==========================================
   SEARCH ORDERS
========================================= */

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
                order.customer_code,
                order.name,
                order.customer_name,
                order.phone,
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
========================================= */

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
========================================= */

function bindRefreshButton() {

    const refreshButton = document.getElementById("refreshBtn");

    if (!refreshButton) return;

    refreshButton.addEventListener("click", () => {
        loadOrders();
    });

}

/* ==========================================
   ACTION BUTTONS
========================================= */

function bindActionButtons() {

    document.querySelectorAll(".view-btn").forEach(button => {
        button.addEventListener("click", () => {
            const orderId = button.dataset.orderId;
            if (!orderId) return;
            viewOrder(orderId);
        });
    });

    document.querySelectorAll(".deliver-action").forEach(button => {
        button.addEventListener("click", async () => {
            const orderId = button.dataset.orderId;
            if (!orderId) return;
            button.disabled = true;
            await deliverOrder(orderId);
            button.disabled = false;
        });
    });

}

function viewOrder(orderId) {

    const order = currentOrders.find(o => String(o.id) === String(orderId));
    if (!order) return;

    const orderedAt = order.ordered_at ? new Date(order.ordered_at).toLocaleString() : "-";
    const details = [
        `Order Number: ${order.order_number || order.id || "-"}`,
        `Customer Code: ${order.customer_code || "-"}`,
        `Name: ${order.name || order.customer_name || "-"}`,
        `Phone: ${order.phone || "-"}`,
        `Products: ${order.product || order.remarks || "-"}`,
        `Quantity: ${order.quantity ?? order.qty ?? "-"}`,
        `Status: ${order.status || "-"}`,
        `Ordered: ${orderedAt}`
    ].join("\n");

    alert(details);

}

/* ==========================================
   DELIVER ORDER
========================================= */

async function deliverOrder(orderId) {

    try {
        const response = await authPut(`/api/orders/${orderId}/deliver`);
        if (!response) {
            showError("Unable to update order.");
            return;
        }
        if (!response.success) {
            showError(response.message || "Unable to update order.");
            return;
        }
        loadOrders();
    } catch (error) {
        console.error(error);
        showError("Server error while updating order.");
    }

}

/* ==========================================
   LOADING / STATES
========================================= */

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
    ordersMessage.textContent = "No orders found.";
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
