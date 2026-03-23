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
  custom_thumbnail?: string | null;
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

// ── 分析ツールのデータ型（Discriminated Union） ──
// type フィールドで絞り込むと data の型が自動的に確定する

export type TreeNode = {
  id: string;
  speaker: string;
  stance: string;
  text: string;
  children: TreeNode[];
};

export type MatrixPattern = { title: string; description: string };
export type MatrixCell = { score: string; reason: string };
export type MatrixRow = { itemTitle: string; evaluations: MatrixCell[] };

export type AnalysisData =
  | {
      type: "tree";
      data: { theme: string; meta?: { url?: string; description?: string }; nodes: TreeNode[] };
    }
  | {
      type: "matrix";
      data: { theme: string; patterns: MatrixPattern[]; items: MatrixRow[] };
    }
  | {
      type: "swot";
      data: {
        framework: "SWOT" | "PEST";
        theme: string;
        box1: string[];
        box2: string[];
        box3: string[];
        box4: string[];
      };
    }
  | {
      type: "image";
      data: { image_path: string };
    };

export type TopicAnalysis = {
  id: number;
  title: string;
  is_published: boolean;
  topic_id: number | null;
  likes_count: number;
  is_liked_by_me?: boolean;
  supplement?: string | null;
  created_at: string;
  user: { id: number; name: string; avatar?: string | null };
} & AnalysisData;

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
