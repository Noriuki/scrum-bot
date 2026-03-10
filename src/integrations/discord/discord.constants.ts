export const DISCORD_API_BASE = "https://discord.com/api/v10" as const;

export const DISCORD_ENDPOINTS = {
  CURRENT_USER: "/users/@me",
  CHANNEL: (id: string) => `/channels/${id}`,
  CHANNEL_MESSAGES: (channelId: string) => `/channels/${channelId}/messages`,
  GUILD: (id: string) => `/guilds/${id}`,
  INTERACTION_CALLBACK: (interactionId: string, token: string) => `/interactions/${interactionId}/${token}/callback`,
  WEBHOOK_FOLLOWUP: (applicationId: string, token: string) => `/webhooks/${applicationId}/${token}`,
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

export const DISCORD_INTERACTION_TYPE = {
  PING: 1,
  MODAL_SUBMIT: 5,
  MESSAGE_COMPONENT: 3,
  APPLICATION_COMMAND: 2,
  APPLICATION_COMMAND_AUTOCOMPLETE: 4,
} as const;

export const DISCORD_INTERACTION_RESPONSE_TYPE = {
  PONG: 1,
  UPDATE_MESSAGE: 7,
  DEFERRED_UPDATE_MESSAGE: 6,
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE: 5,
} as const;

export const DISCORD_COMPONENT_TYPE = {
  ACTION_ROW: 1,
  BUTTON: 2,
  STRING_SELECT: 3,
} as const;

export const PLANNING_POKER_COMMAND_NAME = "planning-poker" as const;

export const PLANNING_POKER_SUBCOMMANDS = {
  START: "start",
  STORY: "story",
  REVEAL: "reveal",
  END: "end",
} as const;
