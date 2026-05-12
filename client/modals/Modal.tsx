import React from "react";

interface Props {
  children: React.ReactNode;
}

function Modal(props: Props) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center">
      <div className="fixed inset-0 transition-opacity">
        <div className="absolute inset-0 bg-neutral-900 opacity-75"></div>
      </div>
      <div
        className="relative z-50 flex items-center justify-center p-4"
        tabIndex={-1}
      >
        {props.children}
      </div>
    </div>
  );
}

export default Modal;
