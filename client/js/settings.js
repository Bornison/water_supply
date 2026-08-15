/* ==========================================
   SETTINGS PAGE - MINIMALIST PROFILE & BUSINESS
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    if (requireAuth()) {
        initializeSettings();
    }
});

let currentSettings = {};
let currentAvatarBase64 = null;
let isConfirmingProductDelete = false;

/* ==========================================
   INITIALIZE
========================================== */
function initializeSettings() {
    loadSettings();
    loadProducts();
    bindProfileForm();
    bindBusinessForm();
    bindAvatarUpload();
    bindAddProductModal();
    bindEditProductModal();
    bindRegisterQRModal();
}

/* ==========================================
   LOAD SETTINGS (PROFILE & BUSINESS)
========================================== */
async function loadSettings() {
    try {
        const data = await authGet("/api/settings");
        if (!data) return;

        if (!data.success) {
            alert(data.message || "Unable to load settings.");
            return;
        }

        currentSettings = data.data || {};
        displaySettings(currentSettings);
    } catch (error) {
        console.error(error);
        alert("Server error while loading settings.");
    }
}

function displaySettings(settings) {
    // 1. Profile Information
    const ownerNameEl = document.getElementById("ownerName");
    const ownerUserEl = document.getElementById("ownerUsername");
    const ownerPhoneEl = document.getElementById("ownerPhone");
    const avatarDisplay = document.getElementById("avatarOwnerDisplay");
    const avatarImg = document.getElementById("profileAvatarPreview");
    const topbarImg = document.getElementById("topbarProfileImg");
    const topbarName = document.getElementById("topbarProfileName");

    const displayName = settings.owner_name || settings.username || "Administrator";
    const username = settings.username || "Hanao";
    const ownerPhone = settings.owner_phone || "";
    const profilePic = settings.profile_picture || "../assets/images/profile.png";

    if (ownerNameEl) ownerNameEl.value = displayName;
    if (ownerUserEl) ownerUserEl.value = username;
    if (ownerPhoneEl) ownerPhoneEl.value = ownerPhone;
    if (avatarDisplay) avatarDisplay.textContent = displayName;
    if (avatarImg) avatarImg.src = profilePic;
    if (topbarImg) topbarImg.src = profilePic;
    if (topbarName) topbarName.textContent = displayName;

    currentAvatarBase64 = settings.profile_picture || null;

    // 2. Business Information
    const busNameEl = document.getElementById("businessName");
    const busPhoneEl = document.getElementById("businessPhone");
    const busEmailEl = document.getElementById("businessEmail");
    const busAddrEl = document.getElementById("businessAddress");

    if (busNameEl) busNameEl.value = settings.business_name || "";
    if (busPhoneEl) busPhoneEl.value = settings.phone || "";
    if (busEmailEl) busEmailEl.value = settings.email || "";
    if (busAddrEl) busAddrEl.value = settings.address || "";

    const publicUrlEl = document.getElementById("publicRegUrlDisplay");
    if (publicUrlEl) {
        const origin = window.location.origin;
        publicUrlEl.textContent = `${origin}/pages/register-customer.html`;
    }
}

/* ==========================================
   AVATAR UPLOAD & PREVIEW
========================================== */
function bindAvatarUpload() {
    const fileInput = document.getElementById("profileImageInput");
    const avatarPreview = document.getElementById("profileAvatarPreview");
    const topbarImg = document.getElementById("topbarProfileImg");
    const resetBtn = document.getElementById("resetAvatarBtn");

    if (fileInput) {
        fileInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (file.size > 2 * 1024 * 1024) {
                alert("Please choose an image under 2MB.");
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target.result;
                currentAvatarBase64 = base64;
                if (avatarPreview) avatarPreview.src = base64;
                if (topbarImg) topbarImg.src = base64;
            };
            reader.readAsDataURL(file);
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            currentAvatarBase64 = "";
            const defaultAvatar = "../assets/images/profile.png";
            if (avatarPreview) avatarPreview.src = defaultAvatar;
            if (topbarImg) topbarImg.src = defaultAvatar;
            if (fileInput) fileInput.value = "";
        });
    }
}

/* ==========================================
   SAVE PROFILE FORM (ADMINISTRATOR)
========================================== */
function bindProfileForm() {
    const form = document.getElementById("profileForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const ownerName = document.getElementById("ownerName").value.trim();
        const username = document.getElementById("ownerUsername").value.trim();
        const phone = document.getElementById("ownerPhone").value.trim();

        if (!ownerName || !username) {
            alert("Please provide display name and username.");
            return;
        }

        const submitBtn = document.getElementById("saveProfileBtn");
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Saving...</span>`;

        const payload = {
            owner_name: ownerName,
            username: username,
            phone: phone,
            profile_picture: currentAvatarBase64 || ""
        };

        try {
            const data = await authPut("/api/settings/owner", payload);
            if (!data) return;

            if (!data.success) {
                alert(data.message || "Unable to update profile.");
                return;
            }

            alert(data.message || "Profile updated successfully.");
            currentSettings = { ...currentSettings, ...payload, owner_phone: phone };
            displaySettings(currentSettings);

            // Update global localStorage user and sync UI across all pages
            const currentUser = (typeof getUser === "function" ? getUser() : {}) || {};
            const updatedUser = {
                ...currentUser,
                owner_name: ownerName,
                username: username,
                phone: phone,
                profile_picture: currentAvatarBase64 || ""
            };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            if (typeof syncUserProfileUI === "function") {
                syncUserProfileUI();
            }
        } catch (error) {
            console.error(error);
            alert("Server error while updating profile.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                <span>Save Profile</span>
            `;
        }
    });
}

/* ==========================================
   SAVE BUSINESS FORM
========================================== */
function bindBusinessForm() {
    const form = document.getElementById("businessForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const businessName = document.getElementById("businessName").value.trim();
        const phone = document.getElementById("businessPhone").value.trim();
        const email = document.getElementById("businessEmail").value.trim();
        const address = document.getElementById("businessAddress").value.trim();

        if (!businessName || !phone || !email || !address) {
            alert("Please complete all business fields.");
            return;
        }

        const submitBtn = document.getElementById("saveBusinessBtn");
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Saving...</span>`;

        const payload = {
            business_name: businessName,
            phone: phone,
            email: email,
            address: address,
            logo: currentSettings.logo || "",
            theme_color: currentSettings.theme_color || "#2563EB"
        };

        try {
            const data = await authPut("/api/settings/business", payload);
            if (!data) return;

            if (!data.success) {
                alert(data.message || "Unable to save business details.");
                return;
            }

            alert(data.message || "Business details saved successfully.");
            currentSettings = { ...currentSettings, ...payload };
            displaySettings(currentSettings);
        } catch (error) {
            console.error(error);
            alert("Server error while saving business details.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                <span>Save Business Details</span>
            `;
        }
    });
}

/* ==========================================
   COMMON REGISTRATION QR CODE (registerQR)
========================================== */
function bindRegisterQRModal() {
    const regQrBtn = document.getElementById("registerQR");
    const modal = document.getElementById("registerQrModal");
    const closeBtn = document.getElementById("regQrModalCloseBtn");
    const cancelBtn = document.getElementById("regQrCloseBtn");
    const backdrop = document.getElementById("regQrModalBackdrop");
    const downloadBtn = document.getElementById("regQrDownloadBtn");

    const closeModal = () => {
        if (modal) modal.classList.add("hidden");
    };

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
    if (backdrop) backdrop.addEventListener("click", closeModal);

    if (regQrBtn) {
        regQrBtn.addEventListener("click", () => {
            const host = window.location.origin;

            const registrationUrl = `${host}/pages/register-customer.html`;
            const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(registrationUrl)}`;
            const supplierPhone = currentSettings.phone || "6009065856";

            openRegistrationQrModal(registrationUrl, qrImageUrl, supplierPhone);
        });
    }

    if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
            const host = window.location.origin;
            const registrationUrl = `${host}/pages/register-customer.html`;
            const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(registrationUrl)}`;
            const supplierPhone = currentSettings.phone || "6009065856";

            downloadRegistrationSticker(qrImageUrl, supplierPhone);
        });
    }
}

function openRegistrationQrModal(registrationUrl, qrImageUrl, supplierPhone) {
    const modal = document.getElementById("registerQrModal");
    const modalBody = document.getElementById("regQrModalBody");
    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
        <div class="qr-sticker-card" id="regQrStickerCard">
            <!-- Top Corner Brackets -->
            <div class="corner-bracket top-left"></div>
            <div class="corner-bracket top-right"></div>

            <!-- Headings -->
            <div class="sticker-heading">
                <h2>New Customer?</h2>
                <h1>Scan to Register</h1>
            </div>

            <!-- QR Code -->
            <div class="sticker-qr-box">
                <img id="regModalQrImg" src="${qrImageUrl}" alt="Customer Self-Registration QR Code" crossorigin="anonymous">
            </div>

            <!-- Phone Section -->
            <div class="sticker-phone-section">
                <span class="sticker-phone-number">📞 ${supplierPhone}</span>
            </div>

            <p class="sticker-subtext">Scan with camera to register for water supply</p>
        </div>
    `;

    modal.classList.remove("hidden");
}

/**
 * Generate high-res Canvas PNG download of the Registration QR Sticker
 */
function downloadRegistrationSticker(qrImageUrl, phone = "6009065856") {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 800;
    canvas.height = 1000;

    // 1. Background
    ctx.fillStyle = "#ffffff";
    drawRoundRect(ctx, 0, 0, 800, 1000, 48);
    ctx.fill();

    // Border
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 4;
    drawRoundRect(ctx, 2, 2, 796, 996, 48);
    ctx.stroke();

    // 2. Corner Brackets
    ctx.strokeStyle = "#104c97";
    ctx.lineWidth = 14;
    ctx.lineCap = "round";

    // Top-Left Bracket
    ctx.beginPath();
    ctx.moveTo(40, 100);
    ctx.lineTo(40, 48);
    ctx.arcTo(40, 40, 48, 40, 16);
    ctx.lineTo(100, 40);
    ctx.stroke();

    // Top-Right Bracket
    ctx.beginPath();
    ctx.moveTo(700, 40);
    ctx.lineTo(752, 40);
    ctx.arcTo(760, 40, 760, 48, 16);
    ctx.lineTo(760, 100);
    ctx.stroke();

    // 3. Headings
    ctx.fillStyle = "#104c97";
    ctx.font = "800 36px 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("NEW CUSTOMER?", 400, 110);

    ctx.font = "900 56px 'Inter', sans-serif";
    ctx.fillText("SCAN TO REGISTER", 400, 175);

    // 4. Load & Draw QR Code
    const qrImg = new Image();
    qrImg.crossOrigin = "anonymous";
    qrImg.onload = () => {
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "rgba(0, 0, 0, 0.08)";
        ctx.shadowBlur = 24;
        ctx.shadowOffsetY = 8;
        drawRoundRect(ctx, 160, 220, 480, 480, 28);
        ctx.fill();

        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 2;
        drawRoundRect(ctx, 160, 220, 480, 480, 28);
        ctx.stroke();

        ctx.drawImage(qrImg, 185, 245, 430, 430);

        // 5. Phone Badge
        ctx.fillStyle = "#104c97";
        drawRoundRect(ctx, 210, 740, 380, 72, 36);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "800 34px 'Inter', sans-serif";
        ctx.fillText(`📞 ${phone}`, 400, 788);

        // 6. Subtext & Bottom Waves
        ctx.fillStyle = "#64748b";
        ctx.font = "700 24px 'Inter', sans-serif";
        ctx.fillText("G.T Water • Self-Registration", 400, 860);

        // Bottom Wave Accent
        ctx.save();
        ctx.beginPath();
        drawRoundRect(ctx, 0, 0, 800, 1000, 48);
        ctx.clip();

        ctx.fillStyle = "#e0f2fe";
        ctx.beginPath();
        ctx.moveTo(0, 920);
        ctx.bezierCurveTo(200, 950, 600, 890, 800, 930);
        ctx.lineTo(800, 1000);
        ctx.lineTo(0, 1000);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#0284c7";
        ctx.beginPath();
        ctx.moveTo(0, 950);
        ctx.bezierCurveTo(250, 920, 550, 970, 800, 940);
        ctx.lineTo(800, 1000);
        ctx.lineTo(0, 1000);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Trigger Download
        const link = document.createElement("a");
        link.download = `GT_Water_Customer_Registration_QR.png`;
        link.href = canvas.toDataURL("image/png");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    qrImg.src = qrImageUrl;
}

function drawRoundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
}

/* ==========================================
   LOAD PRODUCTS
========================================== */
async function loadProducts() {
    const tableBody = document.getElementById("productTable");
    if (!tableBody) return;

    tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #64748b;">Loading products...</td></tr>`;

    try {
        const data = await authGet("/api/products");
        if (!data) return;

        if (!data.success) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #ef4444;">${data.message || "Unable to load products."}</td></tr>`;
            return;
        }

        renderProducts(data.data || []);
    } catch (error) {
        console.error(error);
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #ef4444;">Server error while loading products.</td></tr>`;
    }
}

function renderProducts(products) {
    const tableBody = document.getElementById("productTable");
    if (!tableBody) return;

    if (!products || products.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: #64748b; padding: 24px;">No products found. Click "+ Add Product" to create one.</td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = products.map(product => {
        const isActive = product.active !== false;
        return `
            <tr data-product-id="${product.id}" data-product-name="${escapeHtml(product.product_name)}" data-product-volume="${product.volume}" data-product-unit="${escapeHtml(product.unit)}" data-product-active="${isActive}">
                <td><strong>${escapeHtml(product.product_name || "-")}</strong></td>
                <td>${product.volume ?? "-"}</td>
                <td>${escapeHtml(product.unit || "-")}</td>
                <td>
                    <span class="badge ${isActive ? 'badge-active' : 'badge-inactive'}">
                        ${isActive ? '● Active' : '○ Inactive'}
                    </span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="edit-btn" data-product-id="${product.id}" type="button">Edit</button>
                        <button class="status-btn ${isActive ? 'btn-disable' : 'btn-enable'}" data-product-id="${product.id}" data-product-active="${isActive}" type="button">
                            ${isActive ? 'Disable' : 'Enable'}
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");

    bindEditProductButtons();
    bindToggleProductButtons();
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
   ADD PRODUCT MODAL
========================================== */
function bindAddProductModal() {
    const addBtn = document.getElementById("addProductBtn");
    const modal = document.getElementById("addProductModal");
    const closeBtn = document.getElementById("addModalCloseBtn");
    const cancelBtn = document.getElementById("addCancelBtn");
    const backdrop = document.getElementById("addModalBackdrop");
    const form = document.getElementById("addProductForm");

    const openModal = () => {
        if (form) form.reset();
        document.getElementById("addProductUnit").value = "Liter";
        modal.classList.remove("hidden");
    };

    const closeModal = () => {
        modal.classList.add("hidden");
    };

    if (addBtn) addBtn.addEventListener("click", openModal);
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
    if (backdrop) backdrop.addEventListener("click", closeModal);

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const name = document.getElementById("addProductName").value.trim();
            const volume = parseFloat(document.getElementById("addProductVolume").value);
            const unit = document.getElementById("addProductUnit").value.trim();

            if (!name || isNaN(volume) || volume <= 0 || !unit) {
                alert("Please provide a valid product name, volume, and unit.");
                return;
            }

            const submitBtn = document.getElementById("addSubmitBtn");
            submitBtn.disabled = true;
            submitBtn.textContent = "Adding...";

            try {
                const data = await authPost("/api/products", {
                    product_name: name,
                    volume: volume,
                    unit: unit
                });

                if (!data || !data.success) {
                    alert(data?.message || "Unable to add product.");
                    return;
                }

                closeModal();
                loadProducts();
            } catch (error) {
                console.error(error);
                alert("Server error while adding product.");
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = "Add Product";
            }
        });
    }
}

/* ==========================================
   EDIT PRODUCT MODAL (WITH DELETE)
========================================== */
function bindEditProductButtons() {
    const buttons = document.querySelectorAll("#productTable .edit-btn");

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const row = button.closest("tr");
            if (!row) return;

            const productId = row.dataset.productId;
            const productName = row.dataset.productName;
            const productVolume = row.dataset.productVolume;
            const productUnit = row.dataset.productUnit;

            openEditProductModal({
                id: productId,
                product_name: productName,
                volume: productVolume,
                unit: productUnit
            });
        });
    });
}

function openEditProductModal(product) {
    const modal = document.getElementById("editProductModal");
    if (!modal) return;

    resetProductDeleteButton();

    document.getElementById("editProductId").value = product.id;
    document.getElementById("editProductName").value = product.product_name || "";
    document.getElementById("editProductVolume").value = product.volume || "";

    const unitSelect = document.getElementById("editProductUnit");
    if (unitSelect) {
        unitSelect.value = product.unit || "Liter";
    }

    modal.classList.remove("hidden");
}

function resetProductDeleteButton() {
    isConfirmingProductDelete = false;
    const deleteBtn = document.getElementById("editProductDeleteBtn");
    if (deleteBtn) {
        deleteBtn.disabled = false;
        deleteBtn.classList.remove("confirming");
        deleteBtn.innerHTML = `
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            <span>Delete Product</span>
        `;
    }
}

function bindEditProductModal() {
    const modal = document.getElementById("editProductModal");
    const closeBtn = document.getElementById("editModalCloseBtn");
    const cancelBtn = document.getElementById("editCancelBtn");
    const backdrop = document.getElementById("editModalBackdrop");
    const form = document.getElementById("editProductForm");
    const deleteBtn = document.getElementById("editProductDeleteBtn");

    const closeModal = () => {
        resetProductDeleteButton();
        modal.classList.add("hidden");
    };

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
    if (backdrop) backdrop.addEventListener("click", closeModal);

    // Save Changes Handler
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const productId = document.getElementById("editProductId").value;
            const name = document.getElementById("editProductName").value.trim();
            const volume = parseFloat(document.getElementById("editProductVolume").value);
            const unit = document.getElementById("editProductUnit").value.trim();

            if (!productId || !name || isNaN(volume) || volume <= 0 || !unit) {
                alert("Please provide a valid product name, volume, and unit.");
                return;
            }

            const saveBtn = document.getElementById("editSaveBtn");
            saveBtn.disabled = true;
            saveBtn.textContent = "Saving...";

            try {
                const data = await authPut(`/api/products/${productId}`, {
                    product_name: name,
                    volume: volume,
                    unit: unit
                });

                if (!data || !data.success) {
                    alert(data?.message || "Unable to update product.");
                    return;
                }

                closeModal();
                loadProducts();
            } catch (error) {
                console.error(error);
                alert("Server error while updating product.");
            } finally {
                saveBtn.disabled = false;
                saveBtn.textContent = "Save Changes";
            }
        });
    }

    // 2-Step In-Modal Delete Handler
    if (deleteBtn) {
        deleteBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const productId = document.getElementById("editProductId").value;
            if (!productId) return;

            // Step 1: Confirmation
            if (!isConfirmingProductDelete) {
                isConfirmingProductDelete = true;
                deleteBtn.classList.add("confirming");
                deleteBtn.innerHTML = `<span>⚠️ Confirm Delete?</span>`;
                return;
            }

            // Step 2: Execute Delete
            deleteBtn.disabled = true;
            deleteBtn.innerHTML = `<span>Deleting...</span>`;

            try {
                const result = await authDelete(`/api/products/${productId}`);
                if (result && result.success) {
                    closeModal();
                    loadProducts();
                } else if (result && result.message) {
                    alert(result.message);
                    resetProductDeleteButton();
                } else {
                    closeModal();
                    loadProducts();
                }
            } catch (error) {
                console.error("Delete product error:", error);
                alert("Could not delete product. Please check server.");
                resetProductDeleteButton();
            }
        });
    }
}

/* ==========================================
   ENABLE / DISABLE TOGGLE
========================================== */
function bindToggleProductButtons() {
    const buttons = document.querySelectorAll("#productTable .status-btn");

    buttons.forEach(button => {
        button.addEventListener("click", async () => {
            const productId = button.dataset.productId;
            const currentActive = button.dataset.productActive === "true";

            if (!productId) return;

            button.disabled = true;
            button.textContent = "Updating...";

            try {
                const data = await authPatch(`/api/products/${productId}/status`, {
                    active: !currentActive
                });

                if (!data || !data.success) {
                    alert(data?.message || "Unable to update product status.");
                    button.disabled = false;
                    button.textContent = currentActive ? "Disable" : "Enable";
                    return;
                }

                loadProducts();
            } catch (error) {
                console.error(error);
                alert("Server error while updating product status.");
                button.disabled = false;
                button.textContent = currentActive ? "Disable" : "Enable";
            }
        });
    });
}

