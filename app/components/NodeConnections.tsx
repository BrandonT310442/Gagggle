'use client';

import { IdeaNode } from '../types/idea';

interface NodeConnectionsProps {
  nodes: Map<string, IdeaNode>;
}

export default function NodeConnections({ nodes }: NodeConnectionsProps) {
  const connections: Array<{ from: { x: number; y: number }; to: { x: number; y: number } }> = [];

  nodes.forEach(node => {
    if (node.position) {
      node.childIds.forEach(childId => {
        const childNode = nodes.get(childId);
        if (childNode?.position) {
          connections.push({
            from: node.position,
            to: childNode.position,
          });
        }
      });
    }
  });

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="#9CA3AF"
          />
        </marker>
      </defs>
      
      {connections.map((connection, index) => {
        const midY = (connection.from.y + connection.to.y) / 2;
        
        return (
          <path
            key={index}
            d={`
              M ${connection.from.x} ${connection.from.y + 40}
              C ${connection.from.x} ${midY},
                ${connection.to.x} ${midY},
                ${connection.to.x} ${connection.to.y - 40}
            `}
            stroke="#9CA3AF"
            strokeWidth="2"
            fill="none"
            markerEnd="url(#arrowhead)"
            className="transition-all duration-300"
          />
        );
      })}
    </svg>
  );
}