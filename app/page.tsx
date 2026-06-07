import { GalleryHome } from "@/components/gallery/GalleryHome";
import { BrandMateProviders } from "@/components/providers/BrandMateProviders";

export default function HomePage() {
  return (
    <BrandMateProviders>
      <GalleryHome />
    </BrandMateProviders>
  );
}
