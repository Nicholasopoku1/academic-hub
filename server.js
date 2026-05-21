require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// FIREBASE ADMIN STORAGE INITIALIZATION
// ==========================================
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

try {
    // Looks for the file locally or dynamically fetched via Render Secret Files mount points
    const keyPath = path.join(__dirname, 'firebase-key.json');
    
    if (fs.existsSync(keyPath)) {
        const serviceAccountData = require(keyPath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccountData)
        });
        console.log("Firestore Database Layer Successfully Initialized!");
    } else {
        console.warn("WARNING: firebase-key.json file missing. Database routes will remain inactive.");
    }
} catch (error) {
    console.error("Firestore Initialization Error:", error.message);
}

const db = admin.firestore();
const usersCollection = db.collection('users');


// ==========================================
// PERSISTENT PERMANENT AUTHENTICATION ROUTES
// ==========================================

// PERMANENT ROUTE 1: Sign Up Coordination Matrix
app.post('/api/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Missing identity validation metrics." });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check if the user document already exists permanently in Firestore
        const userDoc = await usersCollection.doc(normalizedEmail).get();
        if (userDoc.exists) {
            return res.status(400).json({ error: "Profile coordinates already initialized." });
        }

        // Write the new profile data permanently to Firestore
        await usersCollection.doc(normalizedEmail).set({
            email: normalizedEmail,
            password: password, 
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({ success: true, message: "Profile mapped completely to cloud database storage!" });
    } catch (err) {
        console.error("Firestore Signup Error:", err);
        res.status(500).json({ error: "Internal registry database transaction crash." });
    }
});

// PERMANENT ROUTE 2: Login Credentials Authentication Engine
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Parameters incomplete." });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Retrieve user credentials straight from your Firestore collection
        const userDoc = await usersCollection.doc(normalizedEmail).get();
        if (!userDoc.exists) {
            return res.status(401).json({ error: "Invalid operational access credentials." });
        }

        const userData = userDoc.data();

        // Perform credentials verification
        if (userData.password !== password) {
            return res.status(401).json({ error: "Invalid operational access credentials." });
        }

        res.json({ success: true, email: userData.email });
    } catch (err) {
        console.error("Firestore Login Error:", err);
        res.status(500).json({ error: "Security database comparison layer fault." });
    }
});


// ==========================================
// CORE INTELLIGENT AI MODULE CORES
// ==========================================

// MODULE 1 ENDPOINT: Strategic Blueprint Generator (Powered by Groq LPU Speed)
app.post('/check-academic', async (req, res) => {
    try {
        const { studentName, currentGpa, studentChallenge } = req.body;

        const Groq = require('groq-sdk');
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are the official AI duplicate of Nicholas Opoku, elite academic advisor, tech specialist at UCC, and author of the book 'Life Mastery'. 
                    Your mission is to engineer academic and professional excellence for university students. 
                    Always use the core pillars of Nicholas's 'Life Mastery' framework: Mindset Alignment, Skill Acquisition, and Intentional Execution.
                    Speak directly to the student using their name. Be sharp, deeply inspiring, and authoritative. End with a powerful 'Life Mastery Principle'.`
                },
                {
                    role: "user",
                    content: `My name is ${studentName}, my current GPA is ${currentGpa}, and my biggest challenge on campus right now is: "${studentChallenge}". Give me my custom blueprint.`
                }
            ],
            model: "llama-3.3-70b-versatile"
        });

        res.json({
            message: `Life Mastery Blueprint for ${studentName}:`,
            advice: chatCompletion.choices[0].message.content
        });

    } catch (error) {
        console.error("Groq AI Error:", error);
        res.status(500).json({
            message: "System Error",
            advice: "Our AI Mentor is configuring its gears. Check your API key and terminal connections!"
        });
    }
});

// MODULE 2 ENDPOINT: General Assistant (Powered by Dynamic ESM Google Gen AI Import)
app.post('/ask-general', async (req, res) => {
    try {
        const { studentQuestion, studentName, fileData, fileType } = req.body;

        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        let systemInstruction = `You are the official AI duplicate of Nicholas Opoku, academic advisor, tech specialist at UCC, and author of 'Life Mastery'. Answer tech, career, or programming questions. Keep it punchy, structure with bullet points, and end with a motivational punchline in Nicholas Opoku's signature voice.`;
        let textPrompt = `My name is ${studentName || "Scholar"}. Here is my question: "${studentQuestion || "See attached data layer."}"`;

        let contentsArray = [];

        if (fileData && fileType && !fileType.startsWith('image/')) {
            if (fileType === 'application/pdf') {
                textPrompt += `\n\n[System Notification: Student uploaded a reference document via PDF stream context].`;
            } else {
                textPrompt += `\n\n[Attached File Context]:\n${fileData}`;
            }
        }

        contentsArray.push(textPrompt);

        if (fileData && fileType && fileType.startsWith('image/')) {
            const cleanBase64 = fileData.split(',')[1] || fileData;
            contentsArray.push({
                inlineData: {
                    mimeType: fileType,
                    data: cleanBase64
                }
            });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contentsArray,
            config: {
                systemInstruction: systemInstruction
            }
        });

        res.json({ response: response.text });

    } catch (error) {
        console.error("Gemini AI Engine Fault:", error);
        res.status(500).json({
            response: `Gemini Processing Blocked: ${error.message || "Verify file structure or validation key handles."}`
        });
    }
});

app.listen(PORT, () => {
    console.log("Server is running live on port " + PORT);
});