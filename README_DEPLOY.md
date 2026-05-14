# Firebase Deployment Instructions

To deploy the NEXT.AI application to Firebase Hosting, follow these steps:

## Prerequisites
1. Install Firebase CLI (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```
2. Login to your Firebase account:
   ```bash
   firebase login
   ```

## Deployment Steps
1. **Build and Deploy**:
   Run the following command from the project root:
   ```bash
   npm run deploy
   ```
   This command will:
   - Build the production assets using Vite (`npm run build`).
   - Deploy the contents of the `dist` folder to Firebase Hosting.

## Environment Variables
The application uses the following environment variables. Ensure they are available in your environment before running the build:
- `GEMINI_API_KEY`: Required for AI features.
- `VITE_RPC_URL`: RPC URL for blockchain interactions.

## Project Details
- **Project ID**: `nextai-99aa5`
- **Hosting URL**: `https://nextai-99aa5.web.app` (or `.firebaseapp.com`)
