import type { PostBrandingOptions, PostFormat, PostType } from "@/lib/types";

export interface GeneratePostParams {
  topic: string;
  format?: PostFormat;
  includeImage?: boolean;
  imageStyle?: string;
  slideCount?: number;
  postType?: PostType;
  imageUrl?: string;
  portraitImageUrl?: string;
  includeHandle?: boolean;
  includeProfileImage?: boolean;
  branding?: PostBrandingOptions;
  userFeedback?: string;
  judgeRevisionContext?: string;
  scoreBefore?: number;
}
