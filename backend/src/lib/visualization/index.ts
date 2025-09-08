/**
 * T047: Create visualization library with CLI
 * 
 * Data visualization and chart generation library for narrative analytics
 */

export interface DataPoint {
  timestamp: Date;
  value: number;
  label?: string;
  metadata?: Record<string, any>;
}

export interface ChartConfig {
  width: number;
  height: number;
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  theme?: 'dark' | 'light';
  showGrid?: boolean;
  showLegend?: boolean;
}

export interface ChartSeries {
  name: string;
  data: DataPoint[];
  color?: string;
  type?: 'line' | 'bar' | 'scatter' | 'area';
}

export interface NetworkNode {
  id: string;
  label: string;
  value: number;
  group?: string;
  x?: number;
  y?: number;
  metadata?: Record<string, any>;
}

export interface NetworkEdge {
  source: string;
  target: string;
  weight: number;
  label?: string;
  type?: 'similarity' | 'stake' | 'reference';
}

export interface NetworkGraph {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  config: {
    layout: 'force' | 'circular' | 'hierarchical';
    nodeSize: 'fixed' | 'proportional';
    edgeThickness: 'fixed' | 'proportional';
    clustering?: boolean;
  };
}

export interface HeatmapData {
  x: string | number;
  y: string | number;
  value: number;
  label?: string;
}

export interface TreemapData {
  name: string;
  value: number;
  children?: TreemapData[];
  color?: string;
  metadata?: Record<string, any>;
}

export class VisualizationEngine {
  private defaultConfig: ChartConfig = {
    width: 800,
    height: 400,
    theme: 'dark',
    showGrid: true,
    showLegend: true,
  };

  constructor() {}

  /**
   * Generate time series chart data for narrative staking trends
   */
  generateStakingTrends(
    narrativeActivities: Array<{ timestamp: Date; amount: number; narrativeId: number; action: 'stake' | 'unstake' }>
  ): ChartSeries[] {
    const narrativeGroups = new Map<number, DataPoint[]>();

    narrativeActivities.forEach(activity => {
      if (!narrativeGroups.has(activity.narrativeId)) {
        narrativeGroups.set(activity.narrativeId, []);
      }

      const points = narrativeGroups.get(activity.narrativeId)!;
      const value = activity.action === 'stake' ? activity.amount : -activity.amount;
      
      points.push({
        timestamp: activity.timestamp,
        value,
        label: `${activity.action}: ${activity.amount}`,
        metadata: { narrativeId: activity.narrativeId, action: activity.action },
      });
    });

    const series: ChartSeries[] = [];
    let colorIndex = 0;
    const colors = ['#00ff00', '#0088ff', '#ffaa00', '#ff4444', '#aa00ff', '#00ffaa'];

    narrativeGroups.forEach((data, narrativeId) => {
      // Calculate cumulative staking values
      let cumulative = 0;
      const cumulativeData = data
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        .map(point => {
          cumulative += point.value;
          return {
            ...point,
            value: Math.max(0, cumulative), // Don't go below 0
          };
        });

      series.push({
        name: `Narrative #${narrativeId}`,
        data: cumulativeData,
        color: colors[colorIndex % colors.length],
        type: 'line',
      });
      
      colorIndex++;
    });

    return series;
  }

  /**
   * Generate semantic similarity network graph
   */
  generateSimilarityNetwork(
    narratives: Array<{
      id: string;
      name: string;
      embedding: number[];
      totalStaked: number;
      category?: string;
    }>,
    similarityThreshold: number = 0.7
  ): NetworkGraph {
    const nodes: NetworkNode[] = narratives.map(narrative => ({
      id: narrative.id,
      label: narrative.name.length > 20 
        ? narrative.name.substring(0, 17) + '...' 
        : narrative.name,
      value: narrative.totalStaked,
      group: narrative.category || 'default',
      metadata: {
        fullName: narrative.name,
        totalStaked: narrative.totalStaked,
        category: narrative.category,
      },
    }));

    const edges: NetworkEdge[] = [];
    
    for (let i = 0; i < narratives.length; i++) {
      for (let j = i + 1; j < narratives.length; j++) {
        const similarity = this.calculateCosineSimilarity(
          narratives[i].embedding,
          narratives[j].embedding
        );

        if (similarity >= similarityThreshold) {
          edges.push({
            source: narratives[i].id,
            target: narratives[j].id,
            weight: similarity,
            label: `${(similarity * 100).toFixed(1)}%`,
            type: 'similarity',
          });
        }
      }
    }

    return {
      nodes,
      edges,
      config: {
        layout: 'force',
        nodeSize: 'proportional',
        edgeThickness: 'proportional',
        clustering: true,
      },
    };
  }

  /**
   * Generate market heatmap data
   */
  generateMarketHeatmap(
    narratives: Array<{
      category: string;
      totalStaked: number;
      changePercent: number;
    }>
  ): HeatmapData[] {
    const categoryData = new Map<string, { totalStaked: number; changePercent: number; count: number }>();

    narratives.forEach(narrative => {
      const existing = categoryData.get(narrative.category) || { totalStaked: 0, changePercent: 0, count: 0 };
      
      categoryData.set(narrative.category, {
        totalStaked: existing.totalStaked + narrative.totalStaked,
        changePercent: existing.changePercent + narrative.changePercent,
        count: existing.count + 1,
      });
    });

    const heatmapData: HeatmapData[] = [];
    let yIndex = 0;

    categoryData.forEach((data, category) => {
      const avgChange = data.changePercent / data.count;
      
      heatmapData.push({
        x: 'Total Staked',
        y: category,
        value: data.totalStaked,
        label: `${category}: ${data.totalStaked.toFixed(2)} NARR`,
      });

      heatmapData.push({
        x: '24h Change',
        y: category,
        value: avgChange,
        label: `${category}: ${avgChange.toFixed(2)}%`,
      });

      heatmapData.push({
        x: 'Narratives Count',
        y: category,
        value: data.count,
        label: `${category}: ${data.count} narratives`,
      });

      yIndex++;
    });

    return heatmapData;
  }

  /**
   * Generate treemap data for narrative distribution
   */
  generateStakingTreemap(
    narratives: Array<{
      id: string;
      name: string;
      category: string;
      totalStaked: number;
    }>
  ): TreemapData {
    const categories = new Map<string, TreemapData[]>();

    narratives.forEach(narrative => {
      if (!categories.has(narrative.category)) {
        categories.set(narrative.category, []);
      }

      categories.get(narrative.category)!.push({
        name: narrative.name,
        value: narrative.totalStaked,
        metadata: {
          id: narrative.id,
          category: narrative.category,
        },
      });
    });

    const children: TreemapData[] = [];
    const colors = ['#00ff00', '#0088ff', '#ffaa00', '#ff4444', '#aa00ff', '#00ffaa'];
    let colorIndex = 0;

    categories.forEach((narrativeList, categoryName) => {
      const categoryTotal = narrativeList.reduce((sum, n) => sum + n.value, 0);
      
      children.push({
        name: categoryName,
        value: categoryTotal,
        color: colors[colorIndex % colors.length],
        children: narrativeList.sort((a, b) => b.value - a.value),
        metadata: {
          narrativeCount: narrativeList.length,
        },
      });

      colorIndex++;
    });

    return {
      name: 'All Narratives',
      value: children.reduce((sum, child) => sum + child.value, 0),
      children: children.sort((a, b) => b.value - a.value),
    };
  }

  /**
   * Generate chart configuration with theme
   */
  createChartConfig(overrides: Partial<ChartConfig> = {}): ChartConfig {
    return {
      ...this.defaultConfig,
      ...overrides,
    };
  }

  /**
   * Generate SVG path for line chart
   */
  generateLinePath(series: ChartSeries, config: ChartConfig): string {
    if (!series.data || series.data.length === 0) return '';

    const { width, height } = config;
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const xExtent = this.getTimeExtent(series.data);
    const yExtent = this.getValueExtent(series.data);

    const xScale = (timestamp: Date) => 
      ((timestamp.getTime() - xExtent.min.getTime()) / (xExtent.max.getTime() - xExtent.min.getTime())) * chartWidth;
    
    const yScale = (value: number) =>
      chartHeight - ((value - yExtent.min) / (yExtent.max - yExtent.min)) * chartHeight;

    let path = '';
    series.data.forEach((point, index) => {
      const x = xScale(point.timestamp) + padding.left;
      const y = yScale(point.value) + padding.top;
      
      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });

    return path;
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  private calculateCosineSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) return 0;

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * Get time extent from data points
   */
  private getTimeExtent(data: DataPoint[]): { min: Date; max: Date } {
    const timestamps = data.map(d => d.timestamp);
    return {
      min: new Date(Math.min(...timestamps.map(t => t.getTime()))),
      max: new Date(Math.max(...timestamps.map(t => t.getTime()))),
    };
  }

  /**
   * Get value extent from data points
   */
  private getValueExtent(data: DataPoint[]): { min: number; max: number } {
    const values = data.map(d => d.value);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }

  /**
   * Format timestamp for display
   */
  formatTimestamp(timestamp: Date, format: 'short' | 'long' = 'short'): string {
    if (format === 'short') {
      return timestamp.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    return timestamp.toLocaleString('en-US');
  }

  /**
   * Format value for display
   */
  formatValue(value: number, decimals: number = 2): string {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(decimals)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(decimals)}K`;
    }
    return value.toFixed(decimals);
  }
}

export default VisualizationEngine;