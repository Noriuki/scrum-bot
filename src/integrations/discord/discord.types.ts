/**
 * Discord interaction payload types (simplified for interactions handler).
 * @see https://discord.com/developers/docs/interactions/receiving-and-responding
 */

export const DiscordInteractionType = {
  PING: 1,
  MODAL_SUBMIT: 5,
  MESSAGE_COMPONENT: 3,
  APPLICATION_COMMAND: 2,
  APPLICATION_COMMAND_AUTOCOMPLETE: 4,
} as const;

export const DiscordInteractionResponseType = {
  PONG: 1,
  UPDATE_MESSAGE: 7,
  DEFERRED_UPDATE_MESSAGE: 6,
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE: 5,
} as const;

export const DiscordComponentType = {
  ACTION_ROW: 1,
  BUTTON: 2,
  STRING_SELECT: 3,
} as const;

export interface DiscordUser {
  id: string;
  username: string;
  discriminator?: string;
  global_name?: string | null;
  avatar?: string | null;
}

export interface DiscordMember {
  user?: DiscordUser;
  nick?: string | null;
  roles?: string[];
}

export interface DiscordApplicationCommandOption {
  name: string;
  type: number;
  value?: string | number | boolean;
  options?: DiscordApplicationCommandOption[];
}

export interface DiscordApplicationCommandData {
  id: string;
  name: string;
  type: number;
  options?: DiscordApplicationCommandOption[];
  guild_id?: string;
}

export interface DiscordMessageComponentData {
  custom_id: string;
  component_type: number;
}

export interface DiscordInteractionPayload {
  id: string;
  application_id: string;
  type: number;
  data?: DiscordApplicationCommandData | DiscordMessageComponentData;
  guild_id?: string;
  channel_id?: string;
  member?: DiscordMember;
  user?: DiscordUser;
  token: string;
  version: 1;
}

export type DiscordInteractionResponse =
  | { type: 1 }
  | {
      type: 4 | 5 | 6 | 7;
      data?: {
        content?: string;
        embeds?: unknown[];
        components?: DiscordComponent[];
        flags?: number;
      };
    };

export interface DiscordComponent {
  type: number;
  style?: number;
  label?: string;
  custom_id?: string;
  emoji?: { name: string; id?: string | null };
  components?: DiscordComponent[];
}

export interface DiscordInteractionCallbackBody {
  type: number;
  data?: {
    content?: string;
    embeds?: unknown[];
    components?: DiscordComponent[];
    flags?: number;
  };
}
