export const PLAN = {
  FREE: "free",
  TRIAL: "trial",
  PRO: "pro",
  EARLY_BIRD: "early_bird",
};

export const isProLike = (plan) =>
  plan === PLAN.PRO || plan === PLAN.EARLY_BIRD || plan === PLAN.TRIAL;

export const isTrial = (plan) => plan === PLAN.TRIAL;
export const isFree = (plan) => plan === PLAN.FREE;
