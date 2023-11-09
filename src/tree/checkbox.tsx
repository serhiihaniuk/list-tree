import * as Ch from "@radix-ui/react-checkbox";

export const Checkbox = ({
  checked,
  onCheckedChange,
}: {
  checked: boolean | "indeterminate";
  onCheckedChange: () => void;
}) => {
  const val =
    checked === "indeterminate" ? "⎼" : checked === false ? "of" : "✓";
  return (
    <Ch.Root
      style={{ width: "35px", height: "35px", marginRight: "10px" }}
      className="check"
      checked={checked}
      onCheckedChange={onCheckedChange}
    >
      <Ch.Indicator>{val}</Ch.Indicator>
    </Ch.Root>
  );
};
