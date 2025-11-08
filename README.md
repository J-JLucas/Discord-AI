# 🤖 Discord-AI — A Discord + Ollama Integration

**Discord-AI** is a self-hosted Discord bot that connects your Discord server to a local [Ollama](https://ollama.ai) model.  
It listens for mentions or replies in your server, forwards the message text to your local model (like `llama3.2:3b`),  
and replies in-chat with the generated response without any cloud-based LLM APIs.

---

## 🧩 Features

- 💬 **Ping-to-talk** — responds when mentioned (`@YourBotName`) or replied to  
- 🔒 **Discord server only** — ignores user's DMs entirely  
- ⚡ **Local inference** — uses your own Ollama models (no API keys required)  
- 🧠 **Stateless by default** — each message is independent  
- 🔧 **Custom models supported** — easily swap between `llama3.2`, `mistral`, `phi3` or a custom build

---

## 🧱 Requirements

| Component | Description |
|------------|-------------|
| **Node.js** |
| **Ollama** | Installed and serving on `http://127.0.0.1:11434` |
| **Discord App** | Created in the [Discord Developer Portal](https://discord.com/developers/applications) |

---

## ⚙️ Installation

```bash
git clone https://github.com/J-JLucas/Discord-AI.git
cd Discord-AI
npm install
```
## 🔐 Environment Setup
Create a .env file in the project root from .env.example:
```bash
BOT_TOKEN=your_discord_bot_token_here
MODEL=ollama_model_here
OLLAMA_URL=http://127.0.0.1:11434
```

## ⚙️ Discord OAuth2 Setup

**OAuth2 → URL Generator**
1. Under **Scopes**, check:  
   - ✅ **bot**
2. Under **Bot Permissions**, enable:  
   - ✅ **View Channels**  
   - ✅ **Send Messages**  
   - ✅ **Read Message History**

⚠️ **Do not** check Administrator or Manage permissions — the bot doesn’t need them.

---

### 🧠 Privileged Gateway Intents

Under **Bot → Privileged Gateway Intents**, toggle:  
- ✅ **Message Content Intent** *(required so the bot can read messages that mention it)*  
- 🚫 Leave **Presence Intent** and **Server Members Intent** off

## 🚀 Usage
Start Ollama (if not already running):
```bash
ollama serve
```
Then launch the bot:
```bash
node index.js
```
Invite your bot to a server and start a conversation!:
```
@YourBotName hello, how are you doing?
```
it will call your local model via the Ollama API and reply with the response.

## 🧩 Custom Ollama Models

You can create your own model personalities or fine-tuned variants using an **Ollama `Modelfile`**.

Edit the `Modelfile`:
```bash
FROM modelNamehere  # eg. llama3.2:3b

# Inject a custom system prompt
SYSTEM """You are ASTRID, a blunt but brilliant AI who answers questions with confidence."""

PARAMETER temperature 0.8
PARAMETER top_p eg 0.9
PARAMETER num_ctx 4096
```
Build the model with your custom `Modelfile`
```
ollama create myCustomModel -f Modelfile
```
Ollama seems to append your model's name with :latest, you can see the full name with:
```
ollama list
```
Then reference your new model in your .env:
```
MODEL=myCustomModele:latest
```
Restart the bot and that's it!
Your bot is now running your custom personality!
