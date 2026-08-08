/* ==========================================
   REGISTER CUSTOMER
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    initializeRegisterCustomer();

});

function initializeRegisterCustomer(){

    if (requireAuth()) {

        bindForm();

    }

}

function bindForm(){

    const form = document.getElementById("customerForm");

    form.addEventListener("submit", async (e)=>{

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

        try {

            const data = await authPost("/api/customers", {

                name,

                phone,

                address

            });

            if (!data) return;

            if (!data.success) {

                alert(data.message || "Unable to register customer.");

                return;

            }

            showCustomerRegistrationResult(data.qr, data.customer);

            form.reset();

        }

        catch (error) {

            console.error(error);

            alert("Server error while registering customer.");

        }

        finally {

            submitButton.disabled = false;

        }

    });

}

function showCustomerRegistrationResult(qrData, customer) {

    let resultContainer = document.getElementById("registrationResult");

    if (!resultContainer) {

        resultContainer = document.createElement("div");

        resultContainer.id = "registrationResult";

        resultContainer.className = "qr-result";

        const form = document.getElementById("customerForm");

        form.parentNode.insertBefore(resultContainer, form.nextSibling);

    }

    resultContainer.innerHTML = `

        <div class="qr-preview">

            <h3>Customer Registered Successfully</h3>

            <p>Customer Code: ${customer?.customer_code || "N/A"}</p>

            ${qrData ? `<img src="${qrData}" alt="Customer QR Code">` : ""}

            ${qrData ? `<button id="printQrBtn" class="save-btn">Print QR</button>` : ""}

        </div>

    `;

    const printButton = document.getElementById("printQrBtn");

    if (printButton) {

        printButton.addEventListener("click", () => {

            const printWindow = window.open("", "Print QR", "width=400,height=600");

            printWindow.document.write(`

                <html>

                    <head><title>Print QR</title></head>

                    <body style="text-align:center; font-family: Arial, sans-serif;">

                        <h2>Customer QR Code</h2>

                        <img src="${qrData}" alt="QR Code">

                    </body>

                </html>

            `);

            printWindow.document.close();

            printWindow.focus();

            printWindow.print();

        });

    }

}
