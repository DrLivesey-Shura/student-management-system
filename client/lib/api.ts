// Base URL for API requests
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000/api";

// Helper function for API requests
async function fetchAPI(endpoint: string, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}

// Dashboard data
export async function getDashboardSalesOverview() {
  return fetchAPI("/dashboard/sales-overview");
}

export async function getDashboardCustomerInsights() {
  return fetchAPI("/dashboard/customer-insights");
}

// Sales data
export async function getSalesData(page = 1, limit = 10) {
  return fetchAPI(`/sales?page=${page}&limit=${limit}`);
}

export async function getSaleById(id: string) {
  return fetchAPI(`/sales/${id}`);
}

export async function createSale(data: any) {
  return fetchAPI("/sales", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateSale(id: string, data: any) {
  return fetchAPI(`/sales/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteSale(id: string) {
  return fetchAPI(`/sales/${id}`, {
    method: "DELETE",
  });
}

// Products data
export async function getProductsData(page = 1, limit = 10) {
  return fetchAPI(`/products?page=${page}&limit=${limit}`);
}

export async function getProductById(id: string) {
  return fetchAPI(`/products/${id}`);
}

export async function createProduct(data: any) {
  return fetchAPI("/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProduct(id: string, data: any) {
  return fetchAPI(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(id: string) {
  return fetchAPI(`/products/${id}`, {
    method: "DELETE",
  });
}

// Customers data
export async function getCustomersData(page = 1, limit = 10) {
  return fetchAPI(`/customers?page=${page}&limit=${limit}`);
}

export async function getCustomerById(id: string) {
  return fetchAPI(`/customers/${id}`);
}

export async function createCustomer(data: any) {
  return fetchAPI("/customers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCustomer(id: string, data: any) {
  return fetchAPI(`/customers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteCustomer(id: string) {
  return fetchAPI(`/customers/${id}`, {
    method: "DELETE",
  });
}

// Metrics data (for Prometheus/Grafana)
export async function getMetricsData() {
  const response = await fetch(`${API_BASE_URL.replace("/api", "")}/metrics`);
  const text = await response.text();
  return text;
}
