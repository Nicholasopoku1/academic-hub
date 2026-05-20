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

        // Base structural text message container
        let userContent = [
            {
                type: "text",
                text: `My name is ${studentName || "Scholar"}. Here is my question: "${studentQuestion || "See attached data layer."}"`
            }
        ];

        if (fileData && fileType) {
            if (fileType.startsWith('image/')) {
                // Route image snapshots cleanly into Groq's multimodal image layer
                userContent.push({
                    type: "image_url",
                    image_url: {
                        url: fileData // Pass Base64 Data URL data stream
                    }
                });
            } else if (fileType === 'application/pdf') {
                // If it's a PDF base64 Data URL, we note its presence in context
                userContent[0].text += `\n\n[System Alert: User has uploaded an academic/structural PDF document package via base64 stream].`;
            } else {
                // Plain text strings are appended directly as readable prompt context
                userContent[0].text += `\n\n[Attached File Context]:\n${fileData}`;
            }
        }

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are the official AI duplicate of Nicholas Opoku, elite academic advisor, tech specialist at UCC, and author of 'Life Mastery'. 
                    Your mission is to provide authoritative, inspiring, and sharp answers to any general academic, tech career, programming, or student growth questions.
                    
                    You have advanced multimodal vision capabilities active. If an image file (camera snapshot, error screenshot, code breakdown) or a structural document file description is attached, look at the payload details closely to frame your support.
                    
                    Keep your answer punchy, actionable, and cleanly structured using bullet points. End with a sharp, motivational punchline in the style of Nicholas Opoku.`
                },
                {
                    role: "user",
                    content: userContent
                }
            ],
            // Multimodal engine selected to seamlessly read user media vectors
            model: "llama-3.2-11b-vision-preview"
        });

        const aiResponse = chatCompletion.choices[0].message.content;

        res.json({
            response: aiResponse
        });

    } catch (error) {
        console.error("General AI Error:", error);
        res.status(500).json({
            response: "The multimodal vision stream encountered an evaluation block. Verify file sizes are under 4MB."
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running live on port ${PORT}`);
});