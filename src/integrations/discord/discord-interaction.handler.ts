import { Injectable, Logger } from "@nestjs/common";
import type { PlanningPokerScaleSlug } from "../../common/constants";
import { getPlanningPokerValues, PLANNING_POKER_SCALES, SESSION_STATUS } from "../../common/constants";
import { isUuid } from "../../common/utils";
import { SessionService } from "../../modules/session/session.service";
import { StoryService } from "../../modules/story/story.service";
import { UserService } from "../../modules/user/user.service";
import { VoteService } from "../../modules/vote/vote.service";
import {
  DISCORD_BUTTON_STYLE,
  DISCORD_COMPONENT_TYPE,
  DISCORD_CUSTOM_ID,
  DISCORD_INTERACTION_RESPONSE_TYPE,
  DISCORD_INTERACTION_TYPE,
  PLANNING_POKER_COMMAND_NAME,
  PLANNING_POKER_SUBCOMMANDS,
} from "./discord.constants";
import type {
  DiscordApplicationCommandData,
  DiscordComponent,
  DiscordInteractionPayload,
  DiscordInteractionResponse,
  DiscordMessageComponentData,
} from "./discord.types";

@Injectable()
export class DiscordInteractionHandler {
  private readonly logger = new Logger(DiscordInteractionHandler.name);

  constructor(
    private readonly voteService: VoteService,
    private readonly userService: UserService,
    private readonly storyService: StoryService,
    private readonly sessionService: SessionService,
  ) {}

  async handle(payload: DiscordInteractionPayload): Promise<DiscordInteractionResponse> {
    if (payload.type === DISCORD_INTERACTION_TYPE.PING) {
      return { type: 1 };
    }

    if (payload.type === DISCORD_INTERACTION_TYPE.APPLICATION_COMMAND) {
      return this.handleApplicationCommand(payload, payload.data as DiscordApplicationCommandData);
    }

    if (payload.type === DISCORD_INTERACTION_TYPE.MESSAGE_COMPONENT) {
      return this.handleMessageComponent(payload, payload.data as DiscordMessageComponentData);
    }

    if (
      payload.type === DISCORD_INTERACTION_TYPE.APPLICATION_COMMAND_AUTOCOMPLETE ||
      payload.type === DISCORD_INTERACTION_TYPE.MODAL_SUBMIT
    ) {
      return this.reply("Este tipo de interação ainda não é suportado.");
    }

    this.logger.warn(`Unhandled interaction type: ${payload.type}`);
    return this.reply("Tipo de interação ainda não tratado.");
  }

  private getDiscordUser(payload: DiscordInteractionPayload): { id: string; name: string } {
    const user = payload.member?.user ?? payload.user;
    if (!user) throw new Error("Missing user in interaction");
    const name = user.global_name ?? user.username ?? user.id;
    return { id: user.id, name };
  }

  private async handleApplicationCommand(
    payload: DiscordInteractionPayload,
    data: DiscordApplicationCommandData,
  ): Promise<DiscordInteractionResponse> {
    const discordUser = this.getDiscordUser(payload);
    const appUser = await this.userService.findOrCreateFromDiscord(discordUser.id, discordUser.name);

    const channelId = payload.channel_id ?? "";
    const guildId = payload.guild_id ?? "";

    if (!channelId) {
      return this.reply("Este comando precisa ser usado em um canal de servidor (não em DM).");
    }

    if (data.name !== PLANNING_POKER_COMMAND_NAME) {
      return this.reply(
        `Comando \`/${data.name}\` não reconhecido. Use \`/planning-poker start\`, \`story\` ou \`reveal\`.`,
      );
    }

    const subcommand = data.options?.[0];
    const subName = subcommand?.name;
    const opts = subcommand?.options ?? [];

    if (!subName) {
      return this.reply(
        "🚀 Escolha um subcomando: `start` (criar sessão), `story` (adicionar story), `reveal` (revelar votos) ou `end` (encerrar sessão).",
      );
    }

    const getOpt = (name: string): string | number | boolean | undefined => {
      const opt = opts.find((o) => o.name === name);
      return opt?.value;
    };

    if (subName === PLANNING_POKER_SUBCOMMANDS.START) {
      const title = (getOpt("title") as string) ?? "Sessão de Planning Poker";
      const scaleOpt = (getOpt("scale") as string)?.toLowerCase();
      const voteScale =
        scaleOpt === "points" || scaleOpt === "fibonacci" || scaleOpt === "tshirt" ? scaleOpt : "points";
      const existing = await this.sessionService.findByDiscordChannelId(channelId);
      if (existing?.status === SESSION_STATUS.OPEN) {
        return this.reply(
          `⚠️ Já existe uma sessão ativa neste canal: **${existing.title}**. Use \`/planning-poker story <título>\` para adicionar histórias, \`/planning-poker reveal\` para revelar votos ou \`/planning-poker end\` para encerrar.`,
        );
      }
      const session = await this.sessionService.create({
        title,
        createdById: appUser.id,
        discordChannelId: channelId,
        discordGuildId: guildId || undefined,
        voteScale,
      });
      const scaleLabel =
        voteScale === "fibonacci"
          ? "Fibonacci (1, 2, 3, 5, 8, 13, 21)"
          : voteScale === "tshirt"
            ? "T-Shirt (XS, S, M, L, XL)"
            : "Points (1-5)";
      return this.reply(
        `✅ Sessão **${session.title}** criada (votação: ${scaleLabel}). Use \`/planning-poker story <título>\` para adicionar uma user story e iniciar a votação.`,
      );
    }

    if (subName === PLANNING_POKER_SUBCOMMANDS.STORY) {
      const title = getOpt("title") as string | undefined;
      if (!title?.trim()) {
        return this.reply("Informe o título da story: `/planning-poker story título:<texto>`");
      }
      const description = getOpt("description") as string | undefined;
      const session = await this.sessionService.findOpenByDiscordChannelId(channelId);
      if (!session) {
        return this.reply("Nenhuma sessão ativa neste canal. Crie uma com `/planning-poker start [título]`.");
      }
      const story = await this.storyService.create({
        title: title.trim(),
        description: description?.toString?.()?.trim(),
        sessionId: session.id,
      });
      const scaleId = (
        session.voteScale === "fibonacci" ? "fibonacci" : session.voteScale === "tshirt" ? "tshirt" : "points"
      ) as PlanningPokerScaleSlug;
      const components = this.buildVoteButtons(story.id, scaleId, false);
      return {
        type: DISCORD_INTERACTION_RESPONSE_TYPE.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `📌 **Story:** ${story.title}${story.description ? `\n${story.description}` : ""}\n\n🗳️ Vote nos botões abaixo:`,
          components,
        },
      };
    }

    if (subName === PLANNING_POKER_SUBCOMMANDS.REVEAL) {
      const session = await this.sessionService.findByDiscordChannelId(channelId);
      if (!session) {
        return this.reply("Nenhuma sessão neste canal. Crie uma com `/planning-poker start [título]`.");
      }
      if (session.status === SESSION_STATUS.CLOSED) {
        return this.reply("Sessão encerrada. Não é possível revelar votos.");
      }
      const latestStory = await this.storyService.findLatestBySessionId(session.id);
      if (!latestStory) {
        return this.reply(
          "Nenhuma story nesta sessão para revelar. Adicione uma com `/planning-poker story título:<texto>`.",
        );
      }
      const alreadyRevealed = await this.voteService.getRevealedVotes(latestStory.id);
      const scaleIdReveal =
        session.voteScale === "fibonacci" ? "fibonacci" : session.voteScale === "tshirt" ? "tshirt" : "points";
      if (alreadyRevealed.length > 0) {
        const summary = this.formatRevealSummary(latestStory.title, alreadyRevealed, true, scaleIdReveal);
        return this.reply(summary);
      }
      await this.voteService.setRevealedForStory(latestStory.id);
      const votes = await this.voteService.getRevealedVotes(latestStory.id);
      const summary = this.formatRevealSummary(latestStory.title, votes, false, scaleIdReveal);
      return this.reply(summary);
    }

    if (subName === PLANNING_POKER_SUBCOMMANDS.END) {
      const session = await this.sessionService.findByDiscordChannelId(channelId);
      if (!session) {
        return this.reply("Nenhuma sessão neste canal. Crie uma com `/planning-poker start [título]`.");
      }
      if (session.status === SESSION_STATUS.CLOSED) {
        return this.reply(
          `A sessão **${session.title}** já está encerrada. Use \`/planning-poker start\` para iniciar uma nova.`,
        );
      }
      const report = await this.buildSessionReport(session.id, session.title, session.voteScale);
      await this.sessionService.update(session.id, { status: SESSION_STATUS.CLOSED });
      return this.reply(report);
    }

    return this.reply(
      `Subcomando \`${subName ?? "?"}\` não reconhecido. Use \`start\`, \`story\`, \`reveal\` ou \`end\`.`,
    );
  }

  private async handleMessageComponent(
    payload: DiscordInteractionPayload,
    data: DiscordMessageComponentData,
  ): Promise<DiscordInteractionResponse> {
    const discordUser = this.getDiscordUser(payload);
    const appUser = await this.userService.findOrCreateFromDiscord(discordUser.id, discordUser.name);

    const customId = data.custom_id ?? "";

    const channelId = payload.channel_id ?? "";
    if (!channelId) {
      return this.reply("Esta ação precisa ser usada em um canal de servidor.");
    }

    if (customId.startsWith(DISCORD_CUSTOM_ID.VOTE_PREFIX)) {
      const rest = customId.slice(DISCORD_CUSTOM_ID.VOTE_PREFIX.length);
      const [storyId, valueStr] = rest.split(":");
      if (!storyId || valueStr === undefined || !isUuid(storyId)) {
        return this.reply("Payload de voto inválido.");
      }
      const story = await this.storyService.findOneWithSession(storyId);
      if (!story) {
        return this.reply("Story não encontrada. Use os botões da mensagem da story neste canal.");
      }
      if (story.session?.discordChannelId !== channelId) {
        return this.reply("Esta votação não é deste canal. Use a mensagem da story no canal correto.");
      }
      const scaleId =
        story.session?.voteScale === "fibonacci"
          ? "fibonacci"
          : story.session?.voteScale === "tshirt"
            ? "tshirt"
            : "points";
      const scaleValues = PLANNING_POKER_SCALES[scaleId].values;
      const allowedValues =
        scaleId === "tshirt" ? [-1, ...(scaleValues as string[]).map((_, i) => i)] : [-1, ...(scaleValues as number[])];
      const value = valueStr === "?" ? -1 : parseInt(valueStr, 10);
      if (Number.isNaN(value) || !allowedValues.includes(value)) {
        return this.reply("Valor de voto inválido. Use os botões da mensagem.");
      }
      await this.voteService.upsertVote(storyId, appUser.id, value);
      return {
        type: DISCORD_INTERACTION_RESPONSE_TYPE.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "✅ Seu voto foi registrado.",
          flags: 64,
        },
      };
    }

    if (customId.startsWith(DISCORD_CUSTOM_ID.REVEAL_PREFIX)) {
      const storyId = customId.slice(DISCORD_CUSTOM_ID.REVEAL_PREFIX.length);
      if (!storyId || !isUuid(storyId)) {
        return this.reply("Payload de revelação inválido.");
      }
      const story = await this.storyService.findOneWithSession(storyId);
      if (!story) {
        return this.reply("Story não encontrada. Use o comando neste canal da sessão.");
      }
      if (story.session?.discordChannelId !== channelId) {
        return this.reply("Esta story não é deste canal. Use `/planning-poker reveal` no canal da sessão.");
      }
      if (story.session?.status === SESSION_STATUS.CLOSED) {
        return this.reply("Sessão encerrada. Não é possível revelar votos.");
      }
      const scaleIdReveal =
        story.session?.voteScale === "fibonacci"
          ? "fibonacci"
          : story.session?.voteScale === "tshirt"
            ? "tshirt"
            : "points";
      const alreadyRevealed = await this.voteService.getRevealedVotes(storyId);
      if (alreadyRevealed.length > 0) {
        const summary = this.formatRevealSummary(story.title, alreadyRevealed, true, scaleIdReveal);
        return {
          type: DISCORD_INTERACTION_RESPONSE_TYPE.UPDATE_MESSAGE,
          data: { content: summary },
        };
      }
      await this.voteService.setRevealedForStory(storyId);
      const votes = await this.voteService.getRevealedVotes(storyId);
      const summary = this.formatRevealSummary(story.title, votes, false, scaleIdReveal);
      return {
        type: DISCORD_INTERACTION_RESPONSE_TYPE.UPDATE_MESSAGE,
        data: { content: summary },
      };
    }

    return this.reply("Ação não reconhecida.");
  }

  private reply(content: string): DiscordInteractionResponse {
    return {
      type: DISCORD_INTERACTION_RESPONSE_TYPE.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content },
    };
  }

  private async buildSessionReport(sessionId: string, sessionTitle: string, voteScale: string): Promise<string> {
    const stories = await this.storyService.findBySessionId(sessionId);
    const lines: string[] = ["📋 **Relatório da sessão**", `**${sessionTitle}**`, ""];
    const isTshirt = voteScale === "tshirt";
    const tshirtLabels = isTshirt ? (PLANNING_POKER_SCALES.tshirt.values as readonly string[]) : null;
    if (stories.length === 0) {
      lines.push("_Nenhuma story nesta sessão._");
    } else {
      for (const story of stories) {
        const votes = await this.voteService.findByStoryId(story.id);
        const values = votes.map((v) => v.value).filter((n) => n >= 0);
        const totalVotes = votes.length;
        const questionMarks = votes.filter((v) => v.value === -1).length;
        if (totalVotes === 0) {
          lines.push(`  • **${story.title}** — Sem votos`);
        } else if (isTshirt && tshirtLabels) {
          const labels = values.map((idx) => tshirtLabels[idx]).filter(Boolean);
          const dist = labels.reduce<Record<string, number>>((acc, l) => {
            acc[l] = (acc[l] ?? 0) + 1;
            return acc;
          }, {});
          const distStr = Object.entries(dist)
            .map(([k, n]) => (n > 1 ? `${n}× ${k}` : k))
            .join(", ");
          const suffix = questionMarks > 0 ? ` (${questionMarks} ?)` : "";
          lines.push(`  • **${story.title}** — ${distStr}${suffix}`);
        } else {
          const avg =
            values.length > 0
              ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1).replace(/\.0$/, "")
              : null;
          const numericCount = values.length;
          if (avg != null) {
            const plural = numericCount !== 1 ? "s" : "";
            lines.push(
              `  • **${story.title}** — Média: **${avg}** pontos (${numericCount} voto${plural}${questionMarks > 0 ? `, ${questionMarks} ?` : ""})`,
            );
          } else {
            const plural = totalVotes !== 1 ? "s" : "";
            lines.push(`  • **${story.title}** — ${totalVotes} voto${plural} (?)`);
          }
        }
      }
    }
    lines.push("", "🏁 _Sessão encerrada._");
    return lines.join("\n");
  }

  private formatRevealSummary(
    storyTitle: string,
    votes: { value: number; user?: { name: string | null } | null }[],
    alreadyRevealed = false,
    scaleSlug: PlanningPokerScaleSlug = "points",
  ): string {
    if (votes.length === 0) {
      return `📋 **${storyTitle}**\n\n_Nenhum voto registrado._`;
    }
    const isTshirt = scaleSlug === "tshirt";
    const tshirtLabels = isTshirt ? (PLANNING_POKER_SCALES.tshirt.values as readonly string[]) : null;
    const formatValue = (v: number): string =>
      v === -1 ? "?" : isTshirt && tshirtLabels ? (tshirtLabels[v] ?? "?") : String(v);
    const lines = votes.map((v) => `  • **${v.user?.name ?? "?"}** → ${formatValue(v.value)}`);
    const values = votes.map((v) => v.value).filter((n) => n >= 0);
    const avg =
      !isTshirt && values.length > 0
        ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1).replace(/\.0$/, "")
        : null;
    const header = alreadyRevealed ? "**Votos já revelados**" : "**Votos revelados**";
    const parts = [`📋 **${storyTitle}**`, "", header, lines.join("\n"), ""];
    if (avg != null) {
      parts.push(`📊 **Média:** ${avg} pontos`);
    }
    return parts.join("\n");
  }

  private buildVoteButtons(
    storyId: string,
    scaleSlug: PlanningPokerScaleSlug = "points",
    includeRevealButton = false,
  ): DiscordComponent[] {
    const values = getPlanningPokerValues(scaleSlug);
    const isTshirtSize = scaleSlug === "tshirt";
    const voteButtons: DiscordComponent[] = (values as readonly (number | string)[]).map((val, index) => ({
      type: DISCORD_COMPONENT_TYPE.BUTTON,
      style: DISCORD_BUTTON_STYLE.PRIMARY,
      label: String(val),
      custom_id: `vote:${storyId}:${isTshirtSize ? index : val}`,
    }));
    voteButtons.push({
      type: DISCORD_COMPONENT_TYPE.BUTTON,
      style: DISCORD_BUTTON_STYLE.SECONDARY,
      label: "?",
      custom_id: `vote:${storyId}:?`,
    });
    const rows: DiscordComponent[] = [];
    for (let i = 0; i < voteButtons.length; i += 5) {
      const row = voteButtons.slice(i, i + 5);
      if (row.length) rows.push({ type: DISCORD_COMPONENT_TYPE.ACTION_ROW, components: row });
    }
    if (includeRevealButton && rows.length > 0) {
      const lastRow = rows[rows.length - 1];
      const current = (lastRow as { components: DiscordComponent[] }).components;
      if (current.length < 5) {
        current.push({
          type: DISCORD_COMPONENT_TYPE.BUTTON,
          style: DISCORD_BUTTON_STYLE.SUCCESS,
          label: "🔓 Revelar votos",
          custom_id: `reveal:${storyId}`,
        });
      } else {
        rows.push({
          type: DISCORD_COMPONENT_TYPE.ACTION_ROW,
          components: [
            {
              type: DISCORD_COMPONENT_TYPE.BUTTON,
              style: DISCORD_BUTTON_STYLE.SUCCESS,
              label: "🔓 Revelar votos",
              custom_id: `reveal:${storyId}`,
            },
          ],
        });
      }
    }
    return rows;
  }
}
