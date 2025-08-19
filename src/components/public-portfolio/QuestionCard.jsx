"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { clsx } from "clsx";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

const Questionnaire = ({ name }) => {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);
  const username = parts[0];

  // ✅ Use React Query instead of useEffect + useState
  const { data, isLoading, isError } = useQuery({
    queryKey: ["questionnaire", username],
    queryFn: async () => {
      const response = await fetch(`/api/public-portfolio/questions?username=${username}`);
      const result = await response.json();
      if (!result?.questionnaires) throw new Error("No questionnaires found");
      return result.questionnaires;
    },
    staleTime: 1000 * 60 * 5, // cache for 5 min
  });

  // Refs and scroll state
  const desktopScrollRef = useRef(null);
  const mobileScrollRef = useRef(null);
  const [scrollResetTrigger, setScrollResetTrigger] = useState(0);
  const [currentScrollIndex, setCurrentScrollIndex] = useState(0);

  // Build flat cards safely
  const allCards = (data || []).flatMap((item) =>
    item.sections.flatMap((section) =>
      section.questions.map((q, i) => ({
        question: q.question,
        answer: q.answer,
        coverImage: q.coverImage,
        cardType: getCardType(section.section),
        key: `${section.section}-${i}`,
      }))
    )
  );

  // Loading & error states
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Failed to load questions.</div>;

  // Calculate navigation visibility
  const totalCards = allCards.length;
  const showLeftButton = currentScrollIndex > 0;
  const showRightButton = currentScrollIndex < totalCards - 3; // Show right button if there are more than 3 cards remaining
  const showNavButtons = totalCards > 3; // Only show navigation if more than 3 cards

  // Desktop scroll function - scroll by 3 cards (one full view)
  const scrollDesktop = (direction) => {
    const container = desktopScrollRef.current;
    if (container) {
      let newIndex = currentScrollIndex;
      
      if (direction === "left") {
        newIndex = Math.max(0, currentScrollIndex - 3);
      } else {
        newIndex = Math.min(totalCards - 3, currentScrollIndex + 3);
      }
      
      setCurrentScrollIndex(newIndex);
      
      // Calculate scroll position with increased gap (each card is approximately 430px wide including gap)
      const cardWidth = 430; // 370px card + 60px gap
      const scrollPosition = newIndex * cardWidth;
      
      container.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className={clsx(
      "relative pb-10",
      "lg:mt-10 lg:ml-2",
      "flex flex-col items-center"
    )}>
      <h3 className="text-[45px] text-center lg:text-7xl text-2xl font-qimano text-electric-blue mb-0">About {name}</h3>

      {/* Mobile view: horizontal scroll with snap and partial next card visibility */}
      <div className="lg:hidden relative flex-grow flex justify-start w-full max-w-full mt-5">
        {allCards.length > 0 && (
          <div
            ref={mobileScrollRef}
            className="flex overflow-x-scroll scrollbar-hide snap-x snap-mandatory w-full max-w-full justify-start"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            onScroll={() => setScrollResetTrigger(prev => prev + 1)}
          >
            {allCards.map((card, index) => (
              <div
                key={card.key}
                className="flex-shrink-0 snap-center"
                style={{
                  marginRight: (index < allCards.length - 1) ? '3vw' : '0',
                  marginLeft: 0
                }}
              >
                <QuestionCard
                  question={card.question}
                  answer={card.answer}
                  coverImage={card.coverImage}
                  cardType={card.cardType}
                  isMobile
                  scrollResetTrigger={scrollResetTrigger}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop view: controlled horizontal scroll showing 3.5 cards with increased gaps */}
      <div className="hidden lg:flex relative flex-grow justify-center w-full">
        {/* Left Scroll Button */}
        {showNavButtons && showLeftButton && (
          <button
            onClick={() => scrollDesktop("left")}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-transform hover:scale-110 w-20 h-18"
            aria-label="Scroll Left"
          >
            <div className="w-full h-full">
              <Image
                src="/assets/images/Lefthand.svg"
                alt="left-arrow"
                width={56}
                height={56}
                className="w-full h-full object-contain"
              />
            </div>
          </button>
        )}

        {/* Scrollable Cards Container - Full width to allow rightmost card to reach edge */}
        <div className="relative overflow-hidden w-full">
          <div
            ref={desktopScrollRef}
            className="mt-5 lg:mt-4 pb-5 lg:pb-0 overflow-x-hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div className="flex gap-16 w-max pl-8 pr-8">
              {allCards.map((card) => (
                <QuestionCard
                  key={card.key}
                  question={card.question}
                  answer={card.answer}
                  coverImage={card.coverImage}
                  cardType={card.cardType}
                />
              ))}
            </div>
          </div>
          
          {/* Gradient overlay on the right to show partial 4th card - positioned closer to edge */}
          {showNavButtons && (
            <div className="absolute top-0 right-0 w-16 h-full  to-transparent pointer-events-none" />
          )}
        </div>

        {/* Right Scroll Button - positioned closer to edge */}
        {showNavButtons && showRightButton && (
          <button
            onClick={() => scrollDesktop("right")}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 transition-transform hover:scale-110 w-12 h-14"
            aria-label="Scroll Right"
          >
            <div className="w-full h-full">
              <Image
                src="/assets/images/next.svg"
                alt="right-arrow"
                width={56}
                height={56}
                className="w-full h-full object-contain"
              />
            </div>
          </button>
        )}
      </div>
    </div>
  );
};

const QuestionCard = ({ question, answer, coverImage, cardType, isMobile = false, scrollResetTrigger }) => {
  const [hovered, setHovered] = useState(false);
  const [touched, setTouched] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  const handleTouchStart = () => {
    if (isMobile) {
      setTouched(true);
    }
  };

  const handleTouchEnd = () => {
    if (isMobile) {
      setTouched(false);
    }
  };

  const handleClick = () => {
    if (isMobile) {
      setIsRevealed(!isRevealed);
    }
  };

  // Reset revealed state when card changes
  useEffect(() => {
    setIsRevealed(false);
  }, [question, scrollResetTrigger]);

  return (
    <div
      className={clsx(
        "relative flex border rounded-3xl overflow-hidden cursor-pointer shrink-0 transition-transform duration-300",
        isMobile ? "w-[75vw] h-[490px]" : "w-[370px] h-[530px]",
        isMobile && touched ? "-translate-y-4" : ""
      )}
      onMouseEnter={() => !isMobile && setHovered(true)}
      onMouseLeave={() => !isMobile && setHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
    >
      <Image
        src={coverImage || "https://res.cloudinary.com/dgk9ok5fx/image/upload/v1740396552/7_r6djcr.jpg"}
        alt="Preview"
        className="w-full h-full object-cover"
        width={165}
        height={228}
      />

      {/* Overlay for 'Click to reveal' on mobile when not revealed */}
      {isMobile && !isRevealed && (
        <div className="absolute inset-0 flex flex-col justify-center items-center bottom-20 font-qimano bg-black/40 text-white text-[38px]">
          <p>Click to reveal</p>
        </div>
      )}

      <div
        className={clsx(
          `absolute left-0 p-4 bottom-0 w-full flex flex-col items-center transition-all duration-300 rounded-t-xl`,
          cardType.bg,
          cardType.text,
          isMobile
            ? (isRevealed ? "h-[100%]" : "h-[50%]")
            : (hovered ? "h-[100%]" : "h-[45%]")
        )}
        style={{ minHeight: isMobile ? 0 : 240 }}
      >
        <Image
          src={cardType.icon}
          alt="icon"
          height={10}
          width={10}
          className="w-20 h-17 mt-4 lg:mt-0 lg:mb-2"
        />
        <p className={clsx("text-center text-xl p-2 lg:text-2xl font-qimano mb-0 line-clamp-3", cardType.text, "lg:mb-0 lg:mt-0")}
           style={{ minHeight: '4.5em' }}>
          {question}
        </p>
        <p className="font-apfel-grotezk-regular text-xs text-center mb-2 lg:mb-2 lg:mt-0">
          {cardType.bg === "bg-lime-yellow"
            ? "About"
            : cardType.bg === "bg-graphite"
            ? "Audience"
            : cardType.bg === "bg-electric-blue"
            ? "Brand"
            : ""}
        </p>
        {(isMobile ? isRevealed : hovered) && (
          <p
            className={clsx(
              "text-[16px] lg:text-[16px] text-center font-apfel-grotezk-regular mt-2",
              cardType.text
            )}
          >
            {answer}
          </p>
        )}
      </div>
    </div>
  );
};

function getCardType(section) {
  switch (section) {
    case "about":
      return {
        bg: "bg-lime-yellow",
        text: "text-black",
        icon: "/assets/images/aboutIcon.svg",
      };
    case "brand":
      return {
        bg: "bg-electric-blue",
        text: "text-white",
        icon: "/assets/images/brandicon1.svg",
      };
    case "audience":
      return {
        bg: "bg-graphite",
        text: "text-white",
        icon: "/assets/images/audienceIcon.svg",
      };
    default:
      return {
        bg: "bg-gray-200",
        text: "text-black",
        icon: "/assets/images/defaultIcon.svg",
      };
  }
}

export default Questionnaire;