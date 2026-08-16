/* ==========================================
   LOGIN PAGE
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");

    const passwordInput = document.getElementById("password");

    const togglePassword = document.getElementById("togglePassword");

    /* ===============================
       SHOW / HIDE PASSWORD
    =============================== */

    togglePassword.addEventListener("click", () => {

        const type = passwordInput.getAttribute("type");

        passwordInput.setAttribute(

            "type",

            type === "password" ? "text" : "password"

        );

        togglePassword.textContent =

            type === "password" ? "🙈" : "👁";

    });

    /* ===============================
       LOGIN (EXACT CASE-SENSITIVE)
    =============================== */
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Exact input value preserved without trimming or altering
        const username = document.getElementById("username").value;
        const password = passwordInput.value;

        if (!username || !password) {
            alert("Invalid username or password.");
            return;
        }

        const submitButton = loginForm.querySelector("button[type='submit']");
        submitButton.disabled = true;
        submitButton.textContent = "Logging in...";

        try {
            const response = await fetch(
                `${window.location.port === "5500" ? "http://localhost:5000" : window.location.origin}/api/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                alert(data.message || "Invalid username or password.");
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            window.location.href = "dashboard.html";
        } catch (error) {
            console.error(error);
            alert("Unable to connect to the server. Please try again later.");
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Login";
        }
    });

});



