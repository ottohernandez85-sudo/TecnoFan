import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const defaultMenu = [
  { label: 'Smart Fans', path: '/catalog?category=smart-fans', icon: 'fan' },
  { label: 'Ceiling Fans', path: '/catalog?category=ceiling-fans', icon: 'wind' },
  { label: 'Industrial', path: '/catalog?category=industrial', icon: 'building' },
  { label: 'Accesorios', path: '/catalog?category=accesorios', icon: 'package' },
  { label: 'Soporte', path: '/support', icon: 'headset' },
];

async function main() {
  const password = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@lula.dev' },
    update: { role: 'ADMIN' },
    create: {
      email: 'admin@lula.dev',
      password,
      name: 'Administrador',
      role: 'ADMIN',
    },
  });

  const clientePass = await bcrypt.hash('cliente123', 10);
  await prisma.customer.upsert({
    where: { email: 'cliente@lula.dev' },
    update: { name: 'Cliente Demo' },
    create: {
      email: 'cliente@lula.dev',
      password: clientePass,
      name: 'Cliente Demo',
    },
  });

  const cats = [
    {
      name: 'Smart Fans',
      slug: 'smart-fans',
      description: 'Ventilación inteligente con app y automatización.',
      icon: 'fan',
    },
    {
      name: 'Ceiling Fans',
      slug: 'ceiling-fans',
      description: 'Techo, diseño limpio y confort térmico.',
      icon: 'wind',
    },
    {
      name: 'Industrial',
      slug: 'industrial',
      description: 'Alto caudal para bodegas, talleres y comercio.',
      icon: 'building',
    },
    {
      name: 'Accesorios',
      slug: 'accesorios',
      description: 'Complementos, controles y piezas.',
      icon: 'package',
    },
    {
      name: 'Extractores',
      slug: 'extractores',
      description: 'Extracción para baños y espacios húmedos.',
      icon: 'droplet',
    },
  ];

  const categoryMap = {};
  for (const c of cats) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, icon: c.icon },
      create: c,
    });
    categoryMap[c.slug] = row.id;
  }

  const placeholder =
    'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&h=600&fit=crop';

  const products = [
    {
      name: 'AeroFlow Prime 52',
      slug: 'aeroflow-prime-52',
      description: 'Matte White • Sustainable Ash Wood',
      price: 349,
      stock: 24,
      badge: 'NEW ARRIVAL',
      categorySlug: 'ceiling-fans',
      attributes: { airflow: '6,800 CFM', noise: '32 dB', warranty: '3 Years', colorHex: '#f8fafc' },
    },
    {
      name: 'Stealth Pro 42',
      slug: 'stealth-pro-42',
      description: 'Brushed Nickel • Whisper-Quiet DC',
      price: 289,
      stock: 18,
      badge: 'PREMIUM',
      categorySlug: 'ceiling-fans',
      attributes: { airflow: '5,200 CFM', noise: '28 dB', warranty: '5 Years', colorHex: '#94a3b8' },
    },
    {
      name: 'Aurora Smart 56',
      slug: 'aurora-smart-56',
      description: 'Matte Black • Wi-Fi + CCT LED',
      price: 459,
      stock: 12,
      badge: 'BESTSELLER',
      categorySlug: 'smart-fans',
      attributes: { airflow: '7,100 CFM', noise: '30 dB', warranty: '3 Years', colorHex: '#1e293b' },
    },
    {
      name: 'EcoBreeze Walnut 52',
      slug: 'ecobreeze-walnut-52',
      description: 'Walnut blades • Energy Star',
      price: 399,
      stock: 10,
      badge: null,
      categorySlug: 'ceiling-fans',
      attributes: { airflow: '6,400 CFM', noise: '31 dB', warranty: '3 Years', colorHex: '#78350f' },
    },
    {
      name: 'Slimline Core 42',
      slug: 'slimline-core-42',
      description: 'Low profile • Ideal para techos bajos',
      price: 219,
      stock: 30,
      badge: null,
      categorySlug: 'ceiling-fans',
      attributes: { airflow: '4,800 CFM', noise: '34 dB', warranty: '2 Years', colorHex: '#e2e8f0' },
    },
    {
      name: 'Titan X Industrial',
      slug: 'titan-x-industrial',
      description: 'Alto caudal para bodegas y talleres',
      price: 899,
      stock: 6,
      badge: 'PREMIUM',
      categorySlug: 'industrial',
      attributes: { airflow: '12,000 CFM', noise: '48 dB', warranty: '5 Years', colorHex: '#334155' },
    },
    {
      name: 'Aeris Smart Pro',
      slug: 'aeris-smart-pro',
      description: 'Conectividad total, modo brisa natural y motor DC ultra eficiente.',
      price: 4899,
      stock: 8,
      badge: 'NEW ARRIVAL',
      categorySlug: 'smart-fans',
      attributes: { airflow: '6,200 CFM', noise: '32 dB', warranty: '3 Years', colorHex: '#0ea5e9' },
    },
    {
      name: 'Aero-X Pro Smart Edition',
      slug: 'aero-x-pro-smart',
      description: 'Eficiencia aerodinámica y integración smart para climatización residencial.',
      price: 2499,
      stock: 15,
      badge: 'NEW ARRIVAL',
      categorySlug: 'smart-fans',
      attributes: { airflow: '5,900 CFM', noise: '30 dB', warranty: '10 Years', colorHex: '#6366f1' },
    },
    {
      name: 'DeskStream Mini',
      slug: 'deskstream-mini',
      description: 'Ventilador de escritorio compacto, tonos claros y velocidades suaves.',
      price: 189,
      stock: 40,
      badge: null,
      categorySlug: 'accesorios',
      attributes: { airflow: '850 CFM', noise: '38 dB', warranty: '1 Year', colorHex: '#fef3c7' },
    },
    {
      name: 'Extractor Linea Pro',
      slug: 'extractor-linea-pro',
      description: 'Ideal para baños y espacios húmedos.',
      price: 349,
      stock: 22,
      badge: null,
      categorySlug: 'extractores',
      attributes: { airflow: '110 CFM', noise: '36 dB', warranty: '2 Years', colorHex: '#cbd5e1' },
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
        badge: p.badge,
        attributes: p.attributes,
        imageUrl: placeholder,
        categoryId: categoryMap[p.categorySlug],
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        stock: p.stock,
        badge: p.badge,
        attributes: p.attributes,
        imageUrl: placeholder,
        categoryId: categoryMap[p.categorySlug],
      },
    });
  }

  await prisma.siteSetting.upsert({
    where: { id: 1 },
    update: {
      menuItems: defaultMenu,
      companyLegalName: 'Tecnofan Guatemala S.A.',
      companyAddress: 'Zona 10, Ciudad de Guatemala',
      companyPhone: '+502 3000-0000',
      companyEmail: 'ventas@tecnofan.demo',
      companyTaxId: 'NIT 1234567-8',
    },
    create: {
      id: 1,
      brandName: 'Tecnofan',
      colorPrimary: '#0F2A47',
      colorAccent: '#1E5BA8',
      colorBg: '#F2F4F7',
      colorSurface: '#FFFFFF',
      colorText: '#0F2A47',
      menuItems: defaultMenu,
      productTemplate: 'standard',
      companyLegalName: 'Tecnofan Guatemala S.A.',
      companyAddress: 'Zona 10, Ciudad de Guatemala',
      companyPhone: '+502 3000-0000',
      companyEmail: 'ventas@tecnofan.demo',
      companyTaxId: 'NIT 1234567-8',
    },
  });

  console.log('Seed OK: admin@lula.dev / admin123 | cliente@lula.dev / cliente123');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
