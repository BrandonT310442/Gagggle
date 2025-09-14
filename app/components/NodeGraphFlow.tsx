'use client';

import { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  NodeTypes,
  MarkerType,
  ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useIdeaGraph } from '../contexts/IdeaGraphContext';
import CustomIdeaNode from './CustomIdeaNode';
import CustomPromptNode from './CustomPromptNode';
import CustomPromptToolNode from './CustomPromptToolNode';
import Lottie from 'lottie-react';
import loadingAnimation from '../../public/gagggleLoading.json';

interface NodeGraphFlowProps {
  onNodeGenerate?: (nodeId: string) => void;
  isPanMode?: boolean;
}

const nodeTypes: NodeTypes = {
  ideaNode: CustomIdeaNode,
  promptNode: CustomPromptNode,
  promptToolNode: CustomPromptToolNode,
};

export default function NodeGraphFlow({
  onNodeGenerate,
  isPanMode = false,
}: Readonly<NodeGraphFlowProps>) {
  const { state, selectNode, updateNodePosition, isLoading, error } = useIdeaGraph();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Convert IdeaGraph nodes to React Flow format
  useEffect(() => {
    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];
    
    // Calculate positions for nodes
    const promptNodes = Array.from(state.nodes.values()).filter(n => n.metadata?.isPrompt);
    const promptToolNodes = Array.from(state.nodes.values()).filter(n => n.metadata?.isPromptTool);
    const ideaNodes = Array.from(state.nodes.values()).filter(n => !n.metadata?.isPrompt && !n.metadata?.isPromptTool);
    
    // Position prompt nodes - use stored position or default
    promptNodes.forEach((node, index) => {
      flowNodes.push({
        id: node.id,
        type: 'promptNode',
        position: node.position || { 
          x: 400, // Center horizontally as fallback
          y: 50 
        },
        data: { 
          node,
          onSelect: () => selectNode(node.id),
        },
      });
    });

    // Position idea nodes below in rows based on parent-child relationships
    const rootIdeas = ideaNodes.filter(n => !n.parentId || promptNodes.some(p => p.id === n.parentId));
    const childIdeas = ideaNodes.filter(n => n.parentId && !promptNodes.some(p => p.id === n.parentId));
    
    // First row - root ideas (use stored position or calculate)
    rootIdeas.forEach((node, index) => {
      const spacing = 500;
      const startX = -(rootIdeas.length - 1) * spacing / 2;
      
      flowNodes.push({
        id: node.id,
        type: 'ideaNode',
        position: node.position || { 
          x: startX + (index * spacing) + 400,
          y: 250 
        },
        data: { 
          node,
          onSelect: () => selectNode(node.id),
          onGenerateChildren: () => onNodeGenerate?.(node.id),
        },
      });
    });

    // Second row - child ideas (use stored position or calculate)
    childIdeas.forEach((node, index) => {
      const parentNode = flowNodes.find(n => n.id === node.parentId);
      const parentX = parentNode?.position.x || 400;
      
      // Position children relative to their parent
      const siblingCount = childIdeas.filter(n => n.parentId === node.parentId).length;
      const siblingIndex = childIdeas.filter(n => n.parentId === node.parentId).indexOf(node);
      const spacing = 500; // Match spacing used in IdeaGraphContext
      const startX = parentX - ((siblingCount - 1) * spacing / 2);
      
      flowNodes.push({
        id: node.id,
        type: 'ideaNode',
        position: node.position || { 
          x: startX + (siblingIndex * spacing),
          y: 450 
        },
        data: { 
          node,
          onSelect: () => selectNode(node.id),
          onGenerateChildren: () => onNodeGenerate?.(node.id),
        },
      });
    });

    // Add prompt tool nodes (draggable nodes)
    promptToolNodes.forEach(node => {
      flowNodes.push({
        id: node.id,
        type: 'promptToolNode',
        position: node.position || { x: 100, y: 100 },
        data: { 
          node,
        },
      });
    });

    // Create edges for parent-child relationships
    Array.from(state.nodes.values()).forEach(parentNode => {
      if (parentNode.childIds && parentNode.childIds.length > 0) {
        // Deduplicate child IDs to prevent duplicate edge keys
        const uniqueChildIds = Array.from(new Set(parentNode.childIds));
        uniqueChildIds.forEach(childId => {
          flowEdges.push({
            id: `edge-${parentNode.id}-${childId}`,
            source: parentNode.id,
            target: childId,
            type: 'smoothstep',
            animated: false,
            style: {
              stroke: '#000000',
              strokeWidth: 0.75,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 25,
              height: 25,
              color: '#000000',
            },
          });
        });
      }
    });

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [state.nodes, selectNode, onNodeGenerate, setNodes, setEdges]);

  // Handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (node.data?.onSelect) {
      node.data.onSelect();
    }
  }, []);

  // Handle node drag stop to persist position
  const onNodeDragStop = useCallback((event: React.MouseEvent, node: Node) => {
    // Update the position in the IdeaGraph state
    updateNodePosition(node.id, node.position);
  }, [updateNodePosition]);

  if (error) {
    return (
      <div className='absolute top-20 left-8 right-8 z-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
        {error}
      </div>
    );
  }

  if (isLoading && state.nodes.size === 0) {
    return (
      <div className='absolute inset-0 flex items-center justify-center z-10'>
        <div className='flex flex-col items-center justify-center'>
          <Lottie
            animationData={loadingAnimation}
            style={{ width: 200, height: 150 }}
            loop={true}
          />
          <p className='mt-4 text-gray-600 text-sm'>Generating ideas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{
          padding: 0.2,
        }}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        proOptions={{ hideAttribution: true }}
        zoomOnScroll={true}
        panOnScroll={isPanMode}
        panOnDrag={true}
        preventScrolling={true}
        nodesDraggable={true}
        nodesConnectable={false}
        nodesFocusable={true}
        edgesFocusable={false}
        elementsSelectable={true}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1} 
          color="#f1f5f9" 
        />
        <Controls 
          showZoom={true}
          showFitView={true}
          showInteractive={false}
        />
      </ReactFlow>
    </div>
  );
}