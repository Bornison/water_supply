/**
 * BashiKhong Water Supply - Shared Mobile Navigation Helper
 * Injects responsive mobile navbar & offcanvas drawer into all dashboard pages.
 */

document.addEventListener("DOMContentLoaded", () => {
    initMobileNav();
});

function initMobileNav() {
    const sidebar = document.querySelector(".sidebar");
    const dashboard = document.querySelector(".dashboard");
    if (!sidebar || !dashboard) return;

    // 1. Create and inject mobile navbar if not present
    let mobileBar = document.querySelector(".mobile-nav-bar");
    if (!mobileBar) {
        const user = typeof getUser === "function" ? getUser() : null;
        const userPic = (user && user.profile_picture) ? user.profile_picture : "../assets/images/profile.png";

        mobileBar = document.createElement("header");
        mobileBar.className = "mobile-nav-bar";
        mobileBar.innerHTML = `
            <div class="mobile-nav-left">
                <button type="button" class="mobile-nav-toggle" id="mobileNavToggle" aria-label="Open Navigation">
                    ☰
                </button>
                <div class="mobile-brand-wrap" onclick="window.location='dashboard.html'" style="cursor:pointer;">
                    <img src="../assets/logo/logo.png" alt="Logo" class="mobile-brand-logo">
                    <span class="mobile-brand-title">G.T Water</span>
                </div>
            </div>
            <div class="profile" onclick="window.location='settings.html'" style="cursor:pointer;">
                <img src="${userPic}" alt="Profile" style="width:34px;height:34px;border-radius:50%;object-fit:cover;">
            </div>
        `;
        dashboard.insertBefore(mobileBar, dashboard.firstChild);
    }

    // 2. Create Backdrop
    let backdrop = document.querySelector(".sidebar-backdrop");
    if (!backdrop) {
        backdrop = document.createElement("div");
        backdrop.className = "sidebar-backdrop";
        document.body.appendChild(backdrop);
    }

    // 3. Add Close Button to Sidebar
    if (!sidebar.querySelector(".sidebar-close-btn")) {
        const closeBtn = document.createElement("button");
        closeBtn.type = "button";
        closeBtn.className = "sidebar-close-btn";
        closeBtn.setAttribute("aria-label", "Close Menu");
        closeBtn.innerHTML = "✕";
        sidebar.insertBefore(closeBtn, sidebar.firstChild);

        closeBtn.addEventListener("click", closeMobileSidebar);
    }

    // 4. Inject Logout item into Sidebar Navigation if not present
    const sidebarUl = sidebar.querySelector("ul");
    if (sidebarUl && !sidebar.querySelector(".sidebar-logout-item")) {
        const logoutLi = document.createElement("li");
        logoutLi.className = "sidebar-logout-item";
        logoutLi.innerHTML = `<span style="font-size: 16px;">🚪</span> <span>Log Out</span>`;
        logoutLi.style.cursor = "pointer";
        logoutLi.addEventListener("click", (e) => {
            e.stopPropagation();
            if (window.innerWidth <= 768) {
                closeMobileSidebar();
            }
            if (typeof confirmLogout === "function") {
                confirmLogout();
            } else if (confirm("Are you sure you want to log out?")) {
                logout();
            }
        });
        sidebarUl.appendChild(logoutLi);
    }

    // 4. Toggle Listeners
    const toggleBtn = document.getElementById("mobileNavToggle");
    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            if (sidebar.classList.contains("mobile-open")) {
                closeMobileSidebar();
            } else {
                openMobileSidebar();
            }
        });
    }

    backdrop.addEventListener("click", closeMobileSidebar);

    sidebar.querySelectorAll("li").forEach(item => {
        item.addEventListener("click", () => {
            if (window.innerWidth <= 768) {
                closeMobileSidebar();
            }
        });
    });

    function openMobileSidebar() {
        sidebar.classList.add("mobile-open");
        backdrop.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function closeMobileSidebar() {
        sidebar.classList.remove("mobile-open");
        backdrop.classList.remove("active");
        document.body.style.overflow = "";
    }
}
