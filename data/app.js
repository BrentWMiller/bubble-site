// Exported from the Claude Bubble app (scripts/sync-from-app.sh). Do not edit by hand.
window.BUBBLE_APP = {
  "island" : {
    "barHeight" : 40,
    "cornerRadius" : 22,
    "doneHeight" : 40,
    "doneWidth" : 300,
    "hoverWidth" : 350,
    "needsHeight" : 94,
    "needsWidth" : 360,
    "orbSize" : 28,
    "restHeight" : 40,
    "restWidth" : 290,
    "rowHeight" : 51
  },
  "motions" : {
    "bash" : {
      "summary" : "Running a command",
      "verb" : "Running",
      "work" : "bash"
    },
    "compacting" : {
      "summary" : "Compacting the conversation",
      "verb" : "Compacting",
      "work" : "compact"
    },
    "edit" : {
      "summary" : "Editing files",
      "verb" : "Editing",
      "work" : "ripple"
    },
    "generating" : {
      "summary" : "Thinking",
      "verb" : "Thinking",
      "work" : "wave"
    },
    "mcp" : {
      "summary" : "Calling an MCP tool",
      "verb" : "Linking",
      "work" : "link"
    },
    "read" : {
      "summary" : "Reading files",
      "verb" : "Reading",
      "work" : "converge"
    },
    "search" : {
      "summary" : "Searching the codebase",
      "verb" : "Searching",
      "work" : "radar"
    },
    "waiting" : {
      "summary" : "Waiting on subagents",
      "verb" : "Delegating",
      "work" : "wait"
    },
    "web" : {
      "summary" : "Fetching a web page",
      "verb" : "Fetching",
      "work" : "drift"
    }
  },
  "palette" : {
    "done" : {
      "C1" : [
        0.73999999999999999,
        1,
        0.83999999999999997
      ],
      "C2" : [
        0.5,
        0.88,
        0.69999999999999996
      ],
      "C3" : [
        0.90000000000000002,
        1,
        0.92000000000000004
      ],
      "H" : [
        0.10000000000000001,
        0.29999999999999999,
        0.17999999999999999
      ],
      "swatch" : [
        0.73999999999999999,
        1,
        0.83999999999999997
      ]
    },
    "error" : {
      "C1" : [
        1,
        0.20000000000000001,
        0.22
      ],
      "C2" : [
        0.71999999999999997,
        0.080000000000000002,
        0.20000000000000001
      ],
      "C3" : [
        1,
        0.55000000000000004,
        0.45000000000000001
      ],
      "H" : [
        0.5,
        0.029999999999999999,
        0.059999999999999998
      ],
      "swatch" : [
        1,
        0.20000000000000001,
        0.22
      ]
    },
    "idle" : {
      "C1" : [
        0.62,
        0.66000000000000003,
        0.81999999999999995
      ],
      "C2" : [
        0.40000000000000002,
        0.44,
        0.62
      ],
      "C3" : [
        0.80000000000000004,
        0.81999999999999995,
        0.94999999999999996
      ],
      "H" : [
        0.16,
        0.17999999999999999,
        0.34000000000000002
      ],
      "swatch" : [
        0.62,
        0.66000000000000003,
        0.81999999999999995
      ]
    },
    "needs" : {
      "C1" : [
        1,
        0.71999999999999997,
        0.22
      ],
      "C2" : [
        1,
        0.38,
        0.23999999999999999
      ],
      "C3" : [
        1,
        0.85999999999999999,
        0.55000000000000004
      ],
      "H" : [
        0.59999999999999998,
        0.23999999999999999,
        0.080000000000000002
      ],
      "swatch" : [
        1,
        0.71999999999999997,
        0.22
      ]
    },
    "working" : {
      "C1" : [
        1,
        0.46000000000000002,
        0.20000000000000001
      ],
      "C2" : [
        0.56000000000000005,
        0.29999999999999999,
        1
      ],
      "C3" : [
        1,
        0.45000000000000001,
        0.71999999999999997
      ],
      "H" : [
        0.29999999999999999,
        0.14000000000000001,
        0.75
      ],
      "swatch" : [
        0.56000000000000005,
        0.29999999999999999,
        1
      ]
    }
  },
  "story" : [
    {
      "detail" : "Thinking",
      "duration" : 2.2000000000000002,
      "motion" : "generating",
      "skill" : false,
      "state" : "working",
      "subagents" : 0,
      "usageLeft" : 40
    },
    {
      "detail" : "Thinking",
      "duration" : 1.8,
      "motion" : "generating",
      "skill" : true,
      "state" : "working",
      "subagents" : 0
    },
    {
      "detail" : "Reading files",
      "duration" : 0.34999999999999998,
      "motion" : "read",
      "skill" : false,
      "state" : "working",
      "subagents" : 0
    },
    {
      "detail" : "Reading files",
      "duration" : 0.5,
      "endsPrevious" : "done",
      "motion" : "read",
      "skill" : false,
      "state" : "working",
      "subagents" : 0
    },
    {
      "detail" : "Reading files",
      "duration" : 0.40000000000000002,
      "endsPrevious" : "done",
      "motion" : "read",
      "skill" : false,
      "state" : "working",
      "subagents" : 0
    },
    {
      "detail" : "Searching the codebase",
      "duration" : 0.25,
      "endsPrevious" : "done",
      "motion" : "search",
      "skill" : false,
      "state" : "working",
      "subagents" : 0
    },
    {
      "detail" : "Searching the codebase",
      "duration" : 0.29999999999999999,
      "endsPrevious" : "done",
      "motion" : "search",
      "skill" : false,
      "state" : "working",
      "subagents" : 0
    },
    {
      "detail" : "Reading files",
      "duration" : 0.90000000000000002,
      "endsPrevious" : "done",
      "motion" : "read",
      "skill" : false,
      "state" : "working",
      "subagents" : 0,
      "usageLeft" : 33
    },
    {
      "detail" : "Editing files",
      "duration" : 0.80000000000000004,
      "endsPrevious" : "done",
      "motion" : "edit",
      "skill" : false,
      "state" : "working",
      "subagents" : 0
    },
    {
      "detail" : "Approve edit to auth.ts?",
      "duration" : 3,
      "endsPrevious" : "done",
      "motion" : "bash",
      "skill" : false,
      "state" : "needs",
      "subagents" : 0
    },
    {
      "detail" : "Running a command",
      "duration" : 1.6000000000000001,
      "motion" : "bash",
      "skill" : false,
      "state" : "working",
      "subagents" : 0,
      "usageLeft" : 24
    },
    {
      "detail" : "Thinking",
      "duration" : 1.3999999999999999,
      "endsPrevious" : "failed",
      "motion" : "generating",
      "skill" : false,
      "state" : "working",
      "subagents" : 0
    },
    {
      "detail" : "Editing files",
      "duration" : 0.59999999999999998,
      "motion" : "edit",
      "skill" : false,
      "state" : "working",
      "subagents" : 0
    },
    {
      "detail" : "Running a command",
      "duration" : 5,
      "endsPrevious" : "done",
      "motion" : "bash",
      "skill" : false,
      "state" : "working",
      "subagents" : 0,
      "usageLeft" : 18
    },
    {
      "detail" : "Fetching a web page",
      "duration" : 3,
      "endsPrevious" : "done",
      "motion" : "web",
      "skill" : false,
      "state" : "working",
      "subagents" : 0
    },
    {
      "detail" : "Calling an MCP tool",
      "duration" : 2.5,
      "endsPrevious" : "done",
      "motion" : "mcp",
      "skill" : false,
      "state" : "working",
      "subagents" : 0,
      "usageLeft" : 12
    },
    {
      "detail" : "Thinking",
      "duration" : 1.2,
      "endsPrevious" : "done",
      "motion" : "generating",
      "skill" : false,
      "state" : "working",
      "subagents" : 0
    },
    {
      "detail" : "Waiting on subagents",
      "duration" : 7,
      "motion" : "waiting",
      "skill" : false,
      "state" : "working",
      "subagents" : 3,
      "usageLeft" : 8
    },
    {
      "detail" : "Compacting the conversation",
      "duration" : 4,
      "motion" : "compacting",
      "skill" : false,
      "state" : "working",
      "subagents" : 0
    },
    {
      "detail" : "Build failed · exit 1",
      "duration" : 3,
      "motion" : "generating",
      "skill" : false,
      "state" : "error",
      "subagents" : 0
    },
    {
      "detail" : "Thinking",
      "duration" : 2.5,
      "motion" : "generating",
      "resetsUsage" : true,
      "skill" : false,
      "state" : "working",
      "subagents" : 0
    },
    {
      "detail" : "Completed",
      "duration" : 3,
      "motion" : "generating",
      "skill" : false,
      "state" : "done",
      "subagents" : 0
    }
  ],
  "toasts" : {
    "allDone" : {
      "color" : "#bdffd6",
      "text" : "complete"
    },
    "catchUp" : {
      "color" : "#9ea8d1",
      "text" : "updates"
    },
    "error" : {
      "color" : "#ff3338",
      "text" : "hit an error"
    },
    "finished" : {
      "color" : "#9ea8d1",
      "text" : "finished"
    },
    "needs" : {
      "color" : "#ffb838",
      "text" : "needs you"
    },
    "resumed" : {
      "color" : "#8f4dff",
      "text" : "back to work"
    },
    "review" : {
      "color" : "#ffb838",
      "text" : "ready for review"
    },
    "started" : {
      "color" : "#8f4dff",
      "text" : "started"
    },
    "update" : {
      "color" : "#9ea8d1",
      "text" : "is available"
    },
    "usageCritical" : {
      "color" : "#ff3338",
      "text" : "usage"
    },
    "usageLow" : {
      "color" : "#ffb838",
      "text" : "usage"
    },
    "usageRefreshed" : {
      "color" : "#9ea8d1",
      "text" : "usage"
    }
  },
  "version" : "0.1.3"
};
