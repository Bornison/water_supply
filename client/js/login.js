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
       LOGIN
    =============================== */

    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const username = document
            .getElementById("username")
            .value
            .trim();

        const password = passwordInput.value.trim();

        if (!username || !password) {

            alert("Please enter username and password.");

            return;

        }

        const submitButton = loginForm.querySelector("button[type='submit']");
        submitButton.disabled = true;

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

            if (response.status === 401 || response.status === 403) {

                alert(data.message || "Invalid username or password.");

                return;

            }

            if (!response.ok || !data.success) {

                alert(data.message || "Login failed. Please try again.");

                return;

            }

            localStorage.setItem("token", data.token);

            localStorage.setItem("user", JSON.stringify(data.user));

            window.location.href = "dashboard.html";

        }

        catch (error) {

            console.error(error);

            alert("Unable to connect to the server. Please try again later.");

        }

        finally {

            submitButton.disabled = false;

        }

    });

});



