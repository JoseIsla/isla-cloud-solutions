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

  // Create default admin user
  const hashedPassword = await bcrypt.hash('IslaCloud2024!', 12);
  await conn.query(`
    INSERT IGNORE INTO users (email, password, name, role)
    VALUES ('admin@islacloudsolutions.com', ?, 'Administrador', 'admin')
  `, [hashedPassword]);

  // Insert default contents
  const defaultContents = [
    ['hero_title', 'Título del Hero', 'Soluciones Cloud y Tecnología para Empresas'],
    ['hero_subtitle', 'Subtítulo del Hero', 'Administración de sistemas, cloud, hosting y desarrollo tecnológico para empresas.'],
    ['about_text', 'Texto Sobre Nosotros', 'Isla Cloud Solutions nació con la misión de proporcionar servicios tecnológicos de primer nivel.'],
  ];

  for (const [key, title, value] of defaultContents) {
    await conn.query(`
      INSERT IGNORE INTO contents (content_key, title, value) VALUES (?, ?, ?)
    `, [key, title, value]);
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
