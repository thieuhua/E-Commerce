-- ============================================================
--  E-COMMERCE B2C  —  Physical Schema (MySQL / MariaDB)
--  Generated from ERD v1.0
-- ============================================================

SET NAMES utf8mb4;
SET time_zone = '+07:00';

-- ------------------------------------------------------------
--  Drop order (reverse FK dependency)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS Review;
DROP TABLE IF EXISTS Shipment;
DROP TABLE IF EXISTS Payment;
DROP TABLE IF EXISTS OrderItem;
DROP TABLE IF EXISTS `Order`;
DROP TABLE IF EXISTS CartItem;
DROP TABLE IF EXISTS Cart;
DROP TABLE IF EXISTS Coupon;
DROP TABLE IF EXISTS ProductImage;
DROP TABLE IF EXISTS Product;
DROP TABLE IF EXISTS Brand;
DROP TABLE IF EXISTS Category;
DROP TABLE IF EXISTS Address;
DROP TABLE IF EXISTS `User`;

-- ============================================================
--  1. User
-- ============================================================
CREATE TABLE `User` (
    user_id       INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    username      VARCHAR(50)     NOT NULL,
    email         VARCHAR(255)    NOT NULL,
    password_hash VARCHAR(255)    NOT NULL,
    full_name     VARCHAR(100)    NOT NULL,
    phone         VARCHAR(20)         NULL,
    role          ENUM('customer','admin','staff')
                                  NOT NULL DEFAULT 'customer',
    created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id),
    UNIQUE KEY uq_user_email    (email),
    UNIQUE KEY uq_user_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  2. Address
-- ============================================================
CREATE TABLE Address (
    address_id    INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    user_id       INT UNSIGNED    NOT NULL,
    receiver_name VARCHAR(100)    NOT NULL,
    phone         VARCHAR(20)     NOT NULL,
    province      VARCHAR(100)    NOT NULL,
    district      VARCHAR(100)    NOT NULL,
    ward          VARCHAR(100)    NOT NULL,
    detail        VARCHAR(255)    NOT NULL,
    is_default    TINYINT(1)      NOT NULL DEFAULT 0,

    PRIMARY KEY (address_id),
    KEY idx_address_user (user_id),
    CONSTRAINT fk_address_user
        FOREIGN KEY (user_id) REFERENCES `User` (user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  3. Category  (self-referencing for nested categories)
-- ============================================================
CREATE TABLE Category (
    category_id   INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    name          VARCHAR(100)    NOT NULL,
    description   TEXT                NULL,
    parent_id     INT UNSIGNED        NULL,

    PRIMARY KEY (category_id),
    KEY idx_category_parent (parent_id),
    CONSTRAINT fk_category_parent
        FOREIGN KEY (parent_id) REFERENCES Category (category_id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  4. Brand
-- ============================================================
CREATE TABLE Brand (
    brand_id      INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    name          VARCHAR(100)    NOT NULL,
    description   TEXT                NULL,

    PRIMARY KEY (brand_id),
    UNIQUE KEY uq_brand_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  5. Product
-- ============================================================
CREATE TABLE Product (
    product_id     INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    category_id    INT UNSIGNED        NOT NULL,
    brand_id       INT UNSIGNED        NOT NULL,
    name           VARCHAR(255)        NOT NULL,
    description    TEXT                    NULL,
    price          DECIMAL(15, 0)      NOT NULL,  -- VNĐ, no decimals needed
    stock_quantity INT UNSIGNED        NOT NULL DEFAULT 0,
    status         ENUM('active','inactive','out_of_stock')
                                       NOT NULL DEFAULT 'active',
    created_at     DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (product_id),
    KEY idx_product_category (category_id),
    KEY idx_product_brand    (brand_id),
    KEY idx_product_status   (status),
    FULLTEXT KEY ft_product_name_desc (name, description),
    CONSTRAINT fk_product_category
        FOREIGN KEY (category_id) REFERENCES Category (category_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_product_brand
        FOREIGN KEY (brand_id) REFERENCES Brand (brand_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  6. ProductImage
-- ============================================================
CREATE TABLE ProductImage (
    image_id      INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    product_id    INT UNSIGNED    NOT NULL,
    image_url     VARCHAR(500)    NOT NULL,
    sort_order    SMALLINT        NOT NULL DEFAULT 0,

    PRIMARY KEY (image_id),
    KEY idx_productimage_product (product_id),
    CONSTRAINT fk_productimage_product
        FOREIGN KEY (product_id) REFERENCES Product (product_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  7. Coupon
-- ============================================================
CREATE TABLE Coupon (
    coupon_id      INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    code           VARCHAR(50)     NOT NULL,
    discount_type  ENUM('percent','fixed')
                                   NOT NULL,
    discount_value DECIMAL(15, 2)  NOT NULL,
    min_order_amount DECIMAL(15, 0)    NULL,   -- áp dụng từ giá trị đơn tối thiểu
    start_date     DATE            NOT NULL,
    end_date       DATE            NOT NULL,
    quantity       INT UNSIGNED    NOT NULL DEFAULT 1,
    used_count     INT UNSIGNED    NOT NULL DEFAULT 0,
    status         ENUM('active','inactive','expired')
                                   NOT NULL DEFAULT 'active',

    PRIMARY KEY (coupon_id),
    UNIQUE KEY uq_coupon_code (code),
    KEY idx_coupon_status (status),
    CONSTRAINT chk_coupon_dates CHECK (end_date >= start_date),
    CONSTRAINT chk_coupon_value CHECK (discount_value > 0),
    CONSTRAINT chk_coupon_percent CHECK (
        discount_type != 'percent' OR discount_value <= 100
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  8. Cart
-- ============================================================
CREATE TABLE Cart (
    cart_id       INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    user_id       INT UNSIGNED    NOT NULL,
    created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (cart_id),
    UNIQUE KEY uq_cart_user (user_id),          -- 1 user : 1 cart
    CONSTRAINT fk_cart_user
        FOREIGN KEY (user_id) REFERENCES `User` (user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  9. CartItem
-- ============================================================
CREATE TABLE CartItem (
    cart_item_id  INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    cart_id       INT UNSIGNED    NOT NULL,
    product_id    INT UNSIGNED    NOT NULL,
    quantity      SMALLINT UNSIGNED NOT NULL DEFAULT 1,

    PRIMARY KEY (cart_item_id),
    UNIQUE KEY uq_cartitem (cart_id, product_id),  -- no duplicate rows
    KEY idx_cartitem_product (product_id),
    CONSTRAINT fk_cartitem_cart
        FOREIGN KEY (cart_id) REFERENCES Cart (cart_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_cartitem_product
        FOREIGN KEY (product_id) REFERENCES Product (product_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_cartitem_qty CHECK (quantity > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  10. Order
-- ============================================================
CREATE TABLE `Order` (
    order_id       INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    user_id        INT UNSIGNED    NOT NULL,
    address_id     INT UNSIGNED    NOT NULL,
    coupon_id      INT UNSIGNED        NULL,
    order_date     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    subtotal       DECIMAL(15, 0)  NOT NULL,   -- before discount
    discount_amount DECIMAL(15, 0) NOT NULL DEFAULT 0,
    shipping_fee   DECIMAL(15, 0)  NOT NULL DEFAULT 0,
    total_amount   DECIMAL(15, 0)  NOT NULL,   -- final charged amount
    status         ENUM(
                       'pending',      -- chờ xác nhận
                       'confirmed',    -- đã xác nhận
                       'processing',   -- đang xử lý
                       'shipping',     -- đang giao
                       'delivered',    -- đã giao
                       'cancelled',    -- đã hủy
                       'refunded'      -- đã hoàn tiền
                   )               NOT NULL DEFAULT 'pending',
    note           TEXT                NULL,

    PRIMARY KEY (order_id),
    KEY idx_order_user      (user_id),
    KEY idx_order_status    (status),
    KEY idx_order_date      (order_date),
    KEY idx_order_coupon    (coupon_id),
    CONSTRAINT fk_order_user
        FOREIGN KEY (user_id) REFERENCES `User` (user_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_order_address
        FOREIGN KEY (address_id) REFERENCES Address (address_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_order_coupon
        FOREIGN KEY (coupon_id) REFERENCES Coupon (coupon_id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  11. OrderItem
-- ============================================================
CREATE TABLE OrderItem (
    order_item_id  INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    order_id       INT UNSIGNED    NOT NULL,
    product_id     INT UNSIGNED    NOT NULL,
    quantity       SMALLINT UNSIGNED NOT NULL,
    unit_price     DECIMAL(15, 0)  NOT NULL,   -- snapshot giá lúc đặt
    subtotal       DECIMAL(15, 0)  NOT NULL,   -- quantity * unit_price

    PRIMARY KEY (order_item_id),
    KEY idx_orderitem_order   (order_id),
    KEY idx_orderitem_product (product_id),
    CONSTRAINT fk_orderitem_order
        FOREIGN KEY (order_id) REFERENCES `Order` (order_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_orderitem_product
        FOREIGN KEY (product_id) REFERENCES Product (product_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_orderitem_qty CHECK (quantity > 0),
    CONSTRAINT chk_orderitem_price CHECK (unit_price >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  12. Payment
-- ============================================================
CREATE TABLE Payment (
    payment_id    INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    order_id      INT UNSIGNED    NOT NULL,
    method        ENUM('cod','bank_transfer','e_wallet','credit_card')
                                  NOT NULL,
    amount        DECIMAL(15, 0)  NOT NULL,
    status        ENUM('pending','paid','failed','refunded')
                                  NOT NULL DEFAULT 'pending',
    transaction_ref VARCHAR(100)      NULL,   -- mã giao dịch từ cổng TT
    paid_at       DATETIME            NULL,

    PRIMARY KEY (payment_id),
    KEY idx_payment_order  (order_id),
    KEY idx_payment_status (status),
    CONSTRAINT fk_payment_order
        FOREIGN KEY (order_id) REFERENCES `Order` (order_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  13. Shipment
-- ============================================================
CREATE TABLE Shipment (
    shipment_id    INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    order_id       INT UNSIGNED    NOT NULL,
    tracking_code  VARCHAR(100)        NULL,
    carrier        VARCHAR(100)        NULL,   -- GHN, GHTK, VNPost…
    status         ENUM(
                       'preparing',
                       'picked_up',
                       'in_transit',
                       'delivered',
                       'failed',
                       'returned'
                   )               NOT NULL DEFAULT 'preparing',
    shipped_at     DATETIME            NULL,
    delivered_at   DATETIME            NULL,

    PRIMARY KEY (shipment_id),
    UNIQUE KEY uq_shipment_order (order_id),   -- 1 order : 1 shipment (đồ án)
    KEY idx_shipment_status (status),
    CONSTRAINT fk_shipment_order
        FOREIGN KEY (order_id) REFERENCES `Order` (order_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  14. Review
-- ============================================================
CREATE TABLE Review (
    review_id     INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    user_id       INT UNSIGNED    NOT NULL,
    product_id    INT UNSIGNED    NOT NULL,
    rating        TINYINT UNSIGNED NOT NULL,
    comment       TEXT                NULL,
    created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (review_id),
    UNIQUE KEY uq_review_user_product (user_id, product_id),  -- 1 review / sản phẩm
    KEY idx_review_product (product_id),
    CONSTRAINT fk_review_user
        FOREIGN KEY (user_id) REFERENCES `User` (user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_review_product
        FOREIGN KEY (product_id) REFERENCES Product (product_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_review_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  Useful views
-- ============================================================

-- Tồn kho theo sản phẩm (dùng cho trang quản trị)
CREATE OR REPLACE VIEW vw_product_stock AS
SELECT
    p.product_id,
    p.name,
    p.price,
    p.stock_quantity,
    p.status,
    c.name   AS category_name,
    b.name   AS brand_name
FROM Product p
JOIN Category c USING (category_id)
JOIN Brand    b USING (brand_id);

-- Doanh thu theo đơn hàng hoàn thành
CREATE OR REPLACE VIEW vw_revenue AS
SELECT
    DATE(o.order_date)  AS order_day,
    COUNT(*)            AS total_orders,
    SUM(o.total_amount) AS revenue
FROM `Order` o
WHERE o.status = 'delivered'
GROUP BY DATE(o.order_date);

-- Đánh giá trung bình từng sản phẩm
CREATE OR REPLACE VIEW vw_product_rating AS
SELECT
    product_id,
    COUNT(*)              AS review_count,
    ROUND(AVG(rating), 1) AS avg_rating
FROM Review
GROUP BY product_id;

-- ============================================================
--  END OF SCHEMA
-- ============================================================
