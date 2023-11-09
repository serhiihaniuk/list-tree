import { FC, useState } from "react";
import { getNodes, nodes, Node, changeCheck } from "./util";
import { Checkbox } from "./checkbox";

export const Tree = () => {
  const [items, setItems] = useState(getNodes(nodes));
  const handleSelect = (id: number, status: boolean | "indeterminate") => {
    setItems([...changeCheck(items, id, status)]);
  };

  // TODO: filter items before render
  // filterItemsBeforeRender

  return (
    <div>
      <ul>
        {items.map((node) => (
          <TreeItem onCheck={handleSelect} key={node.id} node={node} />
        ))}
      </ul>
    </div>
  );
};

const TreeItem: FC<{
  node: Node;
  onCheck: (id: number, value: boolean | "indeterminate") => void;
}> = ({ node, onCheck }) => {
  const isBranch = node.children.length > 0;

  const handleSelect = () => {
    console.log(node.id, node.checked);
    if (!isBranch) {
      onCheck(node.id, !node.checked);
      return;
    }

    if (node.checked === false) {
      onCheck(node.id, true);
      return;
    }

    if (node.checked === true) {
      onCheck(node.id, "indeterminate");
      return;
    }

    if (node.checked === "indeterminate") {
      onCheck(node.id, false);
      return;
    }
  };

  return (
    <li>
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <Checkbox
          checked={node.checked}
          onCheckedChange={() => {
            handleSelect();
          }}
        />
        <span>{node.label}</span>
      </div>
      {isBranch && (
        <ul>
          {node.children.map((child) => (
            <TreeItem key={child.id} onCheck={onCheck} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
};
