import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description:
    "Términos y Condiciones de uso del sitio de El Narrador de México: acceso, propiedad intelectual, responsabilidades y más.",
  alternates: { canonical: "/terminos" },
};

const LAST_UPDATED = "5 de junio de 2026";

export default function TerminosPage() {
  return (
    <LegalPage title="Términos y Condiciones" updatedAt={LAST_UPDATED}>
      <p>
        Bienvenido a <strong>El Narrador de México</strong>. Estos Términos y
        Condiciones regulan el acceso y uso de este sitio. Al navegar o utilizar
        el sitio aceptas estos términos en su totalidad; si no estás de acuerdo,
        te pedimos no utilizarlo.
      </p>

      <h2>1. Aceptación de los términos</h2>
      <p>
        El uso del sitio implica la aceptación plena de estos Términos y
        Condiciones, así como de nuestra Política de Privacidad. Nos reservamos el
        derecho de actualizarlos en cualquier momento.
      </p>

      <h2>2. Uso del sitio</h2>
      <p>
        Te comprometes a utilizar el sitio de forma lícita y a no realizar
        actividades que puedan dañarlo, sobrecargarlo o interferir con su normal
        funcionamiento, ni a intentar acceder sin autorización a sus sistemas o a
        las cuentas de otros usuarios.
      </p>

      <h2>3. Propiedad intelectual</h2>
      <p>
        Los contenidos del sitio (textos, fotografías, ilustraciones, logotipos,
        revistas y demás materiales) son propiedad de El Narrador de México o de
        sus respectivos titulares y están protegidos por la legislación aplicable.
        Se permite compartir enlaces y citas razonables con la debida atribución,
        pero queda prohibida su reproducción total o parcial con fines comerciales
        sin autorización previa por escrito.
      </p>

      <h2>4. Contenido informativo</h2>
      <p>
        El contenido del sitio tiene fines informativos. Procuramos que sea exacto
        y esté actualizado, pero no garantizamos que se encuentre libre de errores
        ni que esté disponible de forma ininterrumpida.
      </p>

      <h2>5. Enlaces y contenido de terceros</h2>
      <p>
        El sitio puede contener enlaces a páginas de terceros. No somos
        responsables del contenido, las políticas ni las prácticas de dichos
        sitios externos, cuyo acceso es bajo tu propia responsabilidad.
      </p>

      <h2>6. Publicidad y suscripciones</h2>
      <p>
        El sitio puede mostrar publicidad (por ejemplo, mediante Google AdSense) y
        ofrecer opciones de suscripción o acceso a través de servicios de Google
        como &laquo;Subscribe with Google&raquo;. El uso de estos servicios está
        sujeto a los términos y políticas de sus respectivos proveedores.
      </p>

      <h2>7. Conducta del usuario</h2>
      <p>
        En caso de que el sitio habilite comentarios u otras formas de
        participación, te comprometes a no publicar contenido ilícito,
        difamatorio, ofensivo o que infrinja derechos de terceros. Nos reservamos
        el derecho de moderar o eliminar dicho contenido.
      </p>

      <h2>8. Exención de garantías</h2>
      <p>
        El sitio se ofrece &laquo;tal cual&raquo; y &laquo;según
        disponibilidad&raquo;, sin garantías de ningún tipo, ya sean expresas o
        implícitas, respecto de su funcionamiento, disponibilidad o resultados.
      </p>

      <h2>9. Limitación de responsabilidad</h2>
      <p>
        En la medida permitida por la ley, El Narrador de México no será
        responsable de daños directos o indirectos derivados del uso o la
        imposibilidad de uso del sitio o de su contenido.
      </p>

      <h2>10. Modificaciones</h2>
      <p>
        Podemos modificar estos Términos y Condiciones en cualquier momento. La
        versión vigente se publicará en esta página con su fecha de actualización,
        y el uso continuado del sitio implica la aceptación de los cambios.
      </p>

      <h2>11. Legislación aplicable y jurisdicción</h2>
      <p>
        Estos Términos se rigen por las leyes de los Estados Unidos Mexicanos.
        Para cualquier controversia, las partes se someten a la jurisdicción de
        los tribunales competentes de Aguascalientes, México.
      </p>

      <h2>12. Contacto</h2>
      <p>
        Si tienes dudas sobre estos Términos y Condiciones, escríbenos a Álvaro
        Obregón 452, Zona Centro, Aguascalientes, o llámanos al 5610973271.
      </p>
    </LegalPage>
  );
}
