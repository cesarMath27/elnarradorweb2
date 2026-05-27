import Image from "next/image";

export default function StickyPromoLeft() {
  return (
    <div className="hidden 2xl:block fixed left-2 top-1/2 -translate-y-1/2 z-20 w-[140px]">
      <div className="relative w-full aspect-[640/1632]">
        <Image
          src="/images/promo-lateral.jpeg"
          alt="Promoción"
          fill
          sizes="140px"
          className="object-contain rounded-md shadow-lg"
        />
      </div>
    </div>
  );
}
