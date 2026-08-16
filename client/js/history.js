/**
 * Bashi Khong Water Supply - Order History Archive
 * Displays complete all-time historical orders with fast filtering and KPI stats.
 */

document.addEventListener("DOMContentLoaded", () => {
    if (!requireAuth()) {
        return;
    }
    initializeHistory();
});

let allHistoryOrders = [];
let currentFilterStatus = "all";
let currentTimeRange = "all";

/**
 * Initialize history page
 */
function initializeHistory() {
    bindHistorySearch();
    bindTimeRangeFilter();
    bindStatusFilterPills();
    bindRefreshBtn();
    loadAllHistory();
}

/**
 * Load all-time order history from backend
 */
async function loadAllHistory() {
    const tableBody = document.getElementById("historyTableBody");
    const messageEl = document.getElementById("historyMessage");
    const counterEl = document.getElementById("historyCounter");

    if (messageEl) {
        messageEl.style.display = "block";
        messageEl.textContent = "Loading order history archive...";
    }
    if (tableBody) tableBody.innerHTML = "";

    try {
        const response = await authGet("/api/orders/all-history");

        if (!response || !response.success) {
            if (messageEl) messageEl.textContent = response?.message || "Unable to load history archive.";
            return;
        }

        allHistoryOrders = response.data || [];

        // Update top KPI cards
        updateHistoryKPIs(allHistoryOrders);

        // Render filtered table
        applyFiltersAndRender();
    } catch (error) {
        console.error("History fetch error:", error);
        if (messageEl) messageEl.textContent = "Server error while fetching history archive.";
    }
}

/**
 * Calculate and display KPI counts
 */
function updateHistoryKPIs(orders) {
    const totalOrdersEl = document.getElementById("statTotalOrders");
    const deliveredEl = document.getElementById("statDelivered");
    const dueEl = document.getElementById("statDue");
    const unitsEl = document.getElementById("statUnits");

    let totalOrders = orders.length;
    let deliveredCount = 0;
    let dueCount = 0;
    let totalUnits = 0;

    orders.forEach(order => {
        const status = (order.status || "").toLowerCase();
        const qty = Number(order.quantity || 1);
        totalUnits += isNaN(qty) ? 1 : qty;

        if (status === "delivered") {
            deliveredCount++;
        } else if (status === "due") {
            dueCount++;
        }
    });

    if (totalOrdersEl) totalOrdersEl.textContent = totalOrders;
    if (deliveredEl) deliveredEl.textContent = deliveredCount;
    if (dueEl) dueEl.textContent = dueCount;
    if (unitsEl) unitsEl.textContent = totalUnits;
}

/**
 * Apply status, timeframe, and search keyword filters
 */
function applyFiltersAndRender() {
    const searchInput = document.getElementById("searchHistory");
    const keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const now = new Date();

    let filtered = allHistoryOrders.filter(order => {
        // 1. Status Filter
        if (currentFilterStatus !== "all") {
            const status = (order.status || "").toLowerCase();
            if (status !== currentFilterStatus) return false;
        }

        // 2. Timeframe Filter
        if (currentTimeRange !== "all" && order.ordered_at) {
            const orderDate = new Date(order.ordered_at);
            if (currentTimeRange === "today") {
                const isToday = orderDate.toDateString() === now.toDateString();
                if (!isToday) return false;
            } else if (currentTimeRange === "week") {
                const diffTime = Math.abs(now - orderDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays > 7) return false;
            } else if (currentTimeRange === "month") {
                if (orderDate.getMonth() !== now.getMonth() || orderDate.getFullYear() !== now.getFullYear()) {
                    return false;
                }
            }
        }

        // 3. Search Keyword Filter
        if (keyword) {
            const searchable = [
                order.order_number,
                order.name,
                order.customer_name,
                order.phone,
                order.address,
                order.product,
                order.remarks,
                order.status
            ].filter(Boolean).join(" ").toLowerCase();

            if (!searchable.includes(keyword)) return false;
        }

        return true;
    });

    renderHistoryTable(filtered);
}

/**
 * Render history table rows
 */
function renderHistoryTable(orders) {
    const tableBody = document.getElementById("historyTableBody");
    const cardsContainer = document.getElementById("historyCardsContainer");
    const messageEl = document.getElementById("historyMessage");
    const counterEl = document.getElementById("historyCounter");

    if (!tableBody) return;

    if (counterEl) {
        counterEl.textContent = `Showing ${orders.length} of ${allHistoryOrders.length} orders`;
    }

    if (!orders || orders.length === 0) {
        tableBody.innerHTML = "";
        if (cardsContainer) cardsContainer.innerHTML = "";
        if (messageEl) {
            messageEl.style.display = "block";
            messageEl.textContent = "No orders match the selected filters.";
        }
        return;
    }

    if (messageEl) {
        messageEl.style.display = "none";
    }

    // 1. Desktop Table Rows
    tableBody.innerHTML = orders.map(order => {
        const status = order.status || "Pending";
        const quantity = order.quantity ?? "-";
        const orderedAt = order.ordered_at ? formatDateTime(order.ordered_at) : "-";
        const deliveredAt = order.delivered_at ? formatDateTime(order.delivered_at) : "—";
        const address = order.address || "-";
        const phone = order.phone || "-";

        return `
            <tr>
                <td><strong>${escapeHtml(order.order_number || `#ORD${String(order.id).padStart(6, '0')}`)}</strong></td>
                <td>${escapeHtml(order.name || order.customer_name || "-")}</td>
                <td>${escapeHtml(phone)}</td>
                <td>${escapeHtml(address)}</td>
                <td>${escapeHtml(order.product || order.remarks || "Water Jar")}</td>
                <td><strong>${quantity}</strong></td>
                <td><span class="status-badge ${getStatusBadgeClass(status)}">${status}</span></td>
                <td>${orderedAt}</td>
                <td>${deliveredAt}</td>
            </tr>
        `;
    }).join("");

    // 2. Mobile Cards (Matching Customers HCI Standard)
    if (cardsContainer) {
        cardsContainer.innerHTML = orders.map(order => {
            const status = order.status || "Pending";
            const quantity = order.quantity ?? "-";
            const orderedAt = order.ordered_at ? formatDateTime(order.ordered_at) : "-";
            const deliveredAt = order.delivered_at ? formatDateTime(order.delivered_at) : "—";
            const address = order.address || "-";
            const phone = order.phone || "-";

            return `
                <div class="mobile-card history-card-item">
                    <div class="mobile-card-header">
                        <div class="mobile-card-title-group">
                            <div class="mobile-card-avatar">📜</div>
                            <div>
                                <h3 class="mobile-card-primary-title">${escapeHtml(order.name || order.customer_name || "Customer")}</h3>
                                <span class="mobile-card-subtitle" style="font-family: monospace; font-weight: 700; color: #1d4ed8;">${escapeHtml(order.order_number || `#ORD${String(order.id).padStart(6, '0')}`)}</span>
                            </div>
                        </div>
                        <span class="status-badge ${getStatusBadgeClass(status)}">${status}</span>
                    </div>

                    <div class="mobile-card-body">
                        <div class="mobile-detail-cell">
                            <span class="mobile-detail-label">Products</span>
                            <span class="mobile-detail-value">${escapeHtml(order.product || order.remarks || "Water Jar")}</span>
                        </div>
                        <div class="mobile-detail-cell">
                            <span class="mobile-detail-label">Quantity</span>
                            <span class="mobile-detail-value" style="font-weight: 700;">${quantity}</span>
                        </div>
                        <div class="mobile-detail-cell">
                            <span class="mobile-detail-label">Phone</span>
                            <span class="mobile-detail-value">
                                <a href="tel:${escapeHtml(phone)}" style="color: var(--primary); text-decoration: underline;">
                                    📞 ${escapeHtml(phone)}
                                </a>
                            </span>
                        </div>
                        <div class="mobile-detail-cell">
                            <span class="mobile-detail-label">Ordered Date</span>
                            <span class="mobile-detail-value">${orderedAt}</span>
                        </div>
                        ${deliveredAt && deliveredAt !== "—" ? `
                        <div class="mobile-detail-cell">
                            <span class="mobile-detail-label">Delivered At</span>
                            <span class="mobile-detail-value" style="color: #16a34a; font-weight: 600;">${deliveredAt}</span>
                        </div>` : ''}
                        <div class="mobile-detail-cell" style="grid-column: span 2;">
                            <span class="mobile-detail-label">Delivery Address</span>
                            <span class="mobile-detail-value">${escapeHtml(address)}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join("");
    }
}

function formatDateTime(dateStr) {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function getStatusBadgeClass(status) {
    const normalized = String(status || "").toLowerCase();
    if (normalized === "delivered") return "delivered";
    if (normalized === "due") return "due";
    if (normalized === "pending") return "pending";
    if (normalized === "cancelled") return "cancelled";
    return "pending";
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

/**
 * Event Listeners
 */
function bindHistorySearch() {
    const searchInput = document.getElementById("searchHistory");
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            applyFiltersAndRender();
        });
    }
}

function bindTimeRangeFilter() {
    const select = document.getElementById("timeRangeFilter");
    if (select) {
        select.addEventListener("change", (e) => {
            currentTimeRange = e.target.value;
            applyFiltersAndRender();
        });
    }
}

function bindStatusFilterPills() {
    document.querySelectorAll(".history-status-btn").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".history-status-btn").forEach(b => b.classList.remove("active"));
            button.classList.add("active");
            currentFilterStatus = button.dataset.status;
            applyFiltersAndRender();
        });
    });
}

function bindRefreshBtn() {
    const btn = document.getElementById("refreshHistoryBtn");
    if (btn) {
        btn.addEventListener("click", () => {
            loadAllHistory();
        });
    }
}
