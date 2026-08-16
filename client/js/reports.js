/* ==========================================
   REPORTS PAGE
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    if (requireAuth()) {

        initializeReports();

    }

});

/* ==========================================
   INITIALIZE
========================================== */

function initializeReports(){

    loadReportSummary();

    loadReportTable();

    loadCustomerStatistics();

}

/* ==========================================
   REPORT SUMMARY
========================================== */

async function loadReportSummary(){

    try {

        const [dailyData, monthlyData, weekData, yearData] = await Promise.all([

            authGet("/api/reports/daily"),

            authGet("/api/reports/monthly"),

            authGet(`/api/reports/range?start=${getDateOffset(7)}&end=${getTodayDate()}`),

            authGet(`/api/reports/range?start=${getYearStartDate()}&end=${getTodayDate()}`)

        ]);

        if (!dailyData || !monthlyData || !weekData || !yearData) return;

        if (dailyData.success) {

            document.getElementById("todayOrders").textContent = dailyData.data.total_orders ?? 0;

        }

        if (weekData.success) {

            const weekSummary = summarizeRangeData(weekData.data || []);

            document.getElementById("weekOrders").textContent = weekSummary.total;

        }

        if (monthlyData.success) {

            document.getElementById("monthOrders").textContent = monthlyData.data.total_orders ?? 0;

        }

        if (yearData.success) {

            const yearSummary = summarizeRangeData(yearData.data || []);

            document.getElementById("yearOrders").textContent = yearSummary.total;

        }

    }

    catch (error) {

        console.error(error);

        alert("Server error while loading report summary.");

    }

}

function getTodayDate(){

    return new Date().toISOString().split("T")[0];

}

function getDateOffset(days){

    const date = new Date();

    date.setDate(date.getDate() - days + 1);

    return date.toISOString().split("T")[0];

}

function getYearStartDate(){

    const date = new Date();

    date.setMonth(0, 1);

    return date.toISOString().split("T")[0];

}

function summarizeRangeData(orders){

    const summary = {

        total: 0,

        delivered: 0,

        pending: 0

    };

    if (!orders || !orders.length) return summary;

    orders.forEach(order => {

        summary.total += 1;

        if (order.status === "Delivered") summary.delivered += 1;

        if (order.status === "Pending") summary.pending += 1;

    });

    return summary;

}

/* ==========================================
   REPORT TABLE
========================================== */

async function loadReportTable(){

    try {

        const data = await authGet(`/api/reports/range?start=${getDateOffset(7)}&end=${getTodayDate()}`);

        if (!data) return;

        if (!data.success) {

            console.error(data.message || "Unable to load report table.");

            return;

        }

        renderReportTable(data.data || []);

    }

    catch (error) {

        console.error(error);

    }

}

function renderReportTable(orders){
    const tbody = document.querySelector(".report-table table tbody");
    const cardsContainer = document.getElementById("reportsCardsContainer");

    if (!tbody) return;

    if (!orders || orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: #64748b; padding: 20px;">No report data available.</td>
            </tr>
        `;
        if (cardsContainer) {
            cardsContainer.innerHTML = `
                <div style="text-align: center; color: #64748b; padding: 20px; background: #ffffff; border-radius: 16px; border: 1.5px solid #edf2f7;">
                    No report data available.
                </div>
            `;
        }
        return;
    }

    const summary = summarizeRangeData(orders);
    const todayOrders = orders.filter(order => order.ordered_at && order.ordered_at.startsWith(getTodayDate()));
    const todayDelivered = todayOrders.filter(order => order.status === "Delivered").length;
    const todayPending = todayOrders.filter(order => order.status === "Pending").length;

    // 1. Desktop Table Rows
    tbody.innerHTML = `
        <tr>
            <td><strong>Last 7 Days</strong></td>
            <td>${summary.total}</td>
            <td><span style="color: #16a34a; font-weight: 700;">${summary.delivered}</span></td>
            <td><span style="color: #d97706; font-weight: 700;">${summary.pending}</span></td>
        </tr>
        <tr>
            <td><strong>Today</strong></td>
            <td>${todayOrders.length}</td>
            <td><span style="color: #16a34a; font-weight: 700;">${todayDelivered}</span></td>
            <td><span style="color: #d97706; font-weight: 700;">${todayPending}</span></td>
        </tr>
    `;

    // 2. Mobile Cards (Matching Customers HCI Standard)
    if (cardsContainer) {
        cardsContainer.innerHTML = `
            <div class="mobile-card report-card-item">
                <div class="mobile-card-header">
                    <div>
                        <span class="mobile-detail-label">Period</span>
                        <h3 class="mobile-card-primary-title">Last 7 Days</h3>
                    </div>
                    <span class="badge badge-active" style="font-size: 13px; padding: 4px 12px;">${summary.total} Orders</span>
                </div>
                <div class="mobile-card-body">
                    <div class="mobile-detail-cell">
                        <span class="mobile-detail-label">Delivered</span>
                        <span class="mobile-detail-value" style="color: #16a34a; font-weight: 700;">✓ ${summary.delivered}</span>
                    </div>
                    <div class="mobile-detail-cell">
                        <span class="mobile-detail-label">Pending / Due</span>
                        <span class="mobile-detail-value" style="color: #d97706; font-weight: 700;">⏳ ${summary.pending}</span>
                    </div>
                </div>
            </div>

            <div class="mobile-card report-card-item">
                <div class="mobile-card-header">
                    <div>
                        <span class="mobile-detail-label">Period</span>
                        <h3 class="mobile-card-primary-title">Today</h3>
                    </div>
                    <span class="badge badge-active" style="font-size: 13px; padding: 4px 12px;">${todayOrders.length} Orders</span>
                </div>
                <div class="mobile-card-body">
                    <div class="mobile-detail-cell">
                        <span class="mobile-detail-label">Delivered</span>
                        <span class="mobile-detail-value" style="color: #16a34a; font-weight: 700;">✓ ${todayDelivered}</span>
                    </div>
                    <div class="mobile-detail-cell">
                        <span class="mobile-detail-label">Pending / Due</span>
                        <span class="mobile-detail-value" style="color: #d97706; font-weight: 700;">⏳ ${todayPending}</span>
                    </div>
                </div>
            </div>
        `;
    }
}

/* ==========================================
   CUSTOMER STATISTICS
========================================== */

async function loadCustomerStatistics(){

    try {

        const data = await authGet("/api/reports/customers");

        if (!data) return;

        if (!data.success) {

            return;

        }

        renderCustomerStatistics(data.data || []);

    }

    catch (error) {

        console.error(error);

    }

}

function renderCustomerStatistics(customers){

    const reportSection = document.querySelector(".report-table.card");

    if (!reportSection) return;

    let customerStats = document.getElementById("customerStats");

    if (!customerStats) {

        customerStats = document.createElement("div");

        customerStats.id = "customerStats";

        customerStats.className = "customer-stats";

        reportSection.appendChild(customerStats);

    }

    const topCustomers = customers.slice(0, 5);

    customerStats.innerHTML = `

        <h3>Top Customers</h3>

        <ul>

            ${topCustomers.map(customer => `<li>${customer.name}: ${customer.total_orders} orders</li>`).join("")}

        </ul>

    `;

}

/* ==========================================
   AUTH HANDLER
========================================== */

function handleUnauthorized() {

    alert("Session expired or unauthorized. Please login again.");

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    window.location.href = "login.html";

}

/* ==========================================
   REFRESH REPORT
========================================== */

function refreshReports(){

    loadReportSummary();

    loadReportTable();

    loadCustomerStatistics();

}

/* ==========================================
   EXPORT REPORT
========================================== */

function exportReport(){

    console.log("Export Report");

}

/* ==========================================
   LOGOUT
========================================== */

function logout(){

    /*
        Future
    */

}