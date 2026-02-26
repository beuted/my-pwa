# My PWA

A minimal Progressive Web App that displays "Hello World", hosted on GitHub Pages with automated iOS `.ipa` builds via GitHub Actions.

## Project Structure

```
my-pwa/
├── index.html                 # App shell + GTM snippet
├── style.css                  # Dark centered layout
├── app.js                     # Criteo dataLayer push + SW registration
├── sw.js                      # Service Worker for offline caching
├── manifest.json              # PWA manifest (name, icons, theme)
├── icons/
│   ├── icon-192.png           # PWA icon 192×192
│   └── icon-512.png           # PWA icon 512×512
├── capacitor.config.json      # Capacitor iOS config
├── package.json               # Node dependencies
└── .github/
    └── workflows/
        └── build-ios.yml      # GitHub Actions workflow to build .ipa
```

## How It Works

```
                GitHub Pages                    GitHub Actions (macOS)
               ┌───────────┐                   ┌──────────────────────┐
  Browser ───► │ index.html │    git push ────► │ npm ci               │
               │ style.css  │                   │ cap sync ios         │
               │ app.js     │                   │ xcodebuild archive   │
               │ sw.js      │                   │ ──► MyPWA.ipa        │
               └───────────┘                   └──────────────────────┘
                  PWA (web)                        Native iOS app
```

1. **GitHub Pages** serves the PWA as a regular website — installable from the browser on any device.
2. **GitHub Actions** wraps the same web assets in a native iOS shell using [Capacitor](https://capacitorjs.com/) and builds an unsigned `.ipa` on every push to `main`.

## GitHub Pages (Web)

The PWA is served directly from the repository root. Once Pages is enabled, the app is available at:

```
https://<username>.github.io/<repo-name>/
```

Users can "Add to Home Screen" from their mobile browser to get a native-like experience.

## iOS Build (IPA)

On every push to `main` (or via manual trigger), the GitHub Actions workflow:

1. Installs Node dependencies
2. Copies web assets to `www/` and runs `npx cap sync ios`
3. Builds an unsigned `.ipa` using `xcodebuild` on a macOS runner
4. Uploads the `.ipa` as a downloadable artifact

### Downloading the IPA

1. Go to the **Actions** tab in your GitHub repository
2. Click the latest **Build iOS IPA** workflow run
3. Scroll to **Artifacts** and download `MyPWA-unsigned`

### Installing on a Real Device

The `.ipa` is unsigned. To install it on a physical iPhone, use one of these tools with a free Apple ID:

- [AltStore](https://altstore.io/)
- [Sideloadly](https://sideloadly.io/)

For distribution via TestFlight or the App Store, you need a paid Apple Developer account ($99/year) and proper code signing configured as GitHub secrets.

## GTM & Criteo

The app includes Google Tag Manager and a Criteo `dataLayer` event. Replace the placeholders before going live:

| Placeholder | File | Description |
|-------------|------|-------------|
| `GTM-XXXXXXX` | `index.html` | Your GTM Container ID |
| `12345` | `app.js` | Your Criteo Partner ID |

In GTM's web console, create a tag (Custom HTML or Criteo OneTag template) triggered by the `crto_homepage` custom event.

## How to Setup GitHub Repository

Follow these steps to publish this project to a new (or different) GitHub repository.

### 1. Create the Repository

Go to [github.com/new](https://github.com/new) and create a new repository. Do **not** initialize it with a README or `.gitignore`.

### 2. Push the Code

```bash
cd my-pwa

# Initialize git (skip if already done)
git init
git branch -m main

# Stage and commit
git add -A
git commit -m "Initial commit"

# Point to your new repository
git remote add origin git@github.com:<username>/<repo-name>.git

# If migrating from another remote, replace the URL instead
# git remote set-url origin git@github.com:<username>/<repo-name>.git

# Push
git push -u origin main
```

### 3. Enable GitHub Pages

1. Go to **Settings → Pages**
2. Under **Source**, select **Branch: `main`** and folder **`/ (root)`**
3. Click **Save**
4. Your site will be live at `https://<username>.github.io/<repo-name>/` within a few minutes

### 4. Verify the iOS Build

1. Go to the **Actions** tab
2. The **Build iOS IPA** workflow should trigger automatically on push
3. If it didn't, click **Build iOS IPA → Run workflow → Run workflow**
4. Once complete, download the `.ipa` from the **Artifacts** section

### 5. (Optional) Update Capacitor App ID

If you want a unique iOS bundle identifier, edit `capacitor.config.json`:

```json
{
  "appId": "com.yourdomain.yourapp",
  "appName": "Your App Name",
  "webDir": "www"
}
```

Then commit and push — the next build will use the new identifier.
