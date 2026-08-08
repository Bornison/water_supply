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

    await loadDashboard();

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
   RECENT ORDERS
========================================== */

function displayRecentOrders(orders){

    const tbody = document.getElementById("recentOrdersBody");

    if(!tbody) return;

    tbody.innerHTML = "";

    if(!orders || orders.length === 0){

        tbody.innerHTML = `

            <tr>

                <td colspan="5">No recent orders found.</td>

            </tr>

        `;

        return;

    }

    orders.forEach(order=>{

        tbody.innerHTML += `

            <tr>

                <td>${order.name || order.customer_name || "-"}</td>

                <td>${order.product || order.order_number || "-"}</td>

                <td>${order.phone ?? ""}</td>

                <td>${order.status}</td>

                <td>

                    ${order.ordered_at ? new Date(order.ordered_at).toLocaleString() : "-"}

                </td>

            </tr>

        `;

    });

}