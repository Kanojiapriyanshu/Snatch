import { useState, useEffect } from "react";
import Image from "next/image";

const QuestionCounter = ({
  value,
  onQuestionChange,
  onAnswerChange,
  maxWords = 75,
  name,
  type,
  answerValue,
  selectedQuestion,
  onSelectQuestion,
  onBlur
}) => {
  const questionSets = {
    general: [
      "What's one thing your content always delivers—no exceptions?",
      "What's the wildest idea you've turned into content—and did it work?",
      "How do you stay real when the internet loves perfect?",
      "What's one lesson you've learned about keeping things relatable?",
      "What's your why—the thing that fuels your creativity?",
      "How do you stay ahead without losing yourself in trends?",
      "Add a custom question",
    ],
    audience: [
      "What's the one question your DMs never stop asking?",
      "What's one topic your followers can't get enough of right now?",
      "What's one product your audience still thanks you for recommending?",
      "How do you know when something's actually connecting with your audience?",
      "What's one thing your audience has taught you about your influence?",
      "How do you hope your audience feels after every post?",
      "Add a custom question",
    ],
    brand: [
      "What's one thing that makes a brand an instant yes for you?",
      "What's the best feedback you've ever gotten from a collaboration?",
      "How do you make branded content feel anything but branded?",
      "What's one thing you won't compromise on in a partnership?",
      "What's been your most unexpected collab—and why did it click?",
      "What's one thing brands might not know about working with you?",
      "Add a custom question",
    ],
  };

  const questions = questionSets[type] || questionSets.general; // Default to "general" if type is undefined
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isOtherSelected, setIsOtherSelected] = useState(false); // Track if "Other" is selected
  const [customQuestion, setCustomQuestion] = useState("")

  const handleSelect = (question) => {
  if (question === "Add a custom question") {
    setIsOtherSelected(true);
    setCustomQuestion("")
    onSelectQuestion(""); // ✅ empty so user can type
  } else {
    setIsOtherSelected(false);
    onSelectQuestion(question); // ✅ set proper string
  }
  setDropdownOpen(false);
};


const handleQuestionChange = (e) => {
  const value = e.target.value;
  setCustomQuestion(value)
  onQuestionChange(value); // ✅ send only string
};


  // Helper to count words
  const countWords = (str) => {
    if (!str) return 0;
    return str.trim().split(/\s+/).filter(Boolean).length;
  };

  // Handler to enforce word limit
  const handleAnswerChange = (e) => {
    const words = countWords(e.target.value);
    if (words <= maxWords) {
      onAnswerChange(e);
    } else {
      // Only allow up to maxWords
      const trimmed = e.target.value.trim().split(/\s+/).slice(0, maxWords).join(' ');
      const fakeEvent = { ...e, target: { ...e.target, value: trimmed } };
      onAnswerChange(fakeEvent);
    }
  };

  return (
    <div className="p-4 border border-gray-300 rounded-lg w-[564px] relative">
      {/* Clickable header row */}
      <div
        className="flex justify-between items-center mb-2 cursor-pointer"
        onClick={() => !isOtherSelected && setDropdownOpen(!dropdownOpen)}
      >
        {/* If custom selected → replace label with input */}
        {isOtherSelected ? (
          <input
            type="text"
            placeholder="Type your custom question..."
            value={customQuestion}
            onChange={handleQuestionChange}
            onBlur={onBlur}   // ✅ trigger save on blur
            className="w-full bg-transparent p-0 border-none font-apfel-grotezk-regular focus:outline-none text-md text-gray-700"
            autoFocus
          />
        ) : (
          <span
            className={`block text-md font-medium font-apfel-grotezk-regular ${
              !selectedQuestion ? "text-electric-blue" : "text-gray-700"
            }`}
          >
            {selectedQuestion || "Select a question*"}
          </span>
        )}

        <span className="ml-1 text-sm text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="#0037EB"
            className={`w-4 h-4 transform transition-transform ${
              dropdownOpen ? "rotate-180" : ""
            }`}
          >
            <path
              fillRule="evenodd"
              d="M12 15.5a.75.75 0 0 1-.53-.22l-6-6a.75.75 0 1 1 1.06-1.06L12 13.69l5.47-5.47a.75.75 0 0 1 1.06 1.06l-6 6a.75.75 0 0 1-.53.22z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </div>

      {/* Dropdown menu */}
      {dropdownOpen && (
  <div className="absolute border bg-[#F9FBFF] border-gray-300 rounded-md w-[520px] mt-1 shadow-md  max-h-56 overflow-y-auto z-10 custom-scrollbar"
  >
    {questions.map((question, index) => (
      <div
        key={index}
        className="p-2 text-md hover:text-electric-blue cursor-pointer font-apfel-grotezk-regular flex items-center gap-2"
        onClick={() => handleSelect(question, index)}
      >
        {question === "Add a custom question" ? (
          <>
            <Image
              src="/assets/images/add-plus.svg"
              width={14}
              height={14}
              alt="add"
              className="w-4 h-4"
            />
            <span>{question}</span>
          </>
        ) : (
          <span>{question}</span>
        )}
      </div>
    ))}
  </div>
)}

      {/* Answer textarea */}
      <div className="relative mt-2">
        <textarea
          name={name}
          value={answerValue}
          onChange={handleAnswerChange}
          onBlur={onBlur}
          placeholder="Enter your response here..."
          className="bg-transparent w-full px-0 py-2 rounded-md font-apfel-grotezk-regular border-gray-200 focus:outline-none text-gray-700 text-sm resize-none"
          rows={2}
        />
        <span className="absolute -bottom-3.5 right-2 text-xs text-gray-500">
          {countWords(answerValue)}/{maxWords} words
        </span>
      </div>
    </div>
  );
};

export default QuestionCounter;