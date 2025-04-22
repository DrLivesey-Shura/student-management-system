"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { InfoIcon, CheckCircle2, Copy } from "lucide-react";
import { Code } from "@/components/ui/code";

export function GrafanaSetupGuide() {
  const [activeTab, setActiveTab] = useState("prometheus");
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const prometheusConfig = `
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'sales-dashboard'
    static_configs:
      - targets: ['localhost:5000']
    metrics_path: '/metrics'
  `;

  const dockerComposeConfig = `
version: '3'
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-storage:/var/lib/grafana
    depends_on:
      - prometheus

volumes:
  grafana-storage:
  `;

  const dashboardJson = `
{
  "annotations": {
    "list": [
      {
        "builtIn": 1,
        "datasource": "-- Grafana --",
        "enable": true,
        "hide": true,
        "iconColor": "rgba(0, 211, 255, 1)",
        "name": "Annotations & Alerts",
        "type": "dashboard"
      }
    ]
  },
  "editable": true,
  "gnetId": null,
  "graphTooltip": 0,
  "id": 1,
  "links": [],
  "panels": [
    {
      "aliasColors": {},
      "bars": false,
      "dashLength": 10,
      "dashes": false,
      "datasource": "Prometheus",
      "fieldConfig": {
        "defaults": {},
        "overrides": []
      },
      "fill": 1,
      "fillGradient": 0,
      "gridPos": {
        "h": 8,
        "w": 12,
        "x": 0,
        "y": 0
      },
      "hiddenSeries": false,
      "id": 2,
      "legend": {
        "avg": false,
        "current": false,
        "max": false,
        "min": false,
        "show": true,
        "total": false,
        "values": false
      },
      "lines": true,
      "linewidth": 1,
      "nullPointMode": "null",
      "options": {
        "alertThreshold": true
      },
      "percentage": false,
      "pluginVersion": "7.5.5",
      "pointradius": 2,
      "points": false,
      "renderer": "flot",
      "seriesOverrides": [],
      "spaceLength": 10,
      "stack": false,
      "steppedLine": false,
      "targets": [
        {
          "expr": "http_request_duration_ms_sum / http_request_duration_ms_count",
          "interval": "",
          "legendFormat": "Average Request Duration",
          "refId": "A"
        }
      ],
      "thresholds": [],
      "timeFrom": null,
      "timeRegions": [],
      "timeShift": null,
      "title": "Average Request Duration",
      "tooltip": {
        "shared": true,
        "sort": 0,
        "value_type": "individual"
      },
      "type": "graph",
      "xaxis": {
        "buckets": null,
        "mode": "time",
        "name": null,
        "show": true,
        "values": []
      },
      "yaxes": [
        {
          "format": "ms",
          "label": null,
          "logBase": 1,
          "max": null,
          "min": null,
          "show": true
        },
        {
          "format": "short",
          "label": null,
          "logBase": 1,
          "max": null,
          "min": null,
          "show": true
        }
      ],
      "yaxis": {
        "align": false,
        "alignLevel": null
      }
    },
    {
      "aliasColors": {},
      "bars": false,
      "dashLength": 10,
      "dashes": false,
      "datasource": "Prometheus",
      "fieldConfig": {
        "defaults": {},
        "overrides": []
      },
      "fill": 1,
      "fillGradient": 0,
      "gridPos": {
        "h": 8,
        "w": 12,
        "x": 12,
        "y": 0
      },
      "hiddenSeries": false,
      "id": 4,
      "legend": {
        "avg": false,
        "current": false,
        "max": false,
        "min": false,
        "show": true,
        "total": false,
        "values": false
      },
      "lines": true,
      "linewidth": 1,
      "nullPointMode": "null",
      "options": {
        "alertThreshold": true
      },
      "percentage": false,
      "pluginVersion": "7.5.5",
      "pointradius": 2,
      "points": false,
      "renderer": "flot",
      "seriesOverrides": [],
      "spaceLength": 10,
      "stack": false,
      "steppedLine": false,
      "targets": [
        {
          "expr": "rate(http_requests_total[5m])",
          "interval": "",
          "legendFormat": "Requests per second",
          "refId": "A"
        }
      ],
      "thresholds": [],
      "timeFrom": null,
      "timeRegions": [],
      "timeShift": null,
      "title": "Request Rate",
      "tooltip": {
        "shared": true,
        "sort": 0,
        "value_type": "individual"
      },
      "type": "graph",
      "xaxis": {
        "buckets": null,
        "mode": "time",
        "name": null,
        "show": true,
        "values": []
      },
      "yaxes": [
        {
          "format": "reqps",
          "label": null,
          "logBase": 1,
          "max": null,
          "min": null,
          "show": true
        },
        {
          "format": "short",
          "label": null,
          "logBase": 1,
          "max": null,
          "min": null,
          "show": true
        }
      ],
      "yaxis": {
        "align": false,
        "alignLevel": null
      }
    }
  ],
  "refresh": "5s",
  "schemaVersion": 27,
  "style": "dark",
  "tags": [],
  "templating": {
    "list": []
  },
  "time": {
    "from": "now-1h",
    "to": "now"
  },
  "timepicker": {},
  "timezone": "",
  "title": "Sales Dashboard Metrics",
  "uid": "sales-dashboard",
  "version": 1
}
  `;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grafana Monitoring Setup Guide</CardTitle>
        <CardDescription>
          Follow these steps to set up Grafana monitoring for your sales
          dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            Your Express server is already configured with Prometheus metrics.
            This guide will help you set up Prometheus and Grafana to visualize
            those metrics.
          </AlertDescription>
        </Alert>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="prometheus">1. Prometheus Setup</TabsTrigger>
            <TabsTrigger value="grafana">2. Grafana Setup</TabsTrigger>
            <TabsTrigger value="dashboard">3. Dashboard Creation</TabsTrigger>
          </TabsList>

          <TabsContent value="prometheus" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">
                Step 1: Configure Prometheus
              </h3>
              <p className="text-sm text-muted-foreground">
                Create a <code>prometheus.yml</code> file with the following
                configuration:
              </p>

              <div className="relative">
                <Code>{prometheusConfig}</Code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() =>
                    copyToClipboard(prometheusConfig, "prometheus")
                  }
                >
                  {copied === "prometheus" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <p className="text-sm text-muted-foreground mt-4">
                This configuration tells Prometheus to scrape metrics from your
                Express server every 15 seconds.
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="text-lg font-medium">
                Step 2: Set Up Docker Compose
              </h3>
              <p className="text-sm text-muted-foreground">
                Create a <code>docker-compose.yml</code> file to run Prometheus
                and Grafana:
              </p>

              <div className="relative">
                <Code>{dockerComposeConfig}</Code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(dockerComposeConfig, "docker")}
                >
                  {copied === "docker" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <p className="text-sm text-muted-foreground mt-4">
                Run <code>docker-compose up -d</code> to start Prometheus and
                Grafana.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="grafana" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Step 1: Access Grafana</h3>
              <p className="text-sm text-muted-foreground">
                Open Grafana at <code>http://localhost:3000</code> and log in
                with:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                <li>
                  Username: <code>admin</code>
                </li>
                <li>
                  Password: <code>admin</code>
                </li>
              </ul>
              <p className="text-sm text-muted-foreground">
                You'll be prompted to change the password on first login.
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="text-lg font-medium">
                Step 2: Add Prometheus Data Source
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Go to Configuration &gt; Data Sources</li>
                <li>Click "Add data source"</li>
                <li>Select "Prometheus"</li>
                <li>
                  Set the URL to <code>http://prometheus:9090</code> (if using
                  Docker Compose)
                </li>
                <li>Click "Save & Test"</li>
              </ol>
            </div>
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Step 1: Import Dashboard</h3>
              <p className="text-sm text-muted-foreground">
                You can create a dashboard from scratch or import the following
                JSON:
              </p>

              <div className="relative">
                <Code className="max-h-[300px] overflow-auto">
                  {dashboardJson}
                </Code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(dashboardJson, "dashboard")}
                >
                  {copied === "dashboard" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mt-4">
                <li>Go to Dashboards &gt; Import</li>
                <li>Paste the JSON above</li>
                <li>Click "Load"</li>
                <li>Select your Prometheus data source</li>
                <li>Click "Import"</li>
              </ol>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="text-lg font-medium">
                Step 2: Create Custom Panels
              </h3>
              <p className="text-sm text-muted-foreground">
                You can create additional panels to monitor specific metrics:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                <li>
                  <strong>Request Duration by Endpoint:</strong>{" "}
                  <code>
                    http_request_duration_ms_sum{"{"}route="$route"{"}"} /
                    http_request_duration_ms_count{"{"}
                    route="$route"{"}"}
                  </code>
                </li>
                <li>
                  <strong>Error Rate:</strong>{" "}
                  <code>
                    sum(rate(http_requests_total{"{"}status_code=~"5.."{"}"}{" "}
                    [5m])) / sum(rate(http_requests_total [5m]))
                  </code>
                </li>
                <li>
                  <strong>Node.js Memory Usage:</strong>{" "}
                  <code>process_resident_memory_bytes / 1024 / 1024</code>
                </li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>

        <div className="pt-4">
          <Button
            onClick={() =>
              setActiveTab(
                activeTab === "prometheus"
                  ? "grafana"
                  : activeTab === "grafana"
                  ? "dashboard"
                  : "prometheus"
              )
            }
          >
            {activeTab === "prometheus"
              ? "Next: Grafana Setup"
              : activeTab === "grafana"
              ? "Next: Dashboard Creation"
              : "Back to Start"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
