require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Coupon = require('./models/Coupon');
const Content = require('./models/Content');
const connectDB = require('./config/db');

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing database collections...');
    await User.deleteMany();
    await Product.deleteMany();
    await Coupon.deleteMany();
    await Content.deleteMany();

    console.log('Seeding Users...');
    // Create Admin User
    const admin = await User.create({
      name: 'Vaarahi Admin',
      email: 'admin@vaarahi.com',
      password: 'adminpassword123',
      role: 'admin',
      phone: '+919876543210'
    });

    // Create Sub-Admin User
    await User.create({
      name: 'Sub Admin Staff',
      email: 'staff@vaarahi.com',
      password: 'staffpassword123',
      role: 'sub-admin',
      permissions: ['manage_products', 'manage_orders'],
      phone: '+919876543211'
    });

    // Create Customer User
    const customer = await User.create({
      name: 'Ananya Sharma',
      email: 'ananya@gmail.com',
      password: 'customerpassword123',
      role: 'customer',
      phone: '+919988776655'
    });

    console.log('Seeding Products (Sarees)...');
    const products = await Product.create([
      {
        name: 'Pochampally Ikat Royal Silk Saree',
        description: 'A traditional Pochampally double-ikat silk saree from Telangana featuring geometric patterns, hand-dyed ikat design, and a rich contrast zari border. Perfect for festive and special occasions.',
        price: 18500,
        discountPercent: 10,
        sku: 'SAR-IKA-POC-01',
        stock: 6,
        fabric: 'Mulberry Silk',
        weave: 'Pochampally',
        occasion: 'Festive',
        zariType: 'Pure Zari',
        origin: 'Telangana',
        careInstructions: ['Dry Clean Only', 'Store in cotton bags', 'Iron on low reverse heat'],
        color: { name: 'Teal Blue & Red', hex: '#008080' },
        images: [
          { secure_url: '/vaarahi_pochampally_lookbook.jpg', public_id: 'Ikat_1' }
        ],
        ratings: { average: 4.8, count: 12 },
        seo: { metaTitle: 'Pochampally Ikat Silk Saree - Vaarahi Silks', metaDescription: 'Handcrafted Telangana Pochampally Ikat Silk Saree with classic geometric patterns.' },
        isActive: true,
        isFeatured: true
      },
      {
        name: 'Gadwal Heritage Contrast Border Saree',
        description: 'An authentic Gadwal saree with a pure fine cotton body and a contrast heavy silk border featuring intricate gold zari peacock designs. Handcrafted by master weavers of Telangana.',
        price: 14800,
        discountPercent: 5,
        sku: 'SAR-GAD-HER-02',
        stock: 8,
        fabric: 'Cotton Silk Blend',
        weave: 'Gadwal',
        occasion: 'Festive',
        zariType: 'Pure Zari',
        origin: 'Telangana',
        careInstructions: ['Dry Clean Only', 'Do not wring', 'Iron on low'],
        color: { name: 'Mustard Gold & Maroon', hex: '#D4AF37' },
        images: [
          { secure_url: '/vaarahi_gadwal_lookbook.jpg', public_id: 'Gadwal_1' }
        ],
        ratings: { average: 4.9, count: 8 },
        seo: { metaTitle: 'Traditional Gadwal Contrast Silk Saree - Vaarahi Silks', metaDescription: 'Handcrafted traditional Gadwal cotton-silk saree with gold zari work.' },
        isActive: true,
        isFeatured: true
      },
      {
        name: 'Venkatagiri Fine Golden Weave Saree',
        description: 'A light-as-air Venkatagiri cotton-silk saree woven with delicate gold zari borders and jamdani motifs, originating from Andhra Pradesh. Elegant drape for formal and daytime wear.',
        price: 9500,
        discountPercent: 10,
        sku: 'SAR-VEN-GOL-03',
        stock: 10,
        fabric: 'Fine Cotton-Silk',
        weave: 'Venkatagiri',
        occasion: 'Office Wear',
        zariType: 'Metallic Zari',
        origin: 'Andhra Pradesh',
        careInstructions: ['Gentle handwash', 'Do not squeeze', 'Iron on low'],
        color: { name: 'Ivory Cream', hex: '#FFFDD0' },
        images: [
          { secure_url: 'https://images.unsplash.com/photo-1583391265517-35bbdad01209?q=80&w=600&auto=format&fit=crop', public_id: 'Venkatagiri_1' }
        ],
        ratings: { average: 4.5, count: 15 },
        seo: { metaTitle: 'Venkatagiri Ivory Cream Saree - Vaarahi Silks', metaDescription: 'Lightweight gold zari Venkatagiri cotton-silk handloom saree.' },
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Dharmavaram Royal Bridal Silk Saree',
        description: 'A magnificent Dharmavaram bridal silk saree from Andhra Pradesh with broad gold zari peacock motifs, solid contrast pallu, and heavy wedding border work.',
        price: 28000,
        discountPercent: 15,
        sku: 'SAR-DHA-BRD-04',
        stock: 4,
        fabric: 'Mulberry Silk',
        weave: 'Dharmavaram',
        occasion: 'Bridal',
        zariType: 'Pure Zari',
        origin: 'Andhra Pradesh',
        careInstructions: ['Dry Clean Only', 'Store in muslin cloth', 'Iron on low reverse heat'],
        color: { name: 'Royal Red & Gold', hex: '#800020' },
        images: [
          { secure_url: '/vaarahi_dharmavaram_lookbook.jpg', public_id: 'Dharmavaram_1' }
        ],
        ratings: { average: 4.3, count: 6 },
        seo: { metaTitle: 'Dharmavaram Royal Bridal Silk Saree - Vaarahi Silks', metaDescription: 'Handcrafted premium Dharmavaram bridal silk saree with golden zari.' },
        isActive: true,
        isFeatured: true
      }
    ]);

    console.log('Seeding Coupons...');
    await Coupon.create([
      {
        code: 'FESTIVE15',
        discountType: 'percentage',
        discountValue: 15,
        minOrderAmount: 5000,
        maxDiscountAmount: 2000,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2027-12-31')
      },
      {
        code: 'WELCOME500',
        discountType: 'flat',
        discountValue: 500,
        minOrderAmount: 2000,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2027-12-31')
      }
    ]);

    console.log('Seeding Dynamic Lookbook/Banner Content...');
    await Content.create({
      key: 'homepage_banners',
      value: [
        {
          title: 'The Pochampally Legacy',
          subtitle: 'Traditional Double Ikat Handlooms',
          imageUrl: '/vaarahi_pochampally_lookbook.jpg',
          ctaLink: '/shop?weave=Pochampally'
        },
        {
          title: 'Deccan Royal Borders',
          subtitle: 'Gadwal Silk Collection',
          imageUrl: '/vaarahi_gadwal_lookbook.jpg',
          ctaLink: '/shop?weave=Gadwal'
        }
      ]
    });

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed database:', error);
    process.exit(1);
  }
};

seedData();
