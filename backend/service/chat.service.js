const DBMSconnection = require("../db/db.config");
const { GoogleGenAI } = require("@google/genai");

// Correct model
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const getRecentConversationRows = async (limit = 5) => {
  const normalizedLimit = parseInt(limit, 10);
  const safeLimit =
    isNaN(normalizedLimit) || normalizedLimit <= 0 ? 20 : normalizedLimit;

  const [rows] = await DBMSconnection.execute(
    `SELECT id, role, content, created_at
     FROM conversations
     ORDER BY id DESC
     LIMIT ?`,
    [safeLimit],
  );

  return rows.reverse();
};

const generateAssistantAnswer = async ({ historyRows, question }) => {
  // Build a single text prompt containing the whole conversation
  let prompt = "";

  for (const row of historyRows) {
    const speaker = row.role === "assistant" ? "Assistant" : "User";
    prompt += `${speaker}: ${row.content}\n`;
  }

  prompt += `User: ${question}\nAssistant:`;

  // Interactions API call
  const interaction = await ai.interactions.create({
    model: GEMINI_MODEL,
    input: prompt,
  });

  return {
    text: interaction.output_text,
    totalTokens: interaction.usage.total_tokens,
  };
};

const getMessageById = async (messageId) => {
  const [rows] = await DBMSconnection.execute(
    "SELECT id, role, content, token_count, created_at FROM conversations WHERE id = ? LIMIT 1",
    [messageId],
  );
  if (!rows[0]) return null;
  return {
    id: rows[0].id,
    role: rows[0].role,
    content: rows[0].content,
    tokenCount: Number(rows[0].token_count || 0),
    createdAt: rows[0].created_at,
  };
};

async function createConversationService(question) {
  try {
    if (!question.trim()) {
      const error = new Error("Question is required");
      error.status = 400;
      throw error;
    }

    const historyRows = await getRecentConversationRows(6);

    // Save user message
    const [result] = await DBMSconnection.execute(
      'INSERT INTO conversations (content, role) VALUES (?, "user")',
      [question],
    );

    // Generate assistant reply
    const { text, totalTokens } = await generateAssistantAnswer({
      historyRows,
      question,
    });

    // Save assistant reply WITH token count
    const [createAssistantMessageResult] = await DBMSconnection.execute(
      "INSERT INTO conversations (role, content, token_count) VALUES (?, ?, ?)",
      ["assistant", text, totalTokens],
    );

    const userConversation = await getMessageById(result.insertId);
    const assistantConversation = await getMessageById(
      createAssistantMessageResult.insertId,
    );

    // ⭐ FIX: return assistantConversation (not assistantAnswer)
    return {
      userConversation,
      assistantConversation,
      totalTokens,
    };
  } catch (error) {
    throw error;
  }
}


module.exports = { createConversationService, getRecentConversationRows };
