/* ==========================================
   DASHBOARD
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    if (requireAuth()) {

        initializeDashboard();

    }

});

/* ==========================================
   INITIALIZE
========================================== */

async function initializeDashboard(){
    setupQuickActions();
    await loadDashboard();
}

/* ==========================================
   QUICK ACTIONS & CALL TO ACTION HANDLERS
========================================== */

function setupQuickActions() {
    const registerBtn = document.getElementById("registerBtn");
    if (registerBtn) {
        registerBtn.addEventListener("click", () => {
            window.location.href = "register-customer.html";
        });
    }

    const ordersBtn = document.getElementById("ordersBtn");
    if (ordersBtn) {
        ordersBtn.addEventListener("click", () => {
            window.location.href = "orders.html";
        });
    }

    const reportsBtn = document.getElementById("reportsBtn");
    if (reportsBtn) {
        reportsBtn.addEventListener("click", () => {
            window.location.href = "reports.html";
        });
    }
}

/* ==========================================
   LOAD DASHBOARD
========================================== */

async function loadDashboard(){

    setDashboardLoading(true);

    try{

        const data = await authGet("/api/dashboard");

        if (!data) {

            displaySummary({

                today_orders: 0,

                pending_orders: 0,

                delivered_orders: 0,

                total_customers: 0

            });

            displayRecentOrders([]);

            return;

        }

        if (!data.success) {

            alert(data.message || "Unable to load dashboard summary.");

            displaySummary({

                today_orders: 0,

                pending_orders: 0,

                delivered_orders: 0,

                total_customers: 0

            });

            displayRecentOrders([]);

            return;

        }

        displaySummary(data.summary || {

            today_orders: 0,

            pending_orders: 0,

            delivered_orders: 0,

            total_customers: 0

        });

        displayRecentOrders(data.recentOrders || []);

    }

    catch(error){

        console.error(error);

        alert("Server error while loading dashboard.");

        displaySummary({

            today_orders: 0,

            pending_orders: 0,

            delivered_orders: 0,

            total_customers: 0

        });

        displayRecentOrders([]);

    }

    finally {

        setDashboardLoading(false);

    }

}

/* ==========================================
   SUMMARY
========================================== */

function displaySummary(summary){

    document.getElementById("todayOrders").textContent =
        summary.today_orders ?? 0;

    document.getElementById("pendingOrders").textContent =
        summary.pending_orders ?? 0;

    document.getElementById("completedOrders").textContent =
        summary.delivered_orders ?? 0;

    document.getElementById("customers").textContent =
        summary.total_customers ?? 0;

}

function setDashboardLoading(isLoading){

    const ids = ["todayOrders", "pendingOrders", "completedOrders", "customers"];

    ids.forEach(id => {

        const element = document.getElementById(id);

        if(element){

            element.textContent = isLoading ? "..." : element.textContent;

        }

    });

}

/* ==========================================
   RECENT ORDERS (DESKTOP + MOBILE)
========================================== */
function displayRecentOrders(orders){
    const tbody = document.getElementById("recentOrdersBody");
    const cardsContainer = document.getElementById("recentOrdersCards");

    if(!tbody) return;

    if(!orders || orders.length === 0){
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: #64748b; padding: 18px;">No recent orders found.</td>
            </tr>
        `;
        if (cardsContainer) {
            cardsContainer.innerHTML = `
                <div style="text-align: center; color: #64748b; padding: 18px; background: #ffffff; border-radius: 16px; border: 1.5px solid #edf2f7;">
                    No recent orders found.
                </div>
            `;
        }
        return;
    }

    // 1. Desktop Table Rows
    tbody.innerHTML = orders.map(order => {
        const status = order.status || "Pending";
        return `
            <tr>
                <td><strong>${escapeHtml(order.name || order.customer_name || "-")}</strong></td>
                <td>${escapeHtml(order.product || order.remarks || "Water Jar")}</td>
                <td>${escapeHtml(order.phone || "-")}</td>
                <td><span class="status-pill ${getStatusClass(status)}">${status}</span></td>
            </tr>
        `;
    }).join("");

    // 2. Mobile Cards (Matching Customers HCI Standard)
    if (cardsContainer) {
        cardsContainer.innerHTML = orders.map(order => {
            const status = order.status || "Pending";
            const timeStr = order.ordered_at ? new Date(order.ordered_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "-";

            return `
                <div class="mobile-card recent-order-item" onclick="window.location='orders.html'" style="cursor: pointer;">
                    <div class="mobile-card-header">
                        <div class="mobile-card-title-group">
                            <div class="mobile-card-avatar">📦</div>
                            <div>
                                <h3 class="mobile-card-primary-title">${escapeHtml(order.name || order.customer_name || "Customer")}</h3>
                                <span class="mobile-card-subtitle" style="font-family: monospace; font-weight: 700; color: #1d4ed8;">${escapeHtml(order.order_number || `#ORD${String(order.id).padStart(6, '0')}`)}</span>
                            </div>
                        </div>
                        <span class="status-pill ${getStatusClass(status)}">${status}</span>
                    </div>

                    <div class="mobile-card-body">
                        <div class="mobile-detail-cell">
                            <span class="mobile-detail-label">Product</span>
                            <span class="mobile-detail-value">${escapeHtml(order.product || order.remarks || "Water Jar")}</span>
                        </div>
                        <div class="mobile-detail-cell">
                            <span class="mobile-detail-label">Ordered At</span>
                            <span class="mobile-detail-value">${timeStr}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join("");
    }
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