/* ==========================================
   AUTH CONFIGURATION
========================================== */

const API_URL = "http://localhost:5000";

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

    return JSON.parse(user);

}

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