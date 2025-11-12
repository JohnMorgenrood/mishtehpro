'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Download,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  FileText
} from 'lucide-react';

interface Transaction {
  id: string;
  type: string;
  status: string;
  amount: number;
  feeAmount: number;
  netAmount: number;
  donorName: string | null;
  recipientName: string | null;
  requestTitle: string | null;
  paymentId: string | null;
  createdAt: string;
}

interface Stats {
  totalTransactions: number;
  completedTransactions: number;
  pendingTransactions: number;
  totalRevenue: number;
  totalDisbursed: number;
  pendingWithdrawals: number;
}

export default function AdminAccountsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (session?.user?.userType !== 'ADMIN') {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session?.user?.userType === 'ADMIN') {
      fetchData();
    }
  }, [session, statusFilter, typeFilter, startDate, endDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('type', typeFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const [transactionsRes, statsRes] = await Promise.all([
        fetch(`/api/admin/transactions?${params}`),
        fetch('/api/admin/transaction-stats')
      ]);

      if (transactionsRes.ok) {
        const data = await transactionsRes.json();
        setTransactions(data);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Donor', 'Recipient', 'Amount', 'Fee', 'Net', 'Status', 'Payment ID'];
    const rows = filteredTransactions.map(t => [
      new Date(t.createdAt).toLocaleDateString(),
      t.type,
      t.donorName || '-',
      t.recipientName || '-',
      `R${t.amount.toFixed(2)}`,
      `R${t.feeAmount.toFixed(2)}`,
      `R${t.netAmount.toFixed(2)}`,
      t.status,
      t.paymentId || '-'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredTransactions = transactions.filter(t =>
    (t.donorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     t.recipientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     t.requestTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     t.paymentId?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading accounts...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.userType !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Accounts & Transactions</h1>
          <p className="text-gray-600">Manage payments, fees, and disbursements</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-soft-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-blue-600">Total</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {stats.totalTransactions}
              </h3>
              <p className="text-gray-600 text-sm">Transactions</p>
            </div>

            <div className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-soft-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-50 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-sm font-semibold text-green-600">Revenue</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                R{stats.totalRevenue.toFixed(2)}
              </h3>
              <p className="text-gray-600 text-sm">Total Fees Collected</p>
            </div>

            <div className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-soft-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-50 rounded-xl">
                  <TrendingDown className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-sm font-semibold text-purple-600">Disbursed</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                R{stats.totalDisbursed.toFixed(2)}
              </h3>
              <p className="text-gray-600 text-sm">To Recipients</p>
            </div>

            <div className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-soft-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-50 rounded-xl">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <span className="text-sm font-semibold text-yellow-600">Pending</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                R{stats.pendingWithdrawals.toFixed(2)}
              </h3>
              <p className="text-gray-600 text-sm">Awaiting Approval</p>
            </div>

            <div className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-soft-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-50 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-sm font-semibold text-green-600">Completed</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {stats.completedTransactions}
              </h3>
              <p className="text-gray-600 text-sm">Successful</p>
            </div>

            <div className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-soft-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-50 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-sm font-semibold text-orange-600">Pending</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {stats.pendingTransactions}
              </h3>
              <p className="text-gray-600 text-sm">Awaiting Action</p>
            </div>
          </div>
        )}

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl shadow-soft p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Name, request, or payment ID..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="DONATION">Donation</option>
                <option value="DISBURSEMENT">Disbursement</option>
                <option value="REFUND">Refund</option>
                <option value="FEE">Fee</option>
              </select>
            </div>

            {/* Export Button */}
            <div className="flex items-end">
              <button
                onClick={exportToCSV}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-xl hover:scale-105 transition-all"
              >
                <Download className="w-5 h-5" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Donor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Recipient
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Fee
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Net
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          transaction.type === 'DONATION' ? 'bg-green-50 text-green-700' :
                          transaction.type === 'DISBURSEMENT' ? 'bg-blue-50 text-blue-700' :
                          transaction.type === 'REFUND' ? 'bg-yellow-50 text-yellow-700' :
                          'bg-purple-50 text-purple-700'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.donorName || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.recipientName || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-right text-gray-900">
                        R{transaction.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                        R{transaction.feeAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-right text-gray-900">
                        R{transaction.netAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${
                          transaction.status === 'COMPLETED' ? 'bg-green-50 text-green-700' :
                          transaction.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700' :
                          transaction.status === 'FAILED' ? 'bg-red-50 text-red-700' :
                          'bg-gray-50 text-gray-700'
                        }`}>
                          {transaction.status === 'COMPLETED' && <CheckCircle className="w-3 h-3" />}
                          {transaction.status === 'FAILED' && <XCircle className="w-3 h-3" />}
                          {transaction.status === 'PENDING' && <Clock className="w-3 h-3" />}
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/admin/transactions/${transaction.id}`}
                          className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-semibold"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
