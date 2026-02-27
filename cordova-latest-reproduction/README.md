# Cordova Whitelist Issue #49 — Reproduction

Reproduces [apache/cordova-plugin-whitelist#49](https://github.com/apache/cordova-plugin-whitelist/issues/49):
**iframe navigation is treated the same as top-level navigation**, causing third-party iframes (GTM, Pinterest, etc.) to kick the user out to Safari.

## The Problem

On **cordova-ios 6.1.0+** with WKWebView:

1. Third-party scripts (GTM, Pinterest Tag, ad networks) inject **hidden iframes** to external domains
2. If the iframe domain is **not** in `<allow-navigation>`, Cordova opens it in **Safari** — booting the user out of the app
3. Adding `<allow-navigation href="*" />` fixes iframes, but then **external links open inside the app** instead of Safari

There is no way to separately whitelist iframe navigation vs top-level navigation.

## What This App Does

The app has two test scenarios:

| Test | What it does |
|------|-------------|
| **Inject Hidden Iframe** | Creates invisible iframes to `bid.g.doubleclick.net` and `pinterest.com/ct.html` — simulating GTM / Pinterest Tag behavior |
| **External Links** | Links to FedEx, UPS, Google — should open in Safari, not inside the app |

## Config Variants

Three `config.xml` variants demonstrate the trade-offs:

| Config | File | Iframe behavior | Link behavior |
|--------|------|----------------|---------------|
| **Option 1** (default) | `config.xml` | ❌ Kicks user to Safari | ✅ Opens in Safari |
| **Option 2** | `configs/config-option2-allow-all.xml` | ✅ Loads silently | ❌ Opens inside app |
| **Option 3** | `configs/config-option3-specific.xml` | ✅ Loads silently (known domains only) | ✅ Opens in Safari |

**Option 3** is the best workaround, but it's brittle — if a third party changes their iframe URL, the bug resurfaces (this happened with Pinterest).

## Building the IPA

The `.ipa` is built automatically via GitHub Actions on a macOS runner.

### Automatic Build (on push)

Every push to `main` that modifies files in `cordova-issue-reproduction/` triggers a build with the default config (Option 1 — demonstrates the bug).

### Manual Build (choose a config variant)

1. Go to **Actions** → **Build Cordova iOS IPA**
2. Click **Run workflow**
3. Select a **config variant**:
   - `default` — Option 1 (demonstrates the bug)
   - `option1-reject` — Same as default
   - `option2-allow-all` — Wildcard navigation (fixes iframe, breaks links)
   - `option3-specific` — Specific domains (brittle workaround)
4. Click **Run workflow**
5. Download the `.ipa` from the **Artifacts** section

### Install on a Real Device

The `.ipa` is unsigned. To install on a physical iPhone:

1. Download the `.ipa` artifact from GitHub Actions
2. Use [AltStore](https://altstore.io/) or [Sideloadly](https://sideloadly.io/) to sign and install it
3. You need a free Apple ID (no paid developer account required)

> **Note:** This bug only manifests on a real iOS device with WKWebView. The simulator may not reproduce the Safari redirect behavior.

## Testing Steps

### Test Option 1 (the bug)

1. Install the `default` `.ipa`
2. Open the app
3. Tap **"Inject Hidden Iframe"**
4. **Expected:** Safari opens with the doubleclick URL — you've been kicked out of the app
5. Go back to the app, tap an external link (FedEx, Google)
6. **Expected:** Link opens correctly in Safari

### Test Option 2 (wildcard workaround)

1. Build and install the `option2-allow-all` `.ipa`
2. Tap **"Inject Hidden Iframe"**
3. **Expected:** Nothing visible happens — iframe loads silently ✅
4. Tap an external link (FedEx, Google)
5. **Expected:** Link opens **inside the app** instead of Safari ❌

### Test Option 3 (specific domains)

1. Build and install the `option3-specific` `.ipa`
2. Tap **"Inject Hidden Iframe"**
3. **Expected:** iframe loads silently ✅
4. Tap an external link (FedEx, Google)
5. **Expected:** Link opens correctly in Safari ✅
6. **Caveat:** If the third party changes the iframe URL, the bug reappears

## Project Structure

```
cordova-issue-reproduction/
├── config.xml                          # Default config (Option 1 — shows the bug)
├── configs/
│   ├── config-option1-reject.xml       # Same as default
│   ├── config-option2-allow-all.xml    # allow-navigation="*"
│   └── config-option3-specific.xml     # Specific iframe domains
├── www/
│   ├── index.html                      # App UI
│   ├── css/style.css                   # Styles
│   └── js/app.js                       # Iframe injection + logging
├── package.json                        # Cordova dependencies
└── README.md                           # This file
```

## References

- [Issue #49](https://github.com/apache/cordova-plugin-whitelist/issues/49) — Original issue
- [cordova-ios#766](https://github.com/nicolestandifer3/cordova-ios/issues/766) — Related iOS issue
- [CB-10709](https://issues.apache.org/jira/browse/CB-10709) — Allow iframe separately from navigation
- [CB-12455](https://issues.apache.org/jira/browse/CB-12455) — Related Jira issue
