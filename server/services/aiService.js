const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const DEMO_RESPONSES = [
  "Great question! Let me explain this in simple terms.\n\nThis concept is fundamental to understanding the topic. The key points are:\n\n**1. Core Idea**\nThe basic principle here involves how things interact and affect each other in a systematic way.\n\n**2. Why It Matters**\nUnderstanding this helps us solve real-world problems more effectively.\n\n**3. Example**\nThink of it like building blocks — each piece supports the others to create something bigger.\n\n*Note: This is a demo response. Connect an OpenAI API key for full AI capabilities.*",
  
  "I'd be happy to help you understand this!\n\nHere's a step-by-step breakdown:\n\n**Step 1:** Start with the basics — identify what you already know\n**Step 2:** Connect new information to existing knowledge\n**Step 3:** Practice with examples to reinforce understanding\n**Step 4:** Review and summarize key points\n\nWould you like me to explain any specific part in more detail?\n\n*Note: This is a demo response. Connect an OpenAI API key for personalized AI answers.*",
  
  "Excellent question! This is something many students find challenging at first, but it becomes clearer with the right explanation.\n\n**The Simple Version:**\nAt its core, this concept is about how different elements relate to and affect each other.\n\n**Key Points to Remember:**\n- Every system has inputs and outputs\n- Changes in one area often affect other areas\n- Understanding patterns helps predict outcomes\n\n**A Real-World Connection:**\nThis is similar to how a classroom works — the teacher (input) provides information, students process it (system), and learning happens (output).\n\n*Note: This is a demo response. Add your OpenAI API key in server/.env for full AI capabilities.*"
];

let demoIndex = 0;

async function chat(messages, systemPrompt) {
  if (!OPENAI_API_KEY) {
    // Demo mode — rotate through responses
    const response = DEMO_RESPONSES[demoIndex % DEMO_RESPONSES.length];
    demoIndex++;
    return response;
  }

  const fetch = require('node-fetch');
  const body = {
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: systemPrompt || `You are innoVate, SAKSHAM's AI educational assistant. 
        SAKSHAM is an accessibility-focused learning platform. 
        Help students understand complex topics in simple, clear language.
        You specialize in: science, mathematics, competitive exams (NEET, JEE, UPSC), research papers, and general education.
        Always be encouraging, patient, and clear. Use examples and analogies to explain difficult concepts.
        When asked to "Explain Simply" or "Explain for Beginners", use very plain language, short sentences, and relatable examples.`
      },
      ...messages
    ],
    max_tokens: 1000,
    temperature: 0.7,
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'AI service error');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function simplifyText(text) {
  if (!OPENAI_API_KEY) {
    return `**Simple Explanation (Demo Mode):**\n\nThis text discusses important research findings. The researchers studied this topic carefully and found meaningful results that contribute to our understanding of the field.\n\nThe key takeaway is that the findings suggest a relationship between the variables studied, which could have practical applications.\n\n*Note: This is a demo simplification. Add an OpenAI API key for real AI-powered simplification.*`;
  }

  const messages = [
    {
      role: 'user',
      content: `Please simplify the following academic text so that a high school student can understand it. Use plain language, short sentences, and avoid jargon. Preserve the key meaning:\n\n${text}`
    }
  ];

  return await chat(messages, 'You are an expert at making complex academic content simple and accessible.');
}

module.exports = { chat, simplifyText };
