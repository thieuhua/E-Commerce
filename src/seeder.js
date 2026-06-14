/**
 * Seeder — dữ liệu mẫu cho E-Commerce B2C
 * Chạy: node src/seeder.js
 * Reset: node src/seeder.js --reset
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, connectDB } = require('./config/database');

// ── Models ──────────────────────────────────────────────────
const User         = require('./modules/auth/user.model');
const Address      = require('./modules/address/address.model');
const { Category, Brand, Product, ProductImage } = require('./modules/product/product.model');
const { Cart, CartItem } = require('./modules/cart/cart.model');
const { Order, OrderItem } = require('./modules/order/order.model');
const Payment      = require('./modules/payment/payment.model');
const Shipment     = require('./modules/shipment/shipment.model');
const Review       = require('./modules/review/review.model');
const Coupon       = require('./modules/coupon/coupon.model');

// ── Helpers ─────────────────────────────────────────────────
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ── Data ────────────────────────────────────────────────────

const USERS = [
  { username: 'admin',    email: 'admin@shop.vn',   password: 'Admin@123',    full_name: 'Quản Trị Viên',    phone: '0901000001', role: 'admin' },
  { username: 'staff01',  email: 'staff@shop.vn',   password: 'Staff@123',    full_name: 'Nhân Viên Kho',    phone: '0901000002', role: 'staff' },
  { username: 'nguyenvana', email: 'vana@gmail.com', password: 'Pass@1234',   full_name: 'Nguyễn Văn A',     phone: '0912345678', role: 'customer' },
  { username: 'tranthib',   email: 'thib@gmail.com', password: 'Pass@1234',   full_name: 'Trần Thị B',       phone: '0923456789', role: 'customer' },
  { username: 'lehongc',    email: 'hongc@gmail.com', password: 'Pass@1234',  full_name: 'Lê Hồng C',        phone: '0934567890', role: 'customer' },
  { username: 'phamvanD',   email: 'vand@gmail.com', password: 'Pass@1234',   full_name: 'Phạm Văn D',       phone: '0945678901', role: 'customer' },
  { username: 'dothie',     email: 'thie@gmail.com', password: 'Pass@1234',   full_name: 'Đỗ Thị E',         phone: '0956789012', role: 'customer' },
];

const CATEGORIES = [
  { name: 'Điện thoại & Máy tính bảng', description: 'Smartphone, tablet các hãng', parent_id: null },
  { name: 'Laptop & Máy tính', description: 'Laptop, PC, phụ kiện máy tính', parent_id: null },
  { name: 'Âm thanh', description: 'Tai nghe, loa bluetooth', parent_id: null },
  { name: 'Đồng hồ thông minh', description: 'Smartwatch, fitness tracker', parent_id: null },
  // Subcategories
  { name: 'Điện thoại', description: 'Smartphone Android & iOS', parent_id: 1 },
  { name: 'Máy tính bảng', description: 'iPad, Galaxy Tab...', parent_id: 1 },
  { name: 'Laptop gaming', description: 'Laptop cấu hình cao cho game', parent_id: 2 },
  { name: 'Laptop văn phòng', description: 'Mỏng nhẹ, pin trâu', parent_id: 2 },
  { name: 'Tai nghe', description: 'In-ear, over-ear, true wireless', parent_id: 3 },
  { name: 'Loa', description: 'Loa bluetooth di động', parent_id: 3 },
];

const BRANDS = [
  { name: 'Apple',   description: 'Think Different' },
  { name: 'Samsung', description: 'Galaxy ecosystem' },
  { name: 'Sony',    description: 'Professional audio & electronics' },
  { name: 'ASUS',    description: 'ROG & ZenBook series' },
  { name: 'Dell',    description: 'XPS & Inspiron' },
  { name: 'JBL',     description: 'Powerful sound' },
  { name: 'Xiaomi',  description: 'Innovation for everyone' },
  { name: 'Bose',    description: 'Better Sound Through Research' },
];

// product_id sẽ được assign sau khi insert, dùng index để ref
const PRODUCTS = [
  // Điện thoại (cat index 4 = "Điện thoại", brand index 0 = Apple)
  { catIdx: 4, brandIdx: 0, name: 'iPhone 16 Pro Max 256GB', description: 'Chip A18 Pro, camera 48MP ProRAW, màn hình 6.9" Super Retina XDR, pin cả ngày.', price: 34990000, stock: 45, status: 'active' },
  { catIdx: 4, brandIdx: 0, name: 'iPhone 16 128GB', description: 'Chip A18, Dynamic Island, camera 48MP, thiết kế nhôm bền bỉ.', price: 22990000, stock: 80, status: 'active' },
  { catIdx: 4, brandIdx: 1, name: 'Samsung Galaxy S25 Ultra 256GB', description: 'Snapdragon 8 Elite, S-Pen tích hợp, camera 200MP, màn hình 6.9" LTPO AMOLED.', price: 31990000, stock: 35, status: 'active' },
  { catIdx: 4, brandIdx: 1, name: 'Samsung Galaxy A55 5G 128GB', description: 'Exynos 1480, màn hình 6.6" Super AMOLED, camera 50MP OIS, IP67.', price: 8990000, stock: 120, status: 'active' },
  { catIdx: 4, brandIdx: 6, name: 'Xiaomi 14T Pro 512GB', description: 'Dimensity 9300+, Leica camera 50MP, sạc 120W HyperCharge, màn hình AMOLED 144Hz.', price: 16990000, stock: 60, status: 'active' },
  { catIdx: 4, brandIdx: 6, name: 'Xiaomi Redmi Note 13 Pro 256GB', description: 'Snapdragon 7s Gen 2, camera 200MP, pin 5100mAh, sạc 67W.', price: 6490000, stock: 200, status: 'active' },
  // Máy tính bảng
  { catIdx: 5, brandIdx: 0, name: 'iPad Pro M4 11" WiFi 256GB', description: 'Chip M4 mạnh ngang laptop, màn hình OLED Ultra Retina XDR, mỏng nhất lịch sử Apple.', price: 26990000, stock: 25, status: 'active' },
  { catIdx: 5, brandIdx: 1, name: 'Samsung Galaxy Tab S9 FE 128GB', description: 'Exynos 1380, S-Pen đi kèm, màn hình 10.9" TFT, IP68.', price: 11990000, stock: 40, status: 'active' },
  // Laptop gaming
  { catIdx: 6, brandIdx: 3, name: 'ASUS ROG Strix G16 RTX 4070', description: 'Intel Core i9-14900HX, RTX 4070 8GB, RAM 32GB, SSD 1TB, màn hình 16" QHD 240Hz.', price: 45990000, stock: 15, status: 'active' },
  { catIdx: 6, brandIdx: 3, name: 'ASUS TUF Gaming A15 RTX 4060', description: 'Ryzen 9 7940H, RTX 4060 8GB, RAM 16GB, SSD 512GB, pin 90Wh.', price: 27990000, stock: 22, status: 'active' },
  // Laptop văn phòng
  { catIdx: 7, brandIdx: 0, name: 'MacBook Air M3 13" 16GB 256GB', description: 'Chip M3, màn hình Liquid Retina 13.6", pin 18 giờ, không quạt tản nhiệt.', price: 28990000, stock: 30, status: 'active' },
  { catIdx: 7, brandIdx: 4, name: 'Dell XPS 13 Plus Core Ultra 7', description: 'Intel Core Ultra 7 155H, OLED 13.4" 3.5K, RAM 32GB, SSD 512GB, thiết kế siêu mỏng.', price: 35990000, stock: 18, status: 'active' },
  // Tai nghe
  { catIdx: 8, brandIdx: 0, name: 'AirPods Pro 2 (USB-C)', description: 'Chống ồn chủ động H2, Transparency Mode, Adaptive Audio, IP54, pin 6h+30h.', price: 6290000, stock: 150, status: 'active' },
  { catIdx: 8, brandIdx: 2, name: 'Sony WH-1000XM5', description: 'Chống ồn hàng đầu, 30h pin, multipoint, LDAC Hi-Res Audio, trọng lượng 250g.', price: 7490000, stock: 55, status: 'active' },
  { catIdx: 8, brandIdx: 7, name: 'Bose QuietComfort Ultra Earbuds', description: 'Immersive Audio, chống ồn CustomTune, IPX4, pin 6h+24h.', price: 8290000, stock: 40, status: 'active' },
  { catIdx: 8, brandIdx: 1, name: 'Samsung Galaxy Buds3 Pro', description: 'ANC, 360 Audio, IP57, pin 6h+18h, tích hợp Bixby.', price: 4690000, stock: 70, status: 'active' },
  // Loa
  { catIdx: 9, brandIdx: 5, name: 'JBL Charge 5', description: 'IP67 chống nước, pin 20h, powerbank tích hợp, bass mạnh, PartyBoost.', price: 3290000, stock: 85, status: 'active' },
  { catIdx: 9, brandIdx: 2, name: 'Sony SRS-XB100', description: 'Nhỏ gọn IP67, pin 16h, Extra Bass, dây đeo tiện lợi.', price: 1090000, stock: 200, status: 'active' },
  // Đồng hồ
  { catIdx: 3, brandIdx: 0, name: 'Apple Watch Series 10 GPS 42mm', description: 'Màn hình lớn nhất, mỏng nhất, sạc nhanh, theo dõi sức khỏe toàn diện, watchOS 11.', price: 10990000, stock: 50, status: 'active' },
  { catIdx: 3, brandIdx: 1, name: 'Samsung Galaxy Watch 7 44mm', description: 'BioActive Sensor, AI health, Wear OS 5, pin 40h, viền titanium.', price: 7490000, stock: 45, status: 'active' },
];

// Placeholder images từ picsum (không cần upload thật)
const IMAGE_BASE = 'https://picsum.photos/seed';
const PRODUCT_IMAGES = [
  [`${IMAGE_BASE}/iphone16pro/800/800`, `${IMAGE_BASE}/iphone16pro2/800/800`],
  [`${IMAGE_BASE}/iphone16/800/800`, `${IMAGE_BASE}/iphone16b/800/800`],
  [`${IMAGE_BASE}/s25ultra/800/800`, `${IMAGE_BASE}/s25ultra2/800/800`],
  [`${IMAGE_BASE}/galaxya55/800/800`],
  [`${IMAGE_BASE}/xiaomi14t/800/800`, `${IMAGE_BASE}/xiaomi14t2/800/800`],
  [`${IMAGE_BASE}/redminote13/800/800`],
  [`${IMAGE_BASE}/ipadprom4/800/800`, `${IMAGE_BASE}/ipadprom4b/800/800`],
  [`${IMAGE_BASE}/tabs9fe/800/800`],
  [`${IMAGE_BASE}/rogstrix/800/800`, `${IMAGE_BASE}/rogstrix2/800/800`],
  [`${IMAGE_BASE}/tufgaming/800/800`],
  [`${IMAGE_BASE}/macbookairm3/800/800`, `${IMAGE_BASE}/macbookairm3b/800/800`],
  [`${IMAGE_BASE}/dellxps13/800/800`],
  [`${IMAGE_BASE}/airpodspro2/800/800`],
  [`${IMAGE_BASE}/sonywh1000xm5/800/800`, `${IMAGE_BASE}/sonywh1000xm5b/800/800`],
  [`${IMAGE_BASE}/boseqcultra/800/800`],
  [`${IMAGE_BASE}/galaxybuds3/800/800`],
  [`${IMAGE_BASE}/jblcharge5/800/800`],
  [`${IMAGE_BASE}/sonysrs/800/800`],
  [`${IMAGE_BASE}/applewatch10/800/800`, `${IMAGE_BASE}/applewatch10b/800/800`],
  [`${IMAGE_BASE}/galaxywatch7/800/800`],
];

const ADDRESSES = [
  { receiver_name: 'Nguyễn Văn A', phone: '0912345678', province: 'Hà Nội', district: 'Cầu Giấy',    ward: 'Dịch Vọng Hậu', detail: '15 Nguyễn Văn Cừ',     is_default: 1 },
  { receiver_name: 'Trần Thị B',   phone: '0923456789', province: 'TP HCM',  district: 'Quận 1',       ward: 'Bến Nghé',       detail: '88 Lê Lợi',             is_default: 1 },
  { receiver_name: 'Lê Hồng C',    phone: '0934567890', province: 'Đà Nẵng', district: 'Hải Châu',    ward: 'Hải Châu 1',     detail: '12 Trần Phú',           is_default: 1 },
  { receiver_name: 'Phạm Văn D',   phone: '0945678901', province: 'Hà Nội',  district: 'Hoàn Kiếm',   ward: 'Hàng Bài',       detail: '5 Đinh Tiên Hoàng',     is_default: 1 },
  { receiver_name: 'Đỗ Thị E',     phone: '0956789012', province: 'TP HCM',  district: 'Bình Thạnh',  ward: 'Phường 25',      detail: '200 Xô Viết Nghệ Tĩnh', is_default: 1 },
];

const COUPONS = [
  { code: 'WELCOME10', discount_type: 'percent', discount_value: 10, min_order_amount: 500000,  start_date: '2024-01-01', end_date: '2026-12-31', quantity: 1000, status: 'active' },
  { code: 'SALE200K',  discount_type: 'fixed',   discount_value: 200000, min_order_amount: 2000000, start_date: '2024-01-01', end_date: '2026-12-31', quantity: 500,  status: 'active' },
  { code: 'VIP500K',   discount_type: 'fixed',   discount_value: 500000, min_order_amount: 5000000, start_date: '2024-01-01', end_date: '2026-12-31', quantity: 200,  status: 'active' },
  { code: 'TECH15',    discount_type: 'percent', discount_value: 15, min_order_amount: 10000000, start_date: '2024-01-01', end_date: '2026-12-31', quantity: 100, status: 'active' },
  { code: 'EXPIRED',   discount_type: 'percent', discount_value: 20, min_order_amount: null,    start_date: '2023-01-01', end_date: '2023-12-31', quantity: 100, status: 'inactive' },
];

const REVIEW_COMMENTS = [
  'Sản phẩm tuyệt vời, đúng như mô tả, giao hàng nhanh!',
  'Chất lượng rất tốt, mình rất hài lòng với sản phẩm này.',
  'Hàng chính hãng, đóng gói cẩn thận. Sẽ ủng hộ shop tiếp.',
  'Sản phẩm ổn, pin trâu hơn mình nghĩ. Recommend!',
  'Giá tốt so với thị trường, hiệu năng đáp ứng nhu cầu.',
  'Màu đẹp, thiết kế sang, dùng mượt mà.',
  'Giao hàng siêu nhanh, sản phẩm nguyên seal. 5 sao!',
  'Tạm ổn nhưng pin hơi yếu so với kỳ vọng.',
];

// ── Seed function ────────────────────────────────────────────
async function seed() {
  const isReset = process.argv.includes('--reset');

  await connectDB();
  console.log('\n🌱 Bắt đầu seeding...\n');

  if (isReset) {
    console.log('🗑  Xóa dữ liệu cũ...');
    // Disable FK checks để xóa không bị lỗi
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const model of [Review, Shipment, Payment, OrderItem, Order, CartItem, Cart,
                          ProductImage, Product, Brand, Category, Address, Coupon, User]) {
      await model.destroy({ where: {}, truncate: true });
    }
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Đã xóa xong\n');
  }

  // 1. Users
  console.log('👤 Seeding users...');
  const users = [];
  for (const u of USERS) {
    const password_hash = await bcrypt.hash(u.password, 12);
    const user = await User.create({ ...u, password_hash });
    users.push(user);
  }
  console.log(`   ✅ ${users.length} users`);

  // 2. Categories
  console.log('🗂  Seeding categories...');
  const insertedCats = [];
  for (const cat of CATEGORIES) {
    const data = { ...cat };
    if (data.parent_id !== null) {
      // parent_id là index trong insertedCats (chỉ danh mục gốc)
      data.parent_id = insertedCats[data.parent_id - 1]?.category_id || null;
    }
    const c = await Category.create(data);
    insertedCats.push(c);
  }
  console.log(`   ✅ ${insertedCats.length} categories`);

  // 3. Brands
  console.log('🏷  Seeding brands...');
  const brands = [];
  for (const b of BRANDS) {
    brands.push(await Brand.create(b));
  }
  console.log(`   ✅ ${brands.length} brands`);

  // 4. Products + Images
  console.log('📦 Seeding products...');
  const products = [];
  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i];
    const cat   = insertedCats[p.catIdx - 1]; // catIdx 1-based như CATEGORIES index
    const brand = brands[p.brandIdx];
    const product = await Product.create({
      category_id:    cat.category_id,
      brand_id:       brand.brand_id,
      name:           p.name,
      description:    p.description,
      price:          p.price,
      stock_quantity: p.stock,
      status:         p.status,
    });
    products.push(product);

    // Images
    const imgs = PRODUCT_IMAGES[i] || [`${IMAGE_BASE}/product${i}/800/800`];
    await ProductImage.bulkCreate(imgs.map((url, j) => ({
      product_id: product.product_id, image_url: url, sort_order: j,
    })));
  }
  console.log(`   ✅ ${products.length} products`);

  // 5. Coupons
  console.log('🎫 Seeding coupons...');
  const coupons = await Coupon.bulkCreate(COUPONS);
  console.log(`   ✅ ${coupons.length} coupons`);

  // 6. Addresses (1 mỗi customer)
  console.log('📍 Seeding addresses...');
  const customers = users.filter(u => u.role === 'customer');
  for (let i = 0; i < customers.length; i++) {
    await Address.create({ ...ADDRESSES[i], user_id: customers[i].user_id });
  }
  console.log(`   ✅ ${customers.length} addresses`);

  // 7. Carts (customer 0, 1 có items)
  console.log('🛒 Seeding carts...');
  for (const customer of customers.slice(0, 2)) {
    const cart = await Cart.create({ user_id: customer.user_id });
    // 2-3 sản phẩm ngẫu nhiên
    const picked = [...products].sort(() => Math.random() - .5).slice(0, randInt(2, 3));
    for (const p of picked) {
      await CartItem.create({ cart_id: cart.cart_id, product_id: p.product_id, quantity: randInt(1, 2) });
    }
  }
  console.log('   ✅ 2 carts with items');

  // 8. Orders (khách 0,1,2 mỗi người 2 đơn)
  console.log('📋 Seeding orders...');
  const statuses = ['delivered', 'delivered', 'shipping', 'pending'];
  const methods  = ['cod', 'bank_transfer', 'e_wallet'];
  const orderAddresses = await Address.findAll({ where: { user_id: customers.slice(0, 3).map(c => c.user_id) } });
  const addrMap = {};
  orderAddresses.forEach(a => { addrMap[a.user_id] = a; });

  const createdOrders = [];
  for (const customer of customers.slice(0, 3)) {
    const addr = addrMap[customer.user_id];
    for (let o = 0; o < 2; o++) {
      // Pick 1-2 products
      const picked = [...products].sort(() => Math.random() - .5).slice(0, randInt(1, 2));
      const subtotal = picked.reduce((s, p) => s + Number(p.price), 0);
      const shipping = 30000;
      const total    = subtotal + shipping;
      const status   = statuses[(customers.indexOf(customer) * 2 + o) % statuses.length];

      const order = await Order.create({
        user_id: customer.user_id,
        address_id: addr.address_id,
        subtotal, discount_amount: 0, shipping_fee: shipping, total_amount: total,
        status,
        order_date: new Date(Date.now() - randInt(1, 30) * 86400000),
      });

      await OrderItem.bulkCreate(picked.map(p => ({
        order_id: order.order_id, product_id: p.product_id,
        quantity: 1, unit_price: Number(p.price), subtotal: Number(p.price),
      })));

      const method = rand(methods);
      const isPaid = ['delivered', 'shipping'].includes(status);
      await Payment.create({
        order_id: order.order_id, method, amount: total,
        status: isPaid ? 'paid' : 'pending',
        paid_at: isPaid ? new Date() : null,
      });

      if (['delivered', 'shipping'].includes(status)) {
        await Shipment.create({
          order_id: order.order_id,
          tracking_code: `GHN${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          carrier: 'Giao Hàng Nhanh',
          status: status === 'delivered' ? 'delivered' : 'in_transit',
          shipped_at: new Date(Date.now() - randInt(1, 5) * 86400000),
          delivered_at: status === 'delivered' ? new Date() : null,
        });
      }

      createdOrders.push({ order, picked, status });
    }
  }
  console.log(`   ✅ ${createdOrders.length} orders`);

  // 9. Reviews (chỉ cho delivered orders)
  console.log('⭐ Seeding reviews...');
  let reviewCount = 0;
  for (const { order, picked, status } of createdOrders) {
    if (status !== 'delivered') continue;
    for (const product of picked) {
      // Tránh duplicate (1 user + 1 product)
      const exists = await Review.findOne({ where: { user_id: order.user_id, product_id: product.product_id } });
      if (exists) continue;
      await Review.create({
        user_id:    order.user_id,
        product_id: product.product_id,
        rating:     randInt(4, 5),
        comment:    rand(REVIEW_COMMENTS),
      });
      reviewCount++;
    }
  }
  console.log(`   ✅ ${reviewCount} reviews`);

  // ── Summary ──────────────────────────────────────────────
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Seeding hoàn tất!\n');
  console.log('📋 Tài khoản test:');
  console.log('   admin@shop.vn     / Admin@123  (admin)');
  console.log('   staff@shop.vn     / Staff@123  (staff)');
  console.log('   vana@gmail.com    / Pass@1234  (customer — có đơn delivered, có thể review)');
  console.log('   thib@gmail.com    / Pass@1234  (customer — có đơn delivered)');
  console.log('   hongc@gmail.com   / Pass@1234  (customer — có đơn shipping)');
  console.log('   vand@gmail.com    / Pass@1234  (customer — có giỏ hàng, chưa có đơn)');
  console.log('\n🎫 Coupon test:');
  console.log('   WELCOME10 — giảm 10%, đơn từ 500k');
  console.log('   SALE200K  — giảm 200k, đơn từ 2 triệu');
  console.log('   VIP500K   — giảm 500k, đơn từ 5 triệu');
  console.log('   TECH15    — giảm 15%, đơn từ 10 triệu');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await sequelize.close();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
