import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Create Categories (Silicon Valley Perspective)
  const categories = [
    { name: 'Luxury Villas', slug: 'luxury-villas', order: 1 },
    { name: 'Modern Apartments', slug: 'modern-apartments', order: 2 },
    { name: 'Smart Workspaces', slug: 'smart-workspaces', order: 3 },
    { name: 'Sustainable Green Projects', slug: 'sustainable-green', order: 4 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }

  const allCats = await prisma.category.findMany();
  const getCatId = (slug: string) => allCats.find(c => c.slug === slug)?.id || '';

  // 2. Create Products (Properties)
  const properties = [
    {
      name: 'The Gharana Heights',
      description: 'Ultra-luxury penthouse with 360-degree city views and private infinity pool.',
      price: 15000000, // 15M
      categoryId: getCatId('luxury-villas'),
      imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1000',
      featured: true,
      tags: ['luxury', 'view', 'pool', 'penthouse'],
      highlights: ['Private Infinity Pool', 'Smart Home Integration', 'Italian Marble Flooring'],
    },
    {
      name: 'Eco-Vista Sustainable Residency',
      description: 'LEED Certified green building featuring solar power and organic gardens.',
      price: 8500000,
      categoryId: getCatId('sustainable-green'),
      imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1000',
      featured: true,
      tags: ['eco', 'sustainable', 'green', 'solar'],
      highlights: ['Solar Powered', 'Rainwater Harvesting', 'Communal Organic Garden'],
    },
    {
      name: 'Silicon Square Hub',
      description: 'Next-gen co-working and office space designed for tech startups.',
      price: 12000000,
      categoryId: getCatId('smart-workspaces'),
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000',
      featured: false,
      tags: ['office', 'tech', 'startup', 'modern'],
      highlights: ['High-speed Fiber', 'Flexible Layouts', 'Zen Meditation Zones'],
    },
    {
        name: 'Zenith Sky Apartments',
        description: 'Premium urban living with minimalist Japanese design influences.',
        price: 5500000,
        categoryId: getCatId('modern-apartments'),
        imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000',
        featured: false,
        tags: ['minimalist', 'zen', 'urban', 'apartment'],
        highlights: ['Minimalist Aesthetic', 'Smart Security', 'Yoga Studio Access'],
    }
  ];

  for (const prop of properties) {
    await prisma.product.create({
      data: prop,
    });
  }

  // 3. Create Offers
  const offers = [
    { title: 'Inaugural Launch Discount', discount: '10% OFF', description: 'Limited time offer for first 10 bookings at The Gharana Heights.' },
    { title: 'Eco-Incentive', discount: 'FREE SOLAR PANEL UPGRADE', description: 'Book a Sustainable residency this month and get upgraded battery storage.' },
  ];

  for (const offer of offers) {
    await prisma.offer.create({
      data: offer,
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
