/* ==========================================
   CUSTOMERS PAGE & ACTIONS
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
    if (requireAuth()) {
        initializeCustomers();
    }
});

/* ==========================================
   INITIALIZE
========================================== */
function initializeCustomers() {
    bindSearch();
    bindRegisterButton();
    bindModalClose();
    bindEditModalEvents();
    loadCustomers();
}

/* ==========================================
   LOAD CUSTOMERS
========================================== */
async function loadCustomers() {
    const container = document.getElementById("customersContainer");
    if (!container) return;

    container.innerHTML = `<p>Loading customers...</p>`;

    try {
        const data = await authGet("/api/customers");
        if (!data) return;

        if (!data.success) {
            container.innerHTML = `<p>${data.message || "Unable to load customers."}</p>`;
            return;
        }

        renderCustomers(data.data || []);
    } catch (error) {
        console.error(error);
        container.innerHTML = `<p>Server error while loading customers.</p>`;
    }
}

/* ==========================================
   RENDER CUSTOMERS (NAME ONLY UNTIL CLICKED)
========================================== */
function renderCustomers(customers) {
    const container = document.getElementById("customersContainer");
    if (!container) return;

    if (!customers || customers.length === 0) {
        container.innerHTML = `<p style="text-align: center; color: #64748b; padding: 24px;">No customers found.</p>`;
        return;
    }

    container.innerHTML = customers.map(customer => {
        const totalOrders = Number(customer.total_orders || 0);
        const pendingOrders = Number(customer.pending_orders || 0);

        return `
            <div class="customer-card clickable-customer-card" data-customer-id="${customer.id}" data-customer-code="${customer.customer_code || ''}">
                <!-- Primary Header: Shows only customer name & status indicator -->
                <div class="customer-header-row">
                    <div class="customer-name-wrap">
                        <div class="customer-avatar-icon">👤</div>
                        <h2 class="customer-display-name">${escapeHtml(customer.name)}</h2>
                        ${pendingOrders > 0 ? `<span class="badge-pending-order">⏳ ${pendingOrders} Order${pendingOrders > 1 ? 's' : ''}</span>` : ''}
                    </div>
                    <div class="customer-toggle-indicator">
                        <span class="view-details-hint">Details</span>
                        <svg class="chevron-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                </div>

                <!-- Hidden details: Revealed only when customer card area is clicked -->
                <div class="customer-details-content">
                    <div class="customer-details-grid">
                        <div class="detail-item">
                            <span class="detail-label">📞 Phone</span>
                            <span class="detail-val">${escapeHtml(customer.phone || "-")}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">📍 Address</span>
                            <span class="detail-val">${escapeHtml(customer.address || "-")}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">🆔 Customer Code</span>
                            <span class="detail-val font-mono">${escapeHtml(customer.customer_code || "-")}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">📦 Total Orders</span>
                            <span class="detail-val"><span class="customer-order-count">${totalOrders} Order${totalOrders !== 1 ? 's' : ''}</span></span>
                        </div>
                    </div>

                    <div class="customer-actions-btn">
                        <button class="view-btn" data-customer-id="${customer.id}" type="button">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="3" width="7" height="7"></rect>
                                <rect x="14" y="3" width="7" height="7"></rect>
                                <rect x="14" y="14" width="7" height="7"></rect>
                                <rect x="3" y="14" width="7" height="7"></rect>
                            </svg>
                            View QR
                        </button>
                        <button class="edit-btn" data-customer-id="${customer.id}" type="button">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            Edit
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join("");

    bindCustomerCardToggle();
    bindViewQRButtons();
    bindEditButtons();
}

function bindCustomerCardToggle() {
    const cards = document.querySelectorAll(".clickable-customer-card");
    cards.forEach(card => {
        card.addEventListener("click", (e) => {
            // Prevent collapsing/expanding if clicking action buttons inside the card
            if (e.target.closest(".customer-actions-btn")) return;

            card.classList.toggle("expanded");
        });
    });
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

/* ==========================================
   SEARCH CUSTOMER
========================================== */
function bindSearch() {
    const searchInput = document.getElementById("searchCustomer");
    if (!searchInput) return;

    searchInput.addEventListener("keyup", function () {
        const keyword = this.value.toLowerCase();
        const cards = document.querySelectorAll(".customer-card");

        cards.forEach(card => {
            const customerName = card.querySelector("h2").textContent.toLowerCase();
            const customerCode = (card.dataset.customerCode || "").toLowerCase();
            if (customerName.includes(keyword) || customerCode.includes(keyword)) {
                card.style.display = "flex";
            } else {
                card.style.display = "none";
            }
        });
    });
}

/* ==========================================
   REGISTER CUSTOMER BUTTON
========================================== */
function bindRegisterButton() {
    const btn = document.getElementById("addCustomerBtn");
    if (btn) {
        btn.addEventListener("click", () => {
            window.location.href = "register-customer.html";
        });
    }
}

/* ==========================================
   VIEW QR STICKER MODAL
========================================== */
function bindViewQRButtons() {
    const buttons = document.querySelectorAll(".view-btn");

    buttons.forEach(button => {
        button.addEventListener("click", async () => {
            const customerId = button.dataset.customerId;
            if (!customerId) return;

            try {
                const data = await authGet(`/api/customers/${customerId}`);
                if (!data || !data.success || !data.data) {
                    alert(data?.message || "Unable to load customer details.");
                    return;
                }

                const customer = data.data;
                const customerCode = customer.customer_code || `CUST${String(customer.id).padStart(6, '0')}`;
                const supplierPhone = "6009065856";

                // Generate full Order URL encoded into QR Code
                const orderLink = `${window.location.origin}/pages/customer-order.html?customerCode=${encodeURIComponent(customerCode)}`;
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(orderLink)}`;

                openQrModal(customer, customerCode, qrUrl, supplierPhone);
            } catch (error) {
                console.error(error);
                alert("Unable to load customer QR.");
            }
        });
    });
}

/**
 * Open QR Sticker Modal matching design mockup
 */
function openQrModal(customer, customerCode, qrUrl, supplierPhone = "6009065856") {
    const modal = document.getElementById("qrModal");
    const modalBody = document.getElementById("qrModalBody");
    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
        <!-- Center QR Sticker Card (Exact Mockup Design) -->
        <div class="qr-sticker-card" id="qrStickerCard">
            <!-- Top Corner Brackets -->
            <div class="corner-bracket top-left"></div>
            <div class="corner-bracket top-right"></div>

            <!-- Headings -->
            <div class="sticker-heading">
                <h2>Need Water?</h2>
                <h1>Scan Me</h1>
            </div>

            <!-- QR Code -->
            <div class="sticker-qr-box">
                <img id="modalQrImg" src="${qrUrl}" alt="Customer QR Code" crossorigin="anonymous">
            </div>

            <!-- Phone -->
            <div class="sticker-phone-section">
                <div class="sticker-phone-badge">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
                        <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.27c1.21.49 2.53.76 3.88.76a1 1 0 011 1v3.5a1 1 0 01-1 1A19.93 19.93 0 012 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.35.27 2.67.76 3.88a1 1 0 01-.27 1.11l-2.2 2.2z"/>
                    </svg>
                </div>
                <span class="sticker-phone-number">${supplierPhone}</span>
            </div>

            <!-- Water Splash Graphic at Bottom -->
            <div class="sticker-water-splash">
                <svg class="water-wave-svg" viewBox="0 0 500 120" preserveAspectRatio="none">
                    <path d="M0,40 C150,110 350,-20 500,50 L500,120 L0,120 Z" fill="#1769e8" opacity="0.3"></path>
                    <path d="M0,60 C180,10 320,90 500,40 L500,120 L0,120 Z" fill="#104c97" opacity="0.8"></path>
                </svg>
            </div>
        </div>

        <!-- Action Button (Download Only) -->
        <button id="modalDownloadQrBtn" class="btn-download-qr" type="button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download QR
        </button>
    `;

    modal.classList.remove("hidden");

    // Bind Download Button
    const downloadBtn = document.getElementById("modalDownloadQrBtn");
    if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
            downloadStickerAsImage(qrUrl, customerCode, supplierPhone);
        });
    }
}

/* ==========================================
   EDIT CUSTOMER MODAL & DELETE
========================================== */
let isConfirmingDelete = false;

function bindEditButtons() {
    const buttons = document.querySelectorAll(".edit-btn");

    buttons.forEach(button => {
        button.addEventListener("click", async () => {
            const customerId = button.dataset.customerId;
            if (!customerId) return;

            try {
                const customerResponse = await authGet(`/api/customers/${customerId}`);
                if (!customerResponse || !customerResponse.success || !customerResponse.data) {
                    alert(customerResponse?.message || "Unable to load customer details.");
                    return;
                }

                const customer = customerResponse.data;
                openEditCustomerModal(customer);
            } catch (error) {
                console.error(error);
                alert("Unable to load customer details for editing.");
            }
        });
    });
}

function openEditCustomerModal(customer) {
    const modal = document.getElementById("editCustomerModal");
    if (!modal) return;

    resetDeleteButton();

    document.getElementById("editCustomerId").value = customer.id;
    document.getElementById("editCustomerCodeDisplay").textContent = customer.customer_code || `CUST${String(customer.id).padStart(6, '0')}`;
    document.getElementById("editCustomerName").value = customer.name || "";
    document.getElementById("editCustomerPhone").value = customer.phone || "";
    document.getElementById("editCustomerAddress").value = customer.address || "";

    modal.classList.remove("hidden");
}

function resetDeleteButton() {
    isConfirmingDelete = false;
    const deleteBtn = document.getElementById("editDeleteBtn");
    if (deleteBtn) {
        deleteBtn.disabled = false;
        deleteBtn.classList.remove("confirming");
        deleteBtn.innerHTML = `
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            <span>Delete Customer</span>
        `;
    }
}

function bindEditModalEvents() {
    const form = document.getElementById("editCustomerForm");
    const modal = document.getElementById("editCustomerModal");
    const closeBtn = document.getElementById("editModalCloseBtn");
    const cancelBtn = document.getElementById("editCancelBtn");
    const deleteBtn = document.getElementById("editDeleteBtn");
    const backdrop = document.getElementById("editModalBackdrop");

    const closeModal = () => {
        resetDeleteButton();
        modal.classList.add("hidden");
    };

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
    if (backdrop) backdrop.addEventListener("click", closeModal);

    // Save Changes Handler
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const customerId = document.getElementById("editCustomerId").value;
            const name = document.getElementById("editCustomerName").value.trim();
            const phone = document.getElementById("editCustomerPhone").value.trim();
            const address = document.getElementById("editCustomerAddress").value.trim();

            if (!customerId || !name || !phone || !address) {
                alert("Please fill in all customer fields.");
                return;
            }

            const saveBtn = document.getElementById("editSaveBtn");
            saveBtn.disabled = true;
            saveBtn.textContent = "Saving...";

            try {
                const updateData = await authPut(`/api/customers/${customerId}`, {
                    name,
                    phone,
                    address
                });

                if (!updateData || !updateData.success) {
                    alert(updateData?.message || "Unable to update customer.");
                    return;
                }

                closeModal();
                loadCustomers();
            } catch (error) {
                console.error(error);
                alert("Server error while updating customer.");
            } finally {
                saveBtn.disabled = false;
                saveBtn.textContent = "Save Changes";
            }
        });
    }

    // Two-Step Delete Handler (No popup blocking issues)
    if (deleteBtn) {
        deleteBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const customerId = document.getElementById("editCustomerId").value;
            const customerName = document.getElementById("editCustomerName").value;

            if (!customerId) return;

            // Step 1: Ask for confirmation on first click
            if (!isConfirmingDelete) {
                isConfirmingDelete = true;
                deleteBtn.classList.add("confirming");
                deleteBtn.innerHTML = `<span>⚠️ Confirm Delete?</span>`;
                return;
            }

            // Step 2: User confirmed, execute delete
            deleteBtn.disabled = true;
            deleteBtn.innerHTML = `<span>Deleting...</span>`;

            try {
                const result = await authDelete(`/api/customers/${customerId}`);
                if (result && result.success) {
                    closeModal();
                    loadCustomers();
                } else if (result && result.message) {
                    alert(result.message);
                    resetDeleteButton();
                } else {
                    // Fallback
                    closeModal();
                    loadCustomers();
                }
            } catch (error) {
                console.error("Delete customer error:", error);
                alert("Could not delete customer. Please check server.");
                resetDeleteButton();
            }
        });
    }
}

function bindModalClose() {
    const modal = document.getElementById("qrModal");
    const closeBtn = document.getElementById("qrModalCloseBtn");
    const backdrop = document.getElementById("qrModalBackdrop");

    if (closeBtn) closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
    if (backdrop) backdrop.addEventListener("click", () => modal.classList.add("hidden"));
}

/**
 * Generate a high-resolution PNG image of the sticker and trigger download
 */
function downloadStickerAsImage(qrDataUrl, customerCode, phone = "6009065856") {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 800;
    canvas.height = 1000;

    // 1. White Background with rounded corners
    ctx.fillStyle = "#ffffff";
    drawRoundRect(ctx, 0, 0, 800, 1000, 48);
    ctx.fill();

    // Outer Card Border
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 4;
    drawRoundRect(ctx, 2, 2, 796, 996, 48);
    ctx.stroke();

    // 2. Corner Brackets
    ctx.strokeStyle = "#104c97";
    ctx.lineWidth = 14;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(60, 130);
    ctx.lineTo(60, 60);
    ctx.lineTo(130, 60);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(740, 130);
    ctx.lineTo(740, 60);
    ctx.lineTo(670, 60);
    ctx.stroke();

    // 3. Headings
    ctx.fillStyle = "#104c97";
    ctx.font = "800 62px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Need Water?", 400, 130);

    ctx.font = "800 76px Arial, sans-serif";
    ctx.fillText("Scan Me", 400, 215);

    // 4. Rounded Box for QR Code
    ctx.strokeStyle = "#104c97";
    ctx.lineWidth = 8;
    drawRoundRect(ctx, 200, 260, 400, 400, 36);
    ctx.stroke();

    // 5. Draw QR Image
    const qrImg = new Image();
    qrImg.crossOrigin = "anonymous";
    qrImg.onload = () => {
        ctx.drawImage(qrImg, 224, 284, 352, 352);

        // 6. Phone Section
        ctx.fillStyle = "#104c97";
        ctx.beginPath();
        ctx.arc(400, 715, 36, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 32px Arial";
        ctx.fillText("📞", 400, 726);

        ctx.fillStyle = "#104c97";
        ctx.font = "800 50px Arial, sans-serif";
        ctx.fillText(phone, 400, 795);

        // 7. Water Splash Waves
        drawWaterSplashOnCanvas(ctx, 800, 1000);

        // 8. Download PNG
        const downloadLink = document.createElement("a");
        downloadLink.download = `GT_QR_${customerCode || "Customer"}.png`;
        downloadLink.href = canvas.toDataURL("image/png");
        downloadLink.click();
    };

    qrImg.src = qrDataUrl;
}

function drawRoundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

function drawWaterSplashOnCanvas(ctx, width, height) {
    ctx.save();
    
    // Wave 1
    ctx.fillStyle = "rgba(23, 105, 232, 0.25)";
    ctx.beginPath();
    ctx.moveTo(0, height - 120);
    ctx.bezierCurveTo(width * 0.25, height - 190, width * 0.75, height - 60, width, height - 130);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // Wave 2
    ctx.fillStyle = "#104c97";
    ctx.beginPath();
    ctx.moveTo(0, height - 70);
    ctx.bezierCurveTo(width * 0.35, height - 130, width * 0.65, height - 20, width, height - 90);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // Water Droplets
    ctx.fillStyle = "#1769e8";
    const droplets = [
        { x: 120, y: height - 150, r: 8 },
        { x: 180, y: height - 180, r: 5 },
        { x: 620, y: height - 160, r: 7 },
        { x: 690, y: height - 140, r: 9 },
        { x: 400, y: height - 120, r: 6 }
    ];
    droplets.forEach(d => {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.restore();
}
