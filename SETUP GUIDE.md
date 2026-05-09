# 🚀 How to Run the Career Readiness Suite

Hi there! Follow these simple steps to get the application running perfectly on your computer. 

---

### ⚠️ IMPORTANT PREREQUISITE
You must use **Google Chrome**. The Voice & Microphone AI features are strictly optimized for Google Chrome's audio engine. Safari or Edge may not work properly.

---

### Step 1: Install Node.js (If you don't have it)
1. Go to the official website: https://nodejs.org/
2. Download and install the **"LTS" (Long Term Support)** version for Windows/Mac.
3. Just click "Next" through the entire installation (the default settings are perfect).

### Step 2: Extract the Project
1. Take the zip file containing this project and extract/unzip it to your **Desktop**.
2. Open the extracted folder so you can see all the files inside.

### Step 3: Open the Terminal
**For Windows:**
1. Open the project folder.
2. Click on the folder's **Address Bar** at the top.
3. Delete whatever is there, type exactly `cmd` and press **Enter**. A black terminal window will pop up.

**For Mac:**
1. Open the project folder.
2. Right-click anywhere in the folder and select **"New Terminal at Folder"**.

### Step 4: Install the Required Files
In the terminal window you just opened, type the following command exactly as shown and press **Enter**:
\`\`\`bash
npm install
\`\`\`
*(Wait 1-2 minutes for this to finish downloading the necessary files. You will see a lot of text scrolling by—this is normal.)*

### Step 5: Start the AI Application
Once the installation is done, type this command and press **Enter**:
\`\`\`bash
npm run dev
\`\`\`
*(Leave this terminal window open! If you close it, the app will turn off.)*

### Step 6: Open the App
1. Open **Google Chrome**.
2. Type this exact address into the top search bar and press Enter:
   **http://localhost:3000**
3. When you use the Virtual Interviewer for the first time, Chrome will ask for permission to use your Microphone. Click **Allow**.

---

### 🛑 Troubleshooting
- **"It says npm is not recognized"**: You forgot to install Node.js (Step 1), or you need to restart your computer after installing it.
- **"The microphone isn't working"**: Make sure you are using Google Chrome, and ensure your computer's microphone is not muted in your system settings.
- **"The AI isn't responding"**: Ensure the terminal window from Step 5 is still open and running in the background.
