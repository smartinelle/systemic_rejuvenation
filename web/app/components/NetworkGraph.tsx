'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { SimulationResult } from '@/lib/types';

interface NetworkGraphProps {
  result: SimulationResult;
}

const SUBSYSTEM_NAMES = ['Cardio', 'Musc', 'Neuro'];
const COLORS = ['#00D9FF', '#00FF88', '#8B5CF6']; // cyan, green, violet

export default function NetworkGraph({ result }: NetworkGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !result) return;

    const width = 400;
    const height = 400;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    // Get latest X values for node coloring
    const latestX = result.X[result.X.length - 1];

    // Define nodes (3 subsystems)
    const nodes = SUBSYSTEM_NAMES.map((name, i) => ({
      id: name,
      index: i,
      x: 0,
      y: 0,
      health: latestX[i],
    }));

    // Define edges (coupling matrix - simplified)
    const edges = [
      { source: 'Cardio', target: 'Musc', strength: 0.1 },
      { source: 'Cardio', target: 'Neuro', strength: 0.1 },
      { source: 'Musc', target: 'Cardio', strength: 0.1 },
      { source: 'Musc', target: 'Neuro', strength: 0.1 },
      { source: 'Neuro', target: 'Cardio', strength: 0.1 },
      { source: 'Neuro', target: 'Musc', strength: 0.1 },
    ];

    // Create force simulation
    const simulation = d3
      .forceSimulation(nodes as any)
      .force('link', d3.forceLink(edges).id((d: any) => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(60));

    // Create container
    const g = svg.append('g');

    // Draw edges
    const link = g
      .selectAll('line')
      .data(edges)
      .enter()
      .append('line')
      .attr('stroke', '#4B5563')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6)
      .attr('marker-end', 'url(#arrowhead)');

    // Define arrowhead marker
    svg
      .append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('markerWidth', 10)
      .attr('markerHeight', 10)
      .attr('refX', 40)
      .attr('refY', 5)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,0 L0,10 L10,5 z')
      .attr('fill', '#4B5563');

    // Draw nodes
    const node = g
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('g');

    node
      .append('circle')
      .attr('r', 40)
      .attr('fill', (d: any) => {
        // Color by health level
        const healthColor = d3.interpolateRgb(COLORS[d.index], '#DC2626');
        return healthColor(1 - d.health);
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Add labels
    node
      .append('text')
      .text((d: any) => d.id)
      .attr('text-anchor', 'middle')
      .attr('dy', '.3em')
      .attr('fill', '#fff')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold');

    // Add health values
    node
      .append('text')
      .text((d: any) => `X=${d.health.toFixed(2)}`)
      .attr('text-anchor', 'middle')
      .attr('dy', '1.5em')
      .attr('fill', '#fff')
      .attr('font-size', '10px');

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Stop simulation after a while to save resources
    setTimeout(() => simulation.stop(), 3000);

    return () => {
      simulation.stop();
    };
  }, [result]);

  return (
    <div className="glass-panel p-4">
      <h3 className="text-lg font-semibold text-bio-cyan mb-4">System Network</h3>
      <svg
        ref={svgRef}
        width="100%"
        height="400"
        viewBox="0 0 400 400"
        className="bg-black/20 rounded-lg"
      />
      <p className="text-xs text-gray-400 mt-2">
        Node color intensity indicates functional health (X). Arrows show coupling relationships.
      </p>
    </div>
  );
}
