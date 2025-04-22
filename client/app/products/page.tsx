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
import { getProductsData } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Search, Download, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function ProductsPage() {
  const [productsData, setProductsData] = useState<{
    products: any[];
    pagination: { total: number; page: number; limit: number; pages: number };
  }>({
    products: [],
    pagination: { total: 0, page: 1, limit: 10, pages: 0 },
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function loadProductsData() {
      try {
        setIsLoading(true);
        const data = await getProductsData(currentPage);
        setProductsData(data);
        setError(null);
      } catch (err) {
        console.error("Failed to load products data:", err);
        setError("Failed to load products data.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProductsData();
  }, [currentPage]);

  // Filter products data based on search term
  const filteredProducts =
    productsData.products?.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product._id.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  // Function to export products data as CSV
  const exportProductsData = () => {
    const headers = [
      "ID",
      "Name",
      "Category",
      "Price",
      "Cost",
      "Stock",
      "Description",
      "Status",
    ];
    const csvData = [
      headers.join(","),
      ...filteredProducts.map((product) =>
        [
          product._id,
          product.name,
          product.category,
          product.price,
          product.cost,
          product.stockQuantity,
          `"${product.description.replace(/"/g, '""')}"`, // Escape quotes in description
          product.isActive ? "Active" : "Inactive",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products_data.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Group products by category for the chart
  const productsByCategory = productsData.products?.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = { category: product.category, count: 0 };
    }
    acc[product.category].count += 1;
    return acc;
  }, {});

  const productsByCategoryChart = productsByCategory
    ? Object.values(productsByCategory)
    : [];

  const getStockStatus = (quantity: number) => {
    if (quantity <= 0) return { label: "Out of Stock", variant: "destructive" };
    if (quantity < 10) return { label: "Low Stock", variant: "warning" };
    return { label: "In Stock", variant: "success" };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <p className="text-muted-foreground">
          View and manage your product inventory
        </p>
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
          <CardTitle>Products by Category</CardTitle>
          <CardDescription>
            Distribution of products across categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={productsByCategoryChart}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>
            A list of all products in your inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={exportProductsData}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Loading products data...
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product.stockQuantity);
                    return (
                      <TableRow key={product._id}>
                        <TableCell className="font-medium">
                          {product._id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell className="text-right">
                          ${product.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          ${product.cost.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {product.stockQuantity}
                        </TableCell>
                        <TableCell>
                          <Badge variant={stockStatus.variant as any}>
                            {stockStatus.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No products found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {productsData.pagination && productsData.pagination.pages > 1 && (
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
                    { length: Math.min(5, productsData.pagination.pages) },
                    (_, i) => {
                      let pageToShow = currentPage - 2 + i;
                      if (currentPage < 3) {
                        pageToShow = i + 1;
                      } else if (
                        currentPage >
                        productsData.pagination.pages - 2
                      ) {
                        pageToShow = productsData.pagination.pages - 4 + i;
                      }

                      if (
                        pageToShow > 0 &&
                        pageToShow <= productsData.pagination.pages
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
                          Math.min(prev + 1, productsData.pagination.pages)
                        )
                      }
                      className={`${
                        currentPage === productsData.pagination.pages
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
