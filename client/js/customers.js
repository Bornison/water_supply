/* ==========================================
   CUSTOMERS PAGE
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

    }

    catch (error) {

        console.error(error);

        container.innerHTML = `<p>Server error while loading customers.</p>`;

    }

}

/* ==========================================
   RENDER CUSTOMERS
========================================== */

function renderCustomers(customers) {

    const container = document.getElementById("customersContainer");

    if (!container) return;

    if (!customers || customers.length === 0) {

        container.innerHTML = `<p>No customers found.</p>`;

        return;

    }

    container.innerHTML = customers.map(customer => `

        <div class="customer-card" data-customer-id="${customer.id}">

            <div class="customer-info">

                <h2>${customer.name}</h2>

                <p>📞 ${customer.phone || "-"}</p>

                <p>📍 ${customer.address || "-"}</p>

                <p>🆔 ${customer.customer_code || "-"}</p>

            </div>

            <div class="customer-actions-btn">

                <button class="view-btn">View QR</button>

                <button class="edit-btn">Edit</button>

            </div>

        </div>

    `).join("");

    bindViewQRButtons();

    bindEditButtons();

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

            const customerName = card
                .querySelector("h2")
                .textContent
                .toLowerCase();

            if (customerName.includes(keyword)) {

                card.style.display = "flex";

            } else {

                card.style.display = "none";

            }

        });

    });

}

/* ==========================================
   REGISTER CUSTOMER
========================================== */

function bindRegisterButton() {

    document
        .getElementById("addCustomerBtn")
        .addEventListener("click", () => {

            window.location.href =
                "register-customer.html";

        });

}

/* ==========================================
   VIEW QR
========================================== */

function bindViewQRButtons() {

    const buttons = document.querySelectorAll(".view-btn");

    buttons.forEach(button => {

        button.addEventListener("click", async () => {

            const customerCard = button.closest(".customer-card");

            const customerId = customerCard?.dataset.customerId;

            if (!customerId) return;

            try {

const data = await authGet(`/api/customers/${customerId}`);

            if (!data) return;

            if (!data.success) {

                    alert(data.message || "Unable to load customer details.");

                    return;

                }

                alert(`Customer Code: ${data.data.customer_code || "Not available"}`);

            }

            catch (error) {

                console.error(error);

                alert("Unable to load customer QR.");

            }

        });

    });

}

/* ==========================================
   EDIT CUSTOMER
========================================== */

function bindEditButtons() {

    const buttons = document.querySelectorAll(".edit-btn");

    buttons.forEach(button => {

        button.addEventListener("click", async () => {

            const customerCard = button.closest(".customer-card");

            const customerId = customerCard?.dataset.customerId;

            if (!customerId) return;

            try {

                const customerResponse = await authGet(`/api/customers/${customerId}`);

                if (!customerResponse) return;

                if (!customerResponse.success) {

                    alert(customerResponse.message || "Unable to load customer details.");

                    return;

                }

                const customer = customerResponse.data;

                const name = prompt("Customer Name", customer.name);

                if (name === null) return;

                const phone = prompt("Phone Number", customer.phone);

                if (phone === null) return;

                const address = prompt("Address", customer.address);

                if (address === null) return;

                const updateData = await authPut(`/api/customers/${customerId}`, {

                    name: name.trim(),

                    phone: phone.trim(),

                    address: address.trim()

                });

                if (!updateData) return;

                if (!updateData.success) {

                    alert(updateData.message || "Unable to update customer.");

                    return;

                }

                alert(updateData.message || "Customer updated successfully.");

                loadCustomers();

            }

            catch (error) {

                console.error(error);

                alert("Unable to update customer.");

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

function refreshCustomers() {

    loadCustomers();

}

/* ==========================================
   LOGOUT
========================================== */

function logout() {

    /*
        Future
    */

}