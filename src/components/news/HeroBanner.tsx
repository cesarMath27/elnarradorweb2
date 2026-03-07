import Image from "next/image";

export default function HeroBanner() {
  return (
    <section className="relative w-full h-[200px] md:h-[300px] lg:h-[380px] overflow-hidden">
      {/* Background - Mexican landscapes (mountains, cenotes, pyramids) */}
      <Image
        src="/images/banner-narrador.jpg"
        alt="El Narrador de México - Paisajes de México"
        fill
        className="object-cover object-center"
        sizes="100vw"
        priority
      />

      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Logo centered */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Image
          src="/images/logo-horizontal-blanco.png"
          alt="El Narrador de México"
          width={400}
          height={192}
          className="w-[180px] md:w-[280px] lg:w-[360px] h-auto drop-shadow-2xl"
          priority
        />
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
