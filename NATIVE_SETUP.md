# TREDIO — Native iOS Build Checklist

Everything in this file is either **already done in the repo** or a **manual step
only you can do** (Apple account, Firebase console, App Store Connect).

- App: `com.tredio.app` — display name TREDIO
- Version **1.0**, build **2**
- Sign-in: native Google + Apple via `@capacitor-firebase/authentication`
  (the sign-in screen calls `FirebaseAuthentication.signInWithGoogle()` /
  `.signInWithApple()` on device, and Firebase's web popup on the website)
- Purchases: `@revenuecat/purchases-capacitor`

---

## 1. Already in the repo (nothing for you to do)

| File | State |
| --- | --- |
| `package.json` | `firebase@^12`, `@capacitor-firebase/authentication@^8.6`, `@revenuecat/purchases-capacitor@^14` installed |
| `capacitor.config.ts` | appId `com.tredio.app`, providers `google.com` + `apple.com`, SPM symlink option |
| `ios/App/CapApp-SPM/Package.swift` | links Capacitor 8.2, Firebase iOS SDK 12.7+, Firebase Auth plugin, RevenueCat, Browser |
| `ios/App/App/AppDelegate.swift` | `import FirebaseCore` + `FirebaseApp.configure()` (guarded so a missing plist only logs) |
| `ios/App/App/Info.plist` | Google URL scheme placeholder `REVERSED_CLIENT_ID` |
| `ios/App/App/App.entitlements` | `com.apple.developer.applesignin = Default`, referenced by the App target |
| `project.pbxproj` | `MARKETING_VERSION = 1.0`, `CURRENT_PROJECT_VERSION = 2`, entitlements wired for Debug + Release |
| Backend `userData` | `subscription.sync` — reads the customer from RevenueCat with the secret key and writes the verified tier to the profile |

---

## 2. Firebase: GoogleService-Info.plist (manual)

1. Firebase console → your project → **Project settings** → your iOS app with
   bundle id **`com.tredio.app`** (create the iOS app if it is not there yet).
2. Download **`GoogleService-Info.plist`**.
3. In Xcode drag it into the **`App`** folder (`ios/App/App/`), target **App**
   checked, "Copy items if needed" checked.
4. Open the plist and copy the **`REVERSED_CLIENT_ID`** value (looks like
   `com.googleusercontent.apps.1234567890-abc123`).
5. `ios/App/App/Info.plist` → `CFBundleURLTypes` → replace the placeholder
   string `REVERSED_CLIENT_ID` with that value. It must match exactly, or Google
   sign-in closes the sheet without returning to the app.
6. Firebase console → **Authentication → Sign-in method**: enable **Google** and
   **Apple**.

> If the plist is missing the app still launches, but the console prints
> `[TREDIO] GoogleService-Info.plist is missing` and both native sign-ins fail.

---

## 3. Sign in with Apple (manual)

1. Xcode → select the **App** target → **Signing & Capabilities**.
2. **+ Capability** → **Sign in with Apple**. Xcode keeps using
   `App/App.entitlements` (already referenced); do not let it create a second file.
3. With automatic signing, Xcode registers the capability on the App ID. To do it
   by hand: Apple Developer → Certificates, Identifiers & Profiles → Identifiers →
   `com.tredio.app` → tick **Sign in with Apple** → Save.
4. On device, Apple requires the user to be signed into iCloud; in the simulator
   you must be signed into an Apple account too.

---

## 4. Signing team (manual)

Xcode → **App** target → **Signing & Capabilities** → set **Team** to your Apple
Developer team (the project has `CODE_SIGN_STYLE = Automatic` but no team yet).
The bundle id `com.tredio.app` must exist under that team.

---

## 5. RevenueCat (manual)

**Public SDK key (safe to ship).** The iOS public key starts with `appl_`.
It is read from `VITE_REVENUECAT_IOS_KEY` and compiled into the app at build
time, so after changing it you must run `npm run build` again.
Paste it in Base44 → **Settings → Secrets → `VITE_REVENUECAT_IOS_KEY`**
(the secret already exists — just confirm the value is the iOS **public** key).

**Secret API key (server-side only).** `REVENUECAT_API_KEY` must hold the
RevenueCat **secret** key (starts with `sk_`). The backend uses it to read the
subscriber's entitlements and write the tier to the profile; nothing is written
if the key is missing or the lookup fails. Never expose it to the app.

**Entitlements — exactly two, names must match character for character:**

| Entitlement | Products attached |
| --- | --- |
| `pro` | `tredio_pro_monthly`, `tredio_pro_annual` |
| `elite` | `tredio_elite_monthly`, `tredio_elite_annual`, `tredio_og100_monthly` |

No other entitlement is read anywhere in the app. OG100 (`tredio_og100_monthly`)
grants `elite` and is reported as its own tier so the founder badge shows.

**App Store Connect:** create the five auto-renewable subscriptions with exactly
those product ids, put them in the **current offering** (monthly + annual packages
per tier), and add `tredio_og100_monthly` to it as well.

**Tier flow:** on launch, and after every purchase or restore, the app calls
`subscription.sync`. The RevenueCat app user id is the Firebase uid, so the
server can look the customer up and store `free | pro | elite | og100` in
`UserProfile.subscription_tier`.

---

## 6. Build and archive (every release)

```bash
npm install
npm run build
npx cap sync ios
```

Then in Xcode:

1. Open `ios/App/App.xcworkspace` (or `ios/App/App.xcodeproj`).
2. **File → Packages → Reset Package Caches**, then **Resolve Package Versions**
   (first build after cloning downloads Firebase + RevenueCat).
3. Confirm target **App** → General → Version **1.0**, Build **2**.
4. Select **Any iOS Device (arm64)** → **Product → Archive**.
5. Organizer → **Distribute App → App Store Connect → Upload**.
6. In App Store Connect attach build 2, add the **In-App Purchases** and a
   **Privacy Policy URL**, plus the required subscription metadata.

### After every `npx cap sync ios`

`ios/App/CapApp-SPM/Package.swift` is regenerated by the CLI. Check it still
contains these two lines and re-add them if a sync removed them:

```swift
.package(url: "https://github.com/firebase/firebase-ios-sdk.git", .upToNextMajor(from: "12.7.0")),
```
```swift
.product(name: "FirebaseCore", package: "firebase-ios-sdk"),
```

The Firebase Auth plugin's Swift package pulls in Google Sign-In **and** the
Facebook SDK by default. Facebook is unused: to drop it, upgrade the Capacitor CLI
to 8.4+ and add to `capacitor.config.ts`:

```ts
experimental: { ios: { spm: { swiftToolsVersion: '6.1',
  packageTraits: { '@capacitor-firebase/authentication': ['Google'] } } } }
```

(This needs Xcode 16.3+.)

---

## 7. Troubleshooting

| Symptom | Cause |
| --- | --- |
| `[TREDIO] GoogleService-Info.plist is missing` in console | plist not added to the App target |
| Google sheet opens, app never returns | `REVERSED_CLIENT_ID` not replaced in Info.plist |
| Apple sign-in: `invalid_client` / `unknown` | capability not enabled on the App ID, or entitlement missing |
| `Product "tredio_…" not found in current offering` | product id typo, missing in App Store Connect, or offering not marked *current* |
| Tier stays `free` after purchase | `REVENUECAT_API_KEY` missing/invalid server-side, or the Firebase uid was never logged into RevenueCat |
| `Missing required module 'FirebaseCore'` | firebase-ios-sdk lines above were wiped by a sync |