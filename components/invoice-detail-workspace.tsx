"use client"

import { ArrowLeft, Download, CreditCard, AlertCircle, CheckCircle2, Clock, Building2 } from "lucide-react"
import type { Invoice } from "@/types/workspace"

interface InvoiceDetailWorkspaceProps {
  invoice: Invoice
  onBack: () => void
}

export function InvoiceDetailWorkspace({ invoice, onBack }: InvoiceDetailWorkspaceProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const getStatusBadge = (status: Invoice["status"]) => {
    const config = {
      paid: {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-700 dark:text-green-400",
        icon: CheckCircle2,
        label: "Paid",
      },
      pending: {
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        text: "text-yellow-700 dark:text-yellow-400",
        icon: Clock,
        label: "Pending",
      },
      overdue: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-700 dark:text-red-400",
        icon: AlertCircle,
        label: "Overdue",
      },
    }

    const { bg, text, icon: Icon, label } = config[status]

    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${bg}`}>
        <Icon className={`w-5 h-5 ${text}`} />
        <span className={`text-sm font-medium ${text}`}>{label}</span>
      </div>
    )
  }

  const handleDownload = () => {
    console.log("[v0] Downloading invoice:", invoice.invoiceNumber)
    // Download logic would go here
  }

  const handlePayNow = () => {
    console.log("[v0] Processing payment for:", invoice.invoiceNumber)
    // Payment logic would go here
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border px-6 py-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label="Back to billing"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-semibold">{invoice.invoiceNumber}</h2>
              <p className="text-sm text-muted-foreground">{invoice.period}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(invoice.status)}
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Download PDF</span>
            </button>
            {invoice.status !== "paid" && (
              <button
                onClick={handlePayNow}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#A16AE8] text-white hover:bg-[#8F4FD1] transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                <span className="text-sm font-medium">Pay Now</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="px-6 py-8 max-w-5xl mx-auto">
        {/* Invoice Header Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-border">
          {/* Contact Information */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Contact</p>
                <p className="font-semibold text-foreground">{invoice.contact?.name}</p>
                {invoice.contact?.accountNumber && (
                  <p className="text-sm text-muted-foreground">Account #: {invoice.contact.accountNumber}</p>
                )}
                {invoice.contact?.address && (
                  <p className="text-sm text-muted-foreground mt-1">{invoice.contact.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Issue date</p>
                <p className="font-medium text-foreground">{formatDate(invoice.date)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Due date</p>
                <p className="font-medium text-foreground">{formatDate(invoice.dueDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Invoice number</p>
                <p className="font-medium text-foreground">{invoice.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Reference</p>
                <p className="font-medium text-foreground">{invoice.reference || "-"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">{invoice.description}</h3>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Description</th>
                  <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3">Qty</th>
                  <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3">Price</th>
                  <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3">Disc.</th>
                  <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3">Account</th>
                  <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3">Tax rate</th>
                  <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3">Tax amount</th>
                  <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3 min-w-[120px]">
                    Amount AUD
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems && invoice.lineItems.length > 0 ? (
                  invoice.lineItems.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                      <td className="px-4 py-4">
                        <div className="text-sm text-foreground whitespace-pre-line">{item.description}</div>
                      </td>
                      <td className="text-center px-4 py-4 text-sm text-foreground">{item.quantity.toFixed(4)}</td>
                      <td className="text-center px-4 py-4 text-sm text-foreground">{item.price.toFixed(2)}</td>
                      <td className="text-center px-4 py-4 text-sm text-foreground">{item.discount}%</td>
                      <td className="text-center px-4 py-4 text-sm text-foreground">{item.account}</td>
                      <td className="text-center px-4 py-4 text-sm text-foreground">{item.taxRate}</td>
                      <td className="text-center px-4 py-4 text-sm text-foreground">{item.taxAmount.toFixed(2)}</td>
                      <td className="text-center px-4 py-4 text-sm font-medium text-foreground">
                        {item.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No line items available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="flex justify-end">
          <div className="w-full max-w-sm space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-sm font-medium text-foreground">
                {formatCurrency(invoice.subtotal || invoice.amount)}
              </span>
            </div>
            {invoice.tax !== undefined && (
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">{invoice.taxRate || "Tax"}</span>
                <span className="text-sm font-medium text-foreground">{formatCurrency(invoice.tax)}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-3 bg-muted/50 px-4 rounded-lg">
              <span className="text-lg font-semibold text-foreground">Total</span>
              <span className="text-2xl font-bold text-foreground">{formatCurrency(invoice.amount)}</span>
            </div>
          </div>
        </div>

        {/* Overdue Warning */}
        {invoice.status === "overdue" && (
          <div className="mt-8 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Payment Overdue</p>
              <p className="text-sm text-red-600 dark:text-red-400">
                This invoice is overdue. Please make payment as soon as possible to avoid service interruption.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
