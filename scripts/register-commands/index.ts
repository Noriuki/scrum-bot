import { config } from "dotenv";
import { PLANNING_POKER_COMMAND } from "./commands";

config();

const APPLICATION_ID = process.env.DISCORD_CLIENT_ID;
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const API_BASE = "https://discord.com/api/v10";

async function main() {
  if (!BOT_TOKEN) {
    console.error("DISCORD_BOT_TOKEN is required.");
    process.exit(1);
  }

  if (!APPLICATION_ID) {
    console.error("DISCORD_CLIENT_ID is required.");
    process.exit(1);
  }

  const url = `${API_BASE}/applications/${APPLICATION_ID}/commands`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(PLANNING_POKER_COMMAND),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error("Discord API error:", res.status, data);
    process.exit(1);
  }

  console.log("Command registered:", data.name, data.id);
}

void main();
