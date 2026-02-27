var logEl = document.getElementById("log");

function log(msg, cls) {
  var d = document.createElement("div");
  d.textContent = new Date().toLocaleTimeString() + " " + msg;
  if (cls) d.className = cls;
  logEl.appendChild(d);
  logEl.scrollTop = logEl.scrollHeight;
}

log("App loaded");

var URL_EXAMPLE = "https://example.com";
var URL_WIKIPEDIA = "https://www.wikipedia.org";

function injectIframe(url) {
  var container = document.getElementById("iframe-container");
  var status = document.getElementById("iframe-status");

  log("Injecting iframe: " + url, "warn");

  var iframe = document.createElement("iframe");
  iframe.src = url;
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

// Inject example.com (whitelisted — should stay in app)
document.getElementById("btn-inject-example").addEventListener("click", function () {
  document.getElementById("iframe-container").innerHTML = "";
  injectIframe(URL_EXAMPLE);
});

// Inject wikipedia.org (NOT whitelisted — should open Safari)
document.getElementById("btn-inject-wikipedia").addEventListener("click", function () {
  document.getElementById("iframe-container").innerHTML = "";
  injectIframe(URL_WIKIPEDIA);
});

// Inject both
document.getElementById("btn-inject").addEventListener("click", function () {
  document.getElementById("iframe-container").innerHTML = "";
  injectIframe(URL_EXAMPLE);
  setTimeout(function () {
    injectIframe(URL_WIKIPEDIA);
  }, 500);
});

// Log when external links are tapped
document.querySelectorAll(".link-btn").forEach(function (el) {
  el.addEventListener("click", function (e) {
    log("Tapped link: " + el.href);
  });
});
