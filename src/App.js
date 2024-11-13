import {
  addEdge,
  Background,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  useStoreApi,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useMemo } from "react";
import "reactflow/dist/style.css";
import { nodeTypes } from "./NodeTypes.js";
import { getEdgeId } from "./utils.js";

import initialEdges from "./edges.js";
import initialNodes, { NodeHeight } from "./nodes.js";
const GroupClassName = "grouping-hover";
const GroupNodeName = "group_container";
const rfStyle = {
  backgroundColor: "#D0C0F7",
};

function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { getIntersectingNodes, getInternalNode } = useReactFlow();
  const store = useStoreApi();
  const groupNodes = nodes.filter((n) => n.type === GroupNodeName);
  useEffect(() => {
    setNodes((nds) => {
      return nds.sort((a, b) => {
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
  }, [groupNodes.map((n) => n.id).join("")]);

  const getInnerClosestNode = useCallback((node, parentId) => {
    if (!parentId) {
      return null;
    }
    /**
     * 不放外面定义，因为拿不到最新的node数据
     */
    const { nodeLookup } = store.getState();

    const internalNode = getInternalNode(node.id);
    const innerNodes = Array.from(nodeLookup.values())
      .filter(
        (n) =>
          n.parentId && //TODO:不生效？？？ 【node.type === GroupNodeName】
          n.type !== GroupNodeName &&
          n.parentId === parentId &&
          n.id !== node.id
      )
      .map((n) => {
        const internalNode = getInternalNode(n.id);
        return internalNode;
      })
      .sort((a, b) => {
        return a.internals.positionAbsolute.y - b.internals.positionAbsolute.y;
      });

    const index = innerNodes.findIndex((n) => {
      return (
        n.internals.positionAbsolute.y >=
        internalNode.internals.positionAbsolute.y
      );
    });

    const topNeighbor = innerNodes[index - 1] || null;
    const bottomNeighbor = innerNodes[index] || null;
    if (index === 0) {
      return {
        index,
        topNeighbor,
        bottomNeighbor,
        previousNodes: [],
        flowingNodes: innerNodes,
      };
    } else if (index > 0) {
      return {
        index,
        topNeighbor,
        bottomNeighbor,
        previousNodes: innerNodes.slice(0, index),
        flowingNodes: innerNodes.slice(index),
      };
    } else {
      return {
        index,
        topNeighbor: innerNodes.at(-1) ?? null,
        bottomNeighbor: null,
        previousNodes: innerNodes,
        flowingNodes: [],
      };
    }
  }, []);

  const getInterGroup = useCallback((node) => {
    const { nodeLookup } = store.getState();
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
      if (node.type === GroupNodeName) {
        return;
      }
      const interGroup = getInterGroup(node);
      const { index, topNeighbor, bottomNeighbor } =
        getInnerClosestNode(node, interGroup?.id) ?? {};

      setNodes((ns) => {
        const nextNodes = ns.map((n) => {
          let className = "";
          if (interGroup?.id === n.id) {
            className = GroupClassName;
          } else if (topNeighbor?.id === n.id) {
            className = "drop-over-downward";
          } else if (bottomNeighbor?.id === n.id) {
            className = "drop-over-upward";
          }
          return {
            ...n,
            parentId: n.id === node.id ? undefined : n.parentId,
            extent: n.id === node.id ? undefined : n.extent,
            className,
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

  const deleteCurrentNodeEdge = (preEdges, node) => {
    const nextEdges = preEdges
      .filter((edge) => edge.source !== node.id && edge.target !== node.id)
      .map((e) => {
        return {
          ...e,
          animated: false,
        };
      });
    const source = preEdges.find((p) => p.target === node.id)?.source;
    const target = preEdges.find((p) => p.source === node.id)?.target;
    if (source && target && source !== target) {
      nextEdges.push({
        source,
        target,
        id: getEdgeId(source, target),
      });
    }
    return nextEdges;
  };

  const onNodeDragStop = useCallback(
    (_, node) => {
      if (node.type === GroupNodeName) {
        return;
      }

      const interGroup = getInterGroup(node);
      if (interGroup) {
        /** move in */
        const {
          index,
          topNeighbor,
          bottomNeighbor,
          previousNodes = [],
          flowingNodes = [],
        } = getInnerClosestNode(node, interGroup?.id) ?? {};
        console.log("🚀 ~ getInnerClosestNode ~nextNodes+previousNodes:", {
          index,
          previousNodes,
          flowingNodes,
        });

        setNodes((ns) => {
          const nextNodes = ns.map((n) => {
            if (node.type !== GroupNodeName && n.id === node.id) {
              /**
               * @deprecated n.position.x = 0;
               * nodeWidth = groupWidth 所以 extent之后不用设置x
               */
              n.parentId = interGroup.id;
              n.extent = "parent";
              const y =
                50 +
                (NodeHeight + 20) *
                  (index > -1
                    ? index
                    : previousNodes.length + flowingNodes.length);
              n.position.y = y;
            }
            if (flowingNodes.some((fNode) => fNode.id === n.id)) {
              const index =
                previousNodes.length +
                flowingNodes.findIndex((fNode) => fNode.id === n.id) +
                2;
              const y = 50 + (NodeHeight + 20) * index;
              n.position.y = y;
            } else if (previousNodes.some((fNode) => fNode.id === n.id)) {
              const index = previousNodes.findIndex(
                (fNode) => fNode.id === n.id
              );
              const y = 50 + (NodeHeight + 20) * index;
              n.position.y = y;
            }
            return {
              ...n,
              className: "",
            };
          });
          return nextNodes;
        });
        setEdges((eds) => {
          let nextEdges = eds.map((e) => {
            return {
              ...e,
              animated: false,
            };
          });

          nextEdges = deleteCurrentNodeEdge(nextEdges, node);
          if (topNeighbor && !bottomNeighbor) {
            //插在最后一个
            nextEdges = nextEdges.filter(
              (edge) => edge.source !== topNeighbor.id
            );
            return addNewEdge(nextEdges, [
              {
                source: topNeighbor.id,
                target: node.id,
                id: getEdgeId(topNeighbor.id, node.id),
              },
              {
                source: node.id,
                target: interGroup.id,
                id: getEdgeId(node.id, interGroup.id),
              },
            ]);
          } else if (!topNeighbor && bottomNeighbor) {
            //插在第一个
            nextEdges = nextEdges.filter(
              (edge) => edge.target !== bottomNeighbor.id
            );
            return addNewEdge(nextEdges, [
              {
                source: node.id,
                target: bottomNeighbor.id,
                id: getEdgeId(node.id, bottomNeighbor.id),
              },
              {
                source: interGroup.id,
                target: node.id,
                id: getEdgeId(interGroup.id, node.id),
              },
            ]);
          } else if (topNeighbor && bottomNeighbor) {
            //插在中间
            nextEdges = nextEdges.filter(
              (edge) =>
                edge.source !== topNeighbor.id ||
                edge.target !== bottomNeighbor.id
            );
            return addNewEdge(nextEdges, [
              {
                source: topNeighbor.id,
                target: node.id,
                id: getEdgeId(topNeighbor.id, node.id),
              },
              {
                source: node.id,
                target: bottomNeighbor.id,
                id: getEdgeId(node.id, bottomNeighbor.id),
              },
            ]);
          } else if (!topNeighbor && !bottomNeighbor) {
            //parent没有children
            return addNewEdge(nextEdges, [
              {
                source: interGroup.id,
                target: node.id,
                id: getEdgeId(interGroup.id, node.id),
              },
              {
                source: node.id,
                target: interGroup.id,
                id: getEdgeId(node.id, interGroup.id),
              },
            ]);
          }
        });
      } else {
        /** move out */
        setEdges((preEdges) => {
          return deleteCurrentNodeEdge(preEdges, node);
        });
      }
    },
    [getInterGroup]
  );

  const addNewEdge = useCallback((preEdges, newEdges) => {
    newEdges.forEach((newEdge) => {
      if (!preEdges.find((p) => p.id === newEdge.id)) {
        preEdges.push(newEdge);
      }
    });
    return preEdges;
  }, []);

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

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
      nodeTypes={useMemo(() => nodeTypes, [])}
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
