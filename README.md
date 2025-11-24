# touch-grass

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### Run Tests with [Vitest](https://vitest.dev/)

```sh
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## CI/CD Pipelines

This project includes comprehensive CI/CD pipelines using GitHub Actions for automated testing, building, and deployment.

### Available Workflows

#### 1. CI Workflow (`.github/workflows/ci.yml`)

Runs on every push and pull request to `main` branch.

**Steps:**
- Linting with ESLint
- Type checking with TypeScript
- Unit tests with Vitest
- Production build

**Triggers:** Push to `main`, Pull requests to `main`

#### 2. Vercel Deployment (`.github/workflows/deploy-vercel.yml`)

Automatically deploys the web application to Vercel.

**Steps:**
- Builds the application
- Deploys to Vercel (production for `main`, preview for PRs)
- Comments deployment URL on pull requests

**Required Secrets:**
- `VERCEL_TOKEN` - Get from [Vercel Settings](https://vercel.com/account/tokens)
- `VERCEL_ORG_ID` - Run `vercel link` locally to get this value from `.vercel/project.json`
- `VERCEL_PROJECT_ID` - Run `vercel link` locally to get this value from `.vercel/project.json`

**Setup Instructions:**
```sh
# Install Vercel CLI
npm i -g vercel

# Link your project
vercel link

# Copy the values from .vercel/project.json to GitHub Secrets
```

**Triggers:** Push to `main`, Pull requests to `main`

#### 3. Android Build (`.github/workflows/build-android.yml`)

Builds Android APK (debug) and AAB (release) files.

**Steps:**
- Builds web assets
- Syncs Capacitor
- Builds Android app using Gradle
- Uploads build artifacts

**Required Secrets (for release builds):**
- `ANDROID_KEYSTORE_PASSWORD` - Keystore password
- `ANDROID_KEY_ALIAS` - Key alias
- `ANDROID_KEY_PASSWORD` - Key password

**Triggers:**
- Push to `main` (builds debug APK)
- Tags starting with `v*` (builds release AAB)
- Pull requests (builds debug APK)
- Manual workflow dispatch

#### 4. iOS Build (`.github/workflows/build-ios.yml`)

Builds iOS application for simulator (debug) and device (release).

**Steps:**
- Builds web assets
- Syncs Capacitor
- Installs CocoaPods dependencies
- Builds iOS app using Xcode
- Exports IPA (for release builds)

**Required Secrets (for release builds):**
- `MATCH_PASSWORD` - Fastlane Match password (if using Match for code signing)
- `FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD` - Apple app-specific password

**Triggers:**
- Push to `main` (builds for simulator)
- Tags starting with `v*` (builds release IPA)
- Pull requests (builds for simulator)
- Manual workflow dispatch

### Setting Up GitHub Secrets

Navigate to your repository on GitHub, then:

1. Go to **Settings** > **Secrets and variables** > **Actions**
2. Click **New repository secret**
3. Add each required secret mentioned above

### Release Process

To create a release build for mobile apps:

```sh
# Tag your release
git tag v1.0.0
git push origin v1.0.0
```

This will trigger release builds for both Android (AAB) and iOS (IPA).

### Local Mobile Development

#### Android Setup

1. Install [Android Studio](https://developer.android.com/studio)
2. Install Android SDK (via Android Studio)
3. Copy `android/local.properties.example` to `android/local.properties`
4. Update the `sdk.dir` path in `local.properties` to point to your Android SDK location

```sh
# Sync web assets with Android project
npx cap sync android

# Open in Android Studio
npx cap open android
```

#### iOS Setup

1. Install [Xcode](https://apps.apple.com/app/xcode/id497799835) (macOS only)
2. Install CocoaPods: `sudo gem install cocoapods`

```sh
# Sync web assets with iOS project
npx cap sync ios

# Install CocoaPods dependencies
cd ios/App && pod install && cd ../..

# Open in Xcode
npx cap open ios
```

### Troubleshooting

**Android Build Issues:**
- Ensure `android/gradle.properties` does NOT contain `org.gradle.java.home` (it should be managed by your system)
- Ensure `android/local.properties` exists with the correct SDK path
- Make sure Java 17 is installed

**iOS Build Issues:**
- Run `pod install` in `ios/App` directory if you encounter CocoaPods errors
- Ensure you have the latest Xcode command line tools: `xcode-select --install`
