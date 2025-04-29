"use client";
import React, { useState, useEffect, useCallback } from "react";
import Accordion from "./Accordion";
import Profilecustomfile from "./Profilecustomfile";
import QuestionCounter from "./QuestionCounter";
import Image from "next/image";
import { saveQuestionsToDB, fetchProfileData, removeQuestion } from "@/utils/postQuestions";

const About = () => {
  const [aboutQuestions, setAboutQuestions] = useState([{ question: "", answer: "", coverImage: null, coverImageName: null }]);
  const [audienceQuestions, setAudienceQuestions] = useState([{ question: "", answer: "", coverImage: null, coverImageName: null }]);
  const [brandQuestions, setBrandQuestions] = useState([{ question: "", answer: "", coverImage: null, coverImageName: null }]);
  const [unsavedChanges, setUnsavedChanges] = useState({
    about: new Set(),
    audience: new Set(),
    brand: new Set()
  });

  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { aboutQuestions, audienceQuestions, brandQuestions } = await fetchProfileData();
        // Ensure at least one question exists in each section
        setAboutQuestions(aboutQuestions.length > 0 ? aboutQuestions : [{ question: "", answer: "", coverImage: null, coverImageName: null }]);
        setAudienceQuestions(audienceQuestions.length > 0 ? audienceQuestions : [{ question: "", answer: "", coverImage: null, coverImageName: null }]);
        setBrandQuestions(brandQuestions.length > 0 ? brandQuestions : [{ question: "", answer: "", coverImage: null, coverImageName: null }]);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  const handleQuestionChange = (e, index, sectionKey, defaultQuestion) => {
    const newQuestions = [...(sectionKey === "about" ? aboutQuestions : sectionKey === "audience" ? audienceQuestions : brandQuestions)];
    const selectedQuestion = e.target.value?.trim() || defaultQuestion;
    newQuestions[index].question = selectedQuestion;
    updateSectionState(sectionKey, newQuestions);
    
    // Mark this question as having unsaved changes
    setUnsavedChanges(prev => ({
      ...prev,
      [sectionKey]: new Set(prev[sectionKey]).add(index)
    }));
  };
  
  const handleAnswerChange = (e, index, sectionKey) => {
    const newQuestions = [...(sectionKey === "about" ? aboutQuestions : sectionKey === "audience" ? audienceQuestions : brandQuestions)];
    newQuestions[index].answer = e.target.value;
    updateSectionState(sectionKey, newQuestions);
    
    setUnsavedChanges(prev => ({
      ...prev,
      [sectionKey]: new Set(prev[sectionKey]).add(index)
    }));
  };
  
  const handleCoverChange = (imageData, index, sectionKey) => {
    const newQuestions = [...(sectionKey === "about" ? aboutQuestions : sectionKey === "audience" ? audienceQuestions : brandQuestions)];
    newQuestions[index].coverImage = imageData.url;
    newQuestions[index].coverImageName = imageData.name;
    updateSectionState(sectionKey, newQuestions);
    
    setUnsavedChanges(prev => ({
      ...prev,
      [sectionKey]: new Set(prev[sectionKey]).add(index)
    }));
  };

  const handleSaveChanges = async (index, sectionKey) => {
    try {
      const questions = sectionKey === "about" ? aboutQuestions : 
                       sectionKey === "audience" ? audienceQuestions : 
                       brandQuestions;
      
      await saveQuestionsToDB(sectionKey, [questions[index]]);
      
      // Clear unsaved changes for this question
      setUnsavedChanges(prev => ({
        ...prev,
        [sectionKey]: new Set([...prev[sectionKey]].filter(i => i !== index))
      }));
      
      // Show success message (you can implement your own notification system)
      alert("Changes saved successfully!");
    } catch (error) {
      console.error("Failed to save changes:", error);
      alert("Failed to save changes. Please try again.");
    }
  };

  const addQuestion = (sectionKey) => {
    const newQuestions = [...(sectionKey === "about" ? aboutQuestions : sectionKey === "audience" ? audienceQuestions : brandQuestions), { question: "", answer: "", coverImage: null, coverImageName: null }];
    updateSectionState(sectionKey, newQuestions);
  };

  const handleRemoveQuestion = async (questionId, sectionKey) => {
    try {
      const currentQuestions = sectionKey === "about" ? aboutQuestions :
                               sectionKey === "audience" ? audienceQuestions :
                               brandQuestions;
  
      const updatedQuestions = currentQuestions.filter((q) => q._id !== questionId);
      updateSectionState(sectionKey, updatedQuestions);
  
      await removeQuestion(questionId, sectionKey, updateSectionState);
    } catch (error) {
      console.error("Failed to remove question:", error);
      const { aboutQuestions, audienceQuestions, brandQuestions } = await fetchProfileData();
      if (sectionKey === "about") setAboutQuestions(aboutQuestions);
      if (sectionKey === "audience") setAudienceQuestions(audienceQuestions);
      if (sectionKey === "brand") setBrandQuestions(brandQuestions);
    }
  };

  const updateSectionState = (sectionKey, newState) => {
    if (sectionKey === "about") setAboutQuestions(newState);
    if (sectionKey === "audience") setAudienceQuestions(newState);
    if (sectionKey === "brand") setBrandQuestions(newState);
  };

  const toggleAccordion = (index) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const handleSelectQuestion = (question, index, sectionKey) => {
    const newQuestions = [...(sectionKey === "about" ? aboutQuestions : sectionKey === "audience" ? audienceQuestions : brandQuestions)];
    newQuestions[index].question = question || newQuestions[0]?.question || ""; // Fallback to default question
    updateSectionState(sectionKey, newQuestions);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 flex flex-col gap-10">
      {/* Accordion 1 – About You */}
      <Accordion title="About You*" isOpen={openIndex === 0} onToggle={() => toggleAccordion(0)}>
        <div className="text-gray-600 w-full overflow-y-auto h-[270px]" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {aboutQuestions.map((item, index) => (
            <div key={index} className="mb-4 p-2 rounded-md" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <QuestionCounter
                label={`Question ${index + 1}`}
                value={item.question}
                onQuestionChange={(e) => handleQuestionChange(e, index, "about", aboutQuestions[0]?.question)}
                onAnswerChange={(e) => handleAnswerChange(e, index, "about")}
                maxLength={100}
                name={`aboutQuestion_${index}`}
                answerValue={item.answer}
                type="about"
                selectedQuestion={item.question} // Pass selected question
                onSelectQuestion={(question) => handleSelectQuestion(question, index, "about")} // Update parent state
              />
              <div className="flex items-center gap-4 mb-4">
              <Profilecustomfile
                onFileChange={(uploadedUrl) => handleCoverChange(uploadedUrl, index, "about")}
                placeholder="Choose a cover picture "
                iconSrc="/assets/icons/onboarding/Upload.svg"
                label="Cover Picture"
                type="about"
                currentQuestionIndex={index}
                coverImage={item.coverImage} // Pass coverImage from parent state
                coverImageName={item.coverImageName} // Pass coverImageName from parent state
                currentQuestion={item}
              />

              
                <button 
                  onClick={() => handleSaveChanges(index, "about")}
                  className="bg-electric-blue text-white px-4 py-3 rounded-md text-sm mt-7 font-apfel-grotezk-regular"
                >
                  Save answer
                </button>
             
            </div>

              {index > 0 && (
                <button onClick={() => handleRemoveQuestion(item._id, "about", item.question)} className="text-red-500 text-sm mt-2">
                  Remove Question
                </button>
              )}
            </div>
          ))}

          <div className="flex -mt-4 cursor-pointer" onClick={() => addQuestion("about")}>
            <Image src="/assets/images/plus.svg" width={25} height={25} alt="plus icon" className="mr-1" />
            <p className="font-qimano text-graphite ">Add a new question</p>
            <div className="flex-1 ml-2 mt-3.5 border-t border-gray-200"></div>
          </div>
        </div>
      </Accordion>

      {/* Accordion 2 – About Audience */}
      <Accordion title="About Audience*" isOpen={openIndex === 1} onToggle={() => toggleAccordion(1)}>
        <div className="text-gray-600 w-full overflow-y-auto h-[270px]" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {audienceQuestions.map((item, index) => (
            <div key={index} className="mb-4 p-2 rounded-md">
              <QuestionCounter
                label={`Question ${index + 1}`}
                value={item.question}
                onQuestionChange={(e) => handleQuestionChange(e, index, "audience")}
                onAnswerChange={(e) => handleAnswerChange(e, index, "audience")}
                maxLength={100}
                name={`audienceQuestion_${index}`}
                answerValue={item.answer}
                type="audience"
                selectedQuestion={item.question} // Pass selected question
                onSelectQuestion={(question) => handleSelectQuestion(question, index, "audience")} // Update parent state
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
                <button 
                  onClick={() => handleSaveChanges(index, "audience")}
                  className="bg-electric-blue text-white px-4 py-3 rounded-md text-sm mt-7 font-apfel-grotezk-regular"
                >
                  Save answer
                </button>
           
              </div>
              {index > 0 && (
                <button onClick={() => handleRemoveQuestion(index, "audience")} className="text-red-500 text-sm mt-2">
                  Remove Question
                </button>
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
      <Accordion title="Brand Connection*" isOpen={openIndex === 2} onToggle={() => toggleAccordion(2)}>
        <div className="text-gray-600 w-full overflow-y-auto h-[270px]" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {brandQuestions.map((item, index) => (
            <div key={index} className="mb-4 p-2 rounded-md">
              <QuestionCounter
                label={`Question ${index + 1}`}
                value={item.question}
                onQuestionChange={(e) => handleQuestionChange(e, index, "brand", brandQuestions[0]?.question)}
                onAnswerChange={(e) => handleAnswerChange(e, index, "brand")}
                maxLength={100}
                name={`brandQuestion_${index}`}
                answerValue={item.answer}
                type="brand"
                selectedQuestion={item.question} // Pass selected question
                onSelectQuestion={(question) => handleSelectQuestion(question, index, "brand")} // Update parent state
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
                <button 
                  onClick={() => handleSaveChanges(index, "brand")}
                  className="bg-electric-blue text-white px-4 py-3 rounded-md text-sm mt-7 font-apfel-grotezk-regular"
                >
                  Save answer
                </button>
              </div>
              {index > 0 && (
                <button onClick={() => handleRemoveQuestion(index, "brand")} className="text-red-500 text-sm mt-2">
                  Remove Question
                </button>
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
  );
};

export default About;