type InputValue = {
  id: number;
  label: string;
  parent: number | null;
  checked?: boolean;
};

export type Node = {
  id: number;
  value: number;
  label: string;
  children: Node[];
  checked: boolean | "indeterminate";
};

export const nodes: InputValue[] = [
  { id: 1, label: "item 1", parent: null },
  { id: 2, label: "item 2", parent: 1 },
  { id: 3, label: "item 3", parent: 1 },
  { id: 4, label: "item 4", parent: 2 },
  { id: 5, label: "item 5", parent: 2 },
  { id: 6, label: "item 6", parent: 3 },
  { id: 7, label: "item 7", parent: 3 },
  { id: 8, label: "item 8", parent: null },
  { id: 9, label: "item 9", parent: 8 },
  { id: 10, label: "item 10", parent: 2 },
  { id: 11, label: "item 11", parent: 2 },
];

export const getNodes = (input: InputValue[]): Node[] => {
  const nodes: Node[] = [];
  const map: { [key: number]: Node } = {};

  input.forEach((item) => {
    const node: Node = {
      id: item.id,
      value: item.id,
      label: item.label,
      children: [],
      checked: item.checked ? item.checked : false,
    };

    map[node.id] = node;

    if (item.parent !== null) {
      map[item.parent].children.push(node);
    } else {
      nodes.push(node);
    }
  });

  return nodes;
};

const findNode = (nodes: Node[], id: number): Node | undefined => {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }

    const found = findNode(node.children, id);
    if (found) {
      return found;
    }
  }
};

const changeNodeCheck = (
  node: Node,
  checked: boolean | "indeterminate"
): void => {
  node.checked = checked;

  if (checked !== "indeterminate") {
    node.children.forEach((child) => {
      changeNodeCheck(child, checked);
    });
  }
};

const updateTreeCheckStatuses = (nodes: Node[]): void => {
  for (const node of nodes) {
    if (node.children.length > 0) {
      updateTreeCheckStatuses(node.children);
      const checkedChildren = node.children.filter(
        (child) => child.checked === true
      );

      if (checkedChildren.length === node.children.length) {
        //skip
      } else if (
        checkedChildren.length > 0 ||
        node.children.some((child) => child.checked === "indeterminate") ||
        node.checked === "indeterminate"
      ) {
        node.checked = "indeterminate";
      } else {
        node.checked = false;
      }
    }
  }
};

export const changeCheck = (
  nodes: Node[],
  id: number,
  checked: boolean | "indeterminate"
): Node[] => {
  const node = findNode(nodes, id);

  if (node) {
    changeNodeCheck(node, checked);
  }

  updateTreeCheckStatuses(nodes);

  return nodes;
};
