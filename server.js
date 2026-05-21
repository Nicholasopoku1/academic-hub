require('dotenv').config();
const express = require('express');
const Groq = require('groq-sdk');

const app = express();
const PORT = process.env.PORT || 3000;

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY 
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static('public'));

const localUsersTable = [];

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
        localUsersTable.push({ email: email.toLowerCase(), password: password });
        res.json({ success: true, message: "Profile mapped completely!" });
    } catch (err) {
        res.status(500).json({ error: "Internal registry transaction crash." });
    }
});

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
                    Speak directly to the student. Be sharp, inspiring, and end with a powerful 'Life Mastery Principle'.`
                },
                {
                    role: "user",
                    content: `My name is ${studentName}, my current GPA is ${currentGpa}, and my biggest challenge on campus right now is: "${studentChallenge}". Give me my custom blueprint.`
                }
            ],
            model: "llama-3.3-70b-versatile"
        });
        res.json({ message: `Life Mastery Blueprint for ${studentName}:`, advice: chatCompletion.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ message: "System Error", advice: "AI Mentor is adjusting gears." });
    }
});

app.post('/ask-general', async (req, res) => {
    try {
        const { studentQuestion, studentName, fileData, fileType } = req.body;
        let textPrompt = `My name is ${studentName || "Scholar"}. Here is my question: "${studentQuestion || "See attached data layer."}"`;

        if (fileData && fileType && !fileType.startsWith('image/')) {
            textPrompt += fileType === 'application/pdf' ? `\n\n[Uploaded PDF package stream.]` : `\n\n[Attached File Context]:\n${fileData}`;
        }

        let userContentArray = [{ type: "text", text: textPrompt }];
        
        if (fileData && fileType && fileType.startsWith('image/')) {
            // FIX: Validates if data url headers are attached to prevent API blockages
            let formattedImageUrl = fileData;
            if (!formattedImageUrl.startsWith('data:')) {
                formattedImageUrl = `data:${fileType};base64,${fileData}`;
            }

            userContentArray.push({ 
                type: "image_url", 
                image_url: { url: formattedImageUrl } 
            });
        }

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are the official AI duplicate of Nicholas Opoku, academic advisor, tech specialist at UCC, and author of 'Life Mastery'. Answer tech, career, or programming questions. Keep it punchy, structure with bullet points, and end with a motivational punchline.`
                },
                { role: "user", content: userContentArray }
            ],
            // STABLE PRODUCTION MODEL LINK
            model: "llama-3.2-11b-vision-preview"
        });
        
        res.json({ response: chatCompletion.choices[0].message.content });
    } catch (error) {
        console.error("General Assistant Error:", error);
        res.status(500).json({ response: `AI Processing Matrix Blocked: ${error.message || "Check engine configurations."}` });
    }
});

app.listen(PORT, () => console.log("Server running live on port " + PORT));