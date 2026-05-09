import { NextResponse } from "next/server";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { getFirestore } from "firebase-admin/firestore";
import { env } from "~/env.js";

// Initialize Firebase Admin safely
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();
const messaging = getMessaging();

export async function GET(req: Request) {
  // Simple security check to make sure nobody else can hit this endpoint
  // In production, you would check a cron secret (e.g. Vercel Cron Secret)
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  
  if (secret !== "MY_SECRET_CRON_KEY_123") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Get all subscribed users (tokens)
    const tokensSnapshot = await db.collection("subscribers").get();
    if (tokensSnapshot.empty) {
      return NextResponse.json({ success: true, message: "No subscribers found." });
    }

    const tokens = tokensSnapshot.docs.map(doc => doc.id); // Assuming doc id is the token

    // 2. Get today's high priority tasks
    const tasksSnapshot = await db.collection("tasks")
      .where("priority", "==", "High")
      .limit(5)
      .get();
      
    const highPriorityCount = tasksSnapshot.size;
    let messageBody = "You have no high priority tasks today. Relax!";
    
    if (highPriorityCount > 0) {
      const tasksList = tasksSnapshot.docs.map(doc => doc.data().title).join(", ");
      messageBody = `You have ${highPriorityCount} urgent task(s) today: ${tasksList}`;
    }

    // 3. Send Notification Multicast
    const payload = {
      notification: {
        title: "Your Task Intelligence Agenda",
        body: messageBody,
      },
      tokens: tokens, // Array of FCM tokens
    };

    const response = await messaging.sendEachForMulticast(payload);
    
    return NextResponse.json({ 
      success: true, 
      sent: response.successCount, 
      failed: response.failureCount 
    });

  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: "Failed to send notifications" }, { status: 500 });
  }
}
