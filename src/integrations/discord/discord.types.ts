export interface DiscordUser {
  id: string;
  username: string;
  avatar?: string | null;
  global_name?: string | null;
}

export interface DiscordMember {
  roles?: string[];
  user?: DiscordUser;
  nick?: string | null;
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
  guild_id?: string;
  options?: DiscordApplicationCommandOption[];
}

export interface DiscordMessageComponentData {
  custom_id: string;
  component_type: number;
}

export interface DiscordInteractionPayload {
  id: string;
  type: number;
  token: string;
  version: number;
  guild_id?: string;
  user?: DiscordUser;
  channel_id?: string;
  application_id: string;
  member?: DiscordMember;
  data?: DiscordApplicationCommandData | DiscordMessageComponentData;
}

export interface DiscordInteractionResponseData {
  flags?: number;
  content?: string;
  embeds?: unknown[];
  components?: DiscordComponent[];
}

export interface DiscordPongResponse {
  type: 1;
}

export interface DiscordMessageResponse {
  type: 4 | 5 | 6 | 7;
  data?: DiscordInteractionResponseData;
}

export type DiscordInteractionResponse = DiscordPongResponse | DiscordMessageResponse;

export interface DiscordComponent {
  type: number;
  style?: number;
  label?: string;
  custom_id?: string;
  components?: DiscordComponent[];
  emoji?: { name: string; id?: string | null };
}

export interface DiscordInteractionCallbackBody {
  type: number;
  data?: {
    flags?: number;
    content?: string;
    embeds?: unknown[];
    components?: DiscordComponent[];
  };
}

export interface DiscordSendMessageOptions {
  content?: string;
  embeds?: unknown[];
  components?: DiscordComponent[];
}

export interface DiscordRequestOptions {
  body?: unknown;
  query?: Record<string, string>;
}
