const API_HOST = window.location.port === "5500" ? "http://localhost:5000" : window.location.origin;
document.addEventListener("DOMContentLoaded", () => {
    initializeRegisterCustomer();
});

function initializeRegisterCustomer() {
    // If not logged in as admin, adapt UI for public customer self-registration
    const token = localStorage.getItem("token");
    if (!token) {
        const sidebar = document.querySelector(".sidebar");
        const profile = document.querySelector(".profile");
        const topbarH1 = document.querySelector(".topbar h1");
        if (sidebar) sidebar.style.display = "none";
        if (profile) profile.style.display = "none";
        if (topbarH1) topbarH1.textContent = "Customer Self-Registration";
    }

    bindForm();
}

function bindForm() {
    const form = document.getElementById("customerForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("customerName").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const address = document.getElementById("address").value.trim();

        if (!name || !phone || !address) {
            alert("Please complete all fields.");
            return;
        }

        const submitButton = form.querySelector("button[type='submit']");
        submitButton.disabled = true;
        submitButton.textContent = "Registering...";

        try {
            const token = localStorage.getItem("token");
            const headers = { "Content-Type": "application/json" };
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const res = await fetch(`${API_HOST}/api/customers/register`, {
                method: "POST",
                headers,
                body: JSON.stringify({ name, phone, address })
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                alert(data?.message || "Unable to register customer.");
                return;
            }

            // Render the QR Sticker matching the mockup
            showCustomerRegistrationResult(data.qr, data.customer);
            form.reset();
        } catch (error) {
            console.error(error);
            alert("Server error while registering customer. Please try again.");
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Register Customer";
        }
    });
}

/**
 * Display the QR sticker result card matching the mockup
 */
function showCustomerRegistrationResult(qrData, customer) {
    const form = document.getElementById("customerForm");
    const registerCard = document.querySelector(".register-card");
    if (!registerCard) return;

    let resultContainer = document.getElementById("registrationResult");

    if (!resultContainer) {
        resultContainer = document.createElement("div");
        resultContainer.id = "registrationResult";
        resultContainer.className = "qr-result-wrapper";
        registerCard.appendChild(resultContainer);
    }

    const customerCode = customer?.customer_code || "CUST000004";
    const supplierPhone = "6009065856";

    resultContainer.innerHTML = `
        <!-- Green Success Alert -->
        <div class="registration-success-banner">
            <div class="success-banner-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>
            <div class="success-banner-content">
                <h3>Customer Registered Successfully</h3>
                <p>Customer Code: <strong>${customerCode}</strong></p>
            </div>
        </div>

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
                <img id="generatedQrImg" src="${qrData}" alt="Customer QR Code">
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

        <!-- Action Button (Download Only, Print Removed) -->
        <div class="sticker-actions">
            <button id="downloadQrBtn" class="btn-download-qr" type="button">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download QR
            </button>
        </div>

        <button id="registerAnotherBtn" class="btn-register-another" type="button">
            + Register Another Customer
        </button>
    `;

    // Hide original form to focus on sticker result
    if (form) form.style.display = "none";

    // Bind Download QR Button
    const downloadBtn = document.getElementById("downloadQrBtn");
    if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
            downloadStickerAsImage(qrData, customerCode, supplierPhone);
        });
    }

    // Register Another Customer Button
    const anotherBtn = document.getElementById("registerAnotherBtn");
    if (anotherBtn) {
        anotherBtn.addEventListener("click", () => {
            resultContainer.innerHTML = "";
            if (form) {
                form.style.display = "block";
                form.reset();
            }
        });
    }

    // Scroll smoothly to the sticker
    resultContainer.scrollIntoView({ behavior: "smooth" });
}

/**
 * Generate a high-resolution PNG image of the sticker and trigger download
 */
function downloadStickerAsImage(qrDataUrl, customerCode, phone = "6009065856") {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // High resolution: 800 x 1000
    canvas.width = 800;
    canvas.height = 1000;

    // 1. White Background with rounded corners
    ctx.fillStyle = "#ffffff";
    drawRoundRect(ctx, 0, 0, 800, 1000, 48);
    ctx.fill();

    // Subtle Outer Card Border
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 4;
    drawRoundRect(ctx, 2, 2, 796, 996, 48);
    ctx.stroke();

    // 2. Corner Brackets in Top-Left and Top-Right
    ctx.strokeStyle = "#104c97";
    ctx.lineWidth = 14;
    ctx.lineCap = "round";

    // Top-Left bracket
    ctx.beginPath();
    ctx.moveTo(60, 130);
    ctx.lineTo(60, 60);
    ctx.lineTo(130, 60);
    ctx.stroke();

    // Top-Right bracket
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
        // Circular phone background
        ctx.fillStyle = "#104c97";
        ctx.beginPath();
        ctx.arc(400, 715, 36, 0, Math.PI * 2);
        ctx.fill();

        // Phone icon (drawn vector on canvas)
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 32px Arial";
        ctx.fillText("📞", 400, 726);

        // Phone number text
        ctx.fillStyle = "#104c97";
        ctx.font = "800 50px Arial, sans-serif";
        ctx.fillText(phone, 400, 795);

        // 7. Water Splash Waves at Bottom
        drawWaterSplashOnCanvas(ctx, 800, 1000);

        // 8. Download PNG
        const downloadLink = document.createElement("a");
        downloadLink.download = `GT_QR_${customerCode || "Customer"}.png`;
        downloadLink.href = canvas.toDataURL("image/png");
        downloadLink.click();
    };

    qrImg.src = qrDataUrl;
}

/**
 * Helper: Rounded rectangle
 */
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

/**
 * Helper: Water splash waves on Canvas
 */
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


