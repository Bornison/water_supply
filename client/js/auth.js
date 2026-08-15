/* ==========================================
   AUTH CONFIGURATION
========================================== */

const API_URL = window.location.port === "5500" ? "http://localhost:5000" : window.location.origin;

/* ==========================================
   GET TOKEN
========================================== */

function getToken() {

    return localStorage.getItem("token");

}

/* ==========================================
   GET USER
========================================== */

function getUser() {

    const user = localStorage.getItem("user");

    if (!user) {

        return null;

    }

    try {
        return JSON.parse(user);
    } catch (e) {
        return null;
    }

}

/* ==========================================
   GLOBAL USER PROFILE UI SYNC
========================================== */

function syncUserProfileUI() {
    const user = getUser();
    if (!user) return;

    const profilePic = user.profile_picture || "../assets/images/profile.png";
    const displayName = user.owner_name || user.username || "Administrator";

    // Update all profile images across desktop topbar & mobile bar
    document.querySelectorAll(".profile img, #topbarProfileImg, #dashboardProfileImg").forEach(img => {
        if (profilePic) {
            img.src = profilePic;
        }
    });

    // Update all profile text / names
    document.querySelectorAll(".profile span, #topbarProfileName, #dashboardProfileName").forEach(span => {
        span.textContent = displayName;
    });
}

async function refreshUserProfile() {
    if (!getToken()) return;
    try {
        const response = await fetch(
            `${API_URL}/api/settings`,
            {
                method: "GET",
                headers: getHeaders()
            }
        );
        if (response.ok) {
            const data = await response.json();
            if (data && data.success && data.data) {
                const s = data.data;
                const user = getUser() || {};
                user.owner_name = s.owner_name || user.owner_name;
                user.username = s.username || user.username;
                user.phone = s.owner_phone || user.phone;
                user.profile_picture = s.profile_picture || user.profile_picture;
                user.business_name = s.business_name || user.business_name;
                localStorage.setItem("user", JSON.stringify(user));
                syncUserProfileUI();
            }
        }
    } catch (e) {
        // Background sync error - ignore
    }
}

// Automatically sync on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    syncUserProfileUI();
    refreshUserProfile();
});

/* ==========================================
   AUTH HEADERS
========================================== */

function getHeaders() {

    return {

        "Content-Type": "application/json",

        "Authorization": `Bearer ${getToken()}`

    };

}

/* ==========================================
   REQUIRE LOGIN
========================================== */

function requireAuth() {

    const token = getToken();

    if (!token) {

        window.location.replace("login.html");

        return false;

    }

    return true;

}

/* ==========================================
   LOGOUT
========================================== */

function logout() {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    window.location.replace("login.html");

}

/* ==========================================
   HANDLE API RESPONSE
========================================== */

async function handleResponse(response) {

    if (response.status === 401) {

        alert("Your session has expired.");

        logout();

        return null;

    }

    if (response.status === 403) {

        alert("Access denied.");

        return null;

    }

    if (!response.ok) {

        const error = await response.json();

        alert(error.message || "Request Failed.");

        return null;

    }

    return await response.json();

}

/* ==========================================
   AUTH GET
========================================== */

async function authGet(url) {

    const response = await fetch(

        API_URL + url,

        {

            method: "GET",

            headers: getHeaders()

        }

    );

    return await handleResponse(response);

}

/* ==========================================
   AUTH POST
========================================== */

async function authPost(url, body) {

    const response = await fetch(

        API_URL + url,

        {

            method: "POST",

            headers: getHeaders(),

            body: JSON.stringify(body)

        }

    );

    return await handleResponse(response);

}

/* ==========================================
   AUTH PUT
========================================== */

async function authPut(url, body) {

    const response = await fetch(

        API_URL + url,

        {

            method: "PUT",

            headers: getHeaders(),

            body: JSON.stringify(body)

        }

    );

    return await handleResponse(response);

}

/* ==========================================
   AUTH PATCH
========================================== */

async function authPatch(url, body) {

    const response = await fetch(

        API_URL + url,

        {

            method: "PATCH",

            headers: getHeaders(),

            body: JSON.stringify(body)

        }

    );

    return await handleResponse(response);

}

/* ==========================================
   AUTH DELETE
========================================== */

async function authDelete(url) {

    const response = await fetch(

        API_URL + url,

        {

            method: "DELETE",

            headers: getHeaders()

        }

    );

    return await handleResponse(response);

}

