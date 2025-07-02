"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PostCard({ post, postId, username, allPosts }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isPortrait, setIsPortrait] = useState(false);
  const router = useRouter();

  const checkOrientation = (width, height) => {
    return height > width;
  };

  const currentIndex = allPosts ? allPosts.findIndex((p) => p.mediaId === postId) : -1;
  const totalPosts = allPosts ? allPosts.length : 0;

  useEffect(() => {
    if (!username || !postId) {
      console.error("Missing required props:", { username, postId });
      setLoading(false);
      return;
    }

    const fetchInsights = async () => {
      // Only fetch insights for Instagram posts
      if (post.media.source === "instagram") {
        try {
          const url = `/api/public-portfolio/media-insights?username=${encodeURIComponent(
            username
          )}&postId=${encodeURIComponent(postId)}`;

          const res = await fetch(url);
          const data = await res.json();

          if (data.success) {
            const insightsArray = data.insights.data;
            const insightsMap = {};

            insightsArray.forEach((item) => {
              insightsMap[item.name] = item.values?.[0]?.value || 0;
            });

            setInsights(insightsMap);
          } else {
            throw new Error(data.error || "Failed to fetch insights");
          }
        } catch (error) {
          console.error("Error fetching insights:", error);
          setInsights(null);
        }
      }
      setLoading(false);
    };

    fetchInsights();
  }, [username, postId, post.media.source]);

  const handleNavigation = (direction) => {
    if (!allPosts || allPosts.length === 0) return;

    const currentIndex = allPosts.findIndex((p) => p.mediaId === postId);
    let nextIndex;

    if (direction === "next") {
      nextIndex = currentIndex === allPosts.length - 1 ? 0 : currentIndex + 1;
    } else {
      nextIndex = currentIndex === 0 ? allPosts.length - 1 : currentIndex - 1;
    }

    const nextPost = allPosts[nextIndex];
    const pathname = window.location.pathname;
    const isAdminView = pathname.includes('/adminview');
    
    // Construct the URL based on whether it's admin view or not
    const baseUrl = `/${username}/media-kit${isAdminView ? '/adminview' : ''}/post`;
    router.push(`${baseUrl}/?postId=${nextPost.mediaId}`);
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "ArrowLeft") {
        handleNavigation("prev");
      } else if (event.key === "ArrowRight") {
        handleNavigation("next");
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [postId, allPosts]);

  if (loading) return <div>Loading...</div>;
  if (!post) return <p>No post found.</p>;

  const imageUrl = post.media?.files?.[0]?.url;
  const title = post.post?.titleName || "Untitled";
  const description = post.post?.description || "No description available.";
  const industries = post.post?.industries || [];
  const companyName = post.post?.companyName;
  const companyLocation = post.post?.companyLocation;
  const companyLogo = post.post?.companyLogo;
  const eventTypes = post.post?.eventTypes || [];

  const hasCompanyInfo =
    companyName &&
    (companyLocation || eventTypes.length > 0 || companyLogo);

  return (
    <div className="w-full flex flex-col items-center justify-start mt-10">
      {/* Cross icon: fixed for desktop, absolute/scrollable for mobile */}
      <button
        className="z-50  items-center justify-center flex
          absolute right-2 top-2 w-7 h-7 min-w-[28px] min-h-[28px]
          md:fixed md:right-60 md:top-9 md:w-14 md:h-14 md:min-w-[40px] md:min-h-[30px]"
        onClick={() => router.push(`/${username}/media-kit`)}
        aria-label="Go to Portfolio"
      >
        <Image
          src="/assets/icons/cross-mark.svg"
          alt="Go to Portfolio"
          width={20}
          height={20}
          className="w-full h-full object-contain md:w-8 md:h-9"
        />
      </button>
      {/* Main overlay background for large devices */}
      <div className="hidden md:flex fixed inset-0 w-full h-full bg-black/2 z-10 pointer-events-none" aria-hidden="true"></div>
      {/* Desktop content wrapper with navigation arrows close to card */}
      <div className="hidden md:flex flex-col items-center justify-center w-full relative z-20">
        <div className="flex items-center justify-center w-full relative" style={{ minHeight: '430px', overflowY: 'visible' }}>
          {/* Left Arrow - close to card */}
          <button
            onClick={() => handleNavigation('prev')}
            className="absolute left-1/8 -translate-x-[490px] top-1/2 -translate-y-1/2 z-30"
            aria-label="Previous"
            style={{ minWidth: 56, minHeight: 56 }}
          >
            <div className="w-17 h-17 flex items-center justify-center">
              <Image
                src="/assets/images/Lefthand.svg"
                alt="Previous"
                width={56}
                height={56}
                className="w-full h-full object-contain"
              />
            </div>
          </button>
          {/* Card (unchanged) */}
          <div className="w-[864px] h-[450px] p-2 bg-[#FFFFFF] rounded-lg mx-auto">
            <div className="flex gap-5 items-center mt-2">
              {/* Media Section */}
              <div className="w-[300px] h-full pl-5 pt-5">
                <div className={`w-[250px] ${isPortrait ? 'aspect-[4/6]' : 'h-auto'} overflow-hidden rounded-lg flex items-center`}>
                  {(() => {
                    if (!post) {
                      return <p className="text-graphite flex justify-center items-center h-[50vh]">No post selected</p>;
                    }
                    if (post.media?.type === "IMAGE") {
                      return (
                        <div className="relative w-[300px]">
                          <Image
                            src={post.media.files[0].url}
                            alt={post.media.files[0].name || 'Image'}
                            width={300}
                            height={1200}
                            className={`w-full ${isPortrait ? 'aspect-[4/6]' : 'h-auto'} bg-cover rounded-lg`}
                            onLoadingComplete={({ naturalWidth, naturalHeight }) => {
                              setIsPortrait(checkOrientation(naturalWidth, naturalHeight));
                            }}
                          />
                        </div>
                      );
                    } else if (post.media?.type === "VIDEO") {
                      return (
                        <div className="relative p-0 w-[300px]">
                          <video
                            src={post.media.files[0].url}
                            controls
                            width={300}
                            height={1200}
                            className={`w-full ${isPortrait ? 'aspect-[4/6]' : 'h-auto'} object-cover rounded-lg`}
                            onLoadedMetadata={(e) => {
                              setIsPortrait(checkOrientation(e.target.videoWidth, e.target.videoHeight));
                            }}
                          />
                        </div>
                      );
                    } else if (post.media?.type === "CAROUSEL" && post.media.files?.length > 0) {
                      return (
                        <div className="relative w-full">
                          <div className="w-full overflow-hidden rounded-lg">
                            {post.media.files.map((file, index) => (
                              <div
                                key={index}
                                className={`transition-opacity duration-500 w-full ${carouselIndex === index ? "opacity-100" : "opacity-0 absolute inset-0"}`}
                              >
                                {file.type === "IMAGE" ? (
                                  <Image
                                    src={file.url}
                                    alt={`Carousel image ${index + 1}`}
                                    width={300}
                                    height={1200}
                                    className={`w-full h-auto object-contain rounded-lg ${isPortrait ? 'aspect-[4/6]' : 'h-auto'}`}
                                    onLoadingComplete={({ naturalWidth, naturalHeight }) => {
                                      setIsPortrait(checkOrientation(naturalWidth, naturalHeight));
                                    }}
                                  />
                                ) : file.type === "VIDEO" ? (
                                  <video
                                    controls
                                    className={`w-full h-auto object-contain rounded-lg ${isPortrait ? 'aspect-[4/6]' : 'h-auto'}`}
                                    onLoadedMetadata={(e) => {
                                      setIsPortrait(checkOrientation(e.target.videoWidth, e.target.videoHeight));
                                    }}
                                  >
                                    <source src={file.url} type="video/mp4" />
                                  </video>
                                ) : null}
                              </div>
                            ))}
                          </div>
                          {/* Navigation buttons for carousel */}
                          <div className="absolute inset-0 flex items-center justify-between px-2">
                            <button
                              className="z-10 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center"
                              onClick={() => setCarouselIndex(carouselIndex === 0 ? post.media.files.length - 1 : carouselIndex - 1)}
                              aria-label="Previous carousel item"
                            >
                              ❮
                            </button>
                            <button
                              className="z-10 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center"
                              onClick={() => setCarouselIndex(carouselIndex === post.media.files.length - 1 ? 0 : carouselIndex + 1)}
                              aria-label="Next carousel item"
                            >
                              ❯
                            </button>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>

              {/* Details Section */}
              <div className="w-full h-full pl-5 pr-5 mt-5">
                <p className="text-2xl text-graphite font-qimano">{post.post?.titleName || 'Title of the project'}</p>
                <div className="flex gap-1 flex-wrap max-w-xl mr-10">
                  {post.post?.industries?.length > 0 ? (
                    post.post.industries.map((industry, index) => (
                      <span
                        key={index}
                        className="bg-[#0037EB]/5 text-graphite my-2 font-apfel-grotezk-regular inline-block rounded border border-transparent py-1 px-2.5 text-xs font-medium"
                      >
                        {industry}
                      </span>
                    ))
                  ) : (
                    <span>Industry</span>
                  )}
                </div>

                <div className="w-full border-b-[0.5px] border-gray-300 mt-2"></div>

                <div className={`flex items-center space-x-2 ${post.post?.isBrandCollaboration ? 'mt-[2rem]' : 'mt-[0]'}`}>
                  {post.post?.isBrandCollaboration && (
                    <div className="brand-collaboration-section flex gap-3">
                      <Image
                        src={post.post.companyLogo || "/assets/images/logo.svg"}
                        width={50}
                        height={50}
                        alt={post.post.companyLogo ? "Company Logo" : "Default Logo"}
                        className="h-12 w-12 bg-cover rounded-full"
                      />
                      {(post.post.companyName || post.post.companyLocation || post.post.eventTypes?.length > 0) && (
                        <div className="h-12 border-l border-gray-400"></div>
                      )}

                      {(post.post.companyName || post.post.companyLocation || post.post.eventTypes?.length > 0) && (
                        <div className="text-graphite font-apfel-grotezk-regular text-sm space-y-1">
                          {(post.post.companyName || post.post.companyLocation) && (
                            <p>
                              {post.post.companyName && (
                                <> <span className="text-graphite">{post.post.companyName}</span></>
                              )}
                              {post.post.companyLocation && (
                                <> • {post.post.companyLocation}</>
                              )}
                            </p>
                          )}

                          <div className="flex gap-2">
                            {post.post.eventTypes?.length > 0 && (
                              <p className="">
                                {post.post.eventTypes.map((eventType, index) => (
                                  <span key={index} className="px-1 -ml-2 text-sm">
                                    {index > 0 ? " | " : " • "}{eventType}
                                  </span>
                                ))}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <p className={`${post.post?.isBrandCollaboration ? 'text-graphite font-apfel-grotezk-regular mr-3 mt-5' : 'text-graphite font-apfel-grotezk-regular mr-3 mt-6'}`}>
                  {post.post?.description || 'Description of the project'}
                </p>

                {post.media.source === "instagram" && (
                  <div className={`w-full border-b-[0.5px] border-gray-300 ${post.post?.isBrandCollaboration ? 'mt-8' : 'mt-36'}`}></div>
                )}

                {post.media.source === "instagram" && insights && (
                  <div className="mt-5 flex justify-between text-graphite  w-full">
                    {[
                      { label: "Views", key: "impressions" },
                      { label: "Likes", key: "likes" },
                      { label: "Shares", key: "shares" },
                      { label: "Comments", key: "comments" },
                    ].map(({ label, key }) => (
                      <div className="flex flex-col items-center min-w-[40px] text-center" key={key}>
                        <div className="text-[22px] leading-none font-qimano text-graphite">
                          {insights?.[key] ?? 0}
                        </div>
                        <div className="text-[12px] text-gray-500 font-apfel-grotezk-regular mt-1">
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Right Arrow - close to card */}
          <button
            onClick={() => handleNavigation('next')}
            className="absolute left-1/8 translate-x-[490px] top-1/2 -translate-y-1/2 z-30"
            aria-label="Next"
            style={{ minWidth: 56, minHeight: 56 }}
          >
            <div className="w-17 h-17 flex items-center justify-center">
              <Image
                src="/assets/images/Righthand.svg"
                alt="Next"
                width={56}
                height={56}
                className="w-full h-full object-contain"
              />
            </div>
          </button>
        </div>
      </div>
      
      {/* Mobile layout: only for mobile screens */}
      <div className="flex md:hidden flex-col w-full">
        {/* Fixed Header for Mobile */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white p-4 flex justify-between items-center shadow-sm">
          <div className="text-graphite font-apfel-grotezk-regular text-sm font-medium">
            {totalPosts > 0 ? `${currentIndex + 1} / ${totalPosts}` : ''}
          </div>
          <button
            className="bg-[#F2F2F2] rounded-full shadow-lg border border-gray-200 items-center justify-center flex w-7 h-7 min-w-[28px] min-h-[28px]"
            onClick={() => router.push(`/${username}/media-kit`)}
            aria-label="Go to Portfolio"
          >
            <Image
              src="/assets/icons/cross-mark.svg"
              alt="Go to Portfolio"
              width={20}
              height={20}
              className="w-full h-full object-contain"
            />
          </button>
        </div>
        {/* Main Content for Mobile */}
        <div className="flex-grow flex flex-col w-full px-4 pt-4 pb-24 mt-[60px] overflow-y-auto rounded-lg bg-white" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {/* Media Section (mobile) */}
          <div className="relative w-full flex-shrink-0 flex items-center justify-center rounded-lg">
            <div className="relative w-full rounded-lg overflow-hidden flex items-center justify-center">
              {post.media?.type === "CAROUSEL" && post.media.files?.length > 0 ? (
                
                <div className="relative w-full">
                  <div className="w-full overflow-hidden rounded-lg">
                    {post.media.files.map((file, index) => (
                      <div
                        key={index}
                        className={`transition-opacity duration-500 w-full ${carouselIndex === index ? "opacity-100" : "opacity-0 absolute inset-0"}`}
                      >
                        {file.type === "IMAGE" ? (
                          <Image
                            src={file.url}
                            alt={`Carousel image ${index + 1}`}
                            width={300}
                            height={400}
                            className={`w-full h-auto object-contain rounded-lg ${isPortrait ? 'aspect-[4/6]' : 'h-auto'}`}
                            onLoadingComplete={({ naturalWidth, naturalHeight }) => {
                              setIsPortrait(checkOrientation(naturalWidth, naturalHeight));
                            }}
                          />
                        ) : file.type === "VIDEO" ? (
                          <video
                            controls
                            className={`w-full h-auto object-contain rounded-lg ${isPortrait ? 'aspect-[4/6]' : 'h-auto'}`}
                            onLoadedMetadata={(e) => {
                              setIsPortrait(checkOrientation(e.target.videoWidth, e.target.videoHeight));
                            }}
                          >
                            <source src={file.url} type="video/mp4" />
                          </video>
                        ) : null}
                      </div>
                    ))}
                  </div>
                  {/* Navigation Arrows */}
                  <button
                    onClick={() => setCarouselIndex(carouselIndex === 0 ? post.media.files.length - 1 : carouselIndex - 1)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center"
                    aria-label="Previous"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => setCarouselIndex(carouselIndex === post.media.files.length - 1 ? 0 : carouselIndex + 1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center"
                    aria-label="Next"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 6L15 12L9 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              ) : post.media?.type === "VIDEO" ? (
                <video
                  controls
                  className={`w-full h-auto object-contain rounded-lg ${isPortrait ? 'aspect-[4/6]' : 'h-auto'}`}
                  onLoadedMetadata={(e) => {
                    setIsPortrait(checkOrientation(e.target.videoWidth, e.target.videoHeight));
                  }}
                >
                  <source src={post.media.files[0].url} type="video/mp4" />
                </video>
              ) : post.media?.type === "IMAGE" ? (
                <Image
                  src={post.media.files[0].url}
                  alt="Post media"
                  width={300}
                  height={400}
                  className={`w-full h-auto object-contain rounded-lg ${isPortrait ? 'aspect-[4/6]' : 'h-auto'}`}
                  onLoadingComplete={({ naturalWidth, naturalHeight }) => {
                    setIsPortrait(checkOrientation(naturalWidth, naturalHeight));
                  }}
                />
              ) : null}
              {/* Play Icon and Views Overlay */}
              {insights?.impressions != null && (
                <div className="absolute left-3 bottom-3 flex items-center gap-2 bg-black/60 rounded-lg px-2 py-1">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="9" fill="#fff"/><path d="M7.5 6.5L12 9L7.5 11.5V6.5Z" fill="#212121"/></svg>
                  <span className="text-white text-base font-semibold">{insights?.impressions ?? 0}</span>
                </div>
              )}
            </div>
          </div>
          {/* Engagement Metrics Section (moved just below media for mobile) */}
          <div className="w-full">
            <div className="w-full h-px bg-[#e5e5e5] mb-4"></div>
            <div className="mt-2 flex justify-between text-black w-full px-1">
              {[
                { label: "Views", key: "impressions" },
                { label: "Likes", key: "likes" },
                { label: "Shares", key: "shares" },
                { label: "Comments", key: "comments" },
              ].map(({ label, key }) => (
                <div className="flex flex-col items-center min-w-[40px] text-center" key={key}>
                  <div className="text-[19px] leading-none font-qimano text-[#212121]">
                    {insights?.[key] ?? 0}
                  </div>
                  <div className="text-[12px] text-graphite font-apfel-grotezk-regular mt-1">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Title */}
          <div className="flex items-start justify-between mt-4 mb-1 px-1 relative">
            <h2 className="text-lg font-qimano text-[#212121] leading-tight max-w-[85%] min-h-[32px] flex items-center break-words whitespace-normal">
              {title}
            </h2>
          </div>
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-2 mt-1 min-h-[24px] items-center px-1">
            {industries.length > 0 ? (
              industries.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-[#0037EB]/5 text-graphite text-[0.85rem] font-medium font-inter rounded-lg"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-[0.85rem]">No industries listed</span>
            )}
          </div>
          {/* Company Info */}
          {hasCompanyInfo ? (
            <div className="flex items-center gap-3 mb-2 min-h-[36px] px-1">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs">
                {companyLogo ? (
                  <Image
                    src={companyLogo}
                    alt="Company Logo"
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <Image
                    src="/assets/images/logo.svg"
                    alt="CAI Logo"
                    width={32}
                    height={32}
                    className="rounded-full object-contain"
                  />
                )}
              </div>
              <div className="border-l border-[#cbcbcb] pl-2">
                <div className="text-graphite text-sm space-y-1 font-apfel-grotezk-regular">
                  <p>
                    <span className="text-graphite font-medium">{companyName || 'Name of company'}</span> {companyLocation && `• ${companyLocation}`}
                  </p>
                  {eventTypes.length > 0 && (
                    <p>
                      {eventTypes.map((type, index) => (
                        <span key={index} className="px-1 text-sm">
                          {index > 0 ? " | " : " • "}{type}
                        </span>
                      ))}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="min-h-[36px] mb-2"></div>
          )}
          {/* Description */}
          <p className="text-graphite font-apfel-grotezk-regular mt-3 mb-2 text-[0.95rem] leading-snug max-w-[98%] min-h-[28px] flex items-center break-words whitespace-normal px-1">
            {description}
          </p>
        </div>
        {/* Sticky Prev/Next Navigation for Mobile */}
        {allPosts && allPosts.length > 1 && (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex justify-between items-center px-6 py-3 md:hidden">
            <button
              className="flex-1 mr-2 py-2 rounded-lg bg-gray-100 text-graphite font-medium text-base"
              onClick={() => handleNavigation('prev')}
            >
              Prev
            </button>
            <button
              className="flex-1 ml-2 py-2 rounded-lg bg-[#0037EB] text-white font-medium text-base"
              onClick={() => handleNavigation('next')}
            >
              Next
            </button>
          </div>
        )}
      </div>
      
    </div>
  );
}