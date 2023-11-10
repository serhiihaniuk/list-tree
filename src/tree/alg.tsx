import { useState } from "react";

type InputValue = {
  id: number;
  label: string;
  parent: number | null;
  checked?: boolean;
};

export type ProductNode = {
  id: number;
  parentId: number | null;
  children: number[];
  checked: boolean | "indeterminate";
  label: string;
};

export type NodeMap = { [id: number]: ProductNode };

export const convertToNodeMap = (inputValues: InputValue[]): NodeMap => {
  const nodeMap: NodeMap = {};

  inputValues.forEach((input) => {
    nodeMap[input.id] = {
      id: input.id,
      parentId: input.parent,
      children: [],
      checked: input.checked || false,
      label: input.label,
    };
  });

  inputValues.forEach((input) => {
    if (input.parent !== null) {
      nodeMap[input.parent].children.push(input.id);
    }
  });

  return nodeMap;
};
const findNode = (nodeMap: NodeMap, id: number): ProductNode | undefined => {
  return nodeMap[id];
};

const changeNodeCheck = (
  nodeMap: NodeMap,
  id: number,
  checked: boolean | "indeterminate"
): void => {
  const node = findNode(nodeMap, id);
  if (!node || node.checked === checked) return;

  node.checked = checked;
  if (checked !== "indeterminate") {
    node.children.forEach((childId) =>
      changeNodeCheck(nodeMap, childId, checked)
    );
  }

  if (node.parentId !== null) {
    updateParentCheckStatus(nodeMap, node.parentId);
  }
};

const updateParentCheckStatus = (nodeMap: NodeMap, parentId: number): void => {
  const parentNode = findNode(nodeMap, parentId);
  if (!parentNode || parentNode.children.length === 0) return;

  const children = parentNode.children.map((childId) => nodeMap[childId]);
  const checkedChildrenCount = children.filter(
    (child) => child.checked === true
  ).length;
  const indeterminateChildren = children.some(
    (child) => child.checked === "indeterminate"
  );

  if (checkedChildrenCount === children.length) {
    parentNode.checked = true;
  } else if (checkedChildrenCount > 0 || indeterminateChildren) {
    parentNode.checked = "indeterminate";
  } else {
    parentNode.checked = false;
  }

  if (parentNode.parentId !== null) {
    updateParentCheckStatus(nodeMap, parentNode.parentId);
  }
};

export const changeCheck = (
  nodeMap: NodeMap,
  id: number,
  checked: boolean | "indeterminate"
): void => {
  changeNodeCheck(nodeMap, id, checked);
};

function filterTree(nodeMap: NodeMap, searchTerm: string): NodeMap {
  const result: NodeMap = {};
  const children: NodeMap = {};
  const parents: NodeMap = {};
  const foundNodes: Set<number> = new Set();

  const addAllChildrenToMap = (node: ProductNode) => {
    node.children.forEach((childId) => {
      children[childId] = nodeMap[childId];
      addAllChildrenToMap(nodeMap[childId]);
    });
  };

  Object.values(nodeMap).forEach((node) => {
    if (node.label.includes(searchTerm)) {
      result[node.id] = node;
      foundNodes.add(node.id);

      addAllChildrenToMap(node);
    }
  });

  Object.values(result).forEach((node) => {
    let currentParent = node.parentId;
    while (currentParent !== null) {
      const parent = { ...nodeMap[currentParent] };
      parent.children = parent.children.filter((childId) =>
        foundNodes.has(childId)
      );
      parents[parent.id] = parent;

      foundNodes.add(parent.id);
      currentParent = parent.parentId;
    }
  });
  return { ...result, ...children, ...parents };
}

export const useTreeState = (initialValues: InputValue[]) => {
  const initialNodeMap = convertToNodeMap(initialValues);

  const [nodeMap, setNodeMap] = useState<NodeMap>(initialNodeMap);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredNodeMap = filterTree({ ...nodeMap }, searchTerm);

  const topLevelNodes = Object.values(
    searchTerm ? filteredNodeMap : nodeMap
  ).filter((node) => node.parentId === null);

  const updateNodeCheck = (
    id: number,
    checked: boolean | "indeterminate"
  ): void => {
    const updatedNodeMap = { ...nodeMap };

    changeNodeCheck(updatedNodeMap, id, checked);

    setNodeMap(updatedNodeMap);
  };

  return [
    nodeMap,
    topLevelNodes,
    updateNodeCheck,
    searchTerm,
    setSearchTerm,
  ] as const;
};
