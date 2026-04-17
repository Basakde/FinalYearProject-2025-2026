# Smart Wardrobe Assistant – Frontend (Expo React Native)

This is the mobile frontend of the Smart Wardrobe Assistant, built using Expo (React Native) and TypeScript.
It allows users to upload and manage wardrobe items and get AI-driven clothing suggestions.

## Styling

The app uses Tailwind CSS for styling.

## Dependencies

Ensure the following are installed:

- **Node.js** (v22.19.0) – required runtime for Expo
- **npm** (v11.12.1) – package manager (comes with Node.js)
- **Expo CLI** (v54.0.23) – for local testing and builds

Verify installations (via terminal):

```bash
node -v
npm -v
```

## Folder Structure

```
frontend/
│
├── app/                # Screens (Home, Wardrobe, MyStylist, etc.)
├── components/         # Reusable UI components
├── context/            # State management (AuthContext, ImageContext)
├── types/              # TypeScript interfaces
├── assets/             # Static images/icons
├── package.json        # Dependency management
```

## Get Started

### 1. Install dependencies

Before running the app for the first time, install all dependencies:

```bash
npm install
```

### 2. Start the app

Navigate to the project folder and run:

```bash
npx expo start
```

### 3. Open the app

1. Install the **Expo Go** app on your phone.

2. Scan the QR code shown in the terminal with your phone camera.

3. When prompted, select **"Open in Expo Go"** (not a dev build).
