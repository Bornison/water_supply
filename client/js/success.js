/* ==========================================
   SUCCESS PAGE
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    initializeSuccessPage();

});

/* ==========================================
   INITIALIZE
========================================== */

function initializeSuccessPage(){

    bindNewOrderButton();

}

/* ==========================================
   PLACE ANOTHER ORDER
========================================== */

function bindNewOrderButton(){

    document
        .getElementById("newOrderBtn")
        .addEventListener("click",()=>{

            window.location.href =
                "customer-order.html";

        });

}