"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type EditModeCtx = {
  isEditMode: boolean;
  toggleEditMode: () => void;
};

const EditModeContext = createContext<EditModeCtx>({
  isEditMode: false,
  toggleEditMode: () => {},
});

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [isEditMode, setIsEditMode] = useState(false);
  return (
    <EditModeContext.Provider
      value={{ isEditMode, toggleEditMode: () => setIsEditMode((v) => !v) }}
    >
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  return useContext(EditModeContext);
}
