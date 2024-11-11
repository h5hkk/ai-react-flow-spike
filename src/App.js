import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  ReactFlow,
  ReactFlowProvider,
  // useEdgesState,
  // useNodesState,
  useReactFlow,
  useStoreApi,
  useUpdateNodeInternals,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useState } from "react";
import "reactflow/dist/style.css";
// import { edgeTypes } from "./EdgeTypes.js";
import { nodeTypes } from "./NodeTypes.js";

import initialEdges from "./edges.js";
import initialNodes from "./nodes.js";
const MIN_DISTANCE = 200;
const rfStyle = {
  backgroundColor: "#D0C0F7",
};

function Flow() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  // const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  // const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { getInternalNode, getIntersectingNodes, updateNode } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

  const store = useStoreApi();

  const getClosestEdge = useCallback((node) => {
    const { nodeLookup } = store.getState();
    const internalNode = getInternalNode(node.id);
    console.log("🚀 ~ getClosestEdge ~ internalNode:", {
      position: internalNode.position,
      width: internalNode.measured.width,
    });

    const closestNode = Array.from(nodeLookup.values()).reduce(
      (res, n) => {
        if (
          n.type === "group_container" &&
          internalNode.type !== "group_container" &&
          n.id !== internalNode.id &&
          //nodeX > groupX && nodeX < groupX + groupWidth  || groupX > nodeX && groupX < nodeX + nodeWidth
          ((n.position.x <= internalNode.position.x &&
            n.position.x + n.measured.width >= internalNode.position.x) ||
            (internalNode.position.x <= n.position.x &&
              internalNode.position.x + internalNode.measured.width >=
                n.position.x))
        ) {
          const dx =
            n.internals.positionAbsolute.x -
            internalNode.internals.positionAbsolute.x;
          const dy =
            n.internals.positionAbsolute.y -
            internalNode.internals.positionAbsolute.y;
          const d = Math.sqrt(dx * dx + dy * dy);

          if (d < res.distance && d < MIN_DISTANCE) {
            res.distance = d;
            res.node = n;
          }
        }

        return res;
      },
      {
        distance: Number.MAX_VALUE,
        node: null,
      }
    );

    if (!closestNode.node) {
      return {
        closeEdge: null,
        closestNode: null,
      };
    }

    const closeNodeIsSource =
      closestNode.node.internals.positionAbsolute.x <
      internalNode.internals.positionAbsolute.x;

    return {
      closeEdge: {
        id: closeNodeIsSource
          ? `${closestNode.node.id}-${node.id}`
          : `${node.id}-${closestNode.node.id}`,
        source: closeNodeIsSource ? closestNode.node.id : node.id,
        target: closeNodeIsSource ? node.id : closestNode.node.id,
      },
      closestNode: closestNode.node,
    };
  }, []);

  const onNodeDrag = useCallback(
    (_, node) => {
      const { closeEdge, closestNode } = getClosestEdge(node);
      const intersections = getIntersectingNodes(node)
        .filter((n) => n.type === "group_container")
        .map((n) => n.id);

      console.log("🚀 ~ Flow ~ intersections:", {
        intersections,
        closeEdge,
        closestNode,
      });

      setEdges((es) => {
        const nextEdges = es.filter((e) => e.className !== "temp");

        if (
          closeEdge &&
          !nextEdges.find(
            (ne) =>
              ne.source === closeEdge.source && ne.target === closeEdge.target
          )
        ) {
          closeEdge.className = "temp";
          nextEdges.push(closeEdge);
        }

        return nextEdges;
      });
    },
    [getClosestEdge, setEdges]
  );
  function _onNodeDrag({ detail: { targetNode } }) {
    const intersections = getIntersectingNodes(targetNode).map((n) => n.id);

    if (intersections.length > 0) {
      const interGroup = nodes.find(
        (_) => _.type === "group" && intersections.includes(_.id)
      );

      // if (interGroup) {
      //   updateNode(targetNode.id, {
      //     parentId: interGroup.id,
      //   });

      //   updateNodeInternals(targetNode.id);
      // }
    }
  }
  const onNodeDragStop = useCallback(
    (_, node) => {
      const { closeEdge, closestNode } = getClosestEdge(node);

      setEdges((es) => {
        const nextEdges = es.filter((e) => e.className !== "temp");

        if (
          closeEdge &&
          !nextEdges.find(
            (ne) =>
              ne.source === closeEdge.source && ne.target === closeEdge.target
          )
        ) {
          // nextEdges.push(closeEdge);
        }

        return nextEdges;
      });
    },
    [getClosestEdge]
  );

  const onNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => {
        // if (changes[0]?.id === "C3") {
        //   setEdges([
        //     {
        //       id: "link1",
        //       source: "C1",
        //       target: "C3",
        //     },
        //     {
        //       id: "link2",
        //       source: "C3",
        //       target: "C2",
        //     },
        //   ]);
        // }

        // if (changes[0]?.id === "C3") {
        //   const _C1 = nds.find((n) => n.id === "C1");
        //   const _P1 = nds.find((n) => n.id === "P1");
        //   const _C3 = nds.find((n) => n.id === "C3");
        //   nds.map((d) => {
        //     if (d.id === "P1") {
        //       d.style.height = _P1.height + _C3.height;
        //       d.style.width = _C3.width;
        //     } else if (d.id === "C3") {
        //       d.parentNode = "P1";
        //       d.extent = "parent";
        //       d.position.y = _C1.position.y + _C1.height + 2;
        //       // d.position.x = _C1.position.x;
        //     }
        //     d.position.x = _P1.position.x;

        //     return d;
        //   });
        // }
        return applyNodeChanges(changes, nds);
      });
    },
    [setNodes]
  );
  const onEdgesChange = useCallback(
    (changes) => {
      setEdges((eds) => {
        console.log("onEdgesChange", {
          changes,
          eds,
        });
        return applyEdgeChanges(changes, eds);
      });
    },
    [setEdges]
  );
  const onConnect = useCallback(
    (connection) =>
      setEdges((eds) =>
        addEdge(connection, eds).map((e) => ({ ...e, type: "CustomDelEdge" }))
      ),
    [setEdges]
  );

  const edgeTypes = {
    CustomDelEdge,
  };
  function CustomDelEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
  }) {
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });

    const onEdgeClick = () => {
      setEdges((edges) => {
        console.log("🚀 ~ Flow ~ edgeTypes:", { edges, id });

        return edges.filter((edge) => edge.id !== id);
      });
    };

    return (
      <>
        <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              // everything inside EdgeLabelRenderer has no pointer events by default
              // if you have an interactive element, set pointer-events: all
              pointerEvents: "all",
            }}
            className="nodrag nopan"
          >
            <a className="edgebutton" onClick={onEdgeClick}>
              ×
            </a>
          </div>
        </EdgeLabelRenderer>
      </>
    );
  }

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
      edgeTypes={edgeTypes}
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
