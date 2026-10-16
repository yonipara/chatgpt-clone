const { createConversationService } = require("../service/chat.service");
const { GoogleGenAI } = require("@google/genai");
const { getRecentConversationRows } = require("../service/chat.service");
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash-lite";

const geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function createConversationController(req, res, next) {
  // const error = new Error("Something went wrong try again later");
  // error.status = 500;
  // return next(error);
  try {
    const { question } = req.body;
    const result = await createConversationService(question);
    res.status(201).json({
      success: true,
      message: "Conversation posted successfully.",
      data: result,
    });
    // throw new Error("create conversation api error");
  } catch (error) {
    // error.status = 500;
    next(error);
  }

  //   const error = new Error('Something went wrong try again later');
  //   error.status = 500;
  //   return next(error);
}

async function getConversationsController(req, res, next) {
  try {
    const result = await getRecentConversationRows(100);
    res.status(200).json({
      success: true,
      message: "Conversations fetched successfully.",
      data: { conversations: result },
    });
    // throw new Error("create conversation api error");
  } catch (error) {
    error.status = 500;
    next(error);
  }
}

module.exports = { createConversationController, getConversationsController };
