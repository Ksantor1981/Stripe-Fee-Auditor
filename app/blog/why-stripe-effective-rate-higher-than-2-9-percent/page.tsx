import { redirect } from "next/navigation";
import { PILLAR_EFFECTIVE_RATE_PATH } from "../_data/blogIndex";

/** Legacy URL — consolidated into SEO pillar to avoid duplicate intent. */
export default function LegacyEffectiveRateBlogRedirect() {
  redirect(PILLAR_EFFECTIVE_RATE_PATH);
}
