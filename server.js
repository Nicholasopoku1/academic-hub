require('dotenv').config();
const express = require('express');
const Groq = require('groq-sdk');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize the Groq client securely using environment variables
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY 
});

app.use(express.json());
app.use(express.static('public'));

app.post('/check-academic', async (req, res) => {
    try {
        // Catch variables from the frontend UI payload
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

app.listen(PORT, () => {
    console.log(`Server is running live on port ${PORT}`);
});