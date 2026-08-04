import type {
  Announcement,
  AppNotification,
  ChatMessage,
  ChatParticipant,
  Conversation,
  MessageAttachment,
  PresenceInfo,
} from '@/types';

/* ============================================================
   Seed data — mirrors communication-service payloads so the
   Communication Center is fully explorable offline.
   ============================================================ */

const now = Date.now();
const minutesAgo = (m: number): string => new Date(now - m * 60_000).toISOString();
const hoursAgo = (h: number): string => new Date(now - h * 3_600_000).toISOString();
const daysAgo = (d: number): string => new Date(now - d * 86_400_000).toISOString();

export const CURRENT_USER_ID = 'user-me';
export const CURRENT_USER_NAME = 'Alex Morgan';

/* ---------------- Participants ---------------- */

export const seedParticipants: Record<string, ChatParticipant> = {
  'user-sarah': {
    userId: 'user-sarah',
    name: 'Sarah Chen',
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah.chen@skillinfinity.io',
    role: 'ROLE_MENTOR',
    headline: 'Senior Systems Engineer · Ex-Google',
    timezone: 'America/Los_Angeles',
  },
  'user-james': {
    userId: 'user-james',
    name: 'James Carter',
    firstName: 'James',
    lastName: 'Carter',
    email: 'james.carter@skillinfinity.io',
    role: 'ROLE_MENTOR',
    headline: 'Staff Engineer · Distributed Systems',
    timezone: 'Europe/London',
  },
  'user-maya': {
    userId: 'user-maya',
    name: 'Maya Patel',
    firstName: 'Maya',
    lastName: 'Patel',
    email: 'maya.patel@skillinfinity.io',
    role: 'ROLE_LEARNER',
    headline: 'Backend Developer in training',
    timezone: 'Asia/Kolkata',
  },
  'user-priya': {
    userId: 'user-priya',
    name: 'Priya Sharma',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@skillinfinity.io',
    role: 'ROLE_MENTOR',
    headline: 'Cloud Architect · AWS Community Builder',
    timezone: 'Asia/Singapore',
  },
  'user-david': {
    userId: 'user-david',
    name: 'David Kim',
    firstName: 'David',
    lastName: 'Kim',
    email: 'david.kim@skillinfinity.io',
    role: 'ROLE_LEARNER',
    headline: 'Full-stack enthusiast',
    timezone: 'America/New_York',
  },
  'user-elena': {
    userId: 'user-elena',
    name: 'Elena Rodriguez',
    firstName: 'Elena',
    lastName: 'Rodriguez',
    email: 'elena.rodriguez@skillinfinity.io',
    role: 'ROLE_MENTOR',
    headline: 'DevOps & Platform Engineering',
    timezone: 'Europe/Madrid',
  },
  'user-marcus': {
    userId: 'user-marcus',
    name: 'Marcus Webb',
    firstName: 'Marcus',
    lastName: 'Webb',
    email: 'marcus.webb@skillinfinity.io',
    role: 'ROLE_LEARNER',
    headline: 'Cloud engineer (certifications)',
    timezone: 'Australia/Sydney',
  },
};

const me: ChatParticipant = {
  userId: CURRENT_USER_ID,
  name: CURRENT_USER_NAME,
  firstName: 'Alex',
  lastName: 'Morgan',
  email: 'alex.morgan@skillinfinity.io',
  role: 'ROLE_LEARNER',
  headline: 'Software engineer · System design track',
  timezone: 'UTC',
};

/* ---------------- Attachment factory ---------------- */

let attachmentCounter = 0;
const attachment = (
  name: string,
  kind: MessageAttachment['kind'],
  size: number,
  extra: Partial<MessageAttachment> = {},
): MessageAttachment => ({
  id: `att-${++attachmentCounter}`,
  name,
  kind,
  size,
  ...extra,
});

/* ---------------- Message factory ---------------- */

interface MessageSeed {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  kind?: ChatMessage['kind'];
  createdAt: string;
  attachments?: MessageAttachment[];
  status?: ChatMessage['status'];
  pinned?: boolean;
  bookmarked?: boolean;
  replyTo?: ChatMessage['replyTo'];
  forwardedFrom?: string;
  edited?: boolean;
  deleted?: boolean;
  reactions?: ChatMessage['reactions'];
  readBy?: string[];
  senderRole?: ChatMessage['senderRole'];
}

const message = (seed: MessageSeed): ChatMessage => ({
  id: seed.id,
  conversationId: seed.conversationId,
  senderId: seed.senderId,
  senderName: seed.senderName,
  senderRole: seed.senderRole ?? (seed.senderId === CURRENT_USER_ID ? 'ROLE_LEARNER' : 'ROLE_MENTOR'),
  content: seed.content,
  kind: seed.kind ?? 'text',
  createdAt: seed.createdAt,
  attachments: seed.attachments ?? [],
  reactions: seed.reactions ?? [],
  status: seed.status ?? (seed.senderId === CURRENT_USER_ID ? 'read' : 'delivered'),
  pinned: seed.pinned ?? false,
  bookmarked: seed.bookmarked ?? false,
  replyTo: seed.replyTo ?? null,
  forwardedFrom: seed.forwardedFrom,
  edited: seed.edited ?? false,
  deleted: seed.deleted ?? false,
  readBy:
    seed.readBy ??
    (seed.senderId === CURRENT_USER_ID ? [CURRENT_USER_ID] : [seed.senderId, CURRENT_USER_ID]),
});

/* ============================================================
   Conversation: Sarah Chen (direct) — pinned, unread 2
   ============================================================ */

const sarahThread = (conversationId: string): ChatMessage[] => [
  message({
    id: 'm-sarah-1',
    conversationId,
    senderId: CURRENT_USER_ID,
    senderName: CURRENT_USER_NAME,
    content: 'Hi Sarah! I went through the system design materials you shared last week.',
    createdAt: daysAgo(2),
  }),
  message({
    id: 'm-sarah-2',
    conversationId,
    senderId: 'user-sarah',
    senderName: 'Sarah Chen',
    content: 'That is great to hear, Alex! 🎉 Did anything stand out as tricky?',
    createdAt: daysAgo(2),
  }),
  message({
    id: 'm-sarah-3',
    conversationId,
    senderId: CURRENT_USER_ID,
    senderName: CURRENT_USER_NAME,
    content: 'The **caching strategies** section was dense — I have a few follow-up questions.',
    createdAt: hoursAgo(26),
  }),
  message({
    id: 'm-sarah-4',
    conversationId,
    senderId: 'user-sarah',
    senderName: 'Sarah Chen',
    content: 'Perfect — that is exactly what tomorrow’s session is about. I prepared a diagram for you.',
    createdAt: hoursAgo(25),
    attachments: [attachment('cache-architecture.png', 'image', 1_840_000, { emoji: '🗺️' })],
  }),
  message({
    id: 'm-sarah-5',
    conversationId,
    senderId: 'user-sarah',
    senderName: 'Sarah Chen',
    content:
      '```text\nCache-Aside Pattern\n\n1. Read   → miss → load from DB → write cache\n2. Write  → invalidate cache entry\n3. TTL    → short, avoids staleness\n```',
    kind: 'code',
    createdAt: hoursAgo(25),
    bookmarked: true,
  }),
  message({
    id: 'm-sarah-6',
    conversationId,
    senderId: CURRENT_USER_ID,
    senderName: CURRENT_USER_NAME,
    content: 'This is super helpful 🙌 I’ll study the write-through vs write-back trade-offs tonight.',
    createdAt: hoursAgo(24),
    replyTo: {
      messageId: 'm-sarah-5',
      senderName: 'Sarah Chen',
      content: 'Cache-Aside Pattern…',
      kind: 'code',
    },
    reactions: [{ emoji: '❤️', count: 1, reactedByMe: false, userIds: ['user-sarah'] }],
  }),
  message({
    id: 'm-sarah-7',
    conversationId,
    senderId: 'user-sarah',
    senderName: 'Sarah Chen',
    content: 'Here is the checklist I mentioned — print friendly 📄',
    createdAt: hoursAgo(2),
    attachments: [
      attachment('system-design-checklist.pdf', 'pdf', 420_000, { emoji: '📄' }),
    ],
  }),
  message({
    id: 'm-sarah-8',
    conversationId,
    senderId: 'user-sarah',
    senderName: 'Sarah Chen',
    content: 'Let me review your architecture diagram before tomorrow’s session 😊',
    createdAt: minutesAgo(35),
  }),
];

/* ============================================================
   Conversation: James Carter (mentor-learner) — pinned
   ============================================================ */

const jamesThread = (conversationId: string): ChatMessage[] => [
  message({
    id: 'm-james-1',
    conversationId,
    senderId: 'user-james',
    senderName: 'James Carter',
    content: 'Welcome to the mentorship program, Alex! Looking forward to working with you.',
    createdAt: daysAgo(6),
  }),
  message({
    id: 'm-james-2',
    conversationId,
    senderId: CURRENT_USER_ID,
    senderName: CURRENT_USER_NAME,
    content: 'Thank you! I am targeting the **Senior Backend** track and would love a roadmap.',
    createdAt: daysAgo(6),
  }),
  message({
    id: 'm-james-3',
    conversationId,
    senderId: 'user-james',
    senderName: 'James Carter',
    content:
      'I put together a 12-week roadmap. Key pillars: concurrency, data modeling, observability, and system design interviews.',
    createdAt: daysAgo(5),
    attachments: [
      attachment('backend-roadmap-12weeks.docx', 'document', 260_000, { emoji: '📝' }),
    ],
    pinned: true,
  }),
  message({
    id: 'm-james-4',
    conversationId,
    senderId: CURRENT_USER_ID,
    senderName: CURRENT_USER_NAME,
    content: 'Amazing! I’m strong on data modeling — let’s focus on observability first.',
    createdAt: daysAgo(4),
  }),
  message({
    id: 'm-james-5',
    conversationId,
    senderId: 'user-james',
    senderName: 'James Carter',
    content: 'Agreed. I’ll add a couple of tracing exercises to our next session.',
    createdAt: daysAgo(4),
    edited: true,
  }),
  message({
    id: 'm-james-6',
    conversationId,
    senderId: 'user-james',
    senderName: 'James Carter',
    content: 'Quick tip: start every interview answer with the **requirements** before jumping into boxes and arrows.',
    createdAt: hoursAgo(30),
    bookmarked: true,
    pinned: true,
  }),
];

/* ============================================================
   Conversation: System Design Deep Dive (session chat) — unread 1
   ============================================================ */

const sysDesignThread = (conversationId: string): ChatMessage[] => {
  const senders = [
    { id: CURRENT_USER_ID, name: CURRENT_USER_NAME },
    { id: 'user-sarah', name: 'Sarah Chen' },
    { id: 'user-maya', name: 'Maya Patel' },
    { id: 'user-david', name: 'David Kim' },
  ];
  const topics = [
    'Let’s recap the four pillars: **scale, latency, availability, consistency**.',
    'For the news feed, would you fan-out on write or on read?',
    'I’d fan-out on write but paginate heavily — hot users get a hybrid queue.',
    'Great point. Pull model for cold readers keeps the write path simple.',
    'How should we size the cache tier for 10M DAU?',
    'Rough estimate: 60% read hit from cache, ~2KB per item → a few hundred GB hot set.',
    'Redis Cluster with 12 shards handles that comfortably.',
    'What about the notification fan-out? That is the trickiest part.',
    'Let’s model it as a **pull** queue with a per-user inbox in Cassandra.',
    'Consistency: do we need strong consistency for likes?',
    'No — eventual is fine, but the counter must be idempotent to avoid double counts.',
    'Agreed. Exactly-once semantics via request id deduplication.',
    'Time to draw the high-level architecture on the whiteboard.',
    'I’ll share the diagram I sketched last night.',
  ];
  const filler = [
    'Sounds good 👍',
    'Let me note that down.',
    'Can you share the slide for that part?',
    'Right, that aligns with the reading material.',
    'Adding that to my notes.',
    'Good discussion point.',
    'Agreed.',
  ];

  const messages: ChatMessage[] = [];
  const baseTime = now - 72 * 3_600_000;
  const interval = 34 * 60_000;
  let idx = 0;

  const push = (seed: MessageSeed): void => {
    messages.push(message(seed));
  };

  // Opening system message
  push({
    id: 'm-sys-0',
    conversationId,
    senderId: 'system',
    senderName: 'System',
    content: '📌 Session “System Design Deep Dive” — share questions and resources here.',
    kind: 'system',
    createdAt: new Date(baseTime - interval).toISOString(),
  });

  for (let i = 0; i < 92; i += 1) {
    const t = new Date(baseTime + i * interval).toISOString();
    const sender = senders[i % senders.length] ?? senders[0];
    const id = `m-sys-${i + 1}`;

    if (i === 12) {
      push({
        id,
        conversationId,
        senderId: sender.id,
        senderName: sender.name,
        content: 'Here is the high-level architecture sketch — feedback welcome!',
        createdAt: t,
        attachments: [attachment('high-level-architecture.png', 'image', 2_400_000, { emoji: '🏗️' })],
        pinned: true,
      });
    } else if (i === 26) {
      push({
        id,
        conversationId,
        senderId: sender.id,
        senderName: sender.name,
        content: 'Voice note summarizing the cache discussion 🎙️',
        kind: 'voice',
        createdAt: t,
        attachments: [attachment('cache-discussion-summary.m4a', 'audio', 890_000, { durationSeconds: 94 })],
      });
    } else if (i === 38) {
      push({
        id,
        conversationId,
        senderId: sender.id,
        senderName: sender.name,
        content: 'This gif says it all 😄',
        kind: 'gif',
        createdAt: t,
      });
    } else if (i === 51) {
      push({
        id,
        conversationId,
        senderId: sender.id,
        senderName: sender.name,
        content: 'The recording from last session is attached for reference.',
        createdAt: t,
        attachments: [attachment('session-recording-4k.mp4', 'video', 84_000_000, { emoji: '🎬' })],
      });
    } else if (i === 64) {
      push({
        id,
        conversationId,
        senderId: sender.id,
        senderName: sender.name,
        content: 'Certificates for the completed design workshop are now available 🎓',
        createdAt: t,
        attachments: [attachment('design-workshop-certificate.pdf', 'certificate', 180_000, { emoji: '🎓' })],
      });
    } else if (i === 78) {
      push({
        id,
        conversationId,
        senderId: sender.id,
        senderName: sender.name,
        content: `Pinned: session notes — ${topics[(i + 3) % topics.length] ?? ''}`,
        createdAt: t,
        pinned: true,
      });
    } else if (i % 13 === 0) {
      push({
        id,
        conversationId,
        senderId: sender.id,
        senderName: sender.name,
        content: topics[i % topics.length] ?? '',
        createdAt: t,
      });
    } else if (i % 6 === 0) {
      push({
        id,
        conversationId,
        senderId: sender.id,
        senderName: sender.name,
        content: filler[i % filler.length] ?? '',
        createdAt: t,
      });
    } else {
      push({
        id,
        conversationId,
        senderId: sender.id,
        senderName: sender.name,
        content: `Topic ${((i + 4) % 14) + 1} — ${topics[i % topics.length] ?? ''}`,
        createdAt: t,
      });
    }
    idx += 1;
  }

  // A couple of recent unread messages
  push({
    id: 'm-sys-recent-1',
    conversationId,
    senderId: 'user-maya',
    senderName: 'Maya Patel',
    content: 'Session confirmed for tomorrow at 4 PM UTC — reminder set ⏰',
    createdAt: minutesAgo(48),
  });
  push({
    id: 'm-sys-recent-2',
    conversationId,
    senderId: 'user-sarah',
    senderName: 'Sarah Chen',
    content: 'Please bring your architecture diagrams — we’ll do a live review. See you there!',
    createdAt: minutesAgo(12),
  });

  return messages;
};

/* ============================================================
   Conversation: DevOps Study Group (group) — pinned, unread 5
   ============================================================ */

const devopsThread = (conversationId: string): ChatMessage[] => [
  message({
    id: 'm-dev-1',
    conversationId,
    senderId: 'user-elena',
    senderName: 'Elena Rodriguez',
    content: 'Group goal for this month: everyone finishes a hands-on CI/CD pipeline 🤖',
    createdAt: daysAgo(3),
    pinned: true,
  }),
  message({
    id: 'm-dev-2',
    conversationId,
    senderId: 'user-priya',
    senderName: 'Priya Sharma',
    content: 'I found a great GitHub Actions course — sharing the link later.',
    createdAt: daysAgo(3),
  }),
  message({
    id: 'm-dev-3',
    conversationId,
    senderId: CURRENT_USER_ID,
    senderName: CURRENT_USER_NAME,
    content: 'Count me in! I’ll do the **Docker + K8s** track.',
    createdAt: daysAgo(3),
  }),
  message({
    id: 'm-dev-4',
    conversationId,
    senderId: 'user-marcus',
    senderName: 'Marcus Webb',
    content: 'Working on the AWS EKS module right now — the networking part is spicy 🔥',
    createdAt: hoursAgo(20),
    reactions: [
      { emoji: '😂', count: 3, reactedByMe: false, userIds: ['user-elena', 'user-priya', CURRENT_USER_ID] },
    ],
  }),
  message({
    id: 'm-dev-5',
    conversationId,
    senderId: 'user-elena',
    senderName: 'Elena Rodriguez',
    content: '😂 wait until you hit service mesh.',
    createdAt: hoursAgo(19),
  }),
  message({
    id: 'm-dev-6',
    conversationId,
    senderId: 'user-priya',
    senderName: 'Priya Sharma',
    content: 'Terraform workshop notes attached — includes provider gotchas.',
    createdAt: hoursAgo(4),
    attachments: [
      attachment('terraform-workshop-notes.pdf', 'pdf', 640_000, { emoji: '📄' }),
      attachment('terraform-configs.zip', 'archive', 1_200_000, { emoji: '📦' }),
    ],
    bookmarked: true,
  }),
  message({
    id: 'm-dev-7',
    conversationId,
    senderId: 'user-marcus',
    senderName: 'Marcus Webb',
    content: 'EKS + Argo CD finally green 🎉🥳',
    createdAt: minutesAgo(22),
  }),
  message({
    id: 'm-dev-8',
    conversationId,
    senderId: 'user-elena',
    senderName: 'Elena Rodriguez',
    content: 'Love to see it! Next study session: **Friday 5 PM UTC**.',
    createdAt: minutesAgo(18),
  }),
  message({
    id: 'm-dev-9',
    conversationId,
    senderId: 'user-priya',
    senderName: 'Priya Sharma',
    content: 'Friday works for me ✅',
    createdAt: minutesAgo(6),
  }),
];

/* ============================================================
   Conversation: Maya Patel (direct)
   ============================================================ */

const mayaThread = (conversationId: string): ChatMessage[] => [
  message({
    id: 'm-maya-1',
    conversationId,
    senderId: 'user-maya',
    senderName: 'Maya Patel',
    content: 'Hey Alex! Did you finish the concurrency exercise?',
    createdAt: daysAgo(1),
  }),
  message({
    id: 'm-maya-2',
    conversationId,
    senderId: CURRENT_USER_ID,
    senderName: CURRENT_USER_NAME,
    content: 'Almost! Stuck on the **rate limiter** part — token bucket vs sliding window.',
    createdAt: daysAgo(1),
  }),
  message({
    id: 'm-maya-3',
    conversationId,
    senderId: 'user-maya',
    senderName: 'Maya Patel',
    content: 'I wrote a quick explainer — check the voice note 👇',
    createdAt: hoursAgo(22),
    kind: 'voice',
    attachments: [attachment('rate-limiter-explainer.m4a', 'audio', 560_000, { durationSeconds: 48 })],
  }),
  message({
    id: 'm-maya-4',
    conversationId,
    senderId: CURRENT_USER_ID,
    senderName: CURRENT_USER_NAME,
    content: 'That helped a lot, thanks Maya! 🙏',
    createdAt: hoursAgo(21),
  }),
  message({
    id: 'm-maya-5',
    conversationId,
    senderId: 'user-maya',
    senderName: 'Maya Patel',
    content: 'Anytime! Let’s pair on the **event-driven design** module next week.',
    createdAt: hoursAgo(3),
  }),
];

/* ============================================================
   Conversation: Cloud Fundamentals (session chat)
   ============================================================ */

const cloudThread = (conversationId: string): ChatMessage[] => [
  message({
    id: 'm-cloud-1',
    conversationId,
    senderId: 'user-priya',
    senderName: 'Priya Sharma',
    content: 'Cloud Fundamentals session starts in 2 hours — see you at the meeting link! ☁️',
    createdAt: hoursAgo(5),
    pinned: true,
  }),
  message({
    id: 'm-cloud-2',
    conversationId,
    senderId: CURRENT_USER_ID,
    senderName: CURRENT_USER_NAME,
    content: 'Looking forward to the **VPC design** deep dive.',
    createdAt: hoursAgo(4),
  }),
  message({
    id: 'm-cloud-3',
    conversationId,
    senderId: 'user-david',
    senderName: 'David Kim',
    content: 'Same! My VPC peering diagram is ready for feedback.',
    createdAt: hoursAgo(4),
  }),
  message({
    id: 'm-cloud-4',
    conversationId,
    senderId: 'user-priya',
    senderName: 'Priya Sharma',
    content: 'Slides from the last module are attached — focus on sections 3 & 4.',
    createdAt: hoursAgo(1),
    attachments: [attachment('vpc-fundamentals-slides.pdf', 'pdf', 3_100_000, { emoji: '📊' })],
  }),
  message({
    id: 'm-cloud-5',
    conversationId,
    senderId: 'user-david',
    senderName: 'David Kim',
    content: 'Got it, reviewing now ⚡',
    createdAt: minutesAgo(40),
  }),
];

/* ============================================================
   Conversation: Architecture Guild (group) — muted
   ============================================================ */

const guildThread = (conversationId: string): ChatMessage[] => [
  message({
    id: 'm-guild-1',
    conversationId,
    senderId: 'user-james',
    senderName: 'James Carter',
    content: 'Monthly topic: **event sourcing vs CDC**. Bring your hottest takes.',
    createdAt: daysAgo(4),
    pinned: true,
  }),
  message({
    id: 'm-guild-2',
    conversationId,
    senderId: 'user-elena',
    senderName: 'Elena Rodriguez',
    content: 'CDC with Debezium has been rock solid for our analytics pipelines.',
    createdAt: daysAgo(4),
  }),
  message({
    id: 'm-guild-3',
    conversationId,
    senderId: 'user-sarah',
    senderName: 'Sarah Chen',
    content: 'Event sourcing gives you the full audit trail, but the learning curve is real.',
    createdAt: daysAgo(3),
  }),
  message({
    id: 'm-guild-4',
    conversationId,
    senderId: 'user-marcus',
    senderName: 'Marcus Webb',
    content: 'Hot take: most teams should start with CDC and revisit event sourcing later 🔥',
    createdAt: daysAgo(3),
    reactions: [
      { emoji: '🔥', count: 4, reactedByMe: false, userIds: ['user-james', 'user-elena', 'user-sarah', CURRENT_USER_ID] },
    ],
    bookmarked: true,
  }),
  message({
    id: 'm-guild-5',
    conversationId,
    senderId: 'user-james',
    senderName: 'James Carter',
    content: 'Noted for the Friday debate. Bring evidence, not vibes 😄',
    createdAt: hoursAgo(26),
  }),
];

/* ============================================================
   Conversations
   ============================================================ */

export const seedConversations: Conversation[] = [
  {
    id: 'c-sarah',
    type: 'direct',
    subtitle: 'Direct message',
    participants: [me, seedParticipants['user-sarah']!],
    unreadCount: 2,
    pinned: true,
    createdAt: daysAgo(6),
    updatedAt: minutesAgo(35),
  },
  {
    id: 'c-james',
    type: 'mentor-learner',
    subtitle: 'Mentorship',
    participants: [me, seedParticipants['user-james']!],
    unreadCount: 0,
    pinned: true,
    createdAt: daysAgo(7),
    updatedAt: hoursAgo(30),
  },
  {
    id: 'c-sysdesign',
    type: 'session',
    title: 'System Design Deep Dive',
    subtitle: 'Session · 12 members',
    avatarEmoji: '🧠',
    sessionId: 's-001',
    participants: [
      me,
      seedParticipants['user-sarah']!,
      seedParticipants['user-maya']!,
      seedParticipants['user-david']!,
    ],
    unreadCount: 1,
    pinned: false,
    createdAt: daysAgo(3),
    updatedAt: minutesAgo(12),
  },
  {
    id: 'c-devops',
    type: 'group',
    title: 'DevOps Study Group',
    subtitle: 'Group · 6 members',
    avatarEmoji: '🚀',
    participants: [
      me,
      seedParticipants['user-elena']!,
      seedParticipants['user-priya']!,
      seedParticipants['user-marcus']!,
    ],
    unreadCount: 5,
    pinned: true,
    createdAt: daysAgo(9),
    updatedAt: minutesAgo(6),
  },
  {
    id: 'c-maya',
    type: 'direct',
    subtitle: 'Direct message',
    participants: [me, seedParticipants['user-maya']!],
    unreadCount: 0,
    pinned: false,
    createdAt: daysAgo(12),
    updatedAt: hoursAgo(3),
  },
  {
    id: 'c-cloud',
    type: 'session',
    title: 'Cloud Fundamentals',
    subtitle: 'Session · 8 members',
    avatarEmoji: '☁️',
    sessionId: 's-004',
    participants: [me, seedParticipants['user-priya']!, seedParticipants['user-david']!],
    unreadCount: 0,
    pinned: false,
    createdAt: daysAgo(2),
    updatedAt: minutesAgo(40),
  },
  {
    id: 'c-guild',
    type: 'group',
    title: 'Architecture Guild',
    subtitle: 'Group · 9 members',
    avatarEmoji: '🏛️',
    participants: [
      me,
      seedParticipants['user-james']!,
      seedParticipants['user-elena']!,
      seedParticipants['user-sarah']!,
      seedParticipants['user-marcus']!,
    ],
    unreadCount: 0,
    muted: true,
    pinned: false,
    createdAt: daysAgo(20),
    updatedAt: hoursAgo(26),
  },
];

/** Attach last-message previews derived from each thread. */
export const seedThreads: Record<string, ChatMessage[]> = {
  'c-sarah': sarahThread('c-sarah'),
  'c-james': jamesThread('c-james'),
  'c-sysdesign': sysDesignThread('c-sysdesign'),
  'c-devops': devopsThread('c-devops'),
  'c-maya': mayaThread('c-maya'),
  'c-cloud': cloudThread('c-cloud'),
  'c-guild': guildThread('c-guild'),
};

seedConversations.forEach((conversation) => {
  const thread = seedThreads[conversation.id] ?? [];
  conversation.lastMessage = thread[thread.length - 1];
});

/* ============================================================
   Presence
   ============================================================ */

export const seedPresence: Record<string, PresenceInfo> = {
  'user-sarah': { userId: 'user-sarah', status: 'online', device: 'web', customStatus: 'Design review hours' },
  'user-james': { userId: 'user-james', status: 'busy', device: 'desktop', lastSeen: minutesAgo(9) },
  'user-maya': { userId: 'user-maya', status: 'online', device: 'mobile' },
  'user-priya': { userId: 'user-priya', status: 'in-session', device: 'desktop', customStatus: 'In a session' },
  'user-david': { userId: 'user-david', status: 'away', device: 'web', lastSeen: minutesAgo(22) },
  'user-elena': { userId: 'user-elena', status: 'online', device: 'desktop' },
  'user-marcus': { userId: 'user-marcus', status: 'offline', device: 'mobile', lastSeen: hoursAgo(2) },
};

/* ============================================================
   Announcements
   ============================================================ */

export const seedAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Platform update — real-time messaging is live 🎉',
    body: 'The Communication Center is now available for all users. Send messages to your mentors, join session chats, and get notified instantly. Let us know what you think!',
    category: 'PLATFORM',
    author: 'Skill Infinity Team',
    pinned: true,
    readByMe: false,
    publishedAt: daysAgo(1),
  },
  {
    id: 'ann-2',
    title: 'Scheduled maintenance — Saturday 02:00–04:00 UTC',
    body: 'We will perform routine infrastructure maintenance. The platform may be briefly unavailable during this window. Your data and bookings are safe.',
    category: 'MAINTENANCE',
    author: 'Platform Engineering',
    readByMe: false,
    publishedAt: hoursAgo(6),
  },
  {
    id: 'ann-3',
    title: 'New mentor events this month 🎤',
    body: 'Join live AMA sessions with our top mentors on system design, cloud, and career growth. Events are free for learners on the annual plan.',
    category: 'EVENT',
    author: 'Community Team',
    readByMe: true,
    publishedAt: daysAgo(3),
  },
  {
    id: 'ann-4',
    title: 'Summer learning promotion — 30% off mentorship tracks',
    body: 'Use code SUMMER30 at checkout to save on 12-week mentorship tracks. Offer valid until the end of the month.',
    category: 'PROMOTION',
    author: 'Growth Team',
    readByMe: true,
    publishedAt: daysAgo(5),
  },
  {
    id: 'ann-5',
    title: 'System upgrade completed ✅',
    body: 'The session engine and calendar now support rescheduling with instant availability checks. Feedback welcome in the community forum.',
    category: 'SYSTEM',
    author: 'Core Team',
    readByMe: true,
    publishedAt: daysAgo(8),
  },
];

/* ============================================================
   Notifications (premium notification center seed)
   ============================================================ */

export const seedNotifications: AppNotification[] = [
  {
    id: 'n-1',
    title: 'Session reminder',
    message: '“System Design Deep Dive” starts in 30 minutes.',
    type: 'info',
    read: false,
    category: 'SESSION',
    emoji: '⏰',
    actionLabel: 'View session',
    link: '/sessions/s-001',
    createdAt: minutesAgo(28),
  },
  {
    id: 'n-2',
    title: 'New message from Sarah Chen',
    message: 'Let me review your architecture diagram before tomorrow’s session 😊',
    type: 'info',
    read: false,
    category: 'MESSAGE',
    emoji: '💬',
    actionLabel: 'Open chat',
    link: '/messages/c-sarah',
    createdAt: minutesAgo(35),
  },
  {
    id: 'n-3',
    title: 'Booking confirmed',
    message: 'James Carter accepted your booking for “Backend Architecture Review”.',
    type: 'success',
    read: false,
    category: 'BOOKING',
    emoji: '✅',
    actionLabel: 'View session',
    link: '/sessions/s-003',
    createdAt: hoursAgo(2),
  },
  {
    id: 'n-4',
    title: 'Payment successful',
    message: 'Your payment of $49.00 for the “System Design Deep Dive” session was processed.',
    type: 'success',
    read: true,
    category: 'PAYMENT',
    emoji: '💳',
    actionLabel: 'View receipt',
    link: '/wallet/transactions',
    createdAt: hoursAgo(3),
  },
  {
    id: 'n-5',
    title: 'Wallet updated',
    message: '120 credits were added to your wallet.',
    type: 'success',
    read: true,
    category: 'WALLET',
    emoji: '👛',
    actionLabel: 'View wallet',
    link: '/wallet',
    createdAt: hoursAgo(3),
  },
  {
    id: 'n-6',
    title: 'Mentor profile approved 🎉',
    message: 'Congratulations! Your mentor application has been approved.',
    type: 'success',
    read: true,
    category: 'SYSTEM',
    emoji: '🏅',
    createdAt: daysAgo(1),
  },
  {
    id: 'n-7',
    title: 'Review reminder',
    message: 'How was your session with Sarah Chen? Share your feedback.',
    type: 'warning',
    read: true,
    category: 'REVIEW',
    emoji: '⭐',
    actionLabel: 'Leave a review',
    link: '/sessions/s-001',
    createdAt: daysAgo(1),
  },
  {
    id: 'n-8',
    title: 'New community activity',
    message: 'David Kim replied to your post in “DevOps Study Group”.',
    type: 'info',
    read: true,
    category: 'COMMUNITY',
    emoji: '🌐',
    actionLabel: 'View thread',
    link: '/community',
    createdAt: daysAgo(2),
  },
  {
    id: 'n-9',
    title: 'New announcement',
    message: 'Platform update — real-time messaging is live 🎉',
    type: 'info',
    read: true,
    category: 'ANNOUNCEMENT',
    emoji: '📣',
    actionLabel: 'Read announcement',
    link: '/announcements',
    createdAt: daysAgo(1),
  },
];

/* ============================================================
   Canned demo replies (offline companion)
   ============================================================ */

export const DEMO_REPLIES: Record<string, { senderId: string; senderName: string; replies: string[] }> = {
  'c-sarah': {
    senderId: 'user-sarah',
    senderName: 'Sarah Chen',
    replies: [
      'Great question — let me think it through and get back to you shortly 🙌',
      'Love the direction! Bring your notes to the session and we’ll dig in.',
      'That matches what we covered in the materials. Nice work!',
    ],
  },
  'c-james': {
    senderId: 'user-james',
    senderName: 'James Carter',
    replies: [
      'Good thinking. Let’s explore that in our next mentoring session.',
      'I’ll add that to your roadmap — keep going!',
      'Exactly the kind of question senior engineers ask. 👍',
    ],
  },
  'c-maya': {
    senderId: 'user-maya',
    senderName: 'Maya Patel',
    replies: [
      'Haha yes! Let’s pair on that later 🚀',
      'I found a great resource for that — sharing it soon.',
    ],
  },
  'c-devops': {
    senderId: 'user-elena',
    senderName: 'Elena Rodriguez',
    replies: ['Nice! Keep the momentum going, group 💪', 'That is a great addition to the study plan.'],
  },
  'c-sysdesign': {
    senderId: 'user-sarah',
    senderName: 'Sarah Chen',
    replies: ['Noted for the live review tomorrow 👍', 'Great contribution to the thread!'],
  },
  'c-cloud': {
    senderId: 'user-priya',
    senderName: 'Priya Sharma',
    replies: ['Perfect timing — we’ll cover that today ☁️'],
  },
  'c-guild': {
    senderId: 'user-james',
    senderName: 'James Carter',
    replies: ['Interesting — bring that to the Friday debate 😄'],
  },
};

export const DEMO_THINKING_REPLIES = ['Typing…', 'Let me check my notes…'];
