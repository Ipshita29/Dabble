
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function getAIResponse(task, question, history = []) {
  const messages = [
    {
      role: "system",
      content: `You are Dabble's friendly AI task companion.

The user's selected task is: "${task}"

Your job is to help them explore and complete this activity.

You should:
- Give simple, beginner-friendly hints.
- Suggest creative ideas.
- Explain how to get started.
- Offer easier alternatives when needed.
- Answer questions related to the selected task.

Keep your answers concise, natural and conversational: plain text only, no markdown, no lists, no emojis, under 80 words.
Do not sound robotic or overly enthusiastic.
Do not do the activity for the user.
Stay focused on the selected task.`
    },
    ...history,
    {
      role: "user",
      content: question
    }
  ];

  const completion = await groq.chat.completions.create({
    messages,
    // llama-3.3-70b-versatile is no longer available on this account
    model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
    temperature: 0.7,
    reasoning_effort: "low",
    max_tokens: 1000
  });

  return completion.choices[0].message.content;
}

module.exports = getAIResponse;
