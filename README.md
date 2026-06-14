# E-Commerce API

Node.js + Express + MySQL + Redis

## Setup

```bash
# 1. Cài dependencies
npm install

# 2. Tạo file .env từ template
cp .env.example .env
# Điền DB_PASSWORD, JWT secrets, mail credentials

# 3. Tạo database
mysql -u root -p -e "CREATE DATABASE ecommerce_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 4. Chạy SQL schema
mysql -u root -p ecommerce_db < schema.sql

# 5. Chạy dev server
npm run dev
```

## API Endpoints

### Auth
| Method | Path | Auth | Mô tả |
|--------|------|------|-------|
| POST | /api/auth/register | — | Đăng ký |
| POST | /api/auth/login | — | Đăng nhập |
| POST | /api/auth/refresh | — | Lấy access token mới |
| POST | /api/auth/logout | Bearer | Đăng xuất |
| GET | /api/auth/me | Bearer | Thông tin user hiện tại |

### Products
| Method | Path | Auth | Mô tả |
|--------|------|------|-------|
| GET | /api/products | — | Danh sách sản phẩm (filter, search, paginate) |
| GET | /api/products/:id | — | Chi tiết sản phẩm |
| POST | /api/products | admin/staff | Tạo sản phẩm + upload ảnh |
| PATCH | /api/products/:id | admin/staff | Cập nhật sản phẩm |
| DELETE | /api/products/:id | admin | Xóa sản phẩm |
| DELETE | /api/products/:id/images/:imageId | admin | Xóa ảnh |

## Query params cho GET /api/products

```
?page=1&limit=20
&category_id=1
&brand_id=2
&status=active
&search=iphone
&sort_by=price&order=asc
&min_price=1000000&max_price=50000000
```

## Cấu trúc thư mục

```
src/
├── app.js                  # Entry point
├── config/
│   ├── database.js         # Sequelize connection
│   └── redis.js            # Redis client
├── middlewares/
│   ├── auth.js             # verifyToken, requireRole
│   ├── errorHandler.js     # Global error handler
│   ├── upload.js           # Multer config
│   └── validate.js         # Joi validation factory
├── modules/
│   ├── auth/
│   │   ├── user.model.js
│   │   ├── auth.schema.js
│   │   ├── auth.service.js
│   │   ├── auth.controller.js
│   │   └── auth.routes.js
│   └── product/
│       ├── product.model.js
│       ├── product.schema.js
│       ├── product.service.js
│       ├── product.controller.js
│       └── product.routes.js
└── utils/
    ├── apiError.js         # ApiError class + asyncHandler
    └── apiResponse.js      # Response helpers
```

## Module tiếp theo

Các module còn lại theo cùng pattern `model → schema → service → controller → routes`:

- `cart` — thêm/xóa/cập nhật giỏ hàng
- `order` — tạo đơn, tính tiền, áp coupon
- `payment` — COD / bank transfer
- `review` — đánh giá sản phẩm
- `user` — profile, địa chỉ giao hàng
