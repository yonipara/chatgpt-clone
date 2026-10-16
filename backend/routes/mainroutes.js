const express = require("express");
const router = express.Router();
const { createConversationController, getConversationsController } = require('../controller/chat.controller');

router.get("/", getConversationsController);

router.post("/", createConversationController);

module.exports = router;

