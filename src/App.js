import { useCallback, useState } from "react";
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  // useReactFlow,
  // ReactFlowProvider,
  // useStoreApi,
} from "reactflow";
import "reactflow/dist/style.css";
import "@xyflow/react/dist/style.css";

import { useReactFlow, ReactFlowProvider, useStoreApi } from "@xyflow/react";

import initialNodes, { P1, C1, C2, C3 } from "./nodes.js";
import initialEdges from "./edges.js";

const rfStyle = {
  backgroundColor: "#D0C0F7",
};

function Flow() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const { getInternalNode } = useReactFlow();
  const store = useStoreApi();

  const getClosestEdge = useCallback((node) => {
    const { nodeLookup } = store.getState();
    const internalNode = getInternalNode(node.id);
    console.log("internalNode----", { node, internalNode, nodeLookup });

    const closestNode = Array.from(nodeLookup.values()).reduce(
      (res, n) => {
        if (n.id !== internalNode.id) {
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
      return null;
    }

    const closeNodeIsSource =
      closestNode.node.internals.positionAbsolute.x <
      internalNode.internals.positionAbsolute.x;

    return {
      id: closeNodeIsSource
        ? `${closestNode.node.id}-${node.id}`
        : `${node.id}-${closestNode.node.id}`,
      source: closeNodeIsSource ? closestNode.node.id : node.id,
      target: closeNodeIsSource ? node.id : closestNode.node.id,
    };
  }, []);

  const onNodeDrag = useCallback(
    (_, node) => {
      const closeEdge = getClosestEdge(node);

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

  const onNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => {
        if (changes[0]?.id === "C3") {
          setEdges([
            {
              id: "link1",
              source: "C1",
              target: "C3",
            },
            {
              id: "link2",
              source: "C3",
              target: "C2",
            },
          ]);
        }

        if (changes[0]?.id === "C3") {
          const _C1 = nds.find((n) => n.id === "C1");
          const _P1 = nds.find((n) => n.id === "P1");
          const _C3 = nds.find((n) => n.id === "C3");
          nds.map((d) => {
            if (d.id === "P1") {
              d.style.height = _P1.height + _C3.height;
              d.style.width = _C3.width;
            } else if (d.id === "C3") {
              d.parentNode = "P1";
              d.extent = "parent";
              d.position.y = _C1.position.y + _C1.height + 2;
              // d.position.x = _C1.position.x;
            }
            d.position.x = _P1.position.x;

            return d;
          });
        }
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
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  // console.log("render00000000", { nodes, edges });

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeDrag={onNodeDrag}
      onConnect={onConnect}
      fitView
      style={rfStyle}
      attributionPosition="top-right"
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
