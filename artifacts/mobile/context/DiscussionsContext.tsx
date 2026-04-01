import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type LocationType = "online" | "offline" | "hybrid";

export type Discussion = {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  duration: string;
  maxParticipants: number;
  coverImage: string;
  hostId: string;
  hostName: string;
  hostRole: string;
  hostReputation: number;
  participants: string[];
  waitingList: string[];
  topics: string[];
  locationType: LocationType;
  meetingLink?: string;
  venueName?: string;
  venueAddress?: string;
  city?: string;
  mapsLink?: string;
  isTrending: boolean;
  createdAt: string;
};

export type ParticipantStatus = "confirmed" | "waiting" | "host" | "none";

export type ChatMessage = {
  id: string;
  discussionId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  timestamp: string;
};

type DiscussionsContextType = {
  discussions: Discussion[];
  myDiscussions: Discussion[];
  joinDiscussion: (discussionId: string, userId: string) => Promise<"confirmed" | "waiting">;
  leaveDiscussion: (discussionId: string, userId: string) => Promise<void>;
  createDiscussion: (discussion: Omit<Discussion, "id" | "createdAt" | "participants" | "waitingList">) => Promise<Discussion>;
  getDiscussion: (id: string) => Discussion | undefined;
  getUserStatus: (discussionId: string, userId: string) => ParticipantStatus;
  promoteFromWaitingList: (discussionId: string, userId: string) => Promise<void>;
  removeParticipant: (discussionId: string, userId: string) => Promise<void>;
  getMessages: (discussionId: string) => Promise<ChatMessage[]>;
  sendMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => Promise<void>;
  refreshDiscussions: () => Promise<void>;
};

const DiscussionsContext = createContext<DiscussionsContextType | null>(null);

const DISCUSSIONS_KEY = "m2d_discussions_v2";
const CHAT_KEY = "m2d_chat_";

const SEED_DISCUSSIONS: Discussion[] = [
  {
    id: "d1",
    title: "Building Scalable AI Products in 2025",
    description: "Join us for an in-depth discussion on the challenges and opportunities in building AI-powered products at scale. We'll cover architecture patterns, model selection, and lessons from real-world deployments.",
    category: "AI & Machine Learning",
    date: "2026-04-15",
    time: "2:00 PM",
    duration: "90",
    maxParticipants: 8,
    coverImage: "ai",
    hostId: "host1",
    hostName: "Sarah Chen",
    hostRole: "AI Product Lead @ OpenAI",
    hostReputation: 4.9,
    participants: ["host1", "u2", "u3", "u4", "u5", "u6", "u7", "u8"],
    waitingList: ["u9", "u10", "u11"],
    topics: ["LLMs", "Product Strategy", "MLOps", "User Experience"],
    locationType: "hybrid",
    meetingLink: "https://meet.google.com/abc-defg-hij",
    venueName: "Moscone Center",
    venueAddress: "747 Howard St",
    city: "San Francisco, CA",
    isTrending: true,
    createdAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "d2",
    title: "Web3 x DeFi: What's Actually Working",
    description: "An honest conversation about what protocols and products in DeFi are gaining real traction. We'll separate hype from substance and discuss investment thesis.",
    category: "Web3 & Blockchain",
    date: "2026-04-18",
    time: "6:00 PM",
    duration: "60",
    maxParticipants: 30,
    coverImage: "web3",
    hostId: "host2",
    hostName: "Marcus Rivera",
    hostRole: "DeFi Researcher @ Paradigm",
    hostReputation: 4.7,
    participants: ["host2", "u1", "u6"],
    waitingList: [],
    topics: ["DeFi", "Protocol Design", "Tokenomics"],
    locationType: "online",
    meetingLink: "https://zoom.us/j/123456789",
    isTrending: true,
    createdAt: "2026-03-02T14:00:00Z",
  },
  {
    id: "d3",
    title: "Developer Tools That Changed My Workflow",
    description: "Share and discover the developer tools, frameworks, and workflows that have had the biggest impact on productivity. From local dev environments to CI/CD pipelines.",
    category: "Developer Tools",
    date: "2026-04-20",
    time: "5:00 PM",
    duration: "60",
    maxParticipants: 15,
    coverImage: "devtools",
    hostId: "host3",
    hostName: "Priya Nair",
    hostRole: "Staff Engineer @ Vercel",
    hostReputation: 4.8,
    participants: ["host3", "u2", "u7"],
    waitingList: [],
    topics: ["DevTools", "Productivity", "CI/CD", "Open Source"],
    locationType: "offline",
    venueName: "WeWork Times Square",
    venueAddress: "1460 Broadway",
    city: "New York, NY",
    mapsLink: "https://maps.google.com/?q=WeWork+Times+Square",
    isTrending: false,
    createdAt: "2026-03-03T09:00:00Z",
  },
  {
    id: "d4",
    title: "From Engineer to Founder: The Real Journey",
    description: "An intimate conversation with founders who made the leap from engineering roles. What surprised them, what they wish they knew, and what skills transferred.",
    category: "Startups & Entrepreneurship",
    date: "2026-04-22",
    time: "3:00 PM",
    duration: "90",
    maxParticipants: 12,
    coverImage: "startup",
    hostId: "host4",
    hostName: "Alex Kim",
    hostRole: "Founder @ BuildFast",
    hostReputation: 4.6,
    participants: ["host4", "u3", "u5", "u8"],
    waitingList: [],
    topics: ["Entrepreneurship", "Leadership", "Product", "Fundraising"],
    locationType: "offline",
    venueName: "Capital Factory",
    venueAddress: "701 Brazos St",
    city: "Austin, TX",
    isTrending: false,
    createdAt: "2026-03-04T11:00:00Z",
  },
  {
    id: "d5",
    title: "Designing for Accessibility First",
    description: "Why accessibility should be a core design principle, not an afterthought. Best practices for building inclusive products that work for everyone.",
    category: "Design & UX",
    date: "2026-04-25",
    time: "1:00 PM",
    duration: "60",
    maxParticipants: 25,
    coverImage: "design",
    hostId: "host5",
    hostName: "Jordan Lee",
    hostRole: "Principal Designer @ Figma",
    hostReputation: 4.9,
    participants: ["host5"],
    waitingList: [],
    topics: ["Accessibility", "Inclusive Design", "UX Research"],
    locationType: "online",
    meetingLink: "https://meet.google.com/xyz-abcd-efg",
    isTrending: true,
    createdAt: "2026-03-05T15:00:00Z",
  },
  {
    id: "d6",
    title: "Platform Engineering: Lessons from Scale",
    description: "Deep dive into platform engineering at scale. Infrastructure, internal developer portals, golden paths, and how to create leverage across engineering orgs.",
    category: "Engineering",
    date: "2026-04-28",
    time: "4:00 PM",
    duration: "120",
    maxParticipants: 18,
    coverImage: "platform",
    hostId: "host6",
    hostName: "Dev Patel",
    hostRole: "Platform Engineer @ Stripe",
    hostReputation: 4.8,
    participants: ["host6", "u1", "u4"],
    waitingList: [],
    topics: ["Platform Engineering", "Infrastructure", "DevEx", "Kubernetes"],
    locationType: "hybrid",
    meetingLink: "https://zoom.us/j/987654321",
    venueName: "Stripe HQ",
    venueAddress: "354 Oyster Point Blvd",
    city: "Seattle, WA",
    isTrending: false,
    createdAt: "2026-03-06T13:00:00Z",
  },
];

const SEED_MESSAGES: Record<string, ChatMessage[]> = {
  d1: [
    {
      id: "m1",
      discussionId: "d1",
      senderId: "host1",
      senderName: "Sarah Chen",
      senderRole: "AI Product Lead",
      content: "Welcome everyone! Excited to discuss AI product building with this great group. Let's start with the biggest challenge you've faced.",
      timestamp: "2026-03-14T14:00:00Z",
    },
    {
      id: "m2",
      discussionId: "d1",
      senderId: "u2",
      senderName: "James Park",
      senderRole: "ML Engineer",
      content: "For me it's been model evaluation at scale. Hard to know when 'good enough' is actually good enough for production.",
      timestamp: "2026-03-14T14:02:00Z",
    },
    {
      id: "m3",
      discussionId: "d1",
      senderId: "u3",
      senderName: "Maria Lopez",
      senderRole: "Product Manager",
      content: "Data quality and latency are my top concerns. Users expect sub-second responses but our models need 3-4 seconds.",
      timestamp: "2026-03-14T14:05:00Z",
    },
  ],
  d2: [
    {
      id: "m4",
      discussionId: "d2",
      senderId: "host2",
      senderName: "Marcus Rivera",
      senderRole: "DeFi Researcher",
      content: "Let's cut through the noise. What DeFi protocols are you actually using day-to-day?",
      timestamp: "2026-03-17T18:00:00Z",
    },
  ],
};

export function DiscussionsProvider({ children }: { children: ReactNode }) {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [myDiscussions] = useState<Discussion[]>([]);

  useEffect(() => {
    loadDiscussions();
  }, []);

  async function loadDiscussions() {
    try {
      const stored = await AsyncStorage.getItem(DISCUSSIONS_KEY);
      if (stored) {
        setDiscussions(JSON.parse(stored));
      } else {
        await AsyncStorage.setItem(DISCUSSIONS_KEY, JSON.stringify(SEED_DISCUSSIONS));
        setDiscussions(SEED_DISCUSSIONS);
        for (const [discussionId, messages] of Object.entries(SEED_MESSAGES)) {
          await AsyncStorage.setItem(CHAT_KEY + discussionId, JSON.stringify(messages));
        }
      }
    } catch (e) {
      console.error("Error loading discussions:", e);
      setDiscussions(SEED_DISCUSSIONS);
    }
  }

  async function refreshDiscussions() {
    await loadDiscussions();
  }

  function getUserStatus(discussionId: string, userId: string): ParticipantStatus {
    const d = discussions.find((x) => x.id === discussionId);
    if (!d) return "none";
    if (d.hostId === userId) return "host";
    if (d.participants.includes(userId)) return "confirmed";
    if (d.waitingList.includes(userId)) return "waiting";
    return "none";
  }

  async function joinDiscussion(discussionId: string, userId: string): Promise<"confirmed" | "waiting"> {
    let result: "confirmed" | "waiting" = "confirmed";
    const updated = discussions.map((d) => {
      if (d.id !== discussionId) return d;
      if (d.participants.includes(userId) || d.waitingList.includes(userId)) return d;
      if (d.participants.length < d.maxParticipants) {
        result = "confirmed";
        return { ...d, participants: [...d.participants, userId] };
      } else {
        result = "waiting";
        return { ...d, waitingList: [...d.waitingList, userId] };
      }
    });
    setDiscussions(updated);
    await AsyncStorage.setItem(DISCUSSIONS_KEY, JSON.stringify(updated));
    return result;
  }

  async function leaveDiscussion(discussionId: string, userId: string) {
    const updated = discussions.map((d) => {
      if (d.id !== discussionId) return d;
      const isConfirmed = d.participants.includes(userId);
      if (isConfirmed) {
        const newParticipants = d.participants.filter((p) => p !== userId);
        if (d.waitingList.length > 0) {
          const [promoted, ...remaining] = d.waitingList;
          return {
            ...d,
            participants: [...newParticipants, promoted],
            waitingList: remaining,
          };
        }
        return { ...d, participants: newParticipants };
      }
      return { ...d, waitingList: d.waitingList.filter((p) => p !== userId) };
    });
    setDiscussions(updated);
    await AsyncStorage.setItem(DISCUSSIONS_KEY, JSON.stringify(updated));
  }

  async function promoteFromWaitingList(discussionId: string, userId: string) {
    const updated = discussions.map((d) => {
      if (d.id !== discussionId) return d;
      if (!d.waitingList.includes(userId)) return d;
      return {
        ...d,
        participants: [...d.participants, userId],
        waitingList: d.waitingList.filter((p) => p !== userId),
      };
    });
    setDiscussions(updated);
    await AsyncStorage.setItem(DISCUSSIONS_KEY, JSON.stringify(updated));
  }

  async function removeParticipant(discussionId: string, userId: string) {
    await leaveDiscussion(discussionId, userId);
  }

  async function createDiscussion(
    data: Omit<Discussion, "id" | "createdAt" | "participants" | "waitingList">
  ): Promise<Discussion> {
    const newDiscussion: Discussion = {
      ...data,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      participants: [data.hostId],
      waitingList: [],
    };
    const updated = [newDiscussion, ...discussions];
    setDiscussions(updated);
    await AsyncStorage.setItem(DISCUSSIONS_KEY, JSON.stringify(updated));
    return newDiscussion;
  }

  function getDiscussion(id: string) {
    return discussions.find((d) => d.id === id);
  }

  async function getMessages(discussionId: string): Promise<ChatMessage[]> {
    const stored = await AsyncStorage.getItem(CHAT_KEY + discussionId);
    return stored ? JSON.parse(stored) : [];
  }

  async function sendMessage(msg: Omit<ChatMessage, "id" | "timestamp">) {
    const messages = await getMessages(msg.discussionId);
    const newMsg: ChatMessage = {
      ...msg,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };
    await AsyncStorage.setItem(CHAT_KEY + msg.discussionId, JSON.stringify([...messages, newMsg]));
  }

  return (
    <DiscussionsContext.Provider
      value={{
        discussions,
        myDiscussions,
        joinDiscussion,
        leaveDiscussion,
        createDiscussion,
        getDiscussion,
        getUserStatus,
        promoteFromWaitingList,
        removeParticipant,
        getMessages,
        sendMessage,
        refreshDiscussions,
      }}
    >
      {children}
    </DiscussionsContext.Provider>
  );
}

export function useDiscussions(): DiscussionsContextType {
  const ctx = useContext(DiscussionsContext);
  if (!ctx) throw new Error("useDiscussions must be used within DiscussionsProvider");
  return ctx;
}
