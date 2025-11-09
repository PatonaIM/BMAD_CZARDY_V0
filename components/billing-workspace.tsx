"use client"

import { useState } from "react"
import { Download, FileText, AlertCircle, CheckCircle2, Clock, Eye } from "lucide-react"
import type { BillingData, Invoice } from "@/types/workspace"

interface BillingWorkspaceProps {
  data?: BillingData
  onViewInvoice?: (invoice: Invoice) => void // Added callback for viewing invoice details
}

export function BillingWorkspace({ data, onViewInvoice }: BillingWorkspaceProps) {
  const [selectedStatus, setSelectedStatus] = useState<"all" | "paid" | "pending" | "overdue">("all")

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Billing Data Available</h3>
          <p className="text-muted-foreground">
            Your billing information will appear here once you have an active subscription.
          </p>
        </div>
      </div>
    )
  }

  const sortedInvoices = [...data.invoices].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  const filteredInvoices =
    selectedStatus === "all" ? sortedInvoices : sortedInvoices.filter((inv) => inv.status === selectedStatus)

  const getStatusIcon = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />
      case "overdue":
        return <AlertCircle className="w-5 h-5 text-red-500" />
    }
  }

  const getStatusBadge = (status: Invoice["status"]) => {
    const styles = {
      paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      overdue: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    }

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const handleDownloadInvoice = (invoice: Invoice) => {
    console.log("[v0] Downloading invoice:", invoice.invoiceNumber)
    // Download logic would go here
  }

  const handleViewReceipt = (invoice: Invoice) => {
    console.log("[v0] Viewing receipt for:", invoice.invoiceNumber)
    // View receipt logic would go here
  }

  const handleInvoiceClick = (invoice: Invoice) => {
    console.log("[v0] Opening invoice detail:", invoice.invoiceNumber)
    onViewInvoice?.(invoice)
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Summary Cards */}
      <div className="px-6 py-6 border-b border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Overdue */}
          <div className="bg-red-500/10 dark:bg-red-500/10 border border-red-500/30 dark:border-red-500/30 rounded-lg p-4">
            <div className="flex justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Total Overdue</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(data.totalOverdue)}</p>
                {data.totalOverdue > 0 && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">Payment required immediately</p>
                )}
              </div>
              <div className="flex items-center">
                <AlertCircle className="w-10 h-10 text-red-500 opacity-50" />
              </div>
            </div>
          </div>

          {/* Next Payment Due */}
          <div className="bg-yellow-500/10 dark:bg-yellow-500/10 border border-yellow-500/30 dark:border-yellow-500/30 rounded-lg p-4">
            <div className="flex justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Next Payment Due</p>
                {data.nextPaymentDue ? (
                  <>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {formatCurrency(data.nextPaymentDue.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Due {formatDate(data.nextPaymentDue.dueDate)}</p>
                  </>
                ) : (
                  <p className="text-lg text-muted-foreground">All paid up!</p>
                )}
              </div>
              <div className="flex items-center">
                <Clock className="w-10 h-10 text-yellow-500 opacity-50" />
              </div>
            </div>
          </div>

          {/* Total Paid This Year */}
          <div className="bg-green-500/10 dark:bg-green-500/10 border border-green-500/30 dark:border-green-500/30 rounded-lg p-4">
            <div className="flex justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Total Paid This Year</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(
                    sortedInvoices.filter((inv) => inv.status === "paid").reduce((sum, inv) => sum + inv.amount, 0),
                  )}
                </p>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="w-10 h-10 text-green-500 opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedStatus("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === "all" ? "bg-[#A16AE8] text-white" : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            All Invoices ({sortedInvoices.length})
          </button>
          <button
            onClick={() => setSelectedStatus("paid")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === "paid" ? "bg-green-500 text-white" : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            Paid ({sortedInvoices.filter((inv) => inv.status === "paid").length})
          </button>
          <button
            onClick={() => setSelectedStatus("pending")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === "pending"
                ? "bg-yellow-500 text-white"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            Pending ({sortedInvoices.filter((inv) => inv.status === "pending").length})
          </button>
          <button
            onClick={() => setSelectedStatus("overdue")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === "overdue"
                ? "bg-red-500 text-white"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            Overdue ({sortedInvoices.filter((inv) => inv.status === "overdue").length})
          </button>
        </div>
      </div>

      {/* Invoices List */}
      <div className="px-6 py-4">
        <div className="space-y-3">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No invoices found for this filter</p>
            </div>
          ) : (
            filteredInvoices.map((invoice) => (
              <div
                key={invoice.id}
                onClick={() => handleInvoiceClick(invoice)}
                className="border border-border rounded-lg p-5 hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">{getStatusIcon(invoice.status)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">{invoice.invoiceNumber}</h3>
                        {getStatusBadge(invoice.status)}
                      </div>
                      <p className="text-sm text-foreground mb-1">{invoice.description}</p>
                      <p className="text-xs text-muted-foreground mb-2">{invoice.period}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Issued: {formatDate(invoice.date)}</span>
                        <span>•</span>
                        <span>Due: {formatDate(invoice.dueDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-foreground">{formatCurrency(invoice.amount)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {invoice.receiptUrl && invoice.status === "paid" && (
                        <button
                          onClick={() => handleViewReceipt(invoice)}
                          className="p-2 rounded-lg border border-border hover:bg-accent transition-colors"
                          aria-label="View receipt"
                          title="View Receipt"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDownloadInvoice(invoice)}
                        className="p-2 rounded-lg border border-border hover:bg-accent transition-colors"
                        aria-label="Download invoice"
                        title="Download Invoice"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Overdue Warning */}
                {invoice.status === "overdue" && (
                  <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-600 dark:text-red-400">
                      This invoice is overdue. Please make payment as soon as possible to avoid service interruption.
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
