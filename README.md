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

This project uses GitHub Actions for automated testing, building, and deployment of the web application.

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

**Triggers:** Push to `main`, Pull requests to `main`

### Setting Up Vercel Deployment

1. **Get your Vercel tokens:**
   - Go to [Vercel Settings → Tokens](https://vercel.com/account/tokens)
   - Create a new token and copy it

2. **Link your project locally:**
   ```sh
   # Install Vercel CLI
   npm i -g vercel

   # Link your project
   vercel link
   ```

3. **Get your project IDs:**
   After running `vercel link`, check `.vercel/project.json` for:
   - `orgId` (this is your `VERCEL_ORG_ID`)
   - `projectId` (this is your `VERCEL_PROJECT_ID`)

4. **Add secrets to GitHub:**
   - Go to your repository on GitHub
   - Navigate to **Settings** > **Secrets and variables** > **Actions**
   - Click **New repository secret** and add:
     - `VERCEL_TOKEN` - Your Vercel token
     - `VERCEL_ORG_ID` - From `.vercel/project.json`
     - `VERCEL_PROJECT_ID` - From `.vercel/project.json`

5. **Push to GitHub:**
   Once configured, every push to `main` will deploy to production, and PRs will create preview deployments.

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

**Web Build Issues:**
- If `npm run build` fails, try deleting `node_modules` and running `npm install` again
- Ensure you're using Node.js version 20.19+ or 22.12+
- Check that all TypeScript errors are resolved with `npm run type-check`

**Android Build Issues:**
- Ensure `android/gradle.properties` does NOT contain `org.gradle.java.home` (it should be managed by your system)
- Ensure `android/local.properties` exists with the correct SDK path
- Make sure Java 17 is installed

**iOS Build Issues:**
- Run `pod install` in `ios/App` directory if you encounter CocoaPods errors
- Ensure you have the latest Xcode command line tools: `xcode-select --install`

> **Note:** Mobile build pipelines (Android/iOS) are not yet configured in CI/CD. Currently, only web deployment is automated. Mobile builds can be done locally following the setup instructions above.
