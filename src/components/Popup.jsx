import React from "react";

function Popup({ onClose, onContinueEditing, onNextStep, message }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-black z-50">
        <p className="text-lg text-black font-qimano">Changes Saved!</p>
        <div className="border-b border-3 border-gray-300 mt-3"></div>
        <p className="text-md font-apfel-grotezk-regular mt-3 max-w-xl text-center">
          {message || "All changes have been saved. Any incomplete projects have been saved as drafts and won’t appear in your press kit just yet."}
        </p>
        <div className="flex justify-center gap-5 mt-8 font-apfel-grotezk-regular">
          <button onClick={onContinueEditing} className="mr-2 bg-white border-2 border-electric-blue text-electric-blue px-10 py-2 rounded-md">Keep Editing</button>
          <button onClick={onNextStep} className="bg-electric-blue text-white px-10 py-2 rounded-md">Save and Continue</button>
        </div>
      </div>
    </div>
  );
}

export default Popup;