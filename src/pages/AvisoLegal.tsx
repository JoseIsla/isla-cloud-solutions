import { motion } from "framer-motion";
import Layout from "@/components/Layout";

const AvisoLegal = () => {
  return (
    <Layout>
      <section className="bg-hero grid-pattern py-24">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-hero-foreground">
              Aviso Legal
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>

              {/* Info general */}
              <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Información General</h2>
              <div className="p-6 rounded-2xl bg-card border border-border mb-8">
                <dl className="space-y-3 text-sm">
                  <div className="flex flex-col sm:flex-row sm:gap-4">
                    <dt className="font-medium text-foreground min-w-[140px]">Titular:</dt>
                    <dd className="text-muted-foreground">Isla Cloud Solutions, S.L. (en adelante ISLACLOUD)</dd>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:gap-4">
                    <dt className="font-medium text-foreground min-w-[140px]">Dirección:</dt>
                    <dd className="text-muted-foreground">Avda. de las Lagunas, 31 – 28981 Parla (Madrid)</dd>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:gap-4">
                    <dt className="font-medium text-foreground min-w-[140px]">Contacto:</dt>
                    <dd className="text-muted-foreground">
                      <a href="mailto:info@islacloudsolutions.com" className="text-primary hover:underline">info@islacloudsolutions.com</a> · +34 91 088 96 13
                    </dd>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:gap-4">
                    <dt className="font-medium text-foreground min-w-[140px]">Datos registrales:</dt>
                    <dd className="text-muted-foreground">Registro Mercantil de Madrid – Tomo 37662, Folio 130, Inscripción 1, Hoja M-671063</dd>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:gap-4">
                    <dt className="font-medium text-foreground min-w-[140px]">CIF/NIF:</dt>
                    <dd className="text-muted-foreground">B88102519</dd>
                  </div>
                </dl>
              </div>

              <p className="text-muted-foreground leading-relaxed mb-4">
                ISLACLOUD no puede asumir ninguna responsabilidad derivada del uso incorrecto, inapropiado o ilícito de la información aparecida en las páginas de Internet de ISLACLOUD. Con los límites establecidos en la ley, ISLACLOUD no asume ninguna responsabilidad derivada de la falta de veracidad, integridad, actualización y precisión de los datos o informaciones que se contienen en sus páginas de Internet.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Las páginas de Internet de ISLACLOUD pueden contener enlaces (links) a otras páginas de terceras partes que ISLACLOUD no puede controlar. Por lo tanto, ISLACLOUD no puede asumir responsabilidades por el contenido que pueda aparecer en páginas de terceros.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Los textos, imágenes, sonidos, animaciones, software y el resto de los contenidos incluidos en este website son propiedad exclusiva de ISLACLOUD o sus licenciantes. Cualquier acto de transmisión, distribución, cesión, reproducción, almacenamiento o comunicación pública total o parcial, debe contar con el consentimiento expreso de ISLACLOUD.
              </p>

              {/* Protección de datos */}
              <h2 className="text-2xl font-heading font-bold text-foreground mt-12 mb-6">Protección de Datos de Carácter Personal</h2>

              <h3 className="text-lg font-heading font-semibold text-foreground mt-8 mb-3">Responsable</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                En cumplimiento de lo que se dispone el Reglamento Europeo de Protección de Datos (RGPD UE 2016/679), de la Ley Orgánica 15/1999 (LOPD) y de la Ley Orgánica 3/2018 de Protección de Datos Personales y Garantía de los Derechos Digitales, Isla Cloud Solutions, S.L., con NIF B88102759, con domicilio fiscal en la Avda. de las Lagunas, 31 – 28981 Parla - Madrid (ESPAÑA), teléfono +34 91 088 96 13 y correo electrónico{" "}
                <a href="mailto:info@islacloudsolutions.com" className="text-primary hover:underline">info@islacloudsolutions.com</a>{" "}
                informa al usuario que todos los datos de carácter personal que nos proporcione a través de la web serán incorporados a ficheros, creados y mantenidos bajo la responsabilidad de Isla Cloud Solutions, S.L. denominados "Fichero de Clientes y Fichero de Proveedores".
              </p>

              <h3 className="text-lg font-heading font-semibold text-foreground mt-8 mb-3">Finalidad</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Los datos de carácter personal proporcionados serán utilizados para gestionar los pedidos realizados por usted, las correspondientes tareas administrativas y legales que así se deriven para remitirle información sobre novedades, promociones exclusivamente de productos y servicios que puedan ser de su interés.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                La respuesta a los formularios para recibir información de los productos o bienes de ISLACLOUD, así como de cualquier otro cuestionario que pueda facilitarse en un futuro, es totalmente potestativa. Sin embargo, la negativa del usuario a facilitar determinados datos, podrá suponer la imposibilidad de llevar a cabo el servicio ofrecido o cuestión solicitada.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                ISLACLOUD conservará los datos proporcionados durante el plazo legal que las obligaciones fiscales determinan para ambas partes una vez concluida la acción comercial o de prestación de servicios, hasta el final del periodo de garantía del producto suministrado y, en general, mientras la función comercial de ISLACLOUD siga siendo del interés de quien nos ha proporcionado los datos.
              </p>

              <h3 className="text-lg font-heading font-semibold text-foreground mt-8 mb-3">Legitimidad</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                La base legal para el tratamiento de los datos proporcionados es la gestión de los pedidos realizados a ISLACLOUD a través de la web o por cualquiera otro medio, para corresponder la solicitud de información puntual o periódica; y para el cumplimiento con las obligaciones legales en vigor.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                El uso de los formularios y la solicitud de los productos del sitio web está limitado a usuarios mayores de edad o que cuenten con autorización o capacidad legal. Al utilizar cualquiera de ellos, usted garantiza que cumple con este requisito y acepta las consecuencias que se deriven en caso de no ser así.
              </p>

              <h3 className="text-lg font-heading font-semibold text-foreground mt-8 mb-3">Destinatarios</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                ISLACLOUD garantiza la confidencialidad y seguridad de sus datos de carácter personal cuando estas son objeto de tratamiento, teniendo implantadas las políticas de tratamiento y medidas de seguridad (técnicas y organizativas) a las cuales se refiere el artículo 9 de la LOPD. ISLACLOUD no prevé ceder los datos proporcionados a terceros, salvo que estemos obligados por ley o que la cesión sea necesaria para gestionar los pedidos realizados.
              </p>

              <h3 className="text-lg font-heading font-semibold text-foreground mt-8 mb-3">Derechos</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">Le informamos que puede ejercitar sus derechos:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed mb-6">
                <li><strong className="text-foreground">De acceso o rectificación:</strong> para consultar y/o solicitar la modificación de sus datos personales.</li>
                <li><strong className="text-foreground">Supresión:</strong> para solicitar la eliminación de sus datos personales.</li>
                <li><strong className="text-foreground">Oposición / Limitación:</strong> para solicitar que no se traten o que se establezca una limitación en el tratamiento.</li>
                <li><strong className="text-foreground">Portabilidad:</strong> para solicitar la transmisión de sus datos personales a un tercero autorizado.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Envíe una carta o un correo electrónico, adjuntando fotocopia de su DNI, a: Avda. de las Lagunas, 31 – 28981 Parla - Madrid (ESPAÑA) o a{" "}
                <a href="mailto:info@islacloudsolutions.com" className="text-primary hover:underline">info@islacloudsolutions.com</a>.
              </p>

              <h3 className="text-lg font-heading font-semibold text-foreground mt-8 mb-3">Procedencia</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Los datos personales tratados por ISLACLOUD proceden de la cesión directa de los interesados. Las categorías de datos que se tratan son:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground leading-relaxed mb-6">
                <li>Datos identificativos de navegación</li>
                <li>Códigos de cliente</li>
                <li>Direcciones postal y/o electrónicas</li>
                <li>Información comercial</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mb-8">
                No se incluyen al fichero datos bancarios ni relativos a medios de pago.
              </p>

              {/* LSSICE */}
              <h2 className="text-2xl font-heading font-bold text-foreground mt-12 mb-6">Ley de Servicios de la Sociedad de la Información (LSSICE)</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                ISLACLOUD, con el objeto de garantizar el cumplimiento de la LSSICE, habilitará en todas las comunicaciones por e-mail un clausurado legal a nivel informativo donde habilitará herramientas para garantizar el ejercicio de oposición a la recepción de comunicaciones electrónicas. El usuario podrá ejercitar la oposición a través del correo{" "}
                <a href="mailto:info@islacloudsolutions.com" className="text-primary hover:underline">info@islacloudsolutions.com</a>{" "}
                indicando en el asunto: <strong className="text-foreground">Baja</strong>.
              </p>

              {/* Responsabilidad */}
              <h2 className="text-2xl font-heading font-bold text-foreground mt-12 mb-6">Responsabilidad</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                ISLACLOUD informa al usuario que asume la responsabilidad del uso del Sitio web. Esta responsabilidad se extiende al registro que fuera necesario para acceder a determinados servicios o contenidos. En este registro el usuario será responsable de aportar información veraz y lícita.
              </p>

              {/* Menores */}
              <h2 className="text-2xl font-heading font-bold text-foreground mt-12 mb-6">Gestión de Datos de Menores</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                En relación con los datos personales de menores de 18 años, ISLACLOUD nunca utilizará estos datos para fines inadecuados para la edad del menor. ISLACLOUD facilitará a los padres o tutores la posibilidad de ejercer los derechos de acceso, cancelación, rectificación y oposición de los datos de sus hijos o tutelados. En caso de tratarse de menores de 14 años, estos deberán abstenerse de la comunicación electrónica de sus datos.
              </p>

              {/* Cookies */}
              <h2 className="text-2xl font-heading font-bold text-foreground mt-12 mb-6">Uso de Cookies y Análisis de Navegación</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Las "cookies" constituyen procedimientos automáticos de recogida de información relativa a las preferencias determinadas por un usuario de internet durante su visita a un determinado sitio web.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Esta página web utiliza Google Analytics, un servicio analítico de web prestado por Google. La información que genera la "cookie" sobre su uso del Sitio web (incluyendo su dirección IP) será directamente transmitida y archivada por Google en los servidores de Estados Unidos.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Para más información:{" "}
                <a href="https://support.google.com/analytics/answer/6004245" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  https://support.google.com/analytics/answer/6004245
                </a>
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Usted puede rechazar el tratamiento de los datos rechazando el uso de "cookies" mediante la selección de la configuración apropiada de su navegador.
              </p>

            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AvisoLegal;
