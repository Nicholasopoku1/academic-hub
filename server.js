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

// LOCAL IN-MEMORY DATA ENGINE (Perfect for completely free independent hosting)
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

        // Map and preserve credentials directly inside local execution vectors
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

// MODULE 1 ENDPOINT: Strategic Blueprint Generator
app.post('/check-academic', async (req, res) => {
    try {
        const { studentName, currentGpa, studentChallenge } = req.body;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are the official AI duplicate of Nicholas Opoku, elite academic advisor, tech specialist at UCC, and author of the book 'Life Mastery'. 
                    Your mission is to engineer academic and professional excellence for university students. 
                    
                    When giving advice, always use the core pillars of Nicholas's 'Life Mastery' framework:
                    1. 'Mindset Alignment' - Shifting from a casual student to a strategic master.
                    2. 'Skill Acquisition' - Balancing grades with high-demand tech skills (like Web Design, Programming, and Data Analysis).
                    3. 'Intentional Execution' - Eliminating distractions (like toxic social media loops) and using practical time blocks.
                    
                    Speak directly to the student using their name. Be sharp, deeply inspiring, and authoritative. Instead of generic quotes, end with a powerful 'Life Mastery Principle' written in the style of Nicholas Opoku.`
                },
                {
                    role: "user",
                    content: `My name is ${studentName}, my current GPA is ${currentGpa}, and my biggest challenge on campus right now is: "${studentChallenge}". Give me my custom blueprint.`
                }
            ],
            model: "llama-3.3-70b-versatile"
        });

        const aiAdvice = chatCompletion.choices[0].message.content;

        res.json({
            message: `Life Mastery Blueprint for ${studentName}:`,
            advice: aiAdvice
        });

    } catch (error) {
        console.error("Groq AI Error:", error);
        res.status(500).json({
            message: "System Error",
            advice: "Our AI Mentor is configuring its gears. Check your API key and terminal connections!"
        });
    }
});

// MODULE 2 ENDPOINT: General Assistant with Distinct Image/File Architecture
app.post('/ask-general', async (req, res) => {
    try {
        const { studentQuestion, studentName, fileData, fileType } = req.body;

        // Base structural text prompt string
        let textPrompt = `My name is ${studentName || "Scholar"}. Here is my question: "${studentQuestion || "See attached data layer."}"`;

        // Process document attachments by embedding text directly into the main prompt context
        if (fileData && fileType && !fileType.startsWith('image/')) {
            if (fileType === 'application/pdf') {
                textPrompt += `\n\n[System Alert: User has uploaded a PDF document package via base64 stream].`;
            } else {
                textPrompt += `\n\n[Attached File Context]:\n${fileData}`;
            }
        }

        // Structuring the user content block to strictly comply with Groq Multimodal API syntax rules
        let userContentArray = [
            {
                type: "text",
                text: textPrompt
            }
        ];

        // If it's a picture snapshot, add it as a separate block inside the content array
        if (fileData && fileType && fileType.startsWith('image/')) {
            userContentArray.push({
                type: "image_url",
                image_url: {
                    url: fileData // Pass the raw Base64 Data URI string cleanly
                }
            });
        }

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are the official AI duplicate of Nicholas Opoku, elite academic advisor, tech specialist at UCC, and author of 'Life Mastery'. 
                    Your mission is to provide authoritative, inspiring, and sharp answers to any general academic, tech career, programming, or student growth questions.
                    
                    You have advanced multimodal vision capabilities active. If an image file (camera snapshot, error screenshot, code breakdown) is attached, look at the payload details closely to frame your support.
                    
                    Keep your answer punchy, actionable, and cleanly structured using bullet points. End with a sharp, motivational punchline in the style of Nicholas Opoku.`
                },
                {
                    role: "user",
                    content: userContentArray // Correctly formed multimodal layout row
                }
            ],
            // FIXED STRATEGIC MODEL HARNESS: Swapped text to Groq's active high-speed vision model identifier
            model: "llama-3.2-11b-vision-preview"
        });

        const aiResponse = chatCompletion.choices[0].message.content;

        res.json({
            response: aiResponse
        });

    } catch (error) {
        console.error("General AI Error:", error);
        res.status(500).json({
            response: `AI Processing Matrix Blocked: ${error.message || "Verify file metrics and API configuration keys."}`
        });
    }
});

app.listen(PORT, () => {
    console.log("Server is running live on port " + PORT);
});