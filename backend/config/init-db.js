require('dotenv').config();
const mariadb = require('mariadb');

const SEED = process.argv.includes('--seed');
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
      sort_order INT DEFAULT 0,
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

  // Partners table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS partners (
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

  // Success cases table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS success_cases (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      client_name VARCHAR(255) NOT NULL,
      excerpt TEXT,
      description LONGTEXT,
      image_url VARCHAR(500),
      sort_order INT DEFAULT 0,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Testimonials table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id INT AUTO_INCREMENT PRIMARY KEY,
      author_name VARCHAR(255) NOT NULL,
      author_role VARCHAR(255),
      author_company VARCHAR(255),
      quote TEXT NOT NULL,
      avatar_url VARCHAR(500),
      rating TINYINT DEFAULT 5,
      sort_order INT DEFAULT 0,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // FAQs table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS faqs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      question VARCHAR(500) NOT NULL,
      answer TEXT NOT NULL,
      sort_order INT DEFAULT 0,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  // ── Seed data (solo con --seed) ──
  if (SEED) {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('IslaCloud2024!', 12);
    await conn.query(`
      INSERT IGNORE INTO users (email, password, name, role)
      VALUES ('admin@islacloudsolutions.com', ?, 'Administrador', 'admin')
    `, [hashedPassword]);
  }

  // ── CMS contents sync (siempre se ejecuta) ──
  const defaultContents = [
      ['hero_title', 'Título del Hero', 'Soluciones Cloud y Tecnología para Empresas', 'text'],
      ['hero_subtitle', 'Subtítulo del Hero', 'Más de 20 años siendo el socio tecnológico de empresas que necesitan un departamento IT profesional, cercano y disponible 24x7.', 'text'],
      ['hero_cta_primary', 'Botón principal Hero', 'Solicita información', 'text'],
      ['hero_cta_secondary', 'Botón secundario Hero', 'Nuestros servicios', 'text'],
      ['services_section_label', 'Etiqueta sección servicios', 'Servicios', 'text'],
      ['services_section_title', 'Título sección servicios', 'Soluciones tecnológicas integrales', 'text'],
      ['services_section_subtitle', 'Subtítulo sección servicios', 'Cubrimos todas las necesidades IT de tu empresa con servicios profesionales y soporte continuo.', 'text'],
      ['whyus_section_title', 'Título sección por qué elegirnos', '¿Por qué Isla Cloud?', 'text'],
      ['whyus_reason_1_title', 'Razón 1 título', '+20 años de experiencia', 'text'],
      ['whyus_reason_1_desc', 'Razón 1 descripción', 'Más de dos décadas resolviendo retos tecnológicos empresariales.', 'text'],
      ['whyus_reason_2_title', 'Razón 2 título', 'Soporte 24x7', 'text'],
      ['whyus_reason_2_desc', 'Razón 2 descripción', 'Equipo técnico disponible las 24 horas, los 7 días de la semana.', 'text'],
      ['whyus_reason_3_title', 'Razón 3 título', 'Seguridad garantizada', 'text'],
      ['whyus_reason_3_desc', 'Razón 3 descripción', 'Protocolos de seguridad avanzados y cumplimiento RGPD.', 'text'],
      ['whyus_reason_4_title', 'Razón 4 título', 'SLA garantizado', 'text'],
      ['whyus_reason_4_desc', 'Razón 4 descripción', 'Acuerdos de nivel de servicio con tiempos de respuesta comprometidos.', 'text'],
      ['clients_section_label', 'Etiqueta sección clientes', 'Clientes', 'text'],
      ['clients_section_title', 'Título sección clientes', 'Empresas que confían en nosotros', 'text'],
      ['clients_section_subtitle', 'Subtítulo sección clientes', 'Más de 60 empresas e instituciones de todos los sectores', 'text'],
      ['clients_bg_image', 'Imagen de fondo sección clientes', '', 'text'],
      ['cta_title', 'Título CTA', '¿Listo para impulsar tu empresa?', 'text'],
      ['cta_subtitle', 'Subtítulo CTA', 'Contacta con nosotros y descubre cómo podemos ayudarte a optimizar tu infraestructura tecnológica.', 'text'],
      ['cta_button', 'Botón CTA', 'Contactar ahora', 'text'],
      ['about_title', 'Título Sobre Nosotros', 'Más de 20 años creando soluciones tecnológicas', 'text'],
      ['about_subtitle', 'Subtítulo Sobre Nosotros', 'Somos un equipo de profesionales apasionados por la tecnología, dedicados a ser el socio tecnológico que tu empresa necesita.', 'text'],
      ['about_history', 'Historia', '<p>Isla Cloud Solutions nació con la misión de proporcionar servicios tecnológicos de primer nivel a empresas que necesitan un socio de confianza para gestionar su infraestructura IT.</p>', 'html'],
      ['contact_title', 'Título Contacto', 'Hablemos de tu proyecto', 'text'],
      ['contact_subtitle', 'Subtítulo Contacto', 'Cuéntanos qué necesitas y te asesoramos sin compromiso.', 'text'],
      ['counter_projects', 'Contador: Proyectos (valor)', '298', 'text'],
      ['counter_projects_label', 'Contador: Proyectos (etiqueta)', 'Proyectos', 'text'],
      ['counter_maintenance', 'Contador: Mantenimientos (valor)', '315', 'text'],
      ['counter_maintenance_label', 'Contador: Mantenimientos (etiqueta)', 'Mantenimientos', 'text'],
      ['counter_clients', 'Contador: Clientes (valor)', '169', 'text'],
      ['counter_clients_label', 'Contador: Clientes (etiqueta)', 'Clientes', 'text'],
      ['counter_systems', 'Contador: Sistemas (valor)', '167', 'text'],
      ['counter_systems_label', 'Contador: Sistemas (etiqueta)', 'Sistemas administrados', 'text'],
      ['footer_description', 'Descripción footer', 'Soluciones Cloud y tecnología IT para empresas. Más de 20 años de experiencia como tu socio tecnológico.', 'text'],
      ['hero_bg_slide1', 'Hero: Fondo Slide 1', '', 'text'],
      ['hero_bg_slide2', 'Hero: Fondo Slide 2', '', 'text'],
      ['hero_bg_slide3', 'Hero: Fondo Slide 3', '', 'text'],
      ['hero_badge', 'Badge del Hero', 'Soluciones IT Profesionales', 'text'],
      ['hero_tab1_label', 'Hero Tab 1', 'Infraestructura', 'text'],
      ['hero_tab2_label', 'Hero Tab 2', 'Cloud', 'text'],
      ['hero_tab3_label', 'Hero Tab 3', 'Seguridad', 'text'],
      ['hero_slide2_title', 'Hero Slide 2 Título', 'Cloud Computing Empresarial', 'text'],
      ['hero_slide2_subtitle', 'Hero Slide 2 Subtítulo', 'Migra tu infraestructura a la nube con seguridad y rendimiento garantizado.', 'text'],
      ['hero_slide2_cta', 'Hero Slide 2 Botón principal', 'Migrar a la nube', 'text'],
      ['hero_slide2_cta_secondary', 'Hero Slide 2 Botón secundario', 'Ver soluciones cloud', 'text'],
      ['hero_slide3_title', 'Hero Slide 3 Título', 'Ciberseguridad Avanzada', 'text'],
      ['hero_slide3_subtitle', 'Hero Slide 3 Subtítulo', 'Protege tu empresa con soluciones de seguridad de última generación.', 'text'],
      ['hero_slide3_cta', 'Hero Slide 3 Botón principal', 'Proteger mi empresa', 'text'],
      ['hero_slide3_cta_secondary', 'Hero Slide 3 Botón secundario', 'Ver servicios de seguridad', 'text'],
      ['cta_card1_title', 'CTA Tarjeta 1 Título', '¿Necesitas ayuda?', 'text'],
      ['cta_card1_desc', 'CTA Tarjeta 1 Descripción', 'Llama a nuestro equipo y te ayudaremos.', 'text'],
      ['cta_card2_title', 'CTA Tarjeta 2 Título', 'Enfoque proactivo', 'text'],
      ['cta_card2_desc', 'CTA Tarjeta 2 Descripción', 'Precios flexibles y adaptados. Solo pagas por lo que necesitas, cuando lo necesitas.', 'text'],
      ['whyus_section_label', 'WhyUs Sección Etiqueta', '¿Por qué elegirnos?', 'text'],
      ['whyus_section_subtitle', 'WhyUs Sección Subtítulo', 'Razones por las que más de 60 empresas confían en Isla Cloud.', 'text'],
      ['intro_text', 'Texto de introducción', '<p>Somos tu socio tecnológico. Gestionamos, protegemos y optimizamos toda tu infraestructura IT para que tú te centres en hacer crecer tu negocio.</p>', 'html'],
      ['contact_phone', 'Teléfono de contacto', '+34 910 000 000', 'text'],
      ['contact_email', 'Email de contacto', 'info@islacloudsolutions.com', 'text'],
      ['contact_address', 'Dirección', 'Madrid, España', 'text'],
      ['footer_services_title', 'Footer: Título Servicios', 'Servicios', 'text'],
      ['footer_company_title', 'Footer: Título Empresa', 'Empresa', 'text'],
      ['footer_contact_title', 'Footer: Título Contacto', 'Contacto', 'text'],
      ['footer_company_link1', 'Footer: Enlace Empresa 1', 'Sobre Nosotros', 'text'],
      ['footer_company_link2', 'Footer: Enlace Empresa 2', 'Noticias', 'text'],
      ['footer_company_link3', 'Footer: Enlace Empresa 3', 'Contacto', 'text'],
      ['footer_legal_link1', 'Footer: Enlace Legal 1', 'Política de Privacidad', 'text'],
      ['footer_legal_link2', 'Footer: Enlace Legal 2', 'Aviso Legal', 'text'],
      ['footer_copyright', 'Footer: Copyright', '© {year} Isla Cloud Solutions. Todos los derechos reservados.', 'text'],
      ['services_page_title', 'Título página Servicios', 'Soluciones IT completas para tu negocio', 'text'],
      ['services_page_subtitle', 'Subtítulo página Servicios', 'Descubre todos nuestros servicios tecnológicos diseñados para impulsar la productividad y seguridad de tu empresa.', 'text'],
      ['blog_page_title', 'Título página Blog', 'Noticias y actualidad IT', 'text'],
      ['blog_page_subtitle', 'Subtítulo página Blog', 'Mantente al día con las últimas noticias del sector tecnológico y novedades de Isla Cloud Solutions.', 'text'],
      ['about_history_title', 'Título sección Historia', 'Nuestra historia', 'text'],
      ['about_values_title', 'Título sección Valores', 'Nuestros valores', 'text'],
      ['nav_link1_label', 'Nav: Enlace 1', 'Inicio', 'text'],
      ['nav_link2_label', 'Nav: Enlace 2', 'Servicios', 'text'],
      ['nav_link3_label', 'Nav: Enlace 3', 'Sobre Nosotros', 'text'],
      ['nav_link4_label', 'Nav: Enlace 4', 'Blog', 'text'],
      ['nav_link5_label', 'Nav: Enlace 5', 'Contacto', 'text'],
      ['nav_cta_text', 'Nav: Botón CTA', 'Solicitar Consulta', 'text'],
      ['nav_link1_path', 'Nav: Enlace 1 Ruta', '/', 'text'],
      ['nav_link2_path', 'Nav: Enlace 2 Ruta', '/servicios', 'text'],
      ['nav_link3_path', 'Nav: Enlace 3 Ruta', '/sobre-nosotros', 'text'],
      ['nav_link4_path', 'Nav: Enlace 4 Ruta', '/blog', 'text'],
      ['nav_link5_path', 'Nav: Enlace 5 Ruta', '/contacto', 'text'],
      ['nav_link1_visible', 'Nav: Enlace 1 Visible', 'true', 'text'],
      ['nav_link2_visible', 'Nav: Enlace 2 Visible', 'true', 'text'],
      ['nav_link3_visible', 'Nav: Enlace 3 Visible', 'true', 'text'],
      ['nav_link4_visible', 'Nav: Enlace 4 Visible', 'true', 'text'],
      ['nav_link5_visible', 'Nav: Enlace 5 Visible', 'true', 'text'],
      ['nav_link1_order', 'Nav: Enlace 1 Orden', '1', 'text'],
      ['nav_link2_order', 'Nav: Enlace 2 Orden', '2', 'text'],
      ['nav_link3_order', 'Nav: Enlace 3 Orden', '3', 'text'],
      ['nav_link4_order', 'Nav: Enlace 4 Orden', '4', 'text'],
      ['nav_link5_order', 'Nav: Enlace 5 Orden', '5', 'text'],
      ['site_logo_navbar', 'Logo Navbar', '', 'text'],
      ['site_logo_footer', 'Logo Footer', '', 'text'],
      ['social_linkedin', 'Red Social: LinkedIn', '', 'text'],
      ['social_twitter', 'Red Social: Twitter/X', '', 'text'],
      ['social_facebook', 'Red Social: Facebook', '', 'text'],
      ['social_instagram', 'Red Social: Instagram', '', 'text'],
      ['social_youtube', 'Red Social: YouTube', '', 'text'],
      ['social_github', 'Red Social: GitHub', '', 'text'],
      ['testimonials_section_label', 'Testimonios: Etiqueta', 'Testimonios', 'text'],
      ['testimonials_section_title', 'Testimonios: Título', 'Lo que dicen nuestros clientes', 'text'],
      ['testimonials_section_subtitle', 'Testimonios: Subtítulo', 'La satisfacción de nuestros clientes es nuestra mejor carta de presentación.', 'text'],
      ['faq_section_label', 'FAQ: Etiqueta', 'FAQ', 'text'],
      ['faq_section_title', 'FAQ: Título', 'Preguntas frecuentes', 'text'],
      ['faq_section_subtitle', 'FAQ: Subtítulo', 'Resolvemos las dudas más habituales sobre nuestros servicios.', 'text'],
      ['cases_section_label', 'Casos Éxito: Etiqueta', 'Casos de éxito', 'text'],
      ['cases_section_title', 'Casos Éxito: Título', 'Proyectos destacados', 'text'],
      ['cases_section_subtitle', 'Casos Éxito: Subtítulo', 'Descubre cómo hemos ayudado a nuestros clientes a alcanzar sus objetivos.', 'text'],
      ['cases_view_detail_btn', 'Casos Éxito: Botón ver detalle', 'Ver caso de éxito', 'text'],
      ['cases_view_all_btn', 'Casos Éxito: Botón ver todos', 'Ver todos los casos', 'text'],
      ['footer_legal_link3', 'Footer: Enlace Legal 3', 'Política de Cookies', 'text'],
      ['legal_aviso_visible', 'Legal: Aviso Legal visible', 'true', 'text'],
      ['legal_privacidad_visible', 'Legal: Privacidad visible', 'true', 'text'],
      ['legal_cookies_visible', 'Legal: Cookies visible', 'true', 'text'],
      ['legal_aviso_content', 'Legal: Contenido Aviso Legal', '', 'html'],
      ['legal_privacidad_content', 'Legal: Contenido Política de Privacidad', '', 'html'],
      ['legal_cookies_content', 'Legal: Contenido Política de Cookies', '', 'html'],
    ];

  for (const [key, title, value, type] of defaultContents) {
    await conn.query(`INSERT IGNORE INTO contents (content_key, title, value, content_type) VALUES (?, ?, ?, ?)`, [key, title, value, type || 'text']);
  }

  if (SEED) {
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
      await conn.query(`INSERT IGNORE INTO clients (name, sort_order) VALUES (?, ?)`, [defaultClients[i], i]);
    }

    console.log('📧 Admin: admin@islacloudsolutions.com');
    console.log('🔑 Password: IslaCloud2024!');
    console.log('⚠️  Cambia la contraseña tras el primer login');
  }

  // ── Migrations (siempre se ejecutan) ──
  const safeAlter = async (sql, label) => {
    try { await conn.query(sql); console.log('  ✅ ' + label); } catch (e) { /* ya existe */ }
  };

  await safeAlter('ALTER TABLE news ADD COLUMN sort_order INT DEFAULT 0 AFTER is_published', 'news.sort_order');
  await safeAlter('ALTER TABLE news ADD COLUMN meta_title VARCHAR(255) DEFAULT \'\'', 'news.meta_title');
  await safeAlter('ALTER TABLE news ADD COLUMN meta_description VARCHAR(500) DEFAULT \'\'', 'news.meta_description');
  await safeAlter('ALTER TABLE news ADD COLUMN noindex TINYINT(1) DEFAULT 0', 'news.noindex');
  await safeAlter('ALTER TABLE news ADD COLUMN nofollow TINYINT(1) DEFAULT 0', 'news.nofollow');

  await safeAlter('ALTER TABLE success_cases ADD COLUMN slug VARCHAR(255) DEFAULT \'\'', 'success_cases.slug');
  await safeAlter('ALTER TABLE success_cases ADD COLUMN meta_title VARCHAR(255) DEFAULT \'\'', 'success_cases.meta_title');
  await safeAlter('ALTER TABLE success_cases ADD COLUMN meta_description VARCHAR(500) DEFAULT \'\'', 'success_cases.meta_description');
  await safeAlter('ALTER TABLE success_cases ADD COLUMN noindex TINYINT(1) DEFAULT 0', 'success_cases.noindex');
  await safeAlter('ALTER TABLE success_cases ADD COLUMN nofollow TINYINT(1) DEFAULT 0', 'success_cases.nofollow');

  // Media library table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS media (
      id INT AUTO_INCREMENT PRIMARY KEY,
      url VARCHAR(500) NOT NULL,
      original_name VARCHAR(255) DEFAULT '',
      category VARCHAR(100) DEFAULT 'general',
      alt_text VARCHAR(500) DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Account lockout columns
  await safeAlter('ALTER TABLE users ADD COLUMN failed_login_attempts INT DEFAULT 0', 'users.failed_login_attempts');
  await safeAlter('ALTER TABLE users ADD COLUMN locked_until TIMESTAMP NULL DEFAULT NULL', 'users.locked_until');
  await safeAlter('ALTER TABLE users ADD COLUMN is_locked TINYINT(1) DEFAULT 0', 'users.is_locked');

  // Login attempts log table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS login_attempts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      ip_address VARCHAR(45) NOT NULL,
      attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_email (email),
      INDEX idx_attempted_at (attempted_at)
    )
  `);

  // Ensure legal content keys always exist (idempotent)
  const requiredContents = [
    ['footer_legal_link3', 'Footer: Enlace Legal 3', 'Política de Cookies', 'text'],
    ['legal_aviso_visible', 'Legal: Aviso Legal visible', 'true', 'text'],
    ['legal_privacidad_visible', 'Legal: Privacidad visible', 'true', 'text'],
    ['legal_cookies_visible', 'Legal: Cookies visible', 'true', 'text'],
    ['legal_aviso_content', 'Legal: Contenido Aviso Legal', '', 'html'],
    ['legal_privacidad_content', 'Legal: Contenido Política de Privacidad', '', 'html'],
    ['legal_cookies_content', 'Legal: Contenido Política de Cookies', '', 'html'],
    // Nav link 6 (Casos de Éxito)
    ['nav_link6_label', 'Nav: Enlace 6', 'Casos de Éxito', 'text'],
    ['nav_link6_path', 'Nav: Enlace 6 Ruta', '/casos', 'text'],
    ['nav_link6_visible', 'Nav: Enlace 6 Visible', 'true', 'text'],
    ['nav_link6_order', 'Nav: Enlace 6 Orden', '6', 'text'],
    // Partners section
    ['partners_section_label', 'Partners: Etiqueta', 'Partners', 'text'],
    ['partners_section_title', 'Partners: Título', 'Nuestros partners tecnológicos', 'text'],
    ['partners_section_subtitle', 'Partners: Subtítulo', 'Colaboramos con los líderes del sector para ofrecerte las mejores soluciones.', 'text'],
    ['partners_bg_image', 'Partners: Imagen de fondo', '', 'text'],
  ];
  for (const [key, title, value, type] of requiredContents) {
    await conn.query('INSERT IGNORE INTO contents (content_key, title, value, content_type) VALUES (?, ?, ?, ?)', [key, title, value, type]);
  }

  // ── Translation columns for entities ──
  // Services
  await safeAlter("ALTER TABLE services ADD COLUMN title_en VARCHAR(255) DEFAULT ''", 'services.title_en');
  await safeAlter("ALTER TABLE services ADD COLUMN short_title_en VARCHAR(100) DEFAULT ''", 'services.short_title_en');
  await safeAlter("ALTER TABLE services ADD COLUMN description_en TEXT", 'services.description_en');
  await safeAlter("ALTER TABLE services ADD COLUMN long_description_en TEXT", 'services.long_description_en');
  await safeAlter("ALTER TABLE services ADD COLUMN features_en JSON", 'services.features_en');

  // News
  await safeAlter("ALTER TABLE news ADD COLUMN title_en VARCHAR(255) DEFAULT ''", 'news.title_en');
  await safeAlter("ALTER TABLE news ADD COLUMN excerpt_en TEXT", 'news.excerpt_en');
  await safeAlter("ALTER TABLE news ADD COLUMN content_en LONGTEXT", 'news.content_en');

  // Success cases
  await safeAlter("ALTER TABLE success_cases ADD COLUMN title_en VARCHAR(255) DEFAULT ''", 'success_cases.title_en');
  await safeAlter("ALTER TABLE success_cases ADD COLUMN excerpt_en TEXT", 'success_cases.excerpt_en');
  await safeAlter("ALTER TABLE success_cases ADD COLUMN description_en LONGTEXT", 'success_cases.description_en');

  // Testimonials
  await safeAlter("ALTER TABLE testimonials ADD COLUMN quote_en TEXT", 'testimonials.quote_en');
  await safeAlter("ALTER TABLE testimonials ADD COLUMN author_role_en VARCHAR(255) DEFAULT ''", 'testimonials.author_role_en');
  await safeAlter("ALTER TABLE testimonials ADD COLUMN author_company_en VARCHAR(255) DEFAULT ''", 'testimonials.author_company_en');

  // FAQs
  await safeAlter("ALTER TABLE faqs ADD COLUMN question_en VARCHAR(500) DEFAULT ''", 'faqs.question_en');
  await safeAlter("ALTER TABLE faqs ADD COLUMN answer_en TEXT", 'faqs.answer_en');

  console.log('✅ Base de datos actualizada correctamente');

  await conn.end();
}

initDB().catch(err => {
  console.error('❌ Error inicializando la base de datos:', err);
  process.exit(1);
});
