import {
  addEdge,
  Background,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  useStoreApi,
  useUpdateNodeInternals,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback } from "react";
import "reactflow/dist/style.css";
import { nodeTypes } from "./NodeTypes.js";
import { getEdgeId } from "./utils.js";

import initialEdges from "./edges.js";
import initialNodes from "./nodes.js";
const GroupClassName = "grouping-hover";
const GroupNodeName = "group_container";
const rfStyle = {
  backgroundColor: "#D0C0F7",
};

function Flow() {
  // const [nodes, setNodes] = useState(initialNodes);
  // const [edges, setEdges] = useState(initialEdges);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { getIntersectingNodes, updateNode, getInternalNode } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();
  const store = useStoreApi();
  const { nodeLookup } = store.getState();

  const getInterGroup = useCallback((node) => {
    if (node.type === GroupNodeName) {
      return null;
    }
    const intersections = getIntersectingNodes(node)
      .filter((n) => n.type === GroupNodeName)
      .map((n) => n.id);

    if (intersections.length > 0) {
      const interGroup = Array.from(nodeLookup.values()).find(
        (_) => _.type === GroupNodeName && intersections.includes(_.id)
      );
      return interGroup;
    }
    return null;
  }, []);

  const onNodeDrag = useCallback(
    (_, node) => {
      const interGroup = getInterGroup(node);
      setNodes((ns) => {
        const nextNodes = ns.map((n) => {
          return {
            ...n,
            extent: n.id === node.id ? undefined : n.extent,
            className: interGroup?.id === n.id ? GroupClassName : "",
          };
        });
        return nextNodes;
      });
      setEdges((eds) => {
        const nextEdges = eds.map((e) => {
          return {
            ...e,
            animated: e.source === node.id || e.target === node.id,
          };
        });
        return nextEdges;
      });
    },
    [getInterGroup, setEdges]
  );

  const onNodeDragStop = useCallback(
    (_, node) => {
      const interGroup = getInterGroup(node);
      if (interGroup) {
        /** move in */
        setNodes((ns) => {
          const nextNodes = ns.map((n) => {
            if (node.type !== GroupNodeName && n.id === node.id) {
              n.position.x = 0;
              n.position.y = 30;
              n.parentId = interGroup.id;
              n.extent = "parent";
            } else if (n.id === interGroup.id) {
              // n.style.height =
              //   interGroup.measured.height + node.measured.height;
            }
            return {
              ...n,
              className: "",
            };
          });
          return nextNodes.sort((a, b) => {
            /**
             * GroupNode必须排在前面，不然react-flow有报错
             */
            if (a.type === GroupNodeName && b.type !== GroupNodeName) {
              return -1;
            } else {
              return 1;
            }
          });
        });
        setEdges((eds) => {
          const nextEdges = eds.map((e) => {
            return {
              ...e,
              animated: false,
            };
          });
          return nextEdges;
        });
      } else {
        /** move out */
        setEdges((preEdges) => {
          const newEdges = preEdges.filter(
            (edge) => edge.source !== node.id && edge.target !== node.id
          );
          const source = preEdges.find((p) => p.target === node.id)?.source;
          const target = preEdges.find((p) => p.source === node.id)?.target;
          if (source && target) {
            newEdges.push({
              source,
              target,
              id: getEdgeId(source, target),
            });
          }
          return newEdges;
        });
      }
    },
    [getInterGroup]
  );

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );
  console.log("🚀 ~ Flow ~ edges:", edges);
  console.log("nodes ~ Flow ~ nodes:", {
    nodes,
    from: Array.from(nodeLookup.values()),
    inter: Array.from(nodeLookup.values()).map((n) => getInternalNode(n.id)),
  });

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeDrag={onNodeDrag}
      onNodeDragStop={onNodeDragStop}
      onConnect={onConnect}
      fitView
      style={rfStyle}
      attributionPosition="top-right"
      nodeTypes={nodeTypes}
      // edgeTypes={edgeTypes}
    >
      <Background />
    </ReactFlow>
  );
}

export default FlowWithProvider;

function FlowWithProvider(props) {
  return (
    <ReactFlowProvider>
      <Flow {...props} />
    </ReactFlowProvider>
  );
}
