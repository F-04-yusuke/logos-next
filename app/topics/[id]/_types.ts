export type TimelineItem = {
  date?: string;
  event?: string;
  is_ai?: boolean;
};

export type Post = {
  id: number;
  url: string;
  title?: string | null;
  thumbnail_url?: string | null;
  comment?: string | null;
  supplement?: string | null;
  category: string;
  likes_count: number;
  is_liked_by_me?: boolean;
  created_at: string;
  user: { id: number; name: string; avatar?: string | null };
};

export type Reply = {
  id: number;
  body: string;
  likes_count: number;
  is_liked_by_me?: boolean;
  created_at: string;
  user: { id: number; name: string; avatar?: string | null };
};

export type Comment = {
  id: number;
  body: string;
  likes_count: number;
  is_liked_by_me?: boolean;
  created_at: string;
  user: { id: number; name: string; avatar?: string | null };
  replies: Reply[];
};

export type TopicAnalysis = {
  id: number;
  title: string;
  type: "tree" | "matrix" | "swot";
  is_published: boolean;
  topic_id: number | null;
  likes_count: number;
  is_liked_by_me?: boolean;
  supplement?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
  created_at: string;
  user: { id: number; name: string; avatar?: string | null };
};

export type TopicDetail = {
  id: number;
  title: string;
  content: string;
  timeline?: TimelineItem[] | null;
  created_at: string;
  user: { id: number; name: string };
  categories: { id: number; name: string }[];
  posts: Post[];
  comments: Comment[];
  analyses?: TopicAnalysis[];
  user_has_commented?: boolean;
  is_bookmarked?: boolean;
};
