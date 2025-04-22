"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSalesData } from "@/lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Search, Download, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function SalesPage() {
  const [salesData, setSalesData] = useState<{
    sales: any[];
    pagination: { total: number; page: number; limit: number; pages: number };
  }>({
    sales: [],
    pagination: { total: 0, page: 1, limit: 10, pages: 0 },
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function loadSalesData() {
      try {
        setIsLoading(true);
        const data = await getSalesData(currentPage);
        setSalesData(data);
        setError(null);
      } catch (err) {
        console.error("Failed to load sales data:", err);
        setError("Failed to load sales data.");
      } finally {
        setIsLoading(false);
      }
    }

    loadSalesData();
  }, [currentPage]);

  // Filter sales data based on search term
  const filteredSales =
    salesData.sales?.filter(
      (sale) =>
        sale.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale._id.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  // Function to export sales data as CSV
  const exportSalesData = () => {
    const headers = [
      "ID",
      "Customer",
      "Product",
      "Quantity",
      "Total Price",
      "Date",
      "Region",
      "Payment Method",
      "Status",
    ];
    const csvData = [
      headers.join(","),
      ...filteredSales.map((sale) =>
        [
          sale._id,
          sale.customer.name,
          sale.product.name,
          sale.quantity,
          sale.totalPrice,
          new Date(sale.date).toLocaleDateString(),
          sale.region,
          sale.paymentMethod,
          sale.status,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sales_data.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Group sales by date for the chart
  const salesByDate = salesData.sales?.reduce((acc, sale) => {
    const date = new Date(sale.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    if (!acc[date]) {
      acc[date] = { date, revenue: 0 };
    }
    acc[date].revenue += sale.totalPrice;
    return acc;
  }, {});

  const salesChartData = salesByDate ? Object.values(salesByDate) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
        <p className="text-muted-foreground">View and manage your sales data</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
          <CardDescription>Sales revenue by date</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={salesChartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [
                    `$${Number(value).toFixed(2)}`,
                    "Revenue",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sales Transactions</CardTitle>
          <CardDescription>A list of your sales transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search sales..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={exportSalesData}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="text-right">Total Price</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Loading sales data...
                    </TableCell>
                  </TableRow>
                ) : filteredSales.length > 0 ? (
                  filteredSales.map((sale) => (
                    <TableRow key={sale._id}>
                      <TableCell className="font-medium">
                        {sale._id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>{sale.customer.name}</TableCell>
                      <TableCell>{sale.product.name}</TableCell>
                      <TableCell>{sale.quantity}</TableCell>
                      <TableCell className="text-right">
                        ${sale.totalPrice.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {new Date(sale.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            sale.status === "Completed"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                              : sale.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                          }`}
                        >
                          {sale.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No sales found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {salesData.pagination && salesData.pagination.pages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      className={`${
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }`}
                    />
                  </PaginationItem>

                  {Array.from(
                    { length: Math.min(5, salesData.pagination.pages) },
                    (_, i) => {
                      // Show current page and surrounding pages
                      let pageToShow = currentPage - 2 + i;
                      if (currentPage < 3) {
                        pageToShow = i + 1;
                      } else if (currentPage > salesData.pagination.pages - 2) {
                        pageToShow = salesData.pagination.pages - 4 + i;
                      }

                      // Ensure page is within valid range
                      if (
                        pageToShow > 0 &&
                        pageToShow <= salesData.pagination.pages
                      ) {
                        return (
                          <PaginationItem key={pageToShow}>
                            <PaginationLink
                              isActive={pageToShow === currentPage}
                              onClick={() => setCurrentPage(pageToShow)}
                            >
                              {pageToShow}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                      return null;
                    }
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(prev + 1, salesData.pagination.pages)
                        )
                      }
                      className={`${
                        currentPage === salesData.pagination.pages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
