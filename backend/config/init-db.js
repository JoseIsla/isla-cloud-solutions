require('dotenv').config();
const mariadb = require('mariadb');
const bcrypt = require('bcryptjs');

async function initDB() {
  const conn = await mariadb.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'islacloud',
    password: process.env.DB_PASSWORD || '',
  });

  const dbName = process.env.DB_NAME || 'islacloud_db';

  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.query(`USE \`${dbName}\``);

  // Users table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(100) NOT NULL,
      role ENUM('admin', 'editor') DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Services table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS services (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(255) NOT NULL UNIQUE,
      title VARCHAR(255) NOT NULL,
      short_title VARCHAR(100) NOT NULL,
      description TEXT,
      long_description TEXT,
      icon VARCHAR(50) DEFAULT 'Server',
      features JSON,
      image_url VARCHAR(500),
      sort_order INT DEFAULT 0,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // News table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS news (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      excerpt TEXT,
      content LONGTEXT,
      image_url VARCHAR(500),
      category VARCHAR(100),
      is_published TINYINT(1) DEFAULT 0,
      published_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Contacts table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL,
      empresa VARCHAR(100),
      telefono VARCHAR(20),
      mensaje TEXT NOT NULL,
      is_read TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Contents table (editable CMS texts)
  await conn.query(`
    CREATE TABLE IF NOT EXISTS contents (
      id INT AUTO_INCREMENT PRIMARY KEY,
      content_key VARCHAR(100) NOT NULL UNIQUE,
      title VARCHAR(255),
      value LONGTEXT,
      content_type ENUM('text', 'html', 'json') DEFAULT 'text',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Clients table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS clients (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      logo_url VARCHAR(500),
      website_url VARCHAR(500),
      sort_order INT DEFAULT 0,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Create default admin user
  const hashedPassword = await bcrypt.hash('IslaCloud2024!', 12);
  await conn.query(`
    INSERT IGNORE INTO users (email, password, name, role)
    VALUES ('admin@islacloudsolutions.com', ?, 'Administrador', 'admin')
  `, [hashedPassword]);

  // Insert default contents for all landing sections
  const defaultContents = [
    // Hero
    ['hero_title', 'Título del Hero', 'Soluciones Cloud y Tecnología para Empresas', 'text'],
    ['hero_subtitle', 'Subtítulo del Hero', 'Más de 20 años siendo el socio tecnológico de empresas que necesitan un departamento IT profesional, cercano y disponible 24x7.', 'text'],
    ['hero_cta_primary', 'Botón principal Hero', 'Solicita información', 'text'],
    ['hero_cta_secondary', 'Botón secundario Hero', 'Nuestros servicios', 'text'],
    // Services section
    ['services_section_label', 'Etiqueta sección servicios', 'Servicios', 'text'],
    ['services_section_title', 'Título sección servicios', 'Soluciones tecnológicas integrales', 'text'],
    ['services_section_subtitle', 'Subtítulo sección servicios', 'Cubrimos todas las necesidades IT de tu empresa con servicios profesionales y soporte continuo.', 'text'],
    // Why us
    ['whyus_section_title', 'Título sección por qué elegirnos', '¿Por qué Isla Cloud?', 'text'],
    ['whyus_reason_1_title', 'Razón 1 título', '+20 años de experiencia', 'text'],
    ['whyus_reason_1_desc', 'Razón 1 descripción', 'Más de dos décadas resolviendo retos tecnológicos empresariales.', 'text'],
    ['whyus_reason_2_title', 'Razón 2 título', 'Soporte 24x7', 'text'],
    ['whyus_reason_2_desc', 'Razón 2 descripción', 'Equipo técnico disponible las 24 horas, los 7 días de la semana.', 'text'],
    ['whyus_reason_3_title', 'Razón 3 título', 'Seguridad garantizada', 'text'],
    ['whyus_reason_3_desc', 'Razón 3 descripción', 'Protocolos de seguridad avanzados y cumplimiento RGPD.', 'text'],
    ['whyus_reason_4_title', 'Razón 4 título', 'SLA garantizado', 'text'],
    ['whyus_reason_4_desc', 'Razón 4 descripción', 'Acuerdos de nivel de servicio con tiempos de respuesta comprometidos.', 'text'],
    // Clients section
    ['clients_section_label', 'Etiqueta sección clientes', 'Clientes', 'text'],
    ['clients_section_title', 'Título sección clientes', 'Empresas que confían en nosotros', 'text'],
    ['clients_section_subtitle', 'Subtítulo sección clientes', 'Más de 60 empresas e instituciones de todos los sectores', 'text'],
    // CTA section
    ['cta_title', 'Título CTA', '¿Listo para impulsar tu empresa?', 'text'],
    ['cta_subtitle', 'Subtítulo CTA', 'Contacta con nosotros y descubre cómo podemos ayudarte a optimizar tu infraestructura tecnológica.', 'text'],
    ['cta_button', 'Botón CTA', 'Contactar ahora', 'text'],
    // About page
    ['about_title', 'Título Sobre Nosotros', 'Más de 20 años creando soluciones tecnológicas', 'text'],
    ['about_subtitle', 'Subtítulo Sobre Nosotros', 'Somos un equipo de profesionales apasionados por la tecnología, dedicados a ser el socio tecnológico que tu empresa necesita.', 'text'],
    ['about_history', 'Historia', '<p>Isla Cloud Solutions nació con la misión de proporcionar servicios tecnológicos de primer nivel a empresas que necesitan un socio de confianza para gestionar su infraestructura IT.</p><p>Con más de 20 años de experiencia en el sector, nuestro equipo de ingenieros y técnicos especializados ha gestionado la infraestructura de empresas de todos los sectores, desde instituciones culturales de prestigio internacional hasta empresas de innovación tecnológica.</p><p>Nuestro compromiso es claro: ser el departamento IT que tu empresa necesita, con la profesionalidad y la cercanía de un equipo que trabaja integrado en tu organización.</p>', 'html'],
    // Contact page
    ['contact_title', 'Título Contacto', 'Hablemos de tu proyecto', 'text'],
    ['contact_subtitle', 'Subtítulo Contacto', 'Cuéntanos qué necesitas y te asesoramos sin compromiso.', 'text'],
    // Counters
    ['counter_projects', 'Contador: Proyectos (valor)', '298', 'text'],
    ['counter_projects_label', 'Contador: Proyectos (etiqueta)', 'Proyectos', 'text'],
    ['counter_maintenance', 'Contador: Mantenimientos (valor)', '315', 'text'],
    ['counter_maintenance_label', 'Contador: Mantenimientos (etiqueta)', 'Mantenimientos', 'text'],
    ['counter_clients', 'Contador: Clientes (valor)', '169', 'text'],
    ['counter_clients_label', 'Contador: Clientes (etiqueta)', 'Clientes', 'text'],
    ['counter_systems', 'Contador: Sistemas (valor)', '167', 'text'],
    ['counter_systems_label', 'Contador: Sistemas (etiqueta)', 'Sistemas administrados', 'text'],
    // Footer
    ['footer_description', 'Descripción footer', 'Soluciones Cloud y tecnología IT para empresas. Más de 20 años de experiencia como tu socio tecnológico.', 'text'],
  ];

  for (const [key, title, value, type] of defaultContents) {
    await conn.query(`
      INSERT IGNORE INTO contents (content_key, title, value, content_type) VALUES (?, ?, ?, ?)
    `, [key, title, value, type || 'text']);
  }

  // Insert default clients
  const defaultClients = [
    'Fundación Amigos Museo del Prado', 'Fundación Museo Reina Sofía', 'American Friends of Prado Museum',
    'Enredart Comunicación', 'ACE', 'WWF España', 'Gasnam', 'Fran Silvestre Arquitectos',
    'GSTI Research Center', 'AGAMFEC', 'Alpeclima', 'Alhambra', 'Raúl García Studio',
    'Pelayo Seguros', 'QDP', 'PRV', 'EuroCinema Van', 'Arquiobras', 'Asteco', 'Irtecon',
    'Recuperaciones Cruz', 'Cofares', 'Bikubo', 'Cauchos Brunete', 'Farline', 'Soroban',
    'Creaciones Carfi', 'Boutique Triángulo', 'Russafa', 'Merkasano', 'Legal Compliance',
    'Clínicas Dr. Nasimi', 'Nagrela', 'Quercus', 'EJA', 'FAE', 'Linneo',
    'Comunidad de Madrid', 'Serrano63', 'Turismo Rural', 'Consultavet', 'Bold', 'Quadam',
    'Alberto Corazón', 'OCJMJ', 'Santos Benbunan Arquitectos', 'Movedesign', 'AICEP',
    'Corporación Alba', 'COAM', 'Unión Interprofesional', 'Fundación Carpio Pérez',
    'Guggenheim Bilbao', 'Hepkra', 'Meatzaldeko Behargintza', 'Hierro Pérez Abogados',
    'Reconstruct Reformas', 'Repuestos Torrejón', 'Meraki Rehabilitación', 'Mundooasis',
    'Colegio CFI Gabriel Pérez Cárcel',
  ];

  for (let i = 0; i < defaultClients.length; i++) {
    await conn.query(`
      INSERT IGNORE INTO clients (name, sort_order) VALUES (?, ?)
    `, [defaultClients[i], i]);
  }

  console.log('✅ Base de datos inicializada correctamente');
  console.log('📧 Admin: admin@islacloudsolutions.com');
  console.log('🔑 Password: IslaCloud2024!');
  console.log('⚠️  Cambia la contraseña tras el primer login');

  await conn.end();
}

initDB().catch(err => {
  console.error('❌ Error inicializando la base de datos:', err);
  process.exit(1);
});
