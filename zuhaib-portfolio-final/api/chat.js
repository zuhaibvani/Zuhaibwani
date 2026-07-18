// api/chat.js
// The Zuvi AI chatbot has been removed from this site. This endpoint is
// intentionally disabled rather than deleted (this MCP can't delete files
// from the repo). If you fully remove this file from GitHub directly,
// also remove the GEMINI_API_KEY environment variable from the Vercel
// project settings — it's no longer used by anything.

export default async function handler(req, res) {
  return res.status(410).json({ error: 'This endpoint has been retired.' });
}
