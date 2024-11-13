import { Handle, useNodes } from "@xyflow/react";
import { memo } from "react";
import { NodeHeight } from "./nodes";

const GroupContainer = (props) => {
  const { id } = props;
  const nodes = useNodes();

  const children = nodes.filter((node) => node.parentId === id);

  const height = 50 + children.length * (NodeHeight + 20);
  return (
    <div
      className="node_group_container"
      style={{
        zIndex: -1,
        backgroundColor: "#fff",
        padding: "10px",
        borderRadius: "5px",
        height,
        opacity: 0.5,
      }}
    >
      <Handle type="source" id={id + "source"} />
      {id}
      <Handle
        type="target"
        id={id + "target"}
        style={{
          transform: `translateY(${height + 20}px)`,
        }}
      />
    </div>
  );
};
export default memo(GroupContainer);
