const SUBCOMMAND = 1;
const STRING = 3;

const SCALE_CHOICES = [
  { name: "Points (1-5)", value: "points" },
  { name: "Fibonacci (1,2,3,5,8,13,21)", value: "fibonacci" },
] as const;

export const PLANNING_POKER_COMMAND = {
  name: "planning-poker",
  description: "Planning Poker: start a session, add a story, reveal votes",
  options: [
    {
      name: "start",
      description: "Start a Planning Poker session in this channel",
      type: SUBCOMMAND,
      options: [
        {
          name: "title",
          description: "Session title",
          type: STRING,
          required: false,
        },
        {
          name: "scale",
          description: "Voting scale (default: points)",
          type: STRING,
          required: false,
          choices: [...SCALE_CHOICES],
        },
      ],
    },
    {
      name: "story",
      description: "Add a user story and open voting",
      type: SUBCOMMAND,
      options: [
        {
          name: "title",
          description: "Story title",
          type: STRING,
          required: true,
        },
        {
          name: "description",
          description: "Story description (optional)",
          type: STRING,
          required: false,
        },
      ],
    },
    {
      name: "reveal",
      description: "Reveal the votes of the last story in the session",
      type: SUBCOMMAND,
    },
    {
      name: "end",
      description: "End the Planning Poker session in this channel",
      type: SUBCOMMAND,
    },
  ],
} as const;
