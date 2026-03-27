import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import usePageMeta from "@/hooks/usePageMeta";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";

const PoliticaPrivacidad = () => {
  usePageMeta({
    title: "Política de Privacidad",
    description: "Política de privacidad y protección de datos de Isla Cloud Solutions. Conoce cómo tratamos tu información personal.",
    canonical: "/privacidad",
  });

  return (
    <Layout>
      <BreadcrumbJsonLd items={[{ name: 'Inicio', path: '/' }, { name: 'Política de Privacidad', path: '/privacidad' }]} />
      <section className="bg-hero grid-pattern py-24">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-hero-foreground">
              Política de Privacidad
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto prose prose-sm text-foreground">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>

              <h2 className="text-2xl font-heading font-bold text-foreground mt-8 mb-4">Política de Privacidad</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                En virtud de lo dispuesto en la Ley 15/1999, de 13 de diciembre, de Protección de Datos de Carácter Personal, le informamos que mediante la cumplimentación del presente formulario sus datos personales quedarán incorporados y serán tratados en los ficheros titularidad de Isla Cloud Solutions, S.L., con el fin de gestionar, administrar y mantener los Servicios prestados y/o contratados, así como para mantenerle informado, incluso por medios electrónicos, sobre cuestiones relativas a la actividad de la Compañía y sus servicios.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Usted puede ejercer, en cualquier momento, los derechos de acceso, rectificación, cancelación y oposición de sus datos de carácter personal mediante correo electrónico dirigido a{" "}
                <a href="mailto:info@islacloudsolutions.com" className="text-primary hover:underline">info@islacloudsolutions.com</a>{" "}
                o bien mediante un escrito dirigido a Isla Cloud Solutions, S.L. - Avda. de las Lagunas, 31 – 28981 Parla - Madrid (ESPAÑA), acompañando siempre una fotocopia de su D.N.I.
              </p>

              <h2 className="text-2xl font-heading font-bold text-foreground mt-12 mb-4">Cookies</h2>
              <ol className="list-decimal pl-6 space-y-4 text-muted-foreground leading-relaxed mb-6">
                <li>Podemos recabar información sobre tu ordenador, incluido, en su caso, su dirección de IP, sistema operativo y tipo de navegador, para la administración del sistema. Se trata de datos estadísticos sobre cómo navegas por nuestro sitio Web.</li>
                <li>Por la misma razón, podemos obtener información sobre tu uso general de Internet mediante un archivo de cookies que se almacena en el disco duro de tu ordenador. Las cookies contienen información que se transfiere al disco duro de tu ordenador.</li>
                <li>
                  Las cookies nos ayudan a mejorar nuestro sitio Web y a prestar un servicio mejor y más personalizado. En concreto, nos permiten:
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Hacer una estimación sobre números y patrones de uso.</li>
                    <li>Almacenar información acerca de tus preferencias y personalizar nuestro sitio web de conformidad con tus intereses individuales.</li>
                    <li>Acelerar tus búsquedas.</li>
                    <li>Reconocerte cuando regreses de nuevo a nuestro sitio.</li>
                  </ul>
                </li>
                <li>Puedes negarte a aceptar cookies activando la configuración en tu navegador que permite rechazar las cookies. No obstante, si seleccionas esta configuración, quizás no puedas acceder a determinadas partes del Sitio Web o no puedas aprovecharte de alguno de nuestros servicios.</li>
              </ol>

              <h2 className="text-2xl font-heading font-bold text-foreground mt-12 mb-4">Cookies utilizadas en este sitio web</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Siguiendo las directrices de la Agencia Española de Protección de Datos procedemos a detallar el uso de cookies que hace esta web con el fin de informarle con la máxima exactitud posible.
              </p>

              <p className="text-muted-foreground leading-relaxed mb-2">Este sitio web utiliza las siguientes <strong className="text-foreground">cookies propias</strong>:</p>
              <ul className="list-disc pl-6 text-muted-foreground leading-relaxed mb-6">
                <li>Cookies de sesión, para garantizar que los usuarios que escriban comentarios en el blog sean humanos y no aplicaciones automatizadas. De esta forma se combate el spam.</li>
              </ul>

              <p className="text-muted-foreground leading-relaxed mb-2">Este sitio web utiliza las siguientes <strong className="text-foreground">cookies de terceros</strong>:</p>
              <ul className="list-disc pl-6 text-muted-foreground leading-relaxed mb-6">
                <li><strong className="text-foreground">Google Analytics:</strong> Almacena cookies para poder elaborar estadísticas sobre el tráfico y volumen de visitas de esta web. Al utilizar este sitio web está consintiendo el tratamiento de información acerca de usted por Google.</li>
                <li><strong className="text-foreground">Redes sociales:</strong> Cada red social utiliza sus propias cookies para que usted pueda pinchar en botones del tipo Me gusta o Compartir.</li>
              </ul>

              <h2 className="text-2xl font-heading font-bold text-foreground mt-12 mb-4">Notas adicionales</h2>
              <ul className="list-disc pl-6 space-y-3 text-muted-foreground leading-relaxed mb-6">
                <li>Ni esta web ni sus representantes legales se hacen responsables ni del contenido ni de la veracidad de las políticas de privacidad que puedan tener los terceros mencionados en esta política de cookies.</li>
                <li>Los navegadores web son las herramientas encargadas de almacenar las cookies y desde este lugar debe efectuar su derecho a eliminación o desactivación de las mismas.</li>
                <li>En algunos casos es necesario instalar cookies para que el navegador no olvide su decisión de no aceptación de las mismas.</li>
                <li>En el caso de las cookies de Google Analytics, esta empresa almacena las cookies en servidores ubicados en Estados Unidos y se compromete a no compartirla con terceros, excepto en los casos en los que sea necesario para el funcionamiento del sistema o cuando la ley obligue a tal efecto.</li>
              </ul>

              <h3 className="text-xl font-heading font-bold text-foreground mt-12 mb-4">Tabla de Cookies Esenciales</h3>
              <div className="overflow-x-auto mb-8">
                <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="p-3 text-left text-foreground font-medium">Nombre</th>
                      <th className="p-3 text-left text-foreground font-medium">Proveedor</th>
                      <th className="p-3 text-left text-foreground font-medium">Propósito</th>
                      <th className="p-3 text-left text-foreground font-medium">Caducidad</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-t border-border"><td className="p-3">PHPSESSID</td><td className="p-3">Este sitio web</td><td className="p-3">Identificador de sesión de usuario</td><td className="p-3">Sesión</td></tr>
                    <tr className="border-t border-border"><td className="p-3">Idioma</td><td className="p-3">Este sitio web</td><td className="p-3">Idioma de la web</td><td className="p-3">4 meses</td></tr>
                    <tr className="border-t border-border"><td className="p-3">consentcookies_*</td><td className="p-3">Este sitio web</td><td className="p-3">Preferencia de consentimiento</td><td className="p-3">1 año</td></tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-heading font-bold text-foreground mt-8 mb-4">Cookies de Preferencias</h3>
              <div className="overflow-x-auto mb-8">
                <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="p-3 text-left text-foreground font-medium">Nombre</th>
                      <th className="p-3 text-left text-foreground font-medium">Proveedor</th>
                      <th className="p-3 text-left text-foreground font-medium">Propósito</th>
                      <th className="p-3 text-left text-foreground font-medium">Caducidad</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-t border-border"><td className="p-3">CONSENT</td><td className="p-3">Google</td><td className="p-3">Rastreador de consentimiento de cookies</td><td className="p-3">17 años</td></tr>
                    <tr className="border-t border-border"><td className="p-3">PREF</td><td className="p-3">Google Maps</td><td className="p-3">Visualización de mapas</td><td className="p-3">2 años</td></tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-heading font-bold text-foreground mt-8 mb-4">Cookies Estadísticas</h3>
              <div className="overflow-x-auto mb-8">
                <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="p-3 text-left text-foreground font-medium">Nombre</th>
                      <th className="p-3 text-left text-foreground font-medium">Proveedor</th>
                      <th className="p-3 text-left text-foreground font-medium">Propósito</th>
                      <th className="p-3 text-left text-foreground font-medium">Caducidad</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-t border-border"><td className="p-3">YSC</td><td className="p-3">Youtube</td><td className="p-3">Estadísticas de vídeos vistos</td><td className="p-3">Sesión</td></tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-heading font-bold text-foreground mt-8 mb-4">Cookies de Marketing</h3>
              <div className="overflow-x-auto mb-8">
                <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="p-3 text-left text-foreground font-medium">Nombre</th>
                      <th className="p-3 text-left text-foreground font-medium">Proveedor</th>
                      <th className="p-3 text-left text-foreground font-medium">Propósito</th>
                      <th className="p-3 text-left text-foreground font-medium">Caducidad</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-t border-border"><td className="p-3">VISITOR_INFO1_LIVE</td><td className="p-3">YouTube</td><td className="p-3">Calcula ancho de banda para vídeos</td><td className="p-3">4 meses</td></tr>
                  </tbody>
                </table>
              </div>

              <p className="text-muted-foreground leading-relaxed text-sm mt-8">
                Las cookies son pequeños archivos de texto que las páginas web pueden utilizar para hacer más eficiente la experiencia del usuario. La ley afirma que podemos almacenar cookies en su dispositivo si son estrictamente necesarias para el funcionamiento de esta página. Para todos los demás tipos de cookies necesitamos su permiso. En cualquier momento puede cambiar o retirar su consentimiento.
              </p>

            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PoliticaPrivacidad;
