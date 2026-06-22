"use client";

import styles from "../styles/device-frame.module.css";
import {
  CHROME_TRANSITION,
  SAFARI_EXPANDED_BOTTOM,
  SAFARI_PILL_GAP,
  SAFARI_PILL_H,
  SAFARI_SCROLLED_BOTTOM,
  SAFARI_SCROLLED_H,
  SAFARI_SCROLLED_W,
  SAFARI_SIDE_MARGIN,
} from "../lib/constants";
import type { ChromeState } from "../hooks/useSafariChrome";

/*
 * iOS 26 "Liquid Glass" Safari chrome — floating glass over a full-height
 * iframe; the page scrolls underneath and the glass blur refracts it. Matched
 * to the iOS 26 Safari reference. The icon paths below are exported 1:1 from
 * the reference components, not redrawn.
 *
 * The transition is a true MORPH, not a cross-fade: the center search bar is a
 * single persistent element that smoothly resizes and drops between its
 * expanded (full address bar) and scrolled (compact domain pill) geometry,
 * while its page/reload icons fade out. The flanking back and more buttons
 * don't morph — they scale down and fade away. A contrast scrim behind the
 * chrome fades out alongside them.
 */

// Icons exported from Figma node 6:27 (currentColor swapped in for #1B1B1B).
function BackIcon() {
  return (
    <svg width="11" height="19" viewBox="0 0 11 19" fill="none" aria-hidden>
      <path d="M0 9.06299C0 8.9432 0.0224609 8.83089 0.0673828 8.72607C0.112305 8.62126 0.183431 8.52393 0.280762 8.43408L8.72607 0.258301C8.89079 0.0861003 9.09668 0 9.34375 0C9.50846 0 9.65446 0.0374349 9.78174 0.112305C9.9165 0.187174 10.0213 0.291992 10.0962 0.426758C10.1785 0.554036 10.2197 0.703776 10.2197 0.875977C10.2197 1.10807 10.1374 1.31396 9.97266 1.49365L2.13379 9.06299L9.97266 16.6436C10.1374 16.8158 10.2197 17.0216 10.2197 17.2612C10.2197 17.4259 10.1785 17.5757 10.0962 17.7104C10.0213 17.8452 9.9165 17.9463 9.78174 18.0137C9.65446 18.0885 9.50846 18.126 9.34375 18.126C9.09668 18.126 8.89079 18.0436 8.72607 17.8789L0.280762 9.70312C0.183431 9.61328 0.112305 9.51595 0.0673828 9.41113C0.0224609 9.30632 0 9.19027 0 9.06299Z" fill="currentColor" />
    </svg>
  );
}

function SiteSettingsIcon() {
  return (
    <svg width="15" height="18" viewBox="0 0 16 19" fill="none" aria-hidden>
      <path fillRule="evenodd" clipRule="evenodd" d="M4.01956 0.099976H11.1804C11.7146 0.0999653 12.1604 0.0999565 12.5247 0.129716C12.9046 0.160753 13.2612 0.227864 13.5985 0.399709C14.1159 0.66336 14.5366 1.08406 14.8003 1.6015C14.9721 1.93877 15.0392 2.29542 15.0703 2.67531C15.1 3.03954 15.1 3.48538 15.1 4.01952V5.68043C15.1 6.21457 15.1 6.66042 15.0703 7.02465C15.0392 7.40453 14.9721 7.76119 14.8003 8.09845C14.5366 8.6159 14.1159 9.03659 13.5985 9.30024C13.2612 9.47209 12.9046 9.5392 12.5247 9.57024C12.1604 9.6 11.7146 9.59999 11.1805 9.59998H4.01955C3.4854 9.59999 3.03956 9.6 2.67533 9.57024C2.29544 9.5392 1.93879 9.47209 1.60153 9.30024C1.08408 9.03659 0.663383 8.6159 0.399731 8.09845C0.227887 7.76119 0.160776 7.40453 0.129738 7.02465C0.0999794 6.66041 0.0999882 6.21457 0.0999989 5.68041V4.01954C0.0999882 3.48539 0.0999794 3.03954 0.129738 2.67531C0.160776 2.29542 0.227887 1.93877 0.399731 1.6015C0.663383 1.08406 1.08408 0.66336 1.60153 0.399708C1.93879 0.227864 2.29544 0.160753 2.67533 0.129716C3.03956 0.0999565 3.48541 0.0999653 4.01956 0.099976ZM2.79748 1.62473C2.51035 1.64819 2.37307 1.69008 2.28251 1.73622C2.04731 1.85606 1.85608 2.04729 1.73624 2.28249C1.6901 2.37305 1.64822 2.51033 1.62476 2.79745C1.60058 3.09333 1.6 3.47755 1.6 4.04998V5.64998C1.6 6.2224 1.60058 6.60662 1.62476 6.9025C1.64822 7.18962 1.6901 7.3269 1.73624 7.41746C1.85608 7.65267 2.04731 7.84389 2.28251 7.96373C2.37307 8.00988 2.51035 8.05176 2.79748 8.07522C3.09336 8.09939 3.47757 8.09998 4.05 8.09998H11.15C11.7224 8.09998 12.1066 8.09939 12.4025 8.07522C12.6896 8.05176 12.8269 8.00988 12.9175 7.96373C13.1527 7.84389 13.3439 7.65267 13.4638 7.41746C13.5099 7.3269 13.5518 7.18962 13.5752 6.9025C13.5994 6.60662 13.6 6.2224 13.6 5.64998V4.04998C13.6 3.47755 13.5994 3.09333 13.5752 2.79745C13.5518 2.51033 13.5099 2.37305 13.4638 2.28249C13.3439 2.04729 13.1527 1.85606 12.9175 1.73622C12.8269 1.69008 12.6896 1.64819 12.4025 1.62473C12.1066 1.60056 11.7224 1.59998 11.15 1.59998H4.05C3.47757 1.59998 3.09336 1.60056 2.79748 1.62473ZM0.0999992 13.35C0.0999992 12.9358 0.435786 12.6 0.849999 12.6H14.35C14.7642 12.6 15.1 12.9358 15.1 13.35C15.1 13.7642 14.7642 14.1 14.35 14.1H0.849999C0.435786 14.1 0.0999992 13.7642 0.0999992 13.35ZM0.0999992 17.35C0.0999992 16.9358 0.435786 16.6 0.849999 16.6H10.35C10.7642 16.6 11.1 16.9358 11.1 17.35C11.1 17.7642 10.7642 18.1 10.35 18.1H0.849999C0.435786 18.1 0.0999992 17.7642 0.0999992 17.35Z" fill="currentColor" stroke="currentColor" strokeWidth="0.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ReloadIcon() {
  return (
    <svg width="15" height="18" viewBox="0 0 15 19" fill="none" aria-hidden>
      <path d="M7.19278 8.51111C7.41251 8.51111 7.5795 8.4408 7.71133 8.30896L11.1303 4.86365C11.2885 4.70544 11.3588 4.52966 11.3588 4.32751C11.3588 4.13416 11.2797 3.9408 11.1303 3.79138L7.71133 0.319702C7.5795 0.179077 7.41251 0.0999756 7.19278 0.0999756C6.79727 0.0999756 6.48965 0.425171 6.48965 0.838257C6.48965 1.02283 6.55997 1.19861 6.68301 1.34802L8.82755 3.43982C8.3793 3.36072 7.92227 3.32556 7.47403 3.32556C3.37833 3.32556 0.100006 6.59509 0.100006 10.6908C0.100006 14.7865 3.38712 18.0824 7.48282 18.0824C11.5697 18.0824 14.8568 14.7865 14.8568 10.6908C14.8568 10.2601 14.5492 9.94373 14.1098 9.94373C13.6879 9.94373 13.4066 10.2601 13.4066 10.6908C13.4066 13.9867 10.7699 16.6322 7.48282 16.6322C4.18692 16.6322 1.5502 13.9867 1.5502 10.6908C1.5502 7.38611 4.17813 4.75818 7.47403 4.75818C8.08047 4.75818 8.6254 4.80212 9.1088 4.8988L6.6918 7.29822C6.55997 7.43884 6.48965 7.60583 6.48965 7.79041C6.48965 8.20349 6.79727 8.51111 7.19278 8.51111Z" fill="currentColor" stroke="currentColor" strokeWidth="0.2" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width="20" height="4" viewBox="0 0 20 4" fill="none" aria-hidden>
      <path d="M1.96533 3.9082C1.59847 3.9082 1.26904 3.8221 0.977051 3.6499C0.685059 3.4777 0.449219 3.24561 0.269531 2.95361C0.0898438 2.65413 0 2.32096 0 1.9541C0 1.59473 0.0898438 1.26904 0.269531 0.977051C0.449219 0.677572 0.685059 0.441732 0.977051 0.269531C1.26904 0.0898438 1.59847 0 1.96533 0C2.31722 0 2.6429 0.0898438 2.94238 0.269531C3.24186 0.441732 3.4777 0.677572 3.6499 0.977051C3.82959 1.26904 3.91943 1.59473 3.91943 1.9541C3.91943 2.32096 3.82959 2.65413 3.6499 2.95361C3.4777 3.24561 3.24186 3.4777 2.94238 3.6499C2.6429 3.8221 2.31722 3.9082 1.96533 3.9082ZM9.72559 3.9082C9.35872 3.9082 9.02555 3.8221 8.72607 3.6499C8.43408 3.4777 8.19824 3.24561 8.01855 2.95361C7.84635 2.65413 7.76025 2.32096 7.76025 1.9541C7.76025 1.59473 7.84635 1.26904 8.01855 0.977051C8.19824 0.677572 8.43408 0.441732 8.72607 0.269531C9.02555 0.0898438 9.35872 0 9.72559 0C10.0775 0 10.4032 0.0898438 10.7026 0.269531C11.0021 0.441732 11.238 0.677572 11.4102 0.977051C11.5898 1.26904 11.6797 1.59473 11.6797 1.9541C11.6797 2.32096 11.5898 2.65413 11.4102 2.95361C11.238 3.24561 11.0021 3.4777 10.7026 3.6499C10.4032 3.8221 10.0775 3.9082 9.72559 3.9082ZM17.4858 3.9082C17.119 3.9082 16.7858 3.8221 16.4863 3.6499C16.1943 3.4777 15.9585 3.24561 15.7788 2.95361C15.6066 2.65413 15.5205 2.32096 15.5205 1.9541C15.5205 1.59473 15.6066 1.26904 15.7788 0.977051C15.9585 0.677572 16.1943 0.441732 16.4863 0.269531C16.7858 0.0898438 17.119 0 17.4858 0C17.8377 0 18.1634 0.0898438 18.4629 0.269531C18.7624 0.441732 18.9982 0.677572 19.1704 0.977051C19.3501 1.26904 19.4399 1.59473 19.4399 1.9541C19.4399 2.32096 19.3501 2.65413 19.1704 2.95361C18.9982 3.24561 18.7624 3.4777 18.4629 3.6499C18.1634 3.8221 17.8377 3.9082 17.4858 3.9082Z" fill="currentColor" />
    </svg>
  );
}

export function SafariBar({
  state,
  domain,
  screenWidth,
  onExpandTap,
}: {
  state: ChromeState;
  domain: string;
  screenWidth: number;
  onExpandTap: () => void;
}) {
  const expanded = state === "expanded";
  const t = CHROME_TRANSITION;

  // Expanded search-bar width = screen minus side margins and the two flanking
  // 48px buttons (+ gaps). 390 → 210, matching the Figma.
  const expandedW =
    screenWidth - SAFARI_SIDE_MARGIN * 2 - (SAFARI_PILL_H + SAFARI_PILL_GAP) * 2;

  const barW = expanded ? expandedW : SAFARI_SCROLLED_W;
  const barH = expanded ? SAFARI_PILL_H : SAFARI_SCROLLED_H;
  const barBottom = expanded ? SAFARI_EXPANDED_BOTTOM : SAFARI_SCROLLED_BOTTOM;

  // Keep the domain label clear of the flanking icons: reserve the icon inset
  // (14) + icon width (~16) + ~16px of breathing room on each side. Scrolled
  // state has no icons, so it just needs inner padding. Long domains ellipsis.
  const ICON_RESERVE = 46;
  const domainMaxW = expanded ? expandedW - ICON_RESERVE * 2 : SAFARI_SCROLLED_W - 28;

  // Side buttons don't morph into anything — but to feel unified they track the
  // center bar's edges: anchored a constant gap outside the bar, so as it
  // narrows they slide inward, descend, scale down and fade. The whole group
  // contracts toward the bottom-center rather than collapsing at fixed anchors.
  const sideOffset = screenWidth / 2 - barW / 2 - SAFARI_PILL_GAP - SAFARI_PILL_H;
  const sideStyle = (edge: "left" | "right"): React.CSSProperties => ({
    [edge]: sideOffset,
    bottom: expanded ? SAFARI_EXPANDED_BOTTOM : SAFARI_SCROLLED_BOTTOM,
    opacity: expanded ? 1 : 0,
    transform: expanded ? "scale(1)" : "scale(0.5)",
    transformOrigin: "bottom center",
    pointerEvents: expanded ? "auto" : "none",
    transition: `opacity ${t}, transform ${t}, bottom ${t}, ${edge} ${t}`,
  });

  const iconStyle: React.CSSProperties = {
    opacity: expanded ? 1 : 0,
    transition: `opacity ${t}`,
  };

  return (
    <div className={styles.safariRegion}>
      {/* Contrast scrim — expanded only */}
      <div
        className={styles.safariFade}
        style={{ opacity: expanded ? 1 : 0, transition: `opacity ${t}` }}
        aria-hidden
      />

      {/* Left: back */}
      <span className={styles.circleBtn} style={sideStyle("left")} aria-hidden>
        <BackIcon />
      </span>

      {/* Right: more */}
      <span className={styles.circleBtn} style={sideStyle("right")} aria-hidden>
        <MoreIcon />
      </span>

      {/* Persistent center search bar — morphs between the two states */}
      <button
        type="button"
        className={styles.searchBar}
        style={{
          width: barW,
          height: barH,
          bottom: barBottom,
          borderRadius: barH / 2,
          pointerEvents: "auto",
          cursor: expanded ? "default" : "pointer",
          transition: `width ${t}, height ${t}, bottom ${t}, border-radius ${t}`,
        }}
        onClick={expanded ? undefined : onExpandTap}
        aria-label={expanded ? undefined : "Expand address bar"}
      >
        <span className={styles.searchIconLeft} style={iconStyle} aria-hidden>
          <SiteSettingsIcon />
        </span>
        <span
          className={styles.searchDomain}
          style={{
            fontSize: expanded ? 17 : 12,
            maxWidth: domainMaxW,
            transition: `font-size ${t}, max-width ${t}`,
          }}
        >
          {domain}
        </span>
        <span className={styles.searchIconRight} style={iconStyle} aria-hidden>
          <ReloadIcon />
        </span>
      </button>
    </div>
  );
}
