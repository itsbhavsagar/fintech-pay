"use client";

import {
  AlertCircle,
  Info,
  Loader2,
  Send,
  Star,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  useIntelligence,
  useIntelligenceQuery,
  type Anomaly,
  type Insight,
} from "@/hooks/useIntelligence";
import { formatCompactNumber } from "@/lib/utils";

function AnomalySeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    critical: "bg-red-500/10 text-red-700 border-red-200",
    warning: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
    info: "bg-blue-500/10 text-blue-700 border-blue-200",
  };

  return (
    <Badge variant="outline" className={colors[severity]}>
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </Badge>
  );
}

function AnomalyIcon({ type }: { type: string }) {
  if (type === "success_rate" || type === "failure_rate") {
    return <AlertCircle className="size-4 text-red-500" />;
  }
  if (type === "volume_spike") {
    return <TrendingUp className="size-4 text-blue-500" />;
  }
  return <Info className="size-4 text-gray-500" />;
}

function InsightIcon({ icon }: { icon: string }) {
  if (icon === "star") {
    return <Star className="size-5 text-yellow-500" />;
  }
  if (icon === "trending") {
    return <TrendingUp className="size-5 text-green-500" />;
  }
  return <AlertCircle className="size-5 text-orange-500" />;
}

export default function AIIntelligencePage() {
  const intelligence = useIntelligence();
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [streamingResponse, setStreamingResponse] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const handleQuerySubmit = async () => {
    if (!query.trim()) return;

    setSubmittedQuery(query);
    setStreamingResponse("");
    setIsStreaming(true);

    try {
      const response = await fetch("/api/intelligence/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6)) as {
              token?: string;
              done?: boolean;
              error?: string;
            };

            if (data.error) {
              throw new Error(data.error);
            }

            if (data.token) {
              result += data.token;
              setStreamingResponse(result);
            }

            if (data.done) {
              setIsStreaming(false);
            }
          }
        }
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to get response";
      setStreamingResponse(
        `Error: ${message}. Please try again with a different question.`,
      );
      setIsStreaming(false);
    }

    setQuery("");
  };

  if (intelligence.isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Payment Intelligence</h2>
          <p className="text-sm text-muted-foreground">
            Loading AI-generated insights...
          </p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
              <span>Analyzing your transactions...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!intelligence.data) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Unable to load intelligence data. Please try again later.
        </CardContent>
      </Card>
    );
  }

  const data = intelligence.data;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Payment Intelligence</h2>
        <p className="text-sm text-muted-foreground">
          AI-generated insights from your transaction data
        </p>
      </div>

      {/* Anomalies Section */}
      {data.anomalies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Anomalies Detected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.anomalies.map((anomaly: Anomaly, index: number) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <AnomalyIcon type={anomaly.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-relaxed">
                      {anomaly.description}
                    </p>
                  </div>
                  <AnomalySeverityBadge severity={anomaly.severity} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revenue Forecast Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>7-Day Revenue Forecast</CardTitle>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Predicted total</p>
              <p className="text-lg font-semibold">
                ₹{formatCompactNumber(data.forecastTotal)}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.forecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) =>
                    "₹" + formatCompactNumber(Number(value))
                  }
                />
                <Tooltip
                  formatter={(value) => [
                    "₹" + formatCompactNumber(Number(value)),
                    "Revenue",
                  ]}
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--border)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  isAnimationActive={false}
                  data={data.forecast.filter((d) => d.isForecast)}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-chart-1" />
              <span>Actual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full border-2 border-border" />
              <span>Forecast</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Insights Section */}
      <div className="grid gap-4 md:grid-cols-3">
        {data.insights.map((insight: Insight, index: number) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-sm font-medium">
                  {insight.title}
                </CardTitle>
                <InsightIcon icon={insight.icon} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{insight.value}</p>
                <p className="text-xs text-muted-foreground">
                  {insight.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Natural Language Query Section */}
      <Card>
        <CardHeader>
          <CardTitle>Ask about your payments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Why did my success rate drop on Apr 15?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleQuerySubmit();
                }
              }}
              disabled={isStreaming}
            />
            <Button
              onClick={handleQuerySubmit}
              disabled={!query.trim() || isStreaming}
              size="icon"
            >
              {isStreaming ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </div>

          {submittedQuery && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Your question:
                </p>
                <p className="text-sm">{submittedQuery}</p>
              </div>
            </>
          )}

          {(streamingResponse || isStreaming) && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="text-sm leading-relaxed text-foreground">
                {streamingResponse}
                {isStreaming && <span className="animate-pulse">▊</span>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
