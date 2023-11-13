import React, { FC, useRef, useEffect } from "react";

type CheckboxState = boolean | "indeterminate";

interface CheckboxProps {
  value: CheckboxState;
  onCheckedChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  id: string;
}

export const Checkbox: FC<CheckboxProps> = ({
  value,
  onCheckedChange,
  label,
  id,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = value === "indeterminate";
    }
  }, [value]);

  return (
    <div className="checkbox">
      <input
        type="checkbox"
        checked={value === true}
        onChange={onCheckedChange}
        ref={inputRef}
        id={id}
        aria-checked={value === "indeterminate" ? "mixed" : value}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
};
