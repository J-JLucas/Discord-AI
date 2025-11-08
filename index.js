require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Events } = require('discord.js');

const {
  BOT_TOKEN,
  MODEL,
  OLLAMA_URL,
  SYSTEM_PROMPT,
} = process.env;

if (!BOT_TOKEN) throw new Error("missing BOT_TOKEN in .env");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  Partials: [Partials.Channel]
});

// remove bot id and extra whitespace from user's message
// before entering prompt into model
function stripBotMention(content, botId) {
  return content
    .replace(new RegExp(`<@!?${botId}>`, 'g'), '')
    .trim();
}

async function askOllamaChat({ model, prompt})
{
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'post',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({
      model,
      messages: [
        {role: 'user', content: prompt}
      ],
      stream: false,
    })
  });

  if(!res.ok) {
    const text = await res.text().catch(() => '');
    throw new error(`ollama error ${res.status}: ${text.slice(0, 500)}`);
  }

  const data = await res.json();
  
  if (data?.message?.content) return data.message.content;
  if (Array.isArray(data?.messages)) {
    const last = data.messages[data.messages.length - 1];
    return last?.content ?? '(no content)';
  }
  return '(no content)';
}

client.once(Events.ClientReady, c=> {
  console.log(`logged in as ${c.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
  try {
    if(message.author.bot) return;
  
    // only speak when spoken to
    const mentioned = message.mentions?.has(client.user) ?? false;
    const isDM = message.channel && message.channel.isDMBased();
    if(!mentioned && !isDM) return;

    let prompt = stripBotMention(message.content ?? '', client.user.id);
    if(!prompt && message.reference?.messageId){
      try {
        const replied = await message.channel.messages.fetch(message.reference.messageId);
        prompt = replied?.content?.trim() ?? '';
      } catch {
        // ignore
      }
    }

    if(!prompt) {
      await message.reply("Hi, I'm BotDaveExplains, what topic would you like to explore today? ")
      return;
    }
    // appear typing while awaiting response
    await message.channel.sendTyping();  
 
    const answer = await askOllamaChat({
      model: MODEL,
      prompt
    });

    // discord has a 2000-char limit; split if needed
    const chunks = answer.match(/[\s\S]{1,1900}/g) ?? ['(empty response)'];
    for (const chunk of chunks) {
      await message.reply({ content: chunk });
    }
  } catch (err) {
    console.error(err);
    await message.reply(`i hit an error: ${string(err.message ?? err).slice(0, 500)}`);
    }
});

client.login(BOT_TOKEN);
