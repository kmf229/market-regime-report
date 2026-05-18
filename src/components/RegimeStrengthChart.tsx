"use client";

import { RegimeStrengthDataPoint } from "@/types/regime-data";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
  ReferenceDot,
} from "recharts";

interface RegimeStrengthChartProps {
  data: RegimeStrengthDataPoint[];
  currentStrength?: number;
}

// Scaling function matching RegimeStats component
const THRESHOLD = 0.25;
const BEARISH_MIN = -3.5;
const BULLISH_MAX = 3.5;

function scaleStrength(rawStrength: number): number {
  let scaled: number;

  if (rawStrength >= THRESHOLD) {
    const range = BULLISH_MAX - THRESHOLD;
    const distance = rawStrength - THRESHOLD;
    scaled = (distance / range) * 10;
  } else {
    const range = THRESHOLD - BEARISH_MIN;
    const distance = THRESHOLD - rawStrength;
    scaled = -(distance / range) * 10;
  }

  return Math.max(-10, Math.min(10, scaled));
}

export default function RegimeStrengthChart({
  data,
  currentStrength,
}: RegimeStrengthChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Regime Strength History
        </h3>
        <p className="text-sm text-gray-500">
          No historical data available yet. Data will be collected daily starting today.
        </p>
      </div>
    );
  }

  // Scale the data
  const chartData = data.map((point) => {
    const scaledStrength = scaleStrength(point.regimeStrength);
    return {
      date: point.date,
      strength: scaledStrength,
      regime: point.regime,
      isPositive: scaledStrength >= 0,
    };
  });

  // Find today's data point (last point)
  const todayPoint = chartData[chartData.length - 1];

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const date = new Date(data.date + "T00:00:00");
      const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      return (
        <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg text-sm">
          <div className="font-semibold">{dateStr}</div>
          <div
            className={`text-lg font-bold mt-1 ${
              data.isPositive ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {data.strength >= 0 ? "+" : ""}
            {data.strength.toFixed(1)}
          </div>
          <div className="text-gray-300 text-xs mt-1 capitalize">
            {data.regime}
          </div>
        </div>
      );
    }
    return null;
  };

  // Format date for X-axis
  const formatXAxis = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Regime Strength History
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Daily regime strength from -10 (strong bearish) to +10 (strong bullish)
          </p>
        </div>
        {currentStrength !== undefined && (
          <div className="text-right">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Current
            </div>
            <div
              className={`text-2xl font-bold font-mono ${
                scaleStrength(currentStrength) >= 0 ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {scaleStrength(currentStrength) >= 0 ? "+" : ""}
              {scaleStrength(currentStrength).toFixed(1)}
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-80 mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          >
            <defs>
              <linearGradient id="colorBullish" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorBearish" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.3} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

            <XAxis
              dataKey="date"
              tickFormatter={formatXAxis}
              stroke="#9ca3af"
              style={{ fontSize: "12px" }}
              interval="preserveStartEnd"
            />

            <YAxis
              domain={[-10, 10]}
              ticks={[-10, -5, 0, 5, 10]}
              stroke="#9ca3af"
              style={{ fontSize: "12px" }}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Zero line */}
            <ReferenceLine y={0} stroke="#6b7280" strokeWidth={2} strokeDasharray="3 3" />

            {/* Area fills - separate for bullish and bearish */}
            <Area
              type="monotone"
              dataKey={(d) => (d.strength >= 0 ? d.strength : 0)}
              stroke="none"
              fill="url(#colorBullish)"
              fillOpacity={1}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey={(d) => (d.strength < 0 ? d.strength : 0)}
              stroke="none"
              fill="url(#colorBearish)"
              fillOpacity={1}
              isAnimationActive={false}
            />

            {/* Line */}
            <Line
              type="monotone"
              dataKey="strength"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />

            {/* Today's point */}
            {todayPoint && (
              <ReferenceDot
                x={todayPoint.date}
                y={todayPoint.strength}
                r={6}
                fill={todayPoint.isPositive ? "#10b981" : "#ef4444"}
                stroke="#fff"
                strokeWidth={2}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-gray-500 border-t border-gray-100 pt-4 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span>Bullish (above 0)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>Bearish (below 0)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-0.5 bg-gray-500"></div>
          <span>Threshold (0)</span>
        </div>
      </div>
    </div>
  );
}
