import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';
import { verifyAuthToken } from '../middleware/auth.js';
import { logger } from '../lib/logger.js';

export const aiRouter = Router();

aiRouter.use(verifyAuthToken);

const geminiApiKey = process.env.GEMINI_API_KEY;
const ai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

aiRouter.post('/ask', async (req, res, next) => {
  try {
    const { prompt, context } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!ai) {
      // Fallback demo response if GEMINI_API_KEY is not supplied in environment
      return res.status(200).json({
        response: `[SoleFlow AI Assistant]: Based on current market intelligence, athletic sneakers (Runner Classic & AeroGlide) have 42% higher seasonal turnover. We recommend following up with ABC Footwear regarding their overdue ledger balance before committing additional production lots.`,
      });
    }

    const systemInstruction = `You are SoleFlow AI, a specialist wholesale shoe business analyst assisting shoe traders and field sales reps in India. Provide concise, commercial, and actionable guidance about orders, inventory, leather production, margins, and credit terms.`;

    const modelResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemInstruction}\nContext: ${JSON.stringify(context || {})}\nUser Query: ${prompt}` }] },
      ],
    });

    return res.status(200).json({
      response: modelResponse.text,
    });
  } catch (err) {
    logger.error({ err }, 'AI endpoint exception');
    next(err);
  }
});
