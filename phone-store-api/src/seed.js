// // src/seed.js
// import dotenv from 'dotenv';
// dotenv.config();

// import bcrypt from 'bcrypt';
// import mongoose from 'mongoose';
// import { connectDB } from './db.js';
// import { User } from './models/User.js';
// import { Brand } from './models/Brand.js';
// import { Product } from './models/Product.js';
// import { Coupon } from './models/Coupon.js';

// async function runSeed() {
//   console.log('🚀 Bắt đầu seed data...');
//   await connectDB();

//   // Có thể chỉnh lại nếu không muốn xoá
//   const RESET_DB = true;

//   if (RESET_DB) {
//     console.log('🧹 Xoá dữ liệu cũ trong các collection Users, Brands, Products, Coupons...');
//     await Promise.all([
//       User.deleteMany({}),
//       Brand.deleteMany({}),
//       Product.deleteMany({}),
//       Coupon.deleteMany({}),
//     ]);
//   }

//   // ========= 1. Tạo users =========
//   console.log('👤 Tạo user admin & customer demo...');

//   const adminPasswordHash = await bcrypt.hash('123456', 10);
//   const customerPasswordHash = await bcrypt.hash('123456', 10);

//   const adminUser = await User.create({
//     name: 'Admin',
//     email: 'admin@shop.vn',
//     phone: '0900000000',
//     passwordHash: adminPasswordHash,
//     role: 'admin',
//   });

//   const customerUser = await User.create({
//     name: 'Khách Demo',
//     email: 'user@shop.vn',
//     phone: '0911111111',
//     passwordHash: customerPasswordHash,
//     role: 'customer',
//   });

//   console.log('✅ Users:');
//   console.log('   - Admin:    admin@shop.vn / 123456');
//   console.log('   - Customer: user@shop.vn  / 123456');

//   // ========= 2. Tạo brands =========
//   console.log('🏷  Tạo brands...');

//   const brands = await Brand.insertMany([
//     { name: 'Apple', slug: 'apple' },
//     { name: 'Samsung', slug: 'samsung' },
//     { name: 'Xiaomi', slug: 'xiaomi' },
//     { name: 'Oppo', slug: 'oppo' },
//   ]);

//   const brandMap = {};
//   brands.forEach((b) => {
//     brandMap[b.slug] = b._id;
//   });

//   console.log('✅ Brands đã tạo:', brands.map((b) => b.name).join(', '));

//   // ========= 3. Tạo products + variants + images =========
//   console.log('📱 Tạo products demo...');

//   const productsData = [
//     {
//       name: 'iPhone 15 Pro Max 256GB',
//       slug: 'iphone-15-pro-max-256gb',
//       brand: brandMap['apple'],
//       basePrice: 27990000,
//       oldPrice: 30990000,
//       condition: 'new',
//       description: 'iPhone 15 Pro Max với khung viền Titanium, chip A17 Pro, camera 48MP và cổng USB-C.',
//       isHotDeal: true,
//       ratingAvg: 4.9,
//       ratingCount: 132,
//       variants: [
//         {
//           color: 'Titan Xanh',
//           ramGb: 8,
//           romGb: 256,
//           price: 27990000,
//           stockQty: 10,
//           sku: 'IP15PM-256-TX',
//           isDefault: true,
//         },
//         {
//           color: 'Titan Tự Nhiên',
//           ramGb: 8,
//           romGb: 256,
//           price: 27990000,
//           stockQty: 8,
//           sku: 'IP15PM-256-TN',
//           isDefault: false,
//         },
//       ],
//       images: [
//         'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-max-storage-select-202309-6-7inch-bluetitanium?wid=600&hei=600&fmt=jpeg&qlt=90&.v=1693010550074',
//         'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-storage-select-202309-6-1inch-bluetitanium?wid=600&hei=600&fmt=jpeg&qlt=90&.v=1693010550074',
//       ],
//     },
//     {
//       name: 'Samsung Galaxy S24 Ultra 12GB 256GB',
//       slug: 'samsung-galaxy-s24-ultra-12-256',
//       brand: brandMap['samsung'],
//       basePrice: 24990000,
//       oldPrice: 26990000,
//       condition: 'new',
//       description:
//         'Galaxy S24 Ultra với màn hình 120Hz, camera zoom, bút S-Pen, hiệu năng mạnh mẽ cho công việc và giải trí.',
//       isHotDeal: true,
//       ratingAvg: 4.8,
//       ratingCount: 98,
//       variants: [
//         {
//           color: 'Xám Titan',
//           ramGb: 12,
//           romGb: 256,
//           price: 24990000,
//           stockQty: 12,
//           sku: 'S24U-256-XT',
//           isDefault: true,
//         },
//         {
//           color: 'Đen',
//           ramGb: 12,
//           romGb: 512,
//           price: 27990000,
//           stockQty: 5,
//           sku: 'S24U-512-BLK',
//           isDefault: false,
//         },
//       ],
//       images: [
//         'https://images.samsung.com/is/image/samsung/p6pim/vn/2401/gallery/vn-galaxy-s24-ultra-s928-sm-s928bztqxxv-539939309?$650_519_PNG$',
//       ],
//     },
//     {
//       name: 'Xiaomi Redmi Note 13 Pro 8GB 256GB',
//       slug: 'xiaomi-redmi-note-13-pro-8-256',
//       brand: brandMap['xiaomi'],
//       basePrice: 7990000,
//       oldPrice: 8990000,
//       condition: 'new',
//       description:
//         'Redmi Note 13 Pro với pin trâu, màn AMOLED 120Hz, camera độ phân giải cao, phù hợp chơi game và giải trí.',
//       isHotDeal: true,
//       ratingAvg: 4.7,
//       ratingCount: 210,
//       variants: [
//         {
//           color: 'Xanh',
//           ramGb: 8,
//           romGb: 256,
//           price: 7990000,
//           stockQty: 20,
//           sku: 'RN13P-256-XANH',
//           isDefault: true,
//         },
//         {
//           color: 'Đen',
//           ramGb: 8,
//           romGb: 256,
//           price: 7990000,
//           stockQty: 15,
//           sku: 'RN13P-256-DEN',
//           isDefault: false,
//         },
//       ],
//       images: [
//         'https://i01.appmifile.com/webfile/globalimg/products/pc/redmi-note-13-pro/blue.png',
//       ],
//     },
//     {
//       name: 'iPhone 13 128GB (Like New 99%)',
//       slug: 'iphone-13-128-like-new',
//       brand: brandMap['apple'],
//       basePrice: 10990000,
//       oldPrice: 12990000,
//       condition: 'used',
//       description:
//         'iPhone 13 máy lướt, hình thức đẹp, pin tốt, bảo hành 6 tháng. Lựa chọn tiết kiệm cho người dùng phổ thông.',
//       isHotDeal: false,
//       ratingAvg: 4.8,
//       ratingCount: 320,
//       variants: [
//         {
//           color: 'Trắng',
//           ramGb: 4,
//           romGb: 128,
//           price: 10990000,
//           stockQty: 7,
//           sku: 'IP13-128-TRANG-LN',
//           isDefault: true,
//         },
//         {
//           color: 'Đen',
//           ramGb: 4,
//           romGb: 128,
//           price: 10990000,
//           stockQty: 6,
//           sku: 'IP13-128-DEN-LN',
//           isDefault: false,
//         },
//       ],
//       images: [
//         'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-13-select-2021?wid=600&hei=600&fmt=jpeg&qlt=90&.v=1645572316342',
//       ],
//     },
//   ];

//   const productsToInsert = productsData.map((p) => ({
//     brand: p.brand,
//     name: p.name,
//     slug: p.slug,
//     basePrice: p.basePrice,
//     oldPrice: p.oldPrice,
//     condition: p.condition,
//     description: p.description,
//     isHotDeal: p.isHotDeal,
//     ratingAvg: p.ratingAvg,
//     ratingCount: p.ratingCount,
//     variants: p.variants,
//     images: p.images.map((url, idx) => ({
//       url,
//       isPrimary: idx === 0,
//     })),
//   }));

//   const products = await Product.insertMany(productsToInsert);

//   console.log(`✅ Đã tạo ${products.length} products demo.`);

//   // ========= 4. Tạo coupons =========
//   console.log('🏷  Tạo coupons demo...');

//   const coupons = await Coupon.insertMany([
//     {
//       code: 'WELCOME10',
//       type: 'percent',
//       value: 10,
//       status: 'active',
//       minOrderTotal: 1000000,
//     },
//     {
//       code: 'BLACKFRIDAY',
//       type: 'percent',
//       value: 20,
//       status: 'active',
//       minOrderTotal: 2000000,
//       maxDiscount: 2000000,
//     },
//   ]);

//   console.log(
//     '✅ Coupons:',
//     coupons.map((c) => c.code).join(', ')
//   );

//   console.log('🎉 Seed data hoàn tất.');
// }

// runSeed()
//   .then(() => {
//     console.log('✅ DONE.');
//     return mongoose.disconnect();
//   })
//   .then(() => {
//     process.exit(0);
//   })
//   .catch((err) => {
//     console.error('❌ Seed failed:', err);
//     process.exit(1);
//   });
