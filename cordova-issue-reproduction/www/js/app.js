var logEl = document.getElementById("log");

function log(msg, cls) {
    var d = document.createElement("div");
    d.textContent = new Date().toLocaleTimeString() + " " + msg;
    if (cls) d.className = cls;
    logEl.appendChild(d);
    logEl.scrollTop = logEl.scrollHeight;
}

log("App loaded");

// Simulate what GTM / third-party tags do:
// Inject a hidden iframe to an external domain.
// On cordova-ios 6.1.0+ without allow-navigation for this domain,
// this will kick the user out to Safari.
function injectIframe() {
    var container = document.getElementById("iframe-container");
    var status = document.getElementById("iframe-status");

    log("Injecting hidden iframe to bid.g.doubleclick.net...", "warn");

    var iframe = document.createElement("iframe");
    iframe.src = "https://bid.g.doubleclick.net/xbbe/pixel?d=KAE";
    iframe.style.display = "none";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";

    iframe.onload = function () {
        log("iframe loaded successfully", "ok");
        status.textContent = "iframe loaded (no redirect to Safari)";
        status.className = "status success";
    };

    iframe.onerror = function () {
        log("iframe failed to load (blocked or error)", "err");
        status.textContent = "iframe blocked or errored";
        status.className = "status error";
    };

    container.appendChild(iframe);
    status.textContent = "iframe injected — if you see Safari open, the bug is reproduced!";
    status.className = "status";

    // Also inject a second iframe simulating Pinterest's ct.html behavior
    setTimeout(function () {
        log("Injecting hidden iframe to pinterest.com/ct.html...", "warn");
        var iframe2 = document.createElement("iframe");
        iframe2.src = "https://www.pinterest.com/ct.html";
        iframe2.style.display = "none";
        iframe2.style.width = "0";
        iframe2.style.height = "0";
        iframe2.style.border = "none";

        iframe2.onload = function () {
            log("Pinterest iframe loaded successfully", "ok");
        };
        iframe2.onerror = function () {
            log("Pinterest iframe blocked or errored", "err");
        };

        container.appendChild(iframe2);
    }, 1000);
}

document.getElementById("btn-inject").addEventListener("click", injectIframe);

// Log when external links are tapped
document.querySelectorAll(".link-btn").forEach(function (el) {
    el.addEventListener("click", function (e) {
        log("Tapped link: " + el.href);
    });
});
