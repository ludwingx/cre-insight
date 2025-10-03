import { prisma } from '@/lib/prisma'

export async function getDashboardMetrics() {
  try {
    // Obtener métricas de productos
    const totalProducts = await prisma.product.count()
    
    // Productos con stock bajo (stock menor o igual a minStock)
    const lowStockProducts = await prisma.product.count({
      where: {
        stock: {
          lte: 5 // Por ahora usamos 5 como límite fijo, luego se puede hacer dinámico
        }
      }
    })
    const outOfStockProducts = await prisma.product.count({
      where: {
        stock: 0
      }
    })

    // Calcular valor total del inventario
    const inventoryValue = await prisma.product.aggregate({
      _sum: {
        stock: true
      },
      _avg: {
        priceRetail: true
      }
    })

    const totalInventoryValue = (inventoryValue._sum.stock || 0) * (inventoryValue._avg.priceRetail || 0)

    // Obtener ventas del mes actual
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const monthlySales = await prisma.sale.aggregate({
      where: {
        createdAt: {
          gte: currentMonth
        }
      },
      _sum: {
        totalPrice: true,
        quantity: true
      },
      _count: true
    })

    // Obtener compras del mes actual
    const monthlyPurchases = await prisma.purchase.aggregate({
      where: {
        createdAt: {
          gte: currentMonth
        }
      },
      _sum: {
        totalPrice: true,
        quantity: true
      },
      _count: true
    })

    return {
      inventory: {
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        totalValue: totalInventoryValue
      },
      sales: {
        monthlyRevenue: monthlySales._sum.totalPrice || 0,
        monthlyQuantity: monthlySales._sum.quantity || 0,
        monthlyTransactions: monthlySales._count || 0
      },
      purchases: {
        monthlySpent: monthlyPurchases._sum.totalPrice || 0,
        monthlyQuantity: monthlyPurchases._sum.quantity || 0,
        monthlyOrders: monthlyPurchases._count || 0
      }
    }
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error)
    return {
      inventory: {
        totalProducts: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0,
        totalValue: 0
      },
      sales: {
        monthlyRevenue: 0,
        monthlyQuantity: 0,
        monthlyTransactions: 0
      },
      purchases: {
        monthlySpent: 0,
        monthlyQuantity: 0,
        monthlyOrders: 0
      }
    }
  }
}

export async function getRecentActivity() {
  try {
    // Obtener movimientos recientes de inventario
    const recentMovements = await prisma.inventoryMovement.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        product: {
          select: {
            name: true,
            phoneModel: { select: { name: true } },
            color: true
          }
        },
        user: {
          select: {
            name: true
          }
        }
      }
    })

    // Obtener ventas recientes
    const recentSales = await prisma.sale.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        product: {
          select: {
            name: true,
            phoneModel: { select: { name: true } },
            color: true
          }
        }
      }
    })

    // Formatear datos para el dashboard
    const formattedActivity = [
      ...recentMovements.map(movement => ({
        id: movement.id,
        title: `${movement.type === 'entrada' ? 'Entrada' : 'Salida'} de stock`,
        description: `${movement.product.name} ${movement.product.phoneModel?.name || ''} - ${Math.abs(movement.quantity)} unidades`,
        timestamp: movement.createdAt.toLocaleDateString('es-ES', { 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        type: movement.type
      })),
      ...recentSales.map(sale => ({
        id: sale.id,
        title: 'Venta realizada',
        description: `${sale.product.name} ${sale.product.phoneModel?.name || ''} - ${sale.quantity} unidades`,
        timestamp: sale.createdAt.toLocaleDateString('es-ES', { 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        type: 'venta'
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8)

    return formattedActivity
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return []
  }
}

export async function getTopProducts() {
  try {
    // Si no hay ventas, devolver productos con más stock
    const salesCount = await prisma.sale.count()
    
    if (salesCount === 0) {
      // Devolver productos con más stock si no hay ventas
      const products = await prisma.product.findMany({
        take: 5,
        orderBy: {
          stock: 'desc'
        },
        select: {
          id: true,
          name: true,
          phoneModel: { select: { name: true } },
          color: true,
          stock: true,
          priceRetail: true
        }
      })
      
      return products.map(product => ({
        ...product,
        totalSold: 0,
        salesCount: 0
      }))
    }

    // Productos más vendidos
    const topSelling = await prisma.sale.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true
      },
      _count: true,
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5
    })

    // Obtener detalles de los productos
    const productIds = topSelling.map(item => item.productId)
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds
        }
      },
      select: {
        id: true,
        name: true,
        phoneModel: { select: { name: true } },
        color: true,
        stock: true,
        priceRetail: true
      }
    })

    // Combinar datos
    const topProducts = topSelling.map(sale => {
      const product = products.find(p => p.id === sale.productId)
      return {
        ...product,
        totalSold: sale._sum.quantity || 0,
        salesCount: sale._count
      }
    })

    return topProducts
  } catch (error) {
    console.error('Error fetching top products:', error)
    return []
  }
}
