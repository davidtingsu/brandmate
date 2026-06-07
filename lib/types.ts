export type PostType = "story" | "insight" | "lesson" | "milestone" | "hot_take";

export type PostFormat = "text" | "carousel" | "diagram";

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
  /** LinkedIn handle, with or without leading @ */
  handle?: string;
  /** Public URL or data URL for profile photo */
  profileImageUrl?: string;
}

export interface PostBrandingOptions {
  includeHandle: boolean;
  includeProfileImage: boolean;
}

export interface PostImage {
  url: string;
  alt?: string;
  aspectRatio?: "1.91:1" | "1:1";
  source?: "generated" | "uploaded";
}

export type CarouselSlideLayout =
  | "portrait_cover"
  | "portrait_cta"
  | "portrait_all"
  | "template_content"
  | "split_before_after";

export type CarouselSlidePngStatus =
  | "pending"
  | "rendering"
  | "done"
  | "error";

export interface CarouselSlide {
  index: number;
  title: string;
  body: string;
  layout?: CarouselSlideLayout;
  imageUrl?: string;
  pngStatus?: CarouselSlidePngStatus;
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
  /** Free-text chat revision from the user */
  human_feedback?: string;
  /** Judge revision context or feedback copied at store time */
  judge_feedback?: string;
  created_at?: string;
}

export interface SimilarPost {
  id: string;
  sessionId: string;
  topic: string;
  hook: string;
  body?: string;
  previewImageUrl?: string;
  previewText?: string;
  niche: string;
  postType?: PostType;
  format?: PostFormat;
  judgeScore?: number;
  createdAt?: string;
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
  judgeFeedback?: string;
  learnedLesson?: string;
  retrievedMemories: Lesson[];
  weaveTraceId?: string;
  scoreBefore?: number;
  scoreAfter?: number;
  humanFeedback?: HumanFeedbackType;
  branding?: PostBrandingOptions;
  systemDiagram?: SystemDiagram;
}

export interface GenerateInput {
  topic: string;
  brandProfile: BrandProfile;
  lessons: Lesson[];
  attemptNumber: number;
  postType?: PostType;
  format?: PostFormat;
  scoreBefore?: number;
  userFeedback?: string;
  judgeRevisionContext?: string;
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
  portraitImageUrl?: string;
  userFeedback?: string;
  judgeRevisionContext?: string;
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
  humanFeedback: string;
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
  portraitImageUrl?: string;
  carouselAspect?: "4:5";
  slideCount?: number;
  scoreBefore?: number;
  niche?: string;
  branding?: PostBrandingOptions;
  userFeedback?: string;
  judgeRevisionContext?: string;
  sessionId?: string;
}

export interface CarouselRenderInput {
  slides: CarouselSlide[];
  portraitImageUrl?: string;
  topic?: string;
  brandProfile?: BrandProfile;
  branding?: PostBrandingOptions;
  userFeedback?: string;
}

export interface CarouselRenderProgressEvent {
  type: "progress" | "slide_done" | "complete" | "error";
  slideIndex?: number;
  total?: number;
  imageUrl?: string;
  slides?: CarouselSlide[];
  error?: string;
}

export interface OrchestrateOutput {
  attempt: PostAttempt;
  weaveTraceId?: string;
  storedLesson?: Lesson;
  postIndexId?: string;
}

export interface ChatThread {
  id: string;
  user_id: string;
  title: string | null;
  copilot_thread_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface GalleryThreadPreview {
  previewImageUrl?: string;
  displayTitle?: string;
  previewText?: string;
}

export type GalleryThread = ChatThread & GalleryThreadPreview;

export interface ChatMessage {
  id: string;
  thread_id: string;
  role: string;
  content: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface SystemDiagram {
  title: string;
  description: string;
}

export interface DiagramAgentInput {
  concept: string;
  context?: string;
}

export interface DiagramAgentResult {
  diagram: SystemDiagram;
  agentId: "diagram_explainer";
}

export interface DiagramAgentOutput extends DiagramAgentResult {
  imageUrl: string;
}
