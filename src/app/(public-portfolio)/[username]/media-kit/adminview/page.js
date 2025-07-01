"use client";

import { FormProvider } from "@/app/onboarding/context";
import ProfileOverview from "@/components/public-portfolio/ProfileOverview";
import LoadingTransition from "@/components/public-portfolio/LoadingTransition";
import { useFetchPortfolio, useFetchPublicPosts } from "@/utils/public-portfolio/portfolio";

function AdminPortfolioContent({ ownerId }) {
  // ✅ Destructure React Query results
  const {
    data: portfolioData,
    isLoading: isPortfolioLoading,
    isError: isPortfolioError,
    error: portfolioError
  } = useFetchPortfolio(ownerId);

  const {
    data: postsData,
    isLoading: isPostsLoading,
    isError: isPostsError,
    error: postsError
  } = useFetchPublicPosts(ownerId);

  // ✅ Combined loading flag
  const isLoading = isPortfolioLoading || isPostsLoading;

  // ✅ Combined error check (optional)
  if (isPortfolioError) return <div>Error: {portfolioError.message}</div>;
  if (isPostsError) return <div>Error: {postsError.message}</div>;

  if (isLoading) {
    return <LoadingTransition />;
  }

  return (
    <div className="h-[200vh] py-[1%] px-[1%] relative">
      <ProfileOverview ownerId={ownerId} isAdminView={true} />
    </div>
  );
}

export default function AdminPortfolioPage({ ownerId }) {
  return (
    <FormProvider>
      <AdminPortfolioContent ownerId={ownerId} />
    </FormProvider>
  );
}
