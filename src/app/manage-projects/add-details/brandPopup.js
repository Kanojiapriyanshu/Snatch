"use client";
import React from "react";
import Image from "next/image";

const BrandPopup = ({
  showBrandPopup,
  popupAnimating,
  popupStep,
  activeCaption,
  activeMediaLink,
  isBrandCollaboration,
  popupUserInput,
  popupGenerating,
  setShowBrandPopup,
  setPopupAnimating,
  setPopupStep,
  setPopupUserInput,
  handleBrandPopupChoice,
  handlePromptChange,
  handlePopupGenerate,
}) => {
  return (
    <>
      {(showBrandPopup || popupAnimating) && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed top-0 left-[35vw] h-full w-[65vw] z-40 bg-black/10 backdrop-blur-sm transition-opacity duration-500 ${
              showBrandPopup
                ? "opacity-70 pointer-events-auto"
                : "opacity-70 pointer-events-none"
            }`}
          />

          {/* Sliding Popup */}
          <div
            className="fixed top-0 left-0 z-50 h-full"
            style={{
              width: "38vw",
              minWidth: 320,
              maxWidth: 800,
              pointerEvents: "auto",
              transform: showBrandPopup ? "translateX(0)" : "translateX(-100%)",
              transition: "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)",
            }}
          >
            <div
              className="h-full w-full bg-white shadow-lg rounded-r-3xl flex flex-col items-center"
              style={{
                borderTopRightRadius: 32,
                borderBottomRightRadius: 32,
                boxShadow: "2px 0 24px rgba(0,0,0,0.08)",
              }}
            >
              <div className="p-8 mt-20 flex flex-col items-center w-full max-w-lg mx-auto transition-all duration-500">
                {popupStep === 1 ? (
                  <>
                    {/* Step 1 - Brand or Personal */}
                    <div className="flex justify-center mb-6">
                      <Image
                        src="/assets/images/aiLogo.svg"
                        className="w-28 h-10"
                        width={10}
                        height={10}
                        alt="AI Logo"
                      />
                    </div>

                    <h2 className="text-2xl text-center text-graphite font-qimano mb-6 leading-snug">
                      Was this in collaboration with a brand or something you
                      shared independently?
                    </h2>

                    {/* Media + Caption Preview */}
                    {activeCaption && (
                      <div className="mb-8 p-3 bg-gray-100 rounded-lg w-full flex items-start gap-3 text-dark-grey text-sm">
                        {activeMediaLink && (
                          <div className="relative w-[32px] h-[48px] rounded-md overflow-hidden flex-shrink-0">
                            {/(\.mp4|\.webm|\.ogg)(\?|$)/i.test(activeMediaLink) ? (
                              <video
                                src={activeMediaLink}
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Image
                                src={activeMediaLink}
                                alt="Project media"
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                        )}

                        <span className="font-apfel-grotezk-regular">
                          {activeCaption.length > 150
                            ? activeCaption.slice(0, 150) + "..."
                            : activeCaption}
                        </span>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                      <button
                        className="w-full sm:w-auto px-6 py-2 rounded-lg border border-electric-blue text-electric-blue hover:bg-electric-blue hover:text-white transition"
                        onClick={() => handleBrandPopupChoice(true)}
                      >
                        It is a brand post
                      </button>
                      <button
                        className="w-full sm:w-auto px-6 py-2 rounded-lg border border-electric-blue text-electric-blue hover:bg-electric-blue hover:text-white transition"
                        onClick={() => handleBrandPopupChoice(false)}
                      >
                        It is a personal post
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Step 2 - Describe Post */}
                    <button
                      className="absolute top-6 left-6 flex items-center text-electric-blue text-base font-apfel-grotezk-regular"
                      onClick={() => setPopupStep(1)}
                    >
                      <span className="mr-2">←</span> Go Back
                    </button>

                    <div className="flex items-center mr-10">
                      <Image
                        src="/assets/images/aiLogo.svg"
                        className="w-14 h-7"
                        width={10}
                        height={10}
                        alt="AI Logo"
                      />
                      <h2 className="text-[22px] font-qimano text-electric-blue mb-6 mt-7 text-center">
                        Tell us about the post, we&rsquo;ll do the rest!
                      </h2>
                    </div>

                    {activeCaption && (
                      <div className="w-full">
                        <div className="mb-4 p-3 bg-gray-100 rounded-lg w-full flex gap-3 text-dark-grey text-sm">
                          {activeMediaLink && (
                            <div className="relative w-[32px] h-[48px] rounded-md overflow-hidden flex-shrink-0">
                              {/(\.mp4|\.webm|\.ogg)(\?|$)/i.test(activeMediaLink) ? (
                                <video
                                  src={activeMediaLink}
                                  playsInline
                                  muted
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Image
                                  src={activeMediaLink}
                                  alt="Project media"
                                  fill
                                  className="object-cover"
                                />
                              )}
                            </div>
                          )}
                          <span className="font-apfel-grotezk-regular">
                            {activeCaption.length > 150
                              ? activeCaption.slice(0, 150) + "..."
                              : activeCaption}
                          </span>
                        </div>

                        <label className="flex items-center gap-2 text-graphite text-sm mb-1 font-apfel-grotezk-regular">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-dark-grey"
                            checked={popupUserInput === activeCaption}
                            onChange={(e) => {
                              if (e.target.checked)
                                setPopupUserInput(activeCaption);
                              else setPopupUserInput("");
                            }}
                          />
                          Use the caption as your prompt
                        </label>
                      </div>
                    )}

                    <div className="relative w-full">
                      <textarea
                        className="mt-5 w-full text-graphite font-apfel-grotezk-regular text-[16px] tracking-normal leading-[120%] p-4 border border-gray-300 rounded-lg min-h-[200px] mb-4 focus:outline-none focus:border-blue-600 placeholder:text-dark-grey"
                        value={popupUserInput}
                        onChange={(e) => handlePromptChange(e.target.value)}
                      />

                      {!popupUserInput && (
                        <div className="absolute top-8 left-4 right-4 text-dark-grey whitespace-pre-line pointer-events-none font-apfel-grotezk-regular text-[16px] tracking-normal">
                          {isBrandCollaboration ? (
                            <>
                              <p className="mb-1">
                                Share the key details of this collaboration:
                              </p>
                              <ul className="list-disc list-inside -mt-1">
                                <li>The brand name</li>
                                <li>Where it took place</li>
                                <li>What the event or campaign was about</li>
                                <li>How you added your magic to it</li>
                              </ul>
                            </>
                          ) : (
                            <p>
                              Tell us what this post is about. What inspired you
                              to make it, and why do you think it matters to your
                              audience?
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1 flex-nowrap">
                      <button
                        className="2xl:px-8 px-6 py-2 rounded-lg border-[1.5px] bg-white border-electric-blue text-electric-blue hover:bg-electric-blue hover:text-white text-sm font-apfel-grotezk-regular transition whitespace-nowrap flex-shrink-0"
                        onClick={() => {
                          setShowBrandPopup(false);
                          setPopupAnimating(true);
                          setTimeout(() => setPopupAnimating(false), 500);
                        }}
                        disabled={popupGenerating}
                      >
                        Skip AI & enter manually
                      </button>

                      <button
                        className={`2xl:px-8 px-6 py-2 rounded-lg ${
                          popupGenerating || !popupUserInput.trim()
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "border-2 bg-electric-blue text-white hover:bg-white hover:text-electric-blue"
                        } min-w-[240px] text-sm font-apfel-grotezk-regular transition cursor-pointer whitespace-nowrap flex-shrink-0`}
                        onClick={handlePopupGenerate}
                        disabled={popupGenerating || !popupUserInput.trim()}
                      >
                        {popupGenerating
                          ? "Generating..."
                          : "Generate my project details"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default BrandPopup;
