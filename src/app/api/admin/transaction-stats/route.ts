import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get transaction statistics
    const [
      totalTransactions,
      completedTransactions,
      pendingTransactions,
      totalRevenue,
      totalDisbursed,
      pendingWithdrawals
    ] = await Promise.all([
      prisma.transaction.count(),
      prisma.transaction.count({ where: { status: 'COMPLETED' } }),
      prisma.transaction.count({ where: { status: 'PENDING' } }),
      prisma.transaction.aggregate({
        where: { type: 'FEE', status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: { type: 'DISBURSEMENT', status: 'COMPLETED' },
        _sum: { netAmount: true }
      }),
      prisma.transaction.aggregate({
        where: { type: 'DISBURSEMENT', status: 'PENDING' },
        _sum: { netAmount: true }
      })
    ]);

    return NextResponse.json({
      totalTransactions,
      completedTransactions,
      pendingTransactions,
      totalRevenue: totalRevenue._sum.amount || 0,
      totalDisbursed: totalDisbursed._sum.netAmount || 0,
      pendingWithdrawals: pendingWithdrawals._sum.netAmount || 0,
    });
  } catch (error: any) {
    console.error('Stats fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
