"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMetricsData } from "@/lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AlertCircle, ExternalLink } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { GrafanaSetupGuide } from "@/components/grafana-setup-guide";

// Sample metrics data for visualization
const sampleMetricsData = {
  requestDuration: [{ time: "00:00", value: 120 }],
  requestCount: [{ time: "00:00", value: 25 }],
  statusCodes: [{ time: "00:00", "200": 24, "404": 1, "500": 0 }],
};

export default function MetricsPage() {
  const [metricsData, setMetricsData] = useState(sampleMetricsData);
  const [rawMetrics, setRawMetrics] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  useEffect(() => {
    async function loadMetricsData() {
      try {
        setIsLoading(true);
        const data = await getMetricsData();
        setRawMetrics(data);
        // In a real app, you would parse the Prometheus metrics here
        // and update the metricsData state
        setError(null);
      } catch (err) {
        console.error("Failed to load metrics data:", err);
        setError("Failed to load metrics data. Using sample data instead.");
        // Keep using sample data on error
      } finally {
        setIsLoading(false);
      }
    }

    loadMetricsData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Metrics</h1>
          <p className="text-muted-foreground">
            Monitor your application performance metrics
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            className="sm:self-start"
            onClick={() => setShowSetupGuide(!showSetupGuide)}
          >
            {showSetupGuide ? "Hide Setup Guide" : "Show Setup Guide"}
          </Button>
          <Button className="sm:self-start" variant="outline">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open in Grafana
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showSetupGuide ? (
        <GrafanaSetupGuide />
      ) : (
        <>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Grafana Integration</AlertTitle>
            <AlertDescription>
              This page shows a preview of metrics. For full monitoring
              capabilities, connect this dashboard to Grafana. Click "Show Setup
              Guide" for detailed instructions.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="charts" className="space-y-4">
            <TabsList>
              <TabsTrigger value="charts">Charts</TabsTrigger>
              <TabsTrigger value="status">Status Codes</TabsTrigger>
              <TabsTrigger value="raw">Raw Metrics</TabsTrigger>
            </TabsList>
            <TabsContent value="charts" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Request Duration (ms)</CardTitle>
                    <CardDescription>
                      Average request duration over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={metricsData.requestDuration}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="value"
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
                    <CardTitle>Request Count</CardTitle>
                    <CardDescription>
                      Number of requests over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={metricsData.requestCount}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="status" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Status Codes</CardTitle>
                  <CardDescription>HTTP status codes over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={metricsData.statusCodes}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="200"
                          stroke="hsl(var(--success))"
                          strokeWidth={2}
                          name="200 OK"
                        />
                        <Line
                          type="monotone"
                          dataKey="404"
                          stroke="hsl(var(--warning))"
                          strokeWidth={2}
                          name="404 Not Found"
                        />
                        <Line
                          type="monotone"
                          dataKey="500"
                          stroke="hsl(var(--destructive))"
                          strokeWidth={2}
                          name="500 Server Error"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="raw">
              <Card>
                <CardHeader>
                  <CardTitle>Raw Prometheus Metrics</CardTitle>
                  <CardDescription>
                    Raw metrics data from your application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-md overflow-auto max-h-[500px]">
                    <pre className="text-xs">
                      {rawMetrics || "Loading metrics data..."}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
