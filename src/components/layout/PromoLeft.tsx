import Image from "next/image";

export default function PromoLeft() {
  return (
    <div className="relative w-full max-w-[320px] lg:max-w-none mx-auto aspect-[640/1632]">
      <Image
        src="/images/promo-lateral.jpeg"
        alt="Promoción"
        fill
        sizes="(max-width: 1024px) 320px, 256px"
        className="object-contain rounded-md shadow-lg"
      />
    </div>
  );
}
