// Criteo OneTag event via dataLayer
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: "crto_homepage",
  crto: {
    email: "",
    siteType: "d",
    account: 12345 // Replace with your Criteo Partner ID
  }
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}
