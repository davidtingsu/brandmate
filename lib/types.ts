export type PostType = "story" | "insight" | "lesson" | "milestone" | "hot_take";

export type PostFormat = "text" | "carousel";

export type HumanFeedbackType =
  | "too_generic"
  | "too_long"
  | "on_brand"
  | "good";

export interface BrandProfile {
  name: string;
  niche: string;
  audience: string;
  voice: string;
  goals?: string;
}

export interface PostImage {
  url: string;
  alt?: string;
  aspectRatio?: "1.91:1" | "1:1";
  source?: "generated" | "uploaded";
}

export interface CarouselSlide {
  index: number;
  title: string;
  body: string;
  imageUrl?: string;
}

export interface LinkedInPost {
  format: PostFormat;
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  postType: PostType;
  characterCount: number;
  image?: PostImage;
  slides?: CarouselSlide[];
}

export interface Lesson {
  id: string;
  task: string;
  task_type: "linkedin_post";
  niche: string;
  post_type?: PostType;
  lesson: string;
  score_before: number;
  score_after?: number;
  human_feedback?: HumanFeedbackType;
  created_at?: string;
}

export interface JudgeBreakdown {
  hook_strength: number;
  voice_authenticity: number;
  audience_fit: number;
  engagement_potential: number;
  brand_alignment: number;
}

export interface PostAttempt {
  attemptNumber: number;
  topic: string;
  variants: LinkedInPost[];
  judgeScore: number;
  problems: string[];
  breakdown: JudgeBreakdown;
  learnedLesson?: string;
  retrievedMemories: Lesson[];
  weaveTraceId?: string;
  scoreBefore?: number;
  scoreAfter?: number;
  humanFeedback?: HumanFeedbackType;
}

export interface GenerateInput {
  topic: string;
  brandProfile: BrandProfile;
  lessons: Lesson[];
  attemptNumber: number;
  postType?: PostType;
  format?: PostFormat;
  scoreBefore?: number;
}

export interface GenerateOutput {
  variants: LinkedInPost[];
  attemptNumber: number;
  postType: PostType;
  format: PostFormat;
}

export interface CarouselGenerateInput {
  topic: string;
  brandProfile: BrandProfile;
  lessons: Lesson[];
  attemptNumber: number;
  postType?: PostType;
  slideCount?: number;
  scoreBefore?: number;
}

export interface CarouselGenerateOutput {
  variants: LinkedInPost[];
  attemptNumber: number;
  postType: PostType;
}

export interface JudgeInput {
  post: LinkedInPost;
  brandProfile: BrandProfile;
  topic: string;
}

export interface JudgeOutput {
  score: number;
  breakdown: JudgeBreakdown;
  problems: string[];
  feedback: string;
}

export interface SummarizeLessonInput {
  topic: string;
  judgeFeedback: string;
  humanFeedback: HumanFeedbackType;
  problems: string[];
  scoreBefore: number;
}

export interface SummarizeLessonOutput {
  lesson: string;
  scoreBefore: number;
}

export interface OrchestrateInput {
  topic: string;
  brandProfile: BrandProfile;
  attemptNumber?: number;
  postType?: PostType;
  format?: PostFormat;
  includeImage?: boolean;
  imageStyle?: string;
  imageUrl?: string;
  slideCount?: number;
  scoreBefore?: number;
  niche?: string;
}

export interface OrchestrateOutput {
  attempt: PostAttempt;
  weaveTraceId?: string;
}

export interface ChatThread {
  id: string;
  user_id: string;
  title: string | null;
  copilot_thread_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  thread_id: string;
  role: string;
  content: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}
