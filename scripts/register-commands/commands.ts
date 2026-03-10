import { SCALE_CHOICES, STRING, SUBCOMMAND } from "./constants";

export const PLANNING_POKER_COMMAND = {
  name: "planning-poker",
  description: "🎯 Planning Poker: start a session, add a story, reveal votes",
  options: [
    {
      name: "start",
      description: "🚀 Start a Planning Poker session in this channel",
      type: SUBCOMMAND,
      options: [
        {
          type: STRING,
          name: "title",
          required: true,
          description: "Session title",
        },
        {
          type: STRING,
          name: "scale",
          required: false,
          choices: [...SCALE_CHOICES],
          description: "Voting scale (default: points)",
        },
      ],
    },
    {
      name: "story",
      description: "📌 Add a user story and open voting",
      type: SUBCOMMAND,
      options: [
        {
          type: STRING,
          name: "title",
          required: true,
          description: "Story title",
        },
        {
          type: STRING,
          required: false,
          name: "description",
          description: "Story description (optional)",
        },
      ],
    },
    {
      name: "reveal",
      type: SUBCOMMAND,
      description: "🔓 Reveal the votes of the last story in the session",
    },
    {
      name: "end",
      type: SUBCOMMAND,
      description: "🏁 End the Planning Poker session in this channel",
    },
  ],
} as const;
