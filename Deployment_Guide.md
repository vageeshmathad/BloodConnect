# 🚀 BLOODCONNECT DEPLOYMENT GUIDE

This guide provides step-by-step instructions for deploying the **BloodConnect** full-stack application. 

For college project reviews and examiner evaluations, we recommend two distinct approaches:
1. **Approach A: Global Cloud Deployment (Vercel + Render + MongoDB Atlas)**: Deploys the application live on the internet, accessible to anyone, anywhere in the world. (100% Free Tiers).
2. **Approach B: Local WiFi Network Hosting (Best for Lab Demos!)**: Runs the application on your laptop and allows examiners and classmates to access the live app instantly on their mobile phones and tablets by connecting to the same college WiFi network!

---

## 🎨 APPROACH A: GLOBAL CLOUD DEPLOYMENT (FREE TIERS)

### 🛠️ STAGE 1: SET UP MONGODB ATLAS (Primary Cloud Database)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free account.
2. Create a new project and build a database choosing the **M0 Free Tier** cluster.
3. Choose a region close to you (e.g., AWS / Mumbai) and click **Create**.
4. In the **Security Quickstart**:
   - Set a Database Username and a secure Password. **(Save these credentials!)**
   - Under **IP Access List**, add `0.0.0.0/0` (Allow access from anywhere, required for cloud platforms like Render).
5. Click **Database** under deployment, select your cluster, and click **Connect**.
6. Select **Drivers** and copy your **Connection String**. It will look like this:
   `mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/bloodconnect?retryWrites=true&w=majority`
7. Replace `<username>` and `<password>` with your database user credentials.

---

### 🖥️ STAGE 2: DEPLOY NODE/EXPRESS BACKEND (on Render)
[Render](https://render.com/) is a free hosting provider for backend Node.js APIs.

1. Create a free account on [Render](https://render.com/).
2. Push your `server` code to a repository on **GitHub** (or deploy directly from Git).
3. On Render, click **New +** and select **Web Service**.
4. Connect your GitHub repository.
5. Configure the Web Service settings:
   - **Name**: `bloodconnect-backend`
   - **Root Directory**: `server` (crucial since your server code resides in a subdirectory)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`
6. Click **Advanced** and add these **Environment Variables**:
   - `MONGO_URI` = *[Your MongoDB Atlas connection string from Stage 1]*
   - `PORT` = `5000`
7. Click **Create Web Service**. 
8. Render will compile and start your server. Once active, copy your **Web Service URL** (e.g., `https://bloodconnect-backend.onrender.com`).

---

### 🎨 STAGE 3: CONFIGURE FRONTEND BACKEND API BASE
Currently, your frontend client is configured to fetch data from `http://localhost:5000`. You must point it to your newly deployed Render API.

1. Open `e:\eval ai\client\src\App.jsx` on your computer.
2. Search for `http://localhost:5000` and replace all occurrences with your Render Web Service URL (e.g., `https://bloodconnect-backend.onrender.com`).
   * *Tip: You can use VS Code's Global Search and Replace (`Ctrl + Shift + F` and `Ctrl + Shift + H`) to do this in seconds!*
3. Save the changes and verify that `npm run build` compiles with zero errors locally:
   ```powershell
   cd client
   npm run build
   ```

---

### 🌐 STAGE 4: DEPLOY REACT FRONTEND (on Vercel)
[Vercel](https://vercel.com/) is the absolute gold standard for hosting Vite/React frontends.

1. Go to [Vercel](https://vercel.com/) and sign up using your GitHub account.
2. Push your updated frontend code (with the Render URL) to your GitHub repository.
3. On Vercel, click **Add New** and select **Project**.
4. Import your GitHub repository.
5. In the project settings configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client` (crucial since your client code resides in the `/client` subdirectory)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click **Deploy**.
7. Vercel will compile and host your client in less than a minute! You will be given a live deployment link (e.g., `https://bloodconnect.vercel.app`).
8. **Your application is now fully deployed online for the entire world to see!**

---

## 📶 APPROACH B: LOCAL WIFI NETWORK HOSTING (EXAMINER FAVORITE!)

This is the ultimate hack for **College Lab Evaluations**. Instead of deploying online, you can host a local web server on your laptop. Anyone in the lab connected to the same college WiFi can open it live on their phones!

### 📋 STEP 1: Connect your hosting Laptop and Mobile Devices to the same WiFi
Make sure your laptop and the testing device (examiner’s phone, tablet, or secondary laptop) are connected to the exact same WiFi network.

### 📋 STEP 2: Find your Laptop's Local IP Address
1. Open PowerShell on your laptop.
2. Type the command:
   ```powershell
   ipconfig
   ```
3. Look for **IPv4 Address** under your active Wireless LAN adapter. It will look like:
   `192.168.x.x` (e.g., `192.168.1.15` or `10.0.0.12`). **(Write this IP address down!)**

### 📋 STEP 3: Configure both Vite and Express to bind to your Local IP
To make the servers accessible inside the network, we must bind them to `0.0.0.0` (all local interfaces).

1. **Frontend Vite Setup**:
   Open `e:\eval ai\client\package.json` and modify the dev script to include the `--host` flag:
   ```json
   "scripts": {
     "dev": "vite --host 0.0.0.0",
     ...
   }
   ```
2. **Frontend API URL Setup**:
   Open `e:\eval ai\client\src\App.jsx` and replace all instances of `http://localhost:5000` with `http://YOUR_LOCAL_IP:5000` (e.g., `http://192.168.1.15:5000`).

### 📋 STEP 4: Fire Up the local Server and Client!
1. Start your backend server:
   ```powershell
   cd server
   npm run serve
   ```
2. Start your frontend development server in a separate terminal:
   ```powershell
   cd client
   npm run dev
   ```
3. Vite will print out:
   ```
   ➜  Local:   http://localhost:5173/
   ➜  Network: http://192.168.1.15:5173/
   ```

### 📱 STEP 5: Let the Examiners test it on their Phones!
1. Ask the examiner to connect their phone to the same WiFi.
2. Open the mobile web browser (Chrome/Safari) and enter the Network URL:
   `http://192.168.1.15:5173`
3. **The BloodConnect application will load instantly on their mobile phone!** They can use the stepped registry wizard, select donor eligibility flags, click map presets, and test it live right in front of you. This is guaranteed to earn you maximum marks for practical implementation!
