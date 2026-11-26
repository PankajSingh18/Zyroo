import mongoose from "mongoose";

import {
  runAgentGraph,
  resumeAgentGraph,
} from "../services/agentGraph.service.js";

import Agent from "../models/agent.model.js";
import { deductCredits } from "../utils/deductCredits.js";

const getScopedThreadId = ({ userId, agentId, threadId }) =>
  [userId.toString(), agentId.toString(), threadId].join(":");

const validateThreadId = (threadId) =>
  typeof threadId === "string" &&
  threadId.trim().length >= 1 &&
  threadId.length <= 100;

const getAuthenticatedUserId = (req) =>
  req.user?._id?.toString();

const formatError = (error) => {
  console.error("Agent controller error:", error.message);
};

export const chatWithAgent = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const { agentId, message, threadId } = req.body;

    if (!mongoose.isValidObjectId(agentId)) {
      return res.status(400).json({
        success: false,
        message: "A valid agentId is required.",
      });
    }

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    if (message.length > 10000) {
      return res.status(400).json({
        success: false,
        message: "Message cannot exceed 10000 characters.",
      });
    }

    if (threadId !== undefined && !validateThreadId(threadId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid threadId.",
      });
    }

    const agent = await Agent.findOne({
      _id: agentId,
      userId,
      isActive: true,
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Active agent not found.",
      });
    }

    const conversationId =
      threadId || new mongoose.Types.ObjectId().toString();

    const scopedThreadId = getScopedThreadId({
      userId,
      agentId: agent._id,
      threadId: conversationId,
    });

    const result = await runAgentGraph({
      agent,
      message: message.trim(),
      threadId: scopedThreadId,
      userId,
    });
      console.log(result)
    if (result.interrupted) {
      return res.status(202).json({
        success: true,
        data: {
          agentId: agent._id,
          agentName: agent.name,
          threadId: conversationId,
          requiresApproval: true,
          interrupts: result.interrupts,
        },
      });
    }
      await deductCredits({
          userId,
          credits: 10,
        });
    return res.status(200).json({
      success: true,
      data: {
        agentId: agent._id,
        agentName: agent.name,
        threadId: conversationId,
        requiresApproval: false,
        reply: result.reply,
        model: result.model,
      },
    });
  } catch (error) {
    formatError(error);

    if (error?.message === "Insufficient credits") {
      return res.status(402).json({
        success: false,
        message: "Not enough credits to use this agent. Add credits from the Pricing page.",
      });
    }

    return res.status(502).json({
      success: false,
      message: "Unable to generate an AI response. Please try again.",
    });
  }
};

export const approveEmail = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const { agentId, threadId, approved } = req.body;

    if (!mongoose.isValidObjectId(agentId)) {
      return res.status(400).json({
        success: false,
        message: "A valid agentId is required.",
      });
    }

    if (!validateThreadId(threadId)) {
      return res.status(400).json({
        success: false,
        message: "A valid threadId is required.",
      });
    }

    if (typeof approved !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "approved must be a boolean.",
      });
    }

    const agent = await Agent.findOne({
      _id: agentId,
      userId,
      isActive: true,
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Active agent not found.",
      });
    }

    const scopedThreadId = getScopedThreadId({
      userId,
      agentId: agent._id,
      threadId,
    });

    const result = await resumeAgentGraph({
      agent,
      threadId: scopedThreadId,
      userId,
      approved,
    });

    if (result.interrupted) {
      return res.status(202).json({
        success: true,
        data: {
          agentId: agent._id,
          threadId,
          requiresApproval: true,
          interrupts: result.interrupts,
        },
      });
    }
 await deductCredits({
          userId,
          credits: 15,
        });
    return res.status(200).json({
      success: true,
      data: {
        agentId: agent._id,
        threadId,
        requiresApproval: false,
        reply: result.reply,
        model: result.model,
      },
    });
  } catch (error) {
    formatError(error);

    const approvalErrors = {
      GMAIL_NOT_CONNECTED: {
        status: 409,
        message:
          "Gmail is not connected. Open Integrations and connect your Google account, then try again.",
      },
      GMAIL_OAUTH_NOT_CONFIGURED: {
        status: 500,
        message:
          "Gmail is not configured on the server. Check the Google OAuth settings.",
      },
      GMAIL_REAUTH_REQUIRED: {
        status: 409,
        message:
          "The Gmail connection has expired. Reconnect your Google account in Integrations, then try again.",
      },
      EMAIL_SEND_FAILED: {
        status: 502,
        message:
          "Gmail could not send the email. Check the backend terminal for the send_email error before retrying.",
      },
    };
    const approvalError = approvalErrors[error?.message];

    if (error?.message === "Insufficient credits") {
      return res.status(402).json({
        success: false,
        message:
          "Insufficient credits for approval. Check Gmail Sent before retrying, in case the email was already sent.",
      });
    }

    return res.status(approvalError?.status || 500).json({
      success: false,
      message: approvalError?.message || "Unable to process email approval.",
    });
  }
};