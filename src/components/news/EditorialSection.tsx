import Image from "next/image";

export default function EditorialSection() {
  return (
    <section className="relative w-full h-[250px] md:h-[350px] overflow-hidden my-10 rounded-lg">
      {/* Full background image - B&W editorial with Meloni & Barbacid */}
      <Image
        src="/images/editorial-section.jpg"
        alt="Voces del Mundo - Sección Editorial"
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 66vw"
        loading="lazy"
      />

      {/* Center overlay with title */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-gold text-xs md:text-sm tracking-[0.3em] uppercase mb-2 drop-shadow-lg">
            Personajes
          </p>
          <h2 className="font-heading text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-lg">
            Voces del Mundo
          </h2>
          <div className="w-16 h-0.5 bg-gold mx-auto mt-4" />
        </div>
      </div>
    </section>
  );
}
