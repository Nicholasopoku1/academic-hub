require('dotenv').config();
const express = require('express');
const Groq = require('groq-sdk');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize the Groq client securely using environment variables
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY 
});

// Expanded JSON limit handles larger base64 file payloads smoothly
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static('public'));

const localUsersTable = [];

// LOCAL AUTH ROUTE 1: Sign Up Coordination Matrix
app.post('/api/signup', (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Missing identity validation metrics." });
        }

        const userExists = localUsersTable.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (userExists) {
            return res.status(400).json({ error: "Profile coordinates already initialized." });
        }

        localUsersTable.push({ 
            email: email.toLowerCase(), 
            password: password 
        });

        res.json({ success: true, message: "Profile mapped completely!" });
    } catch (err) {
        res.status(500).json({ error: "Internal registry transaction crash." });
    }
});

// LOCAL AUTH ROUTE 2: Login Credentials Authentication Engine
app.post('/api/login', (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Parameters incomplete." });
        }

        const user = localUsersTable.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (!user) {
            return res.status(401).json({ error: "Invalid operational access credentials." });
        }

        res.json({ success: true, email: user.email });
    } catch (err) {
        res.status(500).json({ error: "Security layer comparison fault." });
    }
});

// MODULE 1 ENDPOINT: Strategic Blueprint Generator (Powered by Groq LPU Speed)
app.post('/check-academic', async (req, res) => {
    try {
        const { studentName, currentGpa, studentChallenge } = req.body;

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

        // CRUCIAL WORKAROUND: Dynamically import the ESM library inside the runtime execution stack
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        let systemInstruction = `You are the official AI duplicate of Nicholas Opoku, academic advisor, tech specialist at UCC, and author of 'Life Mastery'. Answer tech, career, or programming questions. Keep it punchy, structure with bullet points, and end with a motivational punchline in Nicholas Opoku's signature voice.`;
        let textPrompt = `My name is ${studentName || "Scholar"}. Here is my question: "${studentQuestion || "See attached data layer."}"`;

        let contentsArray = [];

        // Process standard text attachments or documents
        if (fileData && fileType && !fileType.startsWith('image/')) {
            if (fileType === 'application/pdf') {
                textPrompt += `\n\n[System Notification: Student uploaded a reference document via PDF stream context].`;
            } else {
                textPrompt += `\n\n[Attached File Context]:\n${fileData}`;
            }
        }

        contentsArray.push(textPrompt);

        // If a camera picture snapshot is sent, parse it directly into Gemini's native inlineData configuration array
        if (fileData && fileType && fileType.startsWith('image/')) {
            const cleanBase64 = fileData.split(',')[1] || fileData;
            contentsArray.push({
                inlineData: {
                    mimeType: fileType,
                    data: cleanBase64
                }
            });
        }

        // Execute turning call on Gemini Flash Engine
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contentsArray,
            config: {
                systemInstruction: systemInstruction
            }
        });

        res.json({
            response: response.text
        });

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