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
import { getCustomersData } from "@/lib/api";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
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

// Colors for pie chart
const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(var(--muted))",
];

export default function CustomersPage() {
  const [customersData, setCustomersData] = useState<{
    customers: any[];
    pagination: { total: number; page: number; limit: number; pages: number };
  }>({
    customers: [],
    pagination: { total: 0, page: 1, limit: 10, pages: 0 },
  });
  const [customerInsights, setCustomerInsights] = useState({
    customersByType: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function loadCustomersData() {
      try {
        setIsLoading(true);
        const data = await getCustomersData(currentPage);
        setCustomersData(data);

        // Create customer insights from the data
        const typeCount = data.customers.reduce((acc: any, customer: any) => {
          const type = customer.customerType;
          if (!acc[type]) {
            acc[type] = { name: type, value: 0 };
          }
          acc[type].value += 1;
          return acc;
        }, {});

        setCustomerInsights({
          customersByType: Object.values(typeCount),
        });

        setError(null);
      } catch (err) {
        console.error("Failed to load customers data:", err);
        setError("Failed to load customers data.");
      } finally {
        setIsLoading(false);
      }
    }

    loadCustomersData();
  }, [currentPage]);

  // Filter customers data based on search term
  const filteredCustomers =
    customersData.customers?.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.phone &&
          customer.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (customer.customerType &&
          customer.customerType
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        customer._id.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  // Function to export customers data as CSV
  const exportCustomersData = () => {
    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Type",
      "Join Date",
      "Address",
    ];
    const csvData = [
      headers.join(","),
      ...filteredCustomers.map((customer) =>
        [
          customer._id,
          customer.name,
          customer.email,
          customer.phone || "N/A",
          customer.customerType,
          new Date(customer.joinDate).toLocaleDateString(),
          customer.address
            ? `"${customer.address.street}, ${customer.address.city}, ${customer.address.state} ${customer.address.zipCode}, ${customer.address.country}"`
            : "N/A",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customers_data.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">
          View and manage your customer data
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
          <CardTitle>Customers by Type</CardTitle>
          <CardDescription>Distribution of customers by type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={customerInsights.customersByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {customerInsights.customersByType.map(
                    (entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    )
                  )}
                </Pie>
                <Tooltip formatter={(value) => [value, "Customers"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
          <CardDescription>A list of all your customers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search customers..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={exportCustomersData}>
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
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Loading customers data...
                    </TableCell>
                  </TableRow>
                ) : filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer._id}>
                      <TableCell className="font-medium">
                        {customer._id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone || "N/A"}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            customer.customerType === "Premium"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
                              : customer.customerType === "Business"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
                          }`}
                        >
                          {customer.customerType}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(customer.joinDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {customer.address
                          ? `${customer.address.city}, ${customer.address.state}`
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No customers found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {customersData.pagination && customersData.pagination.pages > 1 && (
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
                    { length: Math.min(5, customersData.pagination.pages) },
                    (_, i) => {
                      let pageToShow = currentPage - 2 + i;
                      if (currentPage < 3) {
                        pageToShow = i + 1;
                      } else if (
                        currentPage >
                        customersData.pagination.pages - 2
                      ) {
                        pageToShow = customersData.pagination.pages - 4 + i;
                      }

                      if (
                        pageToShow > 0 &&
                        pageToShow <= customersData.pagination.pages
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
                          Math.min(prev + 1, customersData.pagination.pages)
                        )
                      }
                      className={`${
                        currentPage === customersData.pagination.pages
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
