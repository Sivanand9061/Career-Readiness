// @ts-nocheck
import { exec } from "child_process";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

import activeWin from "active-win";

let previousState = "";
let breakTimer = null;
let lastNotified = 0; // Prevent spamming

async function triggerVibeAlert() {
  try {
    // Make sure we haven't spammed them in the last 15 minutes
    const now = Date.now();
    if (now - lastNotified < 15 * 60 * 1000) return;

    // Fetch the easiest, lowest energy task
    const snapshot = await db.collection("tasks")
      .where("energyLevel", "==", "Low")
      .limit(1)
      .get();

    if (snapshot.empty) return;
    const task = snapshot.docs[0].data();

    // Fetch subscribers to send the push to
    const subs = await db.collection("subscribers").get();
    if (subs.empty) return;
    const tokens = subs.docs.map(doc => doc.id);

    const payload = {
      notification: {
        title: "🧠 Vibe Shift Detected",
        body: `Since you're taking a breather, knock this out real quick: ${task.title}`,
      },
      tokens: tokens,
    };

    const messaging = getMessaging();
    await messaging.sendEachForMulticast(payload);
    console.log(`📲 PUSH SENT: "Since you're taking a breather..."`);
    
    lastNotified = now;
  } catch (error) {
    console.error("Failed to send vibe alert:", error);
  }
}

async function checkVibe() {
  try {
    const window = await activeWin();
    
    if (!window) return;

    const activeApp = (window.owner.name || window.title || "").toLowerCase();
    const windowTitle = (window.title || "").toLowerCase();
    
    let currentState = "IDLE";
    
    const deepWorkApps = ["code", "blender", "photoshop", "figma", "devenv", "cursor", "idea", "illustrator"];
    const breakApps = ["spotify", "discord", "netflix"];
    const browsers = ["chrome", "msedge", "brave", "firefox", "safari"];

    const deepWorkTitles = ["chatgpt", "claude", "localhost", "github", "vercel", "stackoverflow", "firebase", "groq"];
    const breakTitles = ["youtube", "twitter", "x", "reddit", "instagram", "facebook", "tiktok"];

    if (deepWorkApps.some(app => activeApp.includes(app))) {
      currentState = "DEEP_WORK";
    } else if (browsers.some(b => activeApp.includes(b))) {
      if (deepWorkTitles.some(t => windowTitle.includes(t))) {
        currentState = "DEEP_WORK";
      } else if (breakTitles.some(t => windowTitle.includes(t))) {
        currentState = "BREAK";
      } else {
        currentState = "ADMIN";
      }
    } else if (breakApps.some(app => activeApp.includes(app))) {
      currentState = "BREAK";
    } else {
      currentState = "ADMIN";
    }

    if (currentState !== previousState) {
      console.log(`\n=============================`);
      console.log(`🌌 VIBE SHIFT DETECTED 🌌`);
      console.log(`Transitioning to: ${currentState}`);
      console.log(`Triggered by: ${activeApp} (${windowTitle})`);
      console.log(`=============================\n`);
      previousState = currentState;
      
      try {
        await db.collection("users").doc("me").set({
          user_state: currentState,
          last_updated: new Date().toISOString(),
          active_app: activeApp
        }, { merge: true });
        console.log(`✓ Synced state to Firebase: ${currentState}`);
      } catch (e) {
        console.error("Firebase Sync Error", e);
      }

      // --- THE SMART NOTIFICATION LOGIC ---
      if (breakTimer) clearTimeout(breakTimer);

      if (currentState === "DEEP_WORK") {
        console.log("🤫 Entering Deep Work. All notifications muted.");
      } else if (currentState === "BREAK") {
        console.log("⏱️ Break detected. Waiting 30 seconds to confirm...");
        // If they stay on break for 30 seconds, trigger the alert
        breakTimer = setTimeout(triggerVibeAlert, 30000);
      }
    }
  } catch (err) {
    console.error("Failed to read window", err);
  }
}

console.log("🚀 Vibe Bridge (Active-Win Engine) initialized. Listening for brain waves...");
checkVibe();
setInterval(checkVibe, 3000);
