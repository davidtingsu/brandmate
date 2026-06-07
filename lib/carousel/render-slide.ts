import { generateCarouselSlideImage } from "@/lib/pipeline/carousel-slide-image-gen";
import type {
  BrandProfile,
  CarouselSlide,
  PostBrandingOptions,
} from "@/lib/types";

export async function renderSlidePng(input: {
  slide: CarouselSlide;
  portraitImageUrl?: string;
  topic?: string;
  brandProfile?: BrandProfile;
  branding?: PostBrandingOptions;
  totalSlides: number;
}): Promise<string> {
  return generateCarouselSlideImage(input);
}
