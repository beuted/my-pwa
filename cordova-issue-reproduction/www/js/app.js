var logEl = document.getElementById("log");

function log(msg, cls) {
    var d = document.createElement("div");
    d.textContent = new Date().toLocaleTimeString() + " " + msg;
    if (cls) d.className = cls;
    logEl.appendChild(d);
    logEl.scrollTop = logEl.scrollHeight;
}

log("App loaded");

// URLs that will definitely resolve and trigger navigation policy
var TEST_URLS = [
    "https://www.google.com",
    "https://example.com",
    "https://www.wikipedia.org"
];

function injectIframe(url) {
    var container = document.getElementById("iframe-container");
    var status = document.getElementById("iframe-status");

    log("Injecting iframe: " + url, "warn");

    var iframe = document.createElement("iframe");
    iframe.src = url;
    // Make it visible so we can see what happens
    iframe.style.width = "100%";
    iframe.style.height = "150px";
    iframe.style.border = "1px solid #e94560";
    iframe.style.borderRadius = "6px";
    iframe.style.marginTop = "8px";
    iframe.style.background = "#fff";

    iframe.onload = function () {
        log("iframe loaded: " + url, "ok");
    };

    iframe.onerror = function () {
        log("iframe error: " + url, "err");
    };

    container.appendChild(iframe);
    status.textContent = "iframe injected — if Safari opens, the bug is reproduced!";
    status.className = "status";
}

function injectAllIframes() {
    var container = document.getElementById("iframe-container");
    container.innerHTML = "";
    TEST_URLS.forEach(function (url, i) {
        setTimeout(function () { injectIframe(url); }, i * 500);
    });
}

document.getElementById("btn-inject").addEventListener("click", injectAllIframes);

// Auto-inject on deviceready
document.addEventListener("deviceready", function () {
    log("deviceready fired — auto-injecting in 2s", "warn");
    setTimeout(function () { injectIframe(TEST_URLS[0]); }, 2000);
}, false);

// Log when external links are tapped
document.querySelectorAll(".link-btn").forEach(function (el) {
    el.addEventListener("click", function (e) {
        log("Tapped link: " + el.href);
    });
});
