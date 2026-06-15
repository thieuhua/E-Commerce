const router   = require('express').Router()
const { sequelize } = require('../../config/database')
const { verifyToken, requireRole } = require('../../middlewares/auth')
const { asyncHandler } = require('../../utils/apiError')
const { success } = require('../../utils/apiResponse')
const { Order }   = require('../order/order.model')
const { Product } = require('../product/product.model')
const User        = require('../auth/user.model')
const Payment     = require('../payment/payment.model')
const { Op }      = require('sequelize')

router.use(verifyToken, requireRole('admin', 'staff'))

router.get('/stats', asyncHandler(async (req, res) => {
  const now          = new Date()
  const startOfDay   = new Date(now); startOfDay.setHours(0,0,0,0)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLast  = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLast    = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  const [
    totalOrders, todayOrders, pendingOrders,
    totalUsers, newUsersThisMonth,
    totalProducts, lowStockProducts,
    revenueThisMonth, revenueLastMonth, revenueToday,
    ordersByStatus, recentOrders,
  ] = await Promise.all([
    Order.count(),
    Order.count({ where: { order_date: { [Op.gte]: startOfDay } } }),
    Order.count({ where: { status: 'pending' } }),
    User.count({ where: { role: 'customer' } }),
    User.count({ where: { role: 'customer', created_at: { [Op.gte]: startOfMonth } } }),
    Product.count(),
    Product.count({ where: { stock_quantity: { [Op.lte]: 5 }, status: 'active' } }),
    Payment.sum('amount', { where: { status: 'paid', paid_at: { [Op.gte]: startOfMonth } } }),
    Payment.sum('amount', { where: { status: 'paid', paid_at: { [Op.between]: [startOfLast, endOfLast] } } }),
    Payment.sum('amount', { where: { status: 'paid', paid_at: { [Op.gte]: startOfDay } } }),
    Order.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('order_id')), 'count']],
      group: ['status'], raw: true,
    }),
    Order.findAll({
      limit: 8, order: [['order_date', 'DESC']],
      attributes: ['order_id', 'user_id', 'total_amount', 'status', 'order_date'],
      include: [{ model: User, attributes: ['full_name', 'email'] }],
    }),
  ])

  const last7Days = await Promise.all(
    Array.from({ length: 7 }).map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      const start = new Date(d); start.setHours(0,0,0,0)
      const end   = new Date(d); end.setHours(23,59,59,999)
      return Payment.sum('amount', { where: { status: 'paid', paid_at: { [Op.between]: [start, end] } } })
        .then(v => ({
          date: start.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
          revenue: Number(v) || 0,
        }))
    })
  )

  const revenueGrowth = Number(revenueLastMonth)
    ? (((Number(revenueThisMonth) - Number(revenueLastMonth)) / Number(revenueLastMonth)) * 100).toFixed(1)
    : null

  success(res, {
    orders:  { total: totalOrders, today: todayOrders, pending: pendingOrders,
               byStatus: Object.fromEntries(ordersByStatus.map(r => [r.status, Number(r.count)])) },
    users:    { total: totalUsers, newThisMonth: newUsersThisMonth },
    products: { total: totalProducts, lowStock: lowStockProducts },
    revenue:  { today: Number(revenueToday)||0, thisMonth: Number(revenueThisMonth)||0,
                lastMonth: Number(revenueLastMonth)||0, growth: revenueGrowth, last7Days },
    recentOrders,
  })
}))

module.exports = router
