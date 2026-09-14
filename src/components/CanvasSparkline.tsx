import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  registerables,
  ChartOptions,
} from 'chart.js';

// Register all standard Chart.js controllers (including LineController), elements, scales, and plugins
ChartJS.register(...registerables);

export interface CanvasSparklineDataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  fill?: boolean;
  borderWidth?: number;
  tension?: number;
}

export interface CanvasSparklineProps {
  id?: string;
  labels: string[];
  datasets: CanvasSparklineDataset[];
  height?: number;
  unit?: string;
  suggestedMax?: number;
  suggestedMin?: number;
  showLegend?: boolean;
  stepped?: boolean;
}

export const CanvasSparkline: React.FC<CanvasSparklineProps> = ({
  id,
  labels,
  datasets,
  height = 110,
  unit = '',
  suggestedMax,
  suggestedMin = 0,
  showLegend = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const formattedDatasets = datasets.map((ds) => {
      let bg = ds.backgroundColor;
      if (ds.fill && ctx) {
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, ds.backgroundColor);
        gradient.addColorStop(1, 'rgba(15, 23, 42, 0.02)');
        bg = gradient as any;
      }

      return {
        label: ds.label,
        data: ds.data,
        borderColor: ds.borderColor,
        backgroundColor: bg,
        fill: ds.fill ?? true,
        borderWidth: ds.borderWidth ?? 2,
        tension: ds.tension ?? 0.35,
        pointRadius: ds.data.length > 40 ? 0 : 2.5,
        pointHoverRadius: 4.5,
        pointBackgroundColor: ds.borderColor,
        pointBorderColor: '#0f172a',
        pointBorderWidth: 1.5,
      };
    });

    // If chart already exists on this canvas, update in-place for fast, error-free streaming
    if (chartInstanceRef.current && chartInstanceRef.current.canvas === canvas) {
      chartInstanceRef.current.data.labels = labels;
      chartInstanceRef.current.data.datasets = formattedDatasets;
      chartInstanceRef.current.update('none');
      return;
    }

    // Always safely destroy any pre-existing chart registered on this canvas by Chart.js
    const existingChart = ChartJS.getChart(canvas);
    if (existingChart) {
      existingChart.destroy();
    }
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    const options: ChartOptions<'line'> = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 250,
        easing: 'easeOutQuad',
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: showLegend,
          position: 'top',
          labels: {
            color: '#94a3b8',
            font: {
              family: 'monospace',
              size: 11,
            },
            boxWidth: 10,
            boxHeight: 10,
            padding: 8,
          },
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#e2e8f0',
          titleFont: { family: 'monospace', size: 11, weight: 'bold' },
          bodyColor: '#cbd5e1',
          bodyFont: { family: 'monospace', size: 11 },
          borderColor: '#334155',
          borderWidth: 1,
          padding: 8,
          displayColors: true,
          boxPadding: 4,
          callbacks: {
            label: function (context) {
              const val = context.parsed.y;
              return ` ${context.dataset.label}: ${val}${unit}`;
            },
          },
        },
      },
      scales: {
        x: {
          display: true,
          grid: {
            display: false,
          },
          ticks: {
            color: '#64748b',
            font: { family: 'monospace', size: 9 },
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 6,
          },
          border: {
            color: '#334155',
          },
        },
        y: {
          display: true,
          suggestedMin,
          suggestedMax,
          grid: {
            color: 'rgba(51, 65, 85, 0.3)',
          },
          ticks: {
            color: '#64748b',
            font: { family: 'monospace', size: 9 },
            callback: function (val) {
              return `${val}${unit}`;
            },
            maxTicksLimit: 4,
          },
          border: {
            dash: [4, 4],
            color: '#334155',
          },
        },
      },
    };

    try {
      chartInstanceRef.current = new ChartJS(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: formattedDatasets,
        },
        options,
      });
    } catch (err) {
      console.error('Failed to create Chart.js instance:', err);
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
      const activeOnCanvas = ChartJS.getChart(canvas);
      if (activeOnCanvas) {
        activeOnCanvas.destroy();
      }
    };
  }, [labels, datasets, height, unit, suggestedMax, suggestedMin, showLegend]);

  return (
    <div id={id} className="relative w-full" style={{ height: `${height}px` }}>
      <canvas id={id ? `${id}-canvas` : undefined} ref={canvasRef} className="w-full h-full" />
    </div>
  );
};
