"use client";

import { ParentSize } from "@visx/responsive";
import { scaleLinear, scaleTime } from "@visx/scale";
import { GridRows } from "@visx/grid";
import { bisector, extent } from "d3-array";
import {
  type CSSProperties,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import { motion, useMotionValue, useTransform, animate } from "motion/react";

export interface LineChartProps {
  data: Record<string, unknown>[];
  xDataKey?: string;
  yDataKey: string;
  strokeColor?: string;
  strokeWidth?: number;
  margin?: Partial<{ top: number; right: number; bottom: number; left: number }>;
  aspectRatio?: string;
  className?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  animationDuration?: number;
  height?: number;
}

const DEFAULT_MARGIN = { top: 20, right: 20, bottom: 30, left: 40 };

export function LineChart({
  data,
  xDataKey = "date",
  yDataKey,
  strokeColor = "var(--chart-1)",
  strokeWidth = 2,
  margin: marginProp,
  aspectRatio = "2 / 1",
  className,
  showGrid = true,
  showTooltip = true,
  animationDuration = 1000,
  height,
}: LineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const margin = { ...DEFAULT_MARGIN, ...marginProp };
  const [tooltipData, setTooltipData] = useState<{
    x: number;
    y: number;
    data: Record<string, unknown>;
  } | null>(null);

  const xAccessor = useCallback(
    (d: Record<string, unknown>): Date => {
      const value = d[xDataKey];
      return value instanceof Date ? value : new Date(value as string | number);
    },
    [xDataKey]
  );

  const yAccessor = useCallback(
    (d: Record<string, unknown>): number => {
      const value = d[yDataKey];
      return typeof value === "number" ? value : 0;
    },
    [yDataKey]
  );

  const bisectDate = useMemo(
    () => bisector<Record<string, unknown>, Date>((d) => xAccessor(d)).left,
    [xAccessor]
  );

  const handleMouseMove = useCallback(
    (
      e: React.MouseEvent<SVGRectElement>,
      xScale: ReturnType<typeof scaleTime>,
      innerWidth: number
    ) => {
      if (!showTooltip) return;
      const { x } = e.nativeEvent;
      const x0 = xScale.invert(x);
      const index = bisectDate(data, x0, 1);
      const d0 = data[index - 1];
      const d1 = data[index];
      if (!d0) return;
      const d =
        d1 && x0.getTime() - xAccessor(d0).getTime() > xAccessor(d1).getTime() - x0.getTime()
          ? d1
          : d0;
      setTooltipData({ x, y: 0, data: d });
    },
    [data, bisectDate, xAccessor, showTooltip]
  );

  return (
    <div
      className={cn("relative w-full", className)}
      ref={containerRef}
      style={{
        ...(aspectRatio && !height ? { aspectRatio } : undefined),
        height: height ? `${height}px` : undefined,
      }}
    >
      <ParentSize debounceTime={10}>
        {({ width, height: parentHeight }) => {
          if (width < 10 || parentHeight < 10) return null;

          const innerWidth = width - margin.left - margin.right;
          const innerHeight = parentHeight - margin.top - margin.bottom;

          const xScale = scaleTime({
            range: [0, innerWidth],
            domain: extent(data, (d) => xAccessor(d).getTime()) as [number, number],
          });

          const yScale = scaleLinear({
            range: [innerHeight, 0],
            domain: [
              0,
              Math.max(...data.map((d) => yAccessor(d))) * 1.1,
            ],
          });

          const linePath = data
            .map((d, i) => {
              const x = xScale(xAccessor(d).getTime());
              const y = yScale(yAccessor(d));
              return `${i === 0 ? "M" : "L"} ${x},${y}`;
            })
            .join(" ");

          return (
            <svg width={width} height={parentHeight} className="overflow-visible">
              <g transform={`translate(${margin.left},${margin.top})`}>
                {showGrid && (
                  <GridRows
                    scale={yScale}
                    width={innerWidth}
                    stroke="var(--border)"
                    strokeDasharray="3 3"
                  />
                )}

                <path
                  d={linePath}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                />

                {showTooltip && tooltipData && (
                  <g>
                    <line
                      x1={tooltipData.x}
                      y1={0}
                      x2={tooltipData.x}
                      y2={innerHeight}
                      stroke="var(--foreground)"
                      strokeDasharray="4 4"
                      strokeOpacity={0.3}
                    />
                    <circle
                      cx={tooltipData.x}
                      cy={yScale(yAccessor(tooltipData.data))}
                      r={5}
                      fill="var(--foreground)"
                      stroke="var(--background)"
                      strokeWidth={2}
                    />
                  </g>
                )}

                <rect
                  width={innerWidth}
                  height={innerHeight}
                  fill="transparent"
                  onMouseMove={(e) => handleMouseMove(e, xScale, innerWidth)}
                  onMouseLeave={() => setTooltipData(null)}
                />
              </g>
            </svg>
          );
        }}
      </ParentSize>
    </div>
  );
}
