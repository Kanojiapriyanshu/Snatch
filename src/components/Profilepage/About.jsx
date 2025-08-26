"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import Accordion from "./Accordion";
import Profilecustomfile from "./Profilecustomfile";
import QuestionCounter from "./QuestionCounter";
import Image from "next/image";
import { saveQuestionsToDB, fetchProfileData, removeQuestion } from "@/utils/postQuestions";
import { useQueryClient } from "@tanstack/react-query";
import debounce from "lodash.debounce";

const About = ({ onComplete }) => {
  const [aboutQuestions, setAboutQuestions] = useState([{ question: "", answer: "", coverImage: null, coverImageName: null }]);
  const [audienceQuestions, setAudienceQuestions] = useState([{ question: "", answer: "", coverImage: null, coverImageName: null }]);
  const [brandQuestions, setBrandQuestions] = useState([{ question: "", answer: "", coverImage: null, coverImageName: null }]);
  const debouncedSaveRef = useRef();
  const [unsavedChanges, setUnsavedChanges] = useState({
    about: new Set(),
    audience: new Set(),
    brand: new Set()
  });

  const [openIndex, setOpenIndex] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { aboutQuestions, audienceQuestions, brandQuestions } = await fetchProfileData();

        const finalAbout = aboutQuestions.length > 0 ? aboutQuestions : [{ question: "", answer: "", coverImage: null, coverImageName: null }];
        const finalAudience = audienceQuestions.length > 0 ? audienceQuestions : [{ question: "", answer: "", coverImage: null, coverImageName: null }];
        const finalBrand = brandQuestions.length > 0 ? brandQuestions : [{ question: "", answer: "", coverImage: null, coverImageName: null }];

        setAboutQuestions(finalAbout);
        setAudienceQuestions(finalAudience);
        setBrandQuestions(finalBrand);

        // ✅ Open first accordion by default for "about"
        setOpenIndex(0);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

    // Check completion: at least one non-empty answer in each section
  useEffect(() => {
    const aboutDone = aboutQuestions.some(q => q.answer && q.answer.trim().length > 0);
    const audienceDone = audienceQuestions.some(q => q.answer && q.answer.trim().length > 0);
    const brandDone = brandQuestions.some(q => q.answer && q.answer.trim().length > 0);

    // If all three have at least one answer, About is "complete"
    if (aboutDone && audienceDone && brandDone) {
      onComplete?.(true);
    } else {
      onComplete?.(false);
    }
  }, [aboutQuestions, audienceQuestions, brandQuestions, onComplete]);

  const updateSectionState = (sectionKey, newState) => {
    if (sectionKey === "about") setAboutQuestions(newState);
    if (sectionKey === "audience") setAudienceQuestions(newState);
    if (sectionKey === "brand") setBrandQuestions(newState);
  };

  const toggleAccordion = (index) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  };

const debouncedSave = useCallback(
  debounce(async (sectionKey) => {
    const questions =
      sectionKey === "about"
        ? aboutQuestions
        : sectionKey === "audience"
        ? audienceQuestions
        : brandQuestions;

    try {
      await saveQuestionsToDB(sectionKey, questions); // send entire section
      setUnsavedChanges((prev) => ({
        ...prev,
        [sectionKey]: new Set(), // clear unsaved marks for that section
      }));
      queryClient.invalidateQueries({ queryKey: ["aboutCompletion"] });
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  }, 1000),
  [aboutQuestions, audienceQuestions, brandQuestions]
);

const handleQuestionChange = (newQuestion, index, sectionKey) => {
  const newQuestions = [
    ...(sectionKey === "about"
      ? aboutQuestions
      : sectionKey === "audience"
      ? audienceQuestions
      : brandQuestions),
  ];
  newQuestions[index].question = newQuestion.trim();
  updateSectionState(sectionKey, newQuestions);

  setUnsavedChanges((prev) => ({
    ...prev,
    [sectionKey]: new Set(prev[sectionKey]).add(index),
  }));

  // Trigger debounce auto-save
  debouncedSave(sectionKey);
};


const handleAnswerChange = (e, index, sectionKey) => {
  const newQuestions = [
    ...(sectionKey === "about"
      ? aboutQuestions
      : sectionKey === "audience"
      ? audienceQuestions
      : brandQuestions),
  ];
  newQuestions[index].answer = e.target.value;
  updateSectionState(sectionKey, newQuestions);

  setUnsavedChanges((prev) => ({
    ...prev,
    [sectionKey]: new Set(prev[sectionKey]).add(index),
  }));

  // Trigger debounce auto-save
  debouncedSave(sectionKey);
};

  
const handleCoverChange = (imageData, index, sectionKey) => {
  const newQuestions = [
    ...(sectionKey === "about"
      ? aboutQuestions
      : sectionKey === "audience"
      ? audienceQuestions
      : brandQuestions),
  ];

  newQuestions[index].coverImage = imageData.url;
  newQuestions[index].coverImageName = imageData.name;
  updateSectionState(sectionKey, newQuestions);

  setUnsavedChanges((prev) => ({
    ...prev,
    [sectionKey]: new Set(prev[sectionKey]).add(index),
  }));

  // Trigger debounce auto-save
  debouncedSave(sectionKey);
};

  const addQuestion = (sectionKey) => {
    const newQuestion = { question: "", answer: "", coverImage: null, coverImageName: null };
    const updatedQuestions = [...(sectionKey === "about" ? aboutQuestions : sectionKey === "audience" ? audienceQuestions : brandQuestions), newQuestion];
    updateSectionState(sectionKey, updatedQuestions);
  };

  const handleRemoveQuestion = async (questionId, sectionKey) => {
    try {
      await removeQuestion(questionId, sectionKey, updateSectionState);
      // No need to manually filter local state, as removeQuestion fetches and updates state.
    } catch (error) {
      console.error("Failed to remove question:", error);
      alert("Failed to remove question. Please try again.");
    }
  };

  const handleSelectQuestion = (question, index, sectionKey) => {
    const newQuestions = [...(sectionKey === "about" ? aboutQuestions : sectionKey === "audience" ? audienceQuestions : brandQuestions)];
    newQuestions[index].question = question || newQuestions[0]?.question || "";
    updateSectionState(sectionKey, newQuestions);
  };
  
    return (
    <div className="w-full h-screen overflow-y-auto"  style={{ maxHeight: 'calc(135vh - 96px)', scrollbarWidth: 'none',       
    msOverflowStyle: 'none'}}>
      <div className="w-full max-w-5xl mx-auto p-6 overflow-y-auto flex flex-col gap-3" style={{ maxHeight: 'calc(135vh - 96px)', scrollbarWidth: 'none',       
    msOverflowStyle: 'none'}}>
      <h3 className="text-lg font-qimano max-w-md text-center mx-auto">This section helps brands understand your perspective, your 
        <span> story, and the audience behind you.</span>
      </h3>
      <p className="text-sm font-apfel-grotezk-regular mx-auto text-gray-500 mb-5">*Share at least one answer in each category!</p>

      <div className="flex flex-col gap-3 h-screen overflow-y-auto">
         {/* Accordion 1 – About You */}
      <Accordion title="About* / What makes you, you?" isOpen={openIndex === 0} onToggle={() => toggleAccordion(0)}>
        <div className="text-gray-600 w-full overflow-y-auto h-[270px]" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {aboutQuestions.map((item, index) => (
            <div key={index} className="mb-4 p-2 rounded-md" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <QuestionCounter
                label={`Question ${index + 1}`}
                value={item.question}
                 onQuestionChange={(newValue) => handleQuestionChange(newValue, index, "about")}

                onAnswerChange={(e) => handleAnswerChange(e, index, "about")}
                maxWords={75}
                name={`aboutQuestion_${index}`}
                answerValue={item.answer}
                type="about"
                selectedQuestion={item.question}
                onSelectQuestion={(question) => handleSelectQuestion(question, index, "about")}
              />

              <div className="flex w-[100%] items-center gap-4 mb-4">
                <Profilecustomfile
                  onFileChange={(uploadedUrl) => handleCoverChange(uploadedUrl, index, "about")}
                  placeholder="Choose a cover picture"
                  iconSrc="/assets/icons/onboarding/Upload.svg"
                  label="Cover Picture"
                  type="about"
                  currentQuestionIndex={index}
                  coverImage={item.coverImage}
                  coverImageName={item.coverImageName}
                  currentQuestion={item}
                />

              </div>

              {index > 0 && (
      item._id ? (
        <button
          onClick={() => handleRemoveQuestion(item._id, "about")}
          className="flex items-center text-electric-blue text-sm mt-2"
        >
          <Image
            src="/assets/icons/settings/Cross.svg"
            width={16}
            height={16}
            alt="Remove icon"
            className="mr-2"
          />
          Remove question
        </button>
      ) : (
        <button
          onClick={() => {
            // Remove from local state if not saved in DB
            const updated = aboutQuestions.filter((_, i) => i !== index);
            setAboutQuestions(updated);
          }}
          className="flex items-center text-electric-blue text-sm mt-2"
        >
          <Image
            src="/assets/icons/settings/Cross.svg"
            width={16}
            height={16}
            alt="Remove icon"
            className="mr-2"
          />
          Remove question
        </button>
      )
    )}

            </div>
          ))}

          <div className="flex -mt-4 cursor-pointer" onClick={() => addQuestion("about")}>
            <Image src="/assets/images/plus.svg" width={25} height={25} alt="plus icon" className="mr-1" />
            <p className="font-qimano text-graphite">Add a new question</p>
            <div className="flex-1 ml-2 mt-3.5 border-t border-gray-200"></div>
          </div>
        </div>
      </Accordion>

      {/* Accordion 2 – About Audience */}
      <Accordion title="Audience* / What keeps your community interested?" isOpen={openIndex === 1} onToggle={() => toggleAccordion(1)}>
        <div className="text-gray-600 w-full overflow-y-auto h-[270px]" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {audienceQuestions.map((item, index) => (
            <div key={index} className="mb-4 p-2 rounded-md">
              <QuestionCounter
                label={`Question ${index + 1}`}
                value={item.question}
                  onQuestionChange={(newValue) => handleQuestionChange(newValue, index, "audience")}

                onAnswerChange={(e) => handleAnswerChange(e, index, "audience")}
                maxWords={75}
                name={`audienceQuestion_${index}`}
                answerValue={item.answer}
                type="audience"
                selectedQuestion={item.question}
                onSelectQuestion={(question) => handleSelectQuestion(question, index, "audience")}
              />

              <div className="flex items-center gap-4 mb-4">
                <Profilecustomfile
                  onFileChange={(uploadedUrl) => handleCoverChange(uploadedUrl, index, "audience")}
                  placeholder="Choose a cover picture"
                  iconSrc="/assets/icons/onboarding/Upload.svg"
                  label="Cover Picture"
                  type="audience"
                  currentQuestionIndex={index}
                  currentQuestion={item}
                />

              
              </div>

              {index > 0 && (
      item._id ? (
        <button
          onClick={() => handleRemoveQuestion(item._id, "audience")}
          className="flex items-center text-electric-blue text-sm mt-2"
        >
          <Image
            src="/assets/icons/settings/Cross.svg"
            width={16}
            height={16}
            alt="Remove icon"
            className="mr-2"
          />
          Remove question
        </button>
      ) : (
        <button
          onClick={() => {
            // Remove from local state if not saved in DB
            const updated = audienceQuestions.filter((_, i) => i !== index);
            setAudienceQuestions(updated);
          }}
          className="flex items-center text-electric-blue text-sm mt-2"
        >
          <Image
            src="/assets/icons/settings/Cross.svg"
            width={16}
            height={16}
            alt="Remove icon"
            className="mr-2"
          />
          Remove question
        </button>
      )
    )}

            </div>
          ))}

          <div className="flex -mt-4 cursor-pointer" onClick={() => addQuestion("audience")}>
            <Image src="/assets/images/plus.svg" width={25} height={25} alt="plus icon" className="mr-1" />
            <p className="font-qimano text-graphite">Add a new question</p>
            <div className="flex-1 ml-2 mt-3.5 border-t border-gray-200"></div>
          </div>
        </div>
      </Accordion>

      {/* Accordion 3 – Brand Connection */}
      <Accordion title="Partnerships / What makes a brand the right fit?" isOpen={openIndex === 2} onToggle={() => toggleAccordion(2)}>
        <div className="text-gray-600 w-full overflow-y-auto h-[270px]" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {brandQuestions.map((item, index) => (
            <div key={index} className="mb-4 p-2 rounded-md">
              <QuestionCounter
                label={`Question ${index + 1}`}
                value={item.question}
                onQuestionChange={(newValue) => handleQuestionChange(newValue, index, "brand")}
                onAnswerChange={(e) => handleAnswerChange(e, index, "brand")}
                maxWords={75}
                name={`brandQuestion_${index}`}
                answerValue={item.answer}
                type="brand"
                selectedQuestion={item.question}
                onSelectQuestion={(question) => handleSelectQuestion(question, index, "brand")}
              />

              <div className="flex items-center gap-4 mb-4">
                <Profilecustomfile
                  onFileChange={(uploadedUrl) => handleCoverChange(uploadedUrl, index, "brand")}
                  placeholder="Choose a cover picture"
                  iconSrc="/assets/icons/onboarding/Upload.svg"
                  label="Cover Picture"
                  type="brand"
                  currentQuestionIndex={index}
                  currentQuestion={item}
                />

              </div>

              {index > 0 && (
      item._id ? (
        <button
          onClick={() => handleRemoveQuestion(item._id, "brand")}
          className="flex items-center text-electric-blue text-sm mt-2"
        >
          <Image
            src="/assets/icons/settings/Cross.svg"
            width={16}
            height={16}
            alt="Remove icon"
            className="mr-2"
          />
          Remove question
        </button>
      ) : (
        <button
          onClick={() => {
            // Remove from local state if not saved in DB
            const updated = brandQuestions.filter((_, i) => i !== index);
            setBrandQuestions(updated);
          }}
          className="flex items-center text-electric-blue text-sm mt-2"
        >
          <Image
            src="/assets/icons/settings/Cross.svg"
            width={16}
            height={16}
            alt="Remove icon"
            className="mr-2"
          />
          Remove question
        </button>
      )
    )}

            </div>
          ))}

          <div className="flex -mt-4 cursor-pointer" onClick={() => addQuestion("brand")}>
            <Image src="/assets/images/plus.svg" width={25} height={25} alt="plus icon" className="mr-1" />
            <p className="font-qimano text-graphite">Add a new question</p>
            <div className="flex-1 ml-2 mt-3.5 border-t border-gray-200"></div>
          </div>
        </div>
      </Accordion>

      </div>
    
    </div>
    </div>
  );
};

export default About;



  //   const handleSaveChanges = async (index, sectionKey) => {
//   try {
//     const questions = sectionKey === "about" ? aboutQuestions :
//                       sectionKey === "audience" ? audienceQuestions :
//                       brandQuestions;

//     await saveQuestionsToDB(sectionKey, [questions[index]]);
//     alert("Question saved successfully!")
//     setUnsavedChanges(prev => ({
//       ...prev,
//       [sectionKey]: new Set([...prev[sectionKey]].filter(i => i !== index))
//     }));

//     // Invalidate aboutCompletion query so layout re-checks completion
//     queryClient.invalidateQueries({ queryKey: ["aboutCompletion"] });
//   } catch (error) {
//     console.error("Failed to save changes:", error);
//     alert("Failed to save changes. Please try again.");
//   }
// };
