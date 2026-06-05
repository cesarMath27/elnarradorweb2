import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    "Conoce cómo El Narrador de México recopila, utiliza y protege tus datos personales cuando navegas por nuestro sitio.",
  alternates: { canonical: "/privacidad" },
};

const LAST_UPDATED = "5 de junio de 2026";

export default function PrivacidadPage() {
  return (
    <LegalPage title="Política de Privacidad" updatedAt={LAST_UPDATED}>
      <p>
        En <strong>El Narrador de México</strong> (&laquo;el sitio&raquo;,
        &laquo;nosotros&raquo;) valoramos tu privacidad. Esta Política de
        Privacidad explica qué información recopilamos, cómo la utilizamos y qué
        opciones tienes a tu disposición. Al utilizar este sitio aceptas las
        prácticas descritas en este documento.
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <p>
        El Narrador de México, con domicilio en Álvaro Obregón 452, Zona Centro,
        Aguascalientes, México, es responsable del tratamiento de tus datos
        personales conforme a la Ley Federal de Protección de Datos Personales en
        Posesión de los Particulares (LFPDPPP) y su reglamento.
      </p>

      <h2>2. Información que recopilamos</h2>
      <ul>
        <li>
          <strong>Información que nos proporcionas:</strong> datos que envías
          voluntariamente, por ejemplo al suscribirte, contactarnos o comentar
          (como nombre y correo electrónico).
        </li>
        <li>
          <strong>Información recopilada automáticamente:</strong> dirección IP,
          tipo de navegador y dispositivo, páginas visitadas, fecha y hora de
          acceso y datos de navegación obtenidos mediante cookies y
          herramientas de análisis.
        </li>
      </ul>

      <h2>3. Uso de la información</h2>
      <ul>
        <li>Operar, mantener y mejorar el sitio y su contenido.</li>
        <li>Personalizar tu experiencia y mostrarte contenido relevante.</li>
        <li>Medir la audiencia y analizar el uso del sitio.</li>
        <li>Mostrar publicidad y gestionar las opciones de suscripción.</li>
        <li>Cumplir con obligaciones legales aplicables.</li>
      </ul>

      <h2>4. Cookies y tecnologías similares</h2>
      <p>
        Utilizamos cookies propias y de terceros para recordar tus preferencias,
        analizar el tráfico y mostrar anuncios. Puedes configurar tu navegador
        para rechazar o eliminar cookies; ten en cuenta que algunas funciones del
        sitio podrían dejar de operar correctamente.
      </p>

      <h2>5. Publicidad de terceros (Google AdSense)</h2>
      <p>
        Este sitio utiliza Google AdSense. Google y sus socios pueden emplear
        cookies para mostrar anuncios basados en tus visitas a este y a otros
        sitios web. Puedes inhabilitar la publicidad personalizada desde la{" "}
        <a
          href="https://www.google.com/settings/ads"
          target="_blank"
          rel="noopener noreferrer"
        >
          Configuración de anuncios de Google
        </a>{" "}
        o desde{" "}
        <a
          href="https://www.aboutads.info"
          target="_blank"
          rel="noopener noreferrer"
        >
          www.aboutads.info
        </a>
        .
      </p>

      <h2>6. Suscripciones y acceso de Google (Subscribe with Google)</h2>
      <p>
        Integramos &laquo;Subscribe with Google&raquo; / Reader Revenue Manager
        para ofrecer opciones de registro, suscripción o acceso a lectores. Si
        interactúas con estas funciones, Google podrá tratar tus datos conforme a
        su propia{" "}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
        >
          Política de Privacidad
        </a>
        .
      </p>

      <h2>7. Con quién compartimos tu información</h2>
      <p>
        No vendemos tus datos personales. Podemos compartir información con
        proveedores de servicios (analítica, publicidad y alojamiento) que actúan
        por cuenta nuestra, así como cuando lo exija una autoridad competente o la
        ley aplicable.
      </p>

      <h2>8. Tus derechos (ARCO)</h2>
      <p>
        Tienes derecho a Acceder, Rectificar, Cancelar u Oponerte al tratamiento
        de tus datos personales, así como a revocar el consentimiento que nos
        hayas otorgado. Para ejercer estos derechos, contáctanos por los medios
        indicados al final de esta página.
      </p>

      <h2>9. Seguridad</h2>
      <p>
        Implementamos medidas técnicas y organizativas razonables para proteger
        tu información. Sin embargo, ningún método de transmisión por Internet o
        de almacenamiento electrónico es completamente seguro.
      </p>

      <h2>10. Privacidad de menores</h2>
      <p>
        El sitio no está dirigido a menores de edad y no recopilamos de forma
        consciente datos personales de personas menores de edad.
      </p>

      <h2>11. Cambios a esta política</h2>
      <p>
        Podemos actualizar esta Política periódicamente. Publicaremos la versión
        vigente en esta misma página junto con su fecha de actualización.
      </p>

      <h2>12. Contacto</h2>
      <p>
        Si tienes dudas sobre esta Política o deseas ejercer tus derechos,
        escríbenos a Álvaro Obregón 452, Zona Centro, Aguascalientes, o llámanos
        al 5610973271.
      </p>
    </LegalPage>
  );
}
