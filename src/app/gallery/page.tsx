import { getGalleryImages } from "@/app/actions";
import GalleryClient from "@/components/GalleryClient";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
    const images = await getGalleryImages();

    return <GalleryClient initialImages={images} />;
}
