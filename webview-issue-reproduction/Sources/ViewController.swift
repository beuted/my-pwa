import UIKit
import WebKit

class ViewController: UIViewController, WKNavigationDelegate {

    private var webView: WKWebView!

    // Whitelisted domains for navigation (example.com only)
    private let allowedNavigationDomains = ["example.com"]

    override func viewDidLoad() {
        super.viewDidLoad()

        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true

        webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = self
        webView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(webView)

        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: view.topAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor)
        ])

        // Load local index.html from www/
        if let wwwURL = Bundle.main.url(forResource: "www", withExtension: nil),
           let indexURL = wwwURL.appendingPathComponent("index.html") as URL? {
            webView.loadFileURL(indexURL, allowingReadAccessTo: wwwURL)
        }
    }

    // MARK: - WKNavigationDelegate

    func webView(_ webView: WKWebView,
                 decidePolicyFor navigationAction: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {

        guard let url = navigationAction.request.url else {
            decisionHandler(.allow)
            return
        }

        // Always allow local file loads
        if url.isFileURL {
            decisionHandler(.allow)
            return
        }

        let host = url.host ?? ""

        // Check if the domain is whitelisted
        let isWhitelisted = allowedNavigationDomains.contains(where: { host.hasSuffix($0) })

        if navigationAction.targetFrame?.isMainFrame == false {
            // Sub-frame (iframe) navigation
            if isWhitelisted {
                // Whitelisted: allow iframe to load inside the app
                decisionHandler(.allow)
            } else {
                // NOT whitelisted: block and open in Safari (reproducing Cordova 6.x behavior)
                decisionHandler(.cancel)
                UIApplication.shared.open(url)
            }
        } else {
            // Top-level navigation
            if isWhitelisted || url.scheme == "about" {
                decisionHandler(.allow)
            } else {
                decisionHandler(.cancel)
                UIApplication.shared.open(url)
            }
        }
    }
}
