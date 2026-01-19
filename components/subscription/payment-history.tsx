// components/subscription/payment-history.tsx

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Loader2, Receipt } from "lucide-react";

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  invoicePdf: string | null;
  hostedInvoiceUrl: string | null;
  periodStart: number;
  periodEnd: number;
}

export function PaymentHistory() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch("/api/subscription/invoices");
      const data = await response.json();
      setInvoices(data.invoices || []);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      paid: "default",
      open: "secondary",
      void: "destructive",
      uncollectible: "destructive",
    };
    return variants[status] || "secondary";
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground mt-4">
            Loading payment history...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No payment history yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Payment History
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="text-left p-4 font-semibold">Date</th>
                <th className="text-left p-4 font-semibold">Period</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-right p-4 font-semibold">Amount</th>
                <th className="text-right p-4 font-semibold">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="p-4">
                    <div className="text-sm font-medium">
                      {formatDate(invoice.created)}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-muted-foreground">
                      {formatDate(invoice.periodStart)} -{" "}
                      {formatDate(invoice.periodEnd)}
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={getStatusBadge(invoice.status)}
                      className="capitalize"
                    >
                      {invoice.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-sm font-semibold">
                      {formatAmount(invoice.amount, invoice.currency)}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {invoice.invoicePdf && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={invoice.invoicePdf}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </a>
                        </Button>
                      )}
                      {invoice.hostedInvoiceUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={invoice.hostedInvoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View
                          </a>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
