/**
 * Sankey Diagram - Signal Flow Visualization
 * 
 * Shows how signals flow through layers to final risk score
 */

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';

interface SankeyNode {
    name: string;
    category: string;
}

interface SankeyLink {
    source: number;
    target: number;
    value: number;
}

interface SankeyData {
    nodes: SankeyNode[];
    links: SankeyLink[];
}

export function SankeyDiagram({ district }: { district: string }) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current) return;

        // Sample data: signals → layers → risk score
        const data: SankeyData = {
            nodes: [
                // Sources
                { name: 'Social Media', category: 'source' },
                { name: 'News', category: 'source' },
                { name: 'Field Reports', category: 'source' },

                // Layers
                { name: 'Physical Layer', category: 'layer' },
                { name: 'Cognitive Layer', category: 'layer' },
                { name: 'Cyber Layer', category: 'layer' },

                // Risk Score
                { name: 'Risk Score: 65', category: 'output' }
            ],
            links: [
                // Social Media → Layers
                { source: 0, target: 4, value: 25 }, // → Cognitive
                { source: 0, target: 5, value: 15 }, // → Cyber

                // News → Layers
                { source: 1, target: 3, value: 10 }, // → Physical
                { source: 1, target: 4, value: 20 }, // → Cognitive

                // Field Reports → Layers
                { source: 2, target: 3, value: 30 }, // → Physical
                { source: 2, target: 4, value: 10 }, // → Cognitive

                // Layers → Risk Score
                { source: 3, target: 6, value: 40 }, // Physical → 
                { source: 4, target: 6, value: 55 }, // Cognitive →
                { source: 5, target: 6, value: 15 }  // Cyber →
            ]
        };

        // Clear previous
        d3.select(svgRef.current).selectAll('*').remove();

        const width = 800;
        const height = 400;
        const margin = { top: 10, right: 10, bottom: 10, left: 10 };

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Create sankey generator
        const sankeyGenerator = sankey()
            .nodeWidth(15)
            .nodePadding(10)
            .extent([[0, 0], [width - margin.left - margin.right, height - margin.top - margin.bottom]]);

        // Generate layout
        const { nodes, links } = sankeyGenerator(data as any);

        // Color scale
        const colorScale = d3.scaleOrdinal<string, string>()
            .domain(['source', 'layer', 'output'])
            .range(['#60a5fa', '#f59e0b', '#ef4444']);

        // Draw links
        svg.append('g')
            .selectAll('path')
            .data(links)
            .join('path')
            .attr('d', sankeyLinkHorizontal() as any)
            .attr('stroke', '#cbd5e1')
            .attr('stroke-width', (d: any) => Math.max(1, d.width))
            .attr('fill', 'none')
            .attr('opacity', 0.5)
            .on('mouseover', function () {
                d3.select(this).attr('opacity', 0.8);
            })
            .on('mouseout', function () {
                d3.select(this).attr('opacity', 0.5);
            });

        // Draw nodes
        svg.append('g')
            .selectAll('rect')
            .data(nodes)
            .join('rect')
            .attr('x', (d: any) => d.x0)
            .attr('y', (d: any) => d.y0)
            .attr('height', (d: any) => d.y1 - d.y0)
            .attr('width', (d: any) => d.x1 - d.x0)
            .attr('fill', (d: any) => colorScale(d.category) as string)
            .attr('stroke', '#1e293b')
            .attr('stroke-width', 1);

        // Add labels
        svg.append('g')
            .selectAll('text')
            .data(nodes)
            .join('text')
            .attr('x', (d: any) => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
            .attr('y', (d: any) => (d.y1 + d.y0) / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', (d: any) => d.x0 < width / 2 ? 'start' : 'end')
            .text((d: any) => d.name)
            .attr('font-size', '12px')
            .attr('fill', '#1e293b');

    }, [district]);

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Signal Flow Analysis</h3>
            <svg ref={svgRef} className="w-full" />
        </div>
    );
}
