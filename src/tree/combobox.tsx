import { createContext, useState, useContext, ReactNode, FC } from "react";

interface ComboboxContextType {
  showContent: boolean;
  setShowContent: (show: boolean) => void;
}

const ComboboxContext = createContext<ComboboxContextType | undefined>(
  undefined
);

const useCombobox = () => {
  const context = useContext(ComboboxContext);
  if (!context) {
    throw new Error("useCombobox must be used within a ComboboxRoot");
  }
  return context;
};

interface ComboboxRootProps {
  children: ReactNode;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

export const ComboboxRoot: FC<ComboboxRootProps> = ({
  children,
  isOpen,
  onToggle,
}) => {
  const [showContentInternal, setShowContentInternal] = useState(false);

  const isControlled = isOpen !== undefined && onToggle !== undefined;
  const showContent = isControlled ? isOpen : showContentInternal;
  const setShowContent = isControlled ? onToggle : setShowContentInternal;

  const contextValue = {
    showContent,
    setShowContent,
  };

  return (
    <ComboboxContext.Provider value={contextValue}>
      <div className="combobox-root">{children}</div>
    </ComboboxContext.Provider>
  );
};

export const TriggerButton: FC = () => {
  const { setShowContent, showContent } = useCombobox();

  return (
    <button
      className="trigger-button"
      onClick={() => setShowContent(!showContent)}
    >
      Toggle
    </button>
  );
};

interface ComboboxContentProps {
  children: ReactNode;
}

export const ComboboxContent: FC<ComboboxContentProps> = ({ children }) => {
  const { showContent } = useCombobox();

  return showContent && <div className="combobox-content">{children}</div>;
};

interface ComboboxInputProps {
  onFilterChange: (filterText: string) => void;
}

export const ComboboxInput: FC<ComboboxInputProps> = ({ onFilterChange }) => {
  return <input type="text" onChange={(e) => onFilterChange(e.target.value)} />;
};
