# MARBLEX: Android App Release Guide (Google Play Store)

This guide documents the process of packaging the MARBLEX PWA / mobile app into a signed Android App Bundle (`.aab`) ready for submission to the Google Play Store.

---

## Architecture Overview
MARBLEX provides two industry-standard native Android delivery paths:
1. **Capacitor 7 Native Shell** (`@capacitor/android`): Wraps the high-performance Vite React PWA with full native access, status bar theming, Android back button handling, and splash screen support.
2. **Trusted Web Activity (TWA)** via Google Bubblewrap / PWABuilder: Wraps the PWA utilizing Android Chrome Custom Tabs with verified Digital Asset Links (`.well-known/assetlinks.json`).

---

## Path 1: Building with Capacitor

### 1. Initialize Android Platform
Run from the `client/` directory:
```bash
npx cap add android
```

### 2. Sync Web Assets & Configuration
Whenever you update code in `/client`:
```bash
npm run build
npx cap sync android
```

### 3. Open Android Studio
```bash
npx cap open android
```

### 4. Generate Signed Release Bundle
1. In Android Studio, go to: **Build** → **Generate Signed Bundle / APK...**
2. Choose **Android App Bundle** and click **Next**.
3. Create a new Keystore (`marblex-release-key.jks`) or select your existing keystore.
4. Set destination folder and choose **release** build variant.
5. Click **Finish**. Android Studio generates:
   `android/app/release/app-release.aab`

---

## Path 2: Building via PWABuilder / TWA

1. Deploy the MARBLEX frontend to production (`https://marblex-shop.vercel.app`).
2. Go to [PWABuilder.com](https://www.pwabuilder.com/) and enter your store URL.
3. Verify:
   - Manifest: Valid icons, maskable icons, standalone display mode, orientation, shortcuts.
   - Service Worker: Active with offline fallback and background sync.
4. Click **Package for Store** → **Android**.
5. Configure package name `com.marblex.shop` and download the signed `.aab`.
6. Digital Asset Links verification file is already hosted at `/.well-known/assetlinks.json`.

---

## Push Notification Readiness (FCM)
For native Android push notifications in Capacitor:
- `@capacitor/push-notifications` is ready to be linked with `google-services.json` from Firebase Cloud Messaging (FCM).
- Web Push (`web-push` + VAPID) already functions seamlessly in installed PWA standalone mode.

