# Whitelist Bug Reproduction

This repo builds **4 different iOS apps** to test how iframe navigation whitelisting behaves across frameworks and versions. The goal is to reproduce [cordova-plugin-whitelist issue #49](https://github.com/apache/cordova-plugin-whitelist/issues/49), where third-party iframes cause the app to redirect to Safari.

## The 4 Apps

| App                | Folder                          | Framework            | Whitelist mechanism                                          | Build workflow                 |
| ------------------ | ------------------------------- | -------------------- | ------------------------------------------------------------ | ------------------------------ |
| **Cordova 6.1.0**  | `cordova-issue-reproduction/`   | cordova-ios@6.1.0    | `<allow-navigation>` via `cordova-plugin-whitelist`          | `build-cordova-ios.yml`        |
| **Cordova Latest** | `cordova-latest-reproduction/`  | cordova-ios (latest) | `<allow-navigation>` via `cordova-plugin-whitelist`          | `build-cordova-latest-ios.yml` |
| **Capacitor**      | `capacitor-issue-reproduction/` | @capacitor/ios@8.x   | `server.allowNavigation` in `capacitor.config.json`          | `build-ios.yml`                |
| **WKWebView**      | `webview-issue-reproduction/`   | Native Swift/WKWebView | Custom `WKNavigationDelegate` intercepting iframe navigations | `build-webview-ios.yml`        |

Each app has the same test UI:

- A button to inject an **example.com** iframe (whitelisted ✅)
- A button to inject a **wikipedia.org** iframe (NOT whitelisted ❌)
- A button to inject both

## Results

| App                | iframe blocked?                                                              | Opens Safari?     |
| ------------------ | ---------------------------------------------------------------------------- | ----------------- |
| **Cordova 6.1.0**  | ✅ Yes — non-whitelisted iframes trigger Safari redirect                     | ✅ Bug reproduced |
| **Cordova Latest** | ❌ No — `cordova-plugin-whitelist` is deprecated/ignored in cordova-ios 7.x+ | ❌ No bug         |
| **Capacitor**      | ❌ No — `allowNavigation` only controls top-level navigation, not iframes    | ❌ No bug         |
| **WKWebView**      | ✅ Yes — custom native delegate intercepts iframe navigations                | ✅ Bug reproduced |

## Why the bug only occurs on Cordova 6.x

In **cordova-ios 6.x**, the [`cordova-plugin-whitelist`](https://github.com/apache/cordova-plugin-whitelist) plugin installs a native `WKNavigationDelegate` (`CDVIntentAndNavigationFilter`) that intercepts **all** navigation requests — including **sub-frame (iframe)** loads. When an iframe tries to load a URL that doesn't match any `<allow-navigation>` entry in `config.xml`, the delegate calls `UIApplication.openURL`, which hands the URL off to Safari. This is the root cause of the bug: a simple third-party iframe (e.g. from GTM or an ad tag) can kick the user out of the app entirely.

In **cordova-ios 7.x+** (released [July 2023](https://cordova.apache.org/announcements/2023/07/10/cordova-ios-7.0.0.html)), `cordova-plugin-whitelist` was [deprecated and archived](https://github.com/apache/cordova-plugin-whitelist#deprecation-notice). The allow-list functionality was reworked and integrated into the core of Cordova itself. The key behavioral change is that the built-in navigation policy only intercepts **top-level (main frame)** navigations — iframes are no longer subject to the whitelist check, so they load freely without triggering a Safari redirect.

In **Capacitor**, the [`server.allowNavigation`](https://capacitorjs.com/docs/config#server) config option similarly only controls **top-level WebView navigation**. Iframes are not intercepted by the navigation delegate, so they always load inside the app regardless of the allowNavigation list.

The **WKWebView wrapper** app proves this isn't a Cordova-specific issue. Any native app that implements `WKNavigationDelegate.decidePolicyFor` and applies whitelist logic to **sub-frame navigations** (checking `targetFrame?.isMainFrame == false`) will exhibit the same behavior — blocking non-whitelisted iframes and opening them in Safari via `UIApplication.shared.open(url)`.

### Summary

| Framework                                      | Intercepts iframe navigations?                | Bug occurs? |
| ---------------------------------------------- | --------------------------------------------- | ----------- |
| cordova-ios 6.x + `cordova-plugin-whitelist`   | ✅ Yes — all navigations including sub-frames | ✅ Yes      |
| cordova-ios 7.x+ (whitelist plugin deprecated) | ❌ No — top-level only                        | ❌ No       |
| Capacitor 8.x                                  | ❌ No — top-level only                        | ❌ No       |
| Native WKWebView with custom delegate           | ✅ Yes — intentionally reproduces the pattern | ✅ Yes      |

## Project Structure

```
my-pwa/
├── cordova-issue-reproduction/       # Cordova 6.1.0 app
│   ├── config.xml
│   ├── configs/                      # Config variants for testing
│   └── www/                          # Web assets
├── cordova-latest-reproduction/      # Cordova latest app
│   ├── config.xml
│   ├── configs/
│   └── www/
├── capacitor-issue-reproduction/     # Capacitor 8.x app
│   ├── capacitor.config.json
│   ├── ios/                          # Xcode project
│   └── *.html, *.js, *.css          # Web assets
├── webview-issue-reproduction/       # Native WKWebView wrapper
│   ├── project.yml                   # XcodeGen spec
│   ├── Sources/                      # Swift source (AppDelegate, ViewController)
│   ├── Resources/                    # Info.plist
│   └── www/                          # Web assets
└── .github/workflows/
    ├── build-cordova-ios.yml         # Builds cordova-ios@6.1.0
    ├── build-cordova-latest-ios.yml  # Builds latest cordova-ios
    ├── build-ios.yml                 # Builds Capacitor app
    └── build-webview-ios.yml         # Builds WKWebView wrapper
```

## Downloading the IPAs

Github actions allow to build IPA by running on macos instances ! That's why it's handy to have this repository on github.

1. Go to the **Actions** tab in GitHub
2. Click the relevant workflow run
3. Download the artifact:
   - `cordova-6.1.0-whitelist-bug-default`
   - `cordova-latest-whitelist-bug-default`
   - `capacitor-whitelist-bug-unsigned`
   - `webview-whitelist-bug-unsigned`

### Installing on Saucelab

- Connect to [Saucelab](https://app.eu-central-1.saucelabs.com/) on the EU Central 1 DC
- Add the .ipa in the "App Management" tab
- Go to "Get Started Guide" > "Manual testing" > "Mobile app"
- Choose the uploaded .ipa and an IOS device
- Click "Start test"

### Installing on a Real Device

The `.ipa` files are unsigned. To install on a physical iPhone, use:

- [AltStore](https://altstore.io/)
- [Sideloadly](https://sideloadly.io/)

## Setting Up a New GitHub Repository

If you want to fork or push this to your own GitHub repository:

### 1. Clone the repo

```bash
git clone https://github.com/beuted/my-pwa.git
cd my-pwa
```

### 2. Create a new GitHub repository

Go to [github.com/new](https://github.com/new) and create a new repository. Do **not** initialize it with a README or `.gitignore`.

### 3. Change the remote and push

```bash
git remote set-url origin git@github.com:<your-username>/<your-repo>.git
git push -u origin main
```

### 4. Verify the builds

1. Go to the **Actions** tab in your new repository
2. The workflows should trigger automatically on push
3. If not, trigger them manually via **Run workflow**
4. Once complete, download the `.ipa` artifacts from each workflow run
