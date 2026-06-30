'use client';

import {cn} from '@/lib/utils';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type BarShapeProps,
  type TooltipContentProps,
} from 'recharts';

type BenchmarkDatum = {
  name: string;
  fullName?: string;
  current: number;
};

type BenchmarkComparisonChartProps = {
  title?: string;
  description?: string;
  data: BenchmarkDatum[];
  previousLabel?: string;
  currentLabel?: string;
  precision?: number;
  height?: number;
  className?: string;
};

function formatValue(value: unknown, precision: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return String(value);
  }

  return `${value.toLocaleString(undefined, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  })}x`;
}

function formatBenchmarkResult(point: BenchmarkDatum, precision: number) {
  if (!Number.isFinite(point.current) || point.current <= 0) {
    return formatValue(point.current, precision);
  }

  if (point.current === 1) {
    return 'flat';
  }

  const result = point.current > 1 ? point.current : 1 / point.current;
  return `${formatValue(result, precision)} ${point.current > 1 ? 'faster' : 'slower'}`;
}

export function BenchmarkComparisonChart({
  title,
  description,
  data,
  previousLabel = 'Previous',
  currentLabel = 'Current',
  precision = 2,
  height = 300,
  className,
}: BenchmarkComparisonChartProps) {
  const format = (value: unknown) => formatValue(value, precision);
  const chartData = data.map(point => ({...point, previous: 1}));
  const minChartWidth = 450;
  const chartHeight = Math.max(height, data.length * 54 + 76);
  const currentBarFill = (point: BenchmarkDatum | undefined) =>
    point && point.current < 1
      ? 'hsl(var(--destructive))'
      : 'hsl(var(--primary-highlight))';
  const renderCurrentBar = (props: BarShapeProps) => {
    const {payload, ...rectangleProps} = props;
    const point = payload as BenchmarkDatum | undefined;

    return (
      <Rectangle
        {...rectangleProps}
        fill={currentBarFill(point)}
        radius={[0, 4, 4, 0]}
      />
    );
  };
  const renderTooltip = ({active, payload}: TooltipContentProps) => {
    if (!active) return null;

    const point = payload?.[0]?.payload as BenchmarkDatum | undefined;
    if (!point) return null;

    return (
      <div className="rounded-lg border border-border bg-card px-2.5 py-2 text-xs leading-tight text-card-foreground shadow-sm">
        <div className="max-w-72 text-muted-foreground">
          {point.fullName ?? point.name}
        </div>
        <div className="mt-1 font-medium">
          {formatBenchmarkResult(point, precision)}
        </div>
      </div>
    );
  };

  return (
    <figure className={cn('not-prose my-8', className)}>
      {(title || description) && (
        <figcaption className="mb-4">
          {title && (
            <h3 className="m-0 text-base font-semibold text-card-foreground">
              {title}
            </h3>
          )}
          {description && (
            <p className="mb-0 mt-1 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          )}
        </figcaption>
      )}

      <div className="overflow-x-auto pb-2">
        <div style={{height: chartHeight, minWidth: minChartWidth}}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{top: 8, right: 18, bottom: 8, left: 0}}
              barCategoryGap={8}
            >
              <CartesianGrid
                stroke="hsl(var(--border))"
                strokeDasharray="3 3"
                horizontal={false}
              />
              <XAxis
                type="number"
                axisLine={false}
                tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}}
                tickFormatter={format}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}}
                tickLine={false}
                width={140}
              />
              <Tooltip
                content={renderTooltip}
                cursor={{fill: 'hsl(var(--muted))', fillOpacity: 0.5}}
              />
              <Legend
                align="right"
                formatter={value => (
                  <span className="text-[11px] text-muted-foreground">
                    {value}
                  </span>
                )}
                height={30}
                iconType="rect"
                verticalAlign="top"
                wrapperStyle={{fontSize: 11}}
              />
              <Bar
                dataKey="previous"
                fill="hsl(var(--muted-foreground))"
                name={previousLabel}
                radius={[0, 4, 4, 0]}
              />
              <Bar
                dataKey="current"
                fill="hsl(var(--primary-highlight))"
                name={currentLabel}
                shape={renderCurrentBar}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </figure>
  );
}
