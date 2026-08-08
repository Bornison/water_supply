/* ==========================================
   SETTINGS PAGE
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    if (requireAuth()) {

        initializeSettings();

    }

});

let currentSettings = {};

/* ==========================================
   INITIALIZE
========================================== */

function initializeSettings(){

    loadBusinessInformation();

    loadProducts();

    bindSettingsForm();

    bindAddProduct();

}

/* ==========================================
   LOAD BUSINESS INFORMATION
========================================== */

async function loadBusinessInformation(){

    try {

        const data = await authGet("/api/settings");

        if (!data) return;

        if (!data.success) {

            alert(data.message || "Unable to load business settings.");

            return;

        }

        currentSettings = data.data || {};

        displayBusinessInformation(currentSettings);

    }

    catch (error) {

        console.error(error);

        alert("Server error while loading business settings.");

    }

}

function displayBusinessInformation(settings){

    document.getElementById("businessName").value = settings.business_name || "";

    document.getElementById("phone").value = settings.phone || "";

    document.getElementById("email").value = settings.email || "";

    document.getElementById("address").value = settings.address || "";

}

/* ==========================================
   LOAD PRODUCTS
========================================== */

async function loadProducts(){

    try {

        const data = await authGet("/api/products");

        if (!data) return;

        if (!data.success) {

            alert(data.message || "Unable to load products.");

            return;

        }

        renderProducts(data.data || []);

    }

    catch (error) {

        console.error(error);

        alert("Server error while loading products.");

    }

}

function renderProducts(products){

    const tableBody = document.getElementById("productTable");

    if (!tableBody) return;

    if (!products || products.length === 0) {

        tableBody.innerHTML = `

            <tr>

                <td colspan="5">No products found.</td>

            </tr>

        `;

        return;

    }

    tableBody.innerHTML = products.map(product => `

        <tr data-product-id="${product.id}" data-product-active="${product.active}">

            <td>${product.product_name || "-"}</td>

            <td>${product.volume ?? "-"}</td>

            <td>${product.unit || "-"}</td>

            <td>${product.active ? "Active" : "Inactive"}</td>

            <td>

                <button class="edit-btn">Edit</button>

                <button class="status-btn">${product.active ? "Disable" : "Enable"}</button>

            </td>

        </tr>

    `).join("");

    bindEditProduct();

    bindToggleProduct();

}

/* ==========================================
   SAVE SETTINGS
========================================== */

function bindSettingsForm(){

    const form = document.getElementById("settingsForm");

    if (!form) return;

    form.addEventListener("submit", async (e)=>{

        e.preventDefault();

        const businessName = document
            .getElementById("businessName")
            .value
            .trim();

        const phone = document
            .getElementById("phone")
            .value
            .trim();

        const email = document
            .getElementById("email")
            .value
            .trim();

        const address = document
            .getElementById("address")
            .value
            .trim();

        if (!businessName || !phone || !email || !address) {

            alert("Please complete all business details.");

            return;

        }

        const submitButton = form.querySelector("button[type='submit']");

        submitButton.disabled = true;

        const payload = {

            business_name: businessName,

            phone,

            email,

            address,

            logo: currentSettings.logo || "",

            theme_color: currentSettings.theme_color || ""

        };

        try {

            const data = await authPut("/api/settings/business", payload);

            if (!data) return;

            if (!data.success) {

                alert(data.message || "Unable to save business information.");

                return;

            }

            alert(data.message || "Business information saved successfully.");

            currentSettings = { ...currentSettings, ...payload };

        }

        catch (error) {

            console.error(error);

            alert("Server error while saving business information.");

        }

        finally {

            submitButton.disabled = false;

        }

    });

}

/* ==========================================
   ADD PRODUCT
========================================== */

function bindAddProduct(){

    document
        .getElementById("addProductBtn")
        .addEventListener("click", async () => {

            const productName = prompt("Product Name", "");

            if (productName === null) return;

            const volume = prompt("Volume", "");

            if (volume === null) return;

            const unit = prompt("Unit", "Liter");

            if (unit === null) return;

            try {

                const data = await authPost("/api/products", {

                    product_name: productName.trim(),

                    volume: Number(volume),

                    unit: unit.trim()

                });

                if (!data) return;

                if (!data.success) {

                    alert(data.message || "Unable to add product.");

                    return;

                }

                alert(data.message || "Product added successfully.");

                loadProducts();

            }

            catch (error) {

                console.error(error);

                alert("Server error while adding product.");

            }

        });

}

/* ==========================================
   EDIT PRODUCT
========================================== */

function bindEditProduct(){

    const buttons = document.querySelectorAll(".edit-btn");

    buttons.forEach(button => {

        button.addEventListener("click", async () => {

            const row = button.closest("tr");

            const productId = row?.dataset.productId;

            if (!productId) return;

            const productName = prompt("Product Name", row.children[0].textContent.trim());

            if (productName === null) return;

            const volume = prompt("Volume", row.children[1].textContent.trim());

            if (volume === null) return;

            const unit = prompt("Unit", row.children[2].textContent.trim());

            if (unit === null) return;

            try {

                const data = await authPut(`/api/products/${productId}`, {

                    product_name: productName.trim(),

                    volume: Number(volume),

                    unit: unit.trim()

                });

                if (!data) return;

                if (!data.success) {

                    alert(data.message || "Unable to update product.");

                    return;

                }

                alert(data.message || "Product updated successfully.");

                loadProducts();

            }

            catch (error) {

                console.error(error);

                alert("Server error while updating product.");

            }

        });

    });

}

function bindToggleProduct(){

    const buttons = document.querySelectorAll(".status-btn");

    buttons.forEach(button => {

        button.addEventListener("click", async () => {

            const row = button.closest("tr");

            const productId = row?.dataset.productId;

            const isActive = row?.dataset.productActive === "true";

            if (!productId) return;

            try {

                const data = await authPatch(`/api/products/${productId}/status`, {

                    active: !isActive

                });

                if (!data) return;

                if (!data.success) {

                    alert(data.message || "Unable to update product status.");

                    return;

                }

                loadProducts();

            }

            catch (error) {

                console.error(error);

                alert("Server error while updating product status.");

            }

        });

    });

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
   REFRESH
========================================== */

function refreshSettings(){

    loadBusinessInformation();

    loadProducts();

}

/* ==========================================
   LOGOUT
========================================== */

function logout(){

    /*
        Future
    */

}