/**
 * Discord API configuration.
 * @see https://discord.com/developers/docs/reference
 */

export const DISCORD_API_BASE = "https://discord.com/api/v10" as const;

export const DISCORD_ENDPOINTS = {
  CURRENT_USER: "/users/@me",
  CHANNEL: (id: string) => `/channels/${id}`,
  CHANNEL_MESSAGES: (channelId: string) => `/channels/${channelId}/messages`,
  GUILD: (id: string) => `/guilds/${id}`,
  INTERACTION_CALLBACK: (interactionId: string, token: string) =>
    `/interactions/${interactionId}/${token}/callback`,
  WEBHOOK_FOLLOWUP: (applicationId: string, token: string) =>
    `/webhooks/${applicationId}/${token}`,
} as const;

export const DISCORD_BUTTON_STYLE = {
  PRIMARY: 1,
  SECONDARY: 2,
  SUCCESS: 3,
  DANGER: 4,
  LINK: 5,
} as const;

export const DISCORD_CUSTOM_ID = {
  VOTE_PREFIX: "vote:",
  REVEAL_PREFIX: "reveal:",
} as const;
