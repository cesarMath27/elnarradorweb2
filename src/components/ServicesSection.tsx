import Image from "next/image";

const packages = [
  { src: "/images/paquete_GO.jpeg", alt: "Paquete Impulsa Go - $18,900" },
  { src: "/images/paquete_MAX.jpeg", alt: "Paquete Crece Max - $29,600" },
  { src: "/images/paquete_posiciona_360.jpeg", alt: "Paquete Posiciona 360 - $39,000" },
  { src: "/images/paquete_PRO.jpeg", alt: "Paquete Lidera Pro - $50,000" },
];

export default function ServicesSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Servicios
        </h2>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.src}
            className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-md"
          >
            <Image
              src={pkg.src}
              alt={pkg.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
