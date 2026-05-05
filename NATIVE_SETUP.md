# TREDIO — Native iOS Setup Guide

This project uses Firebase Authentication.
The current build uses signInWithPopup (web/WKWebView).
For App Store native social login, follow this guide.

---

## 1. Local Setup

```bash
git clone https://github.com/yungin019/Tredia-base44.git
cd Tredia-base44
npm install
npm install @capacitor/cli @capacitor/core @capacitor/ios
npm install @capacitor-firebase/authentication
npm run build
npx cap add ios
npx cap sync ios
```

---

## 2. .env.local

Create .env.local in project root:

VITE_FIREBASE_API_KEY=AIzaSyC2yUbUi-OdU0Vp-0fHJo_rXLmh2JjaKZk
VITE_FIREBASE_APP_ID=1:676892933166:web:b5ab440ecd9a78c3ac73bf
VITE_ALPACA_CLIENT_ID=<from Alpaca dashboard>

---

## 3. GoogleService-Info.plist

1. Firebase Console > Project tredia-479515 > iOS app
2. Download GoogleService-Info.plist
3. In Xcode drag it into ios/App/App/ (check Copy items if needed)

---

## 4. AppDelegate.swift

File: ios/App/App/AppDelegate.swift

Add at top:
  import FirebaseCore

Add inside application(_:didFinishLaunchingWithOptions:):
  FirebaseApp.configure()

Full example:

  import UIKit
  import Capacitor
  import FirebaseCore

  @UIApplicationMain
  class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?

    func application(
      _ application: UIApplication,
      didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
      FirebaseApp.configure()
      return true
    }

    func application(_ app: UIApplication, open url: URL,
      options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
      return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication,
      continue userActivity: NSUserActivity,
      restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
      return ApplicationDelegateProxy.shared.application(
        application, continue: userActivity, restorationHandler: restorationHandler)
    }
  }

---

## 5. Info.plist

Add inside the root <dict>:

  <key>CFBundleURLTypes</key>
  <array>
    <dict>
      <key>CFBundleURLSchemes</key>
      <array>
        <!-- REVERSED_CLIENT_ID from GoogleService-Info.plist -->
        <string>com.googleusercontent.apps.676892933166-XXXXXXXX</string>
      </array>
    </dict>
  </array>

Replace the value with REVERSED_CLIENT_ID from your GoogleService-Info.plist.

---

## 6. Swift Package Manager

In Xcode > File > Add Package Dependencies
URL: https://github.com/capawesome-team/capacitor-firebase
Add: CapacitorFirebaseAuthentication

---

## 7. Signing & Capabilities

Target: App
- Signing: select your Apple Developer team
- Bundle ID: com.tredio.app
- + Capability > Sign In with Apple

---

## 8. Replace signInWithPopup with Native

In src/pages/SignIn.jsx, replace the social login handlers:

// REMOVE these imports:
// signInWithPopup, GoogleAuthProvider, OAuthProvider from 'firebase/auth'

// ADD these imports:
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { signInWithCredential, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';

// Google handler:
const handleGoogle = async () => {
  setLoading(true);
  try {
    const result = await FirebaseAuthentication.signInWithGoogle();
    const credential = GoogleAuthProvider.credential(result.credential?.idToken);
    const cred = await signInWithCredential(auth, credential);
    await handleAfterLogin(cred.user);
  } catch (err) {
    setError(mapFirebaseError(err));
    setLoading(false);
  }
};

// Apple handler:
const handleApple = async () => {
  setLoading(true);
  try {
    const result = await FirebaseAuthentication.signInWithApple();
    const provider = new OAuthProvider('apple.com');
    const credential = provider.credential({
      idToken: result.credential?.idToken,
      rawNonce: result.credential?.nonce,
    });
    const cred = await signInWithCredential(auth, credential);
    await handleAfterLogin(cred.user);
  } catch (err) {
    setError(mapFirebaseError(err));
    setLoading(false);
  }
};

---

## 9. Build & Run

npm run build
npx cap sync ios
npx cap open ios   # opens Xcode, then press Run
