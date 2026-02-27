# Whitelist Bug Reproduction

This repo builds **3 different iOS apps** to test how iframe navigation whitelisting behaves across frameworks and versions. The goal is to reproduce [cordova-plugin-whitelist issue #49](https://github.com/apache/cordova-plugin-whitelist/issues/49), where third-party iframes cause the app to redirect to Safari.

## The 3 Apps

| App | Folder | Framework | Whitelist mechanism | Build workflow |
|-----|--------|-----------|-------------------|----------------|
| **Cordova 6.1.0** | `cordova-issue-reproduction/` | cordova-ios@6.1.0 | `<allow-navigation>` via `cordova-plugin-whitelist` | `build-cordova-ios.yml` |
| **Cordova Latest** | `cordova-latest-reproduction/` | cordova-ios (latest) | `<allow-navigation>` via `cordova-plugin-whitelist` | `build-cordova-latest-ios.yml` |
| **Capacitor** | `capacitor-issue-reproduction/` | @capacitor/ios@8.x | `server.allowNavigation` in `capacitor.config.json` | `build-ios.yml` |

Each app has the same test UI:
- A button to inject an **example.com** iframe (whitelisted ✅)
- A button to inject a **wikipedia.org** iframe (NOT whitelisted ❌)
- A button to inject both

## Results

| App | iframe blocked? | Opens Safari? |
|-----|----------------|---------------|
| **Cordova 6.1.0** | ✅ Yes — non-whitelisted iframes trigger Safari redirect | ✅ Bug reproduced |
| **Cordova Latest** | ❌ No — `cordova-plugin-whitelist` is deprecated/ignored in cordova-ios 7.x+ | ❌ No bug |
| **Capacitor** | ❌ No — `allowNavigation` only controls top-level navigation, not iframes | ❌ No bug |

## Why the bug only occurs on Cordova 6.x

In **cordova-ios 6.x**, `cordova-plugin-whitelist` installs a `WKNavigationDelegate` that intercepts **all** navigation requests — including sub-frame (iframe) loads. If an iframe URL doesn't match `<allow-navigation>`, it calls `UIApplication.openURL` which opens Safari.

In **cordova-ios 7.x+**, the whitelist plugin was deprecated. The built-in navigation policy only enforces rules on top-level navigations, not iframes.

In **Capacitor**, `server.allowNavigation` similarly only controls top-level WebView navigation. Iframes load freely.

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
└── .github/workflows/
    ├── build-cordova-ios.yml         # Builds cordova-ios@6.1.0
    ├── build-cordova-latest-ios.yml  # Builds latest cordova-ios
    └── build-ios.yml                 # Builds Capacitor app
```

## Downloading the IPAs

1. Go to the **Actions** tab in GitHub
2. Click the relevant workflow run
3. Download the artifact:
   - `cordova-6.1.0-whitelist-bug-default`
   - `cordova-latest-whitelist-bug-default`
   - `capacitor-whitelist-bug-unsigned`

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
