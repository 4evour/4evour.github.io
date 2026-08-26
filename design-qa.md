# Design QA

## Evidence

- Source visual truth: `https://xianchaoqian.com/#info`
- Source capture: `D:\4evour_blog\design-qa-evidence\reference-872x740.png`
- Implementation: `http://127.0.0.1:4321/`
- Implementation capture: `D:\4evour_blog\design-qa-evidence\implementation-872x740.png`
- Full-view comparison: `D:\4evour_blog\design-qa-evidence\comparison-full-1744x740.png`
- Focused navigation comparison: `D:\4evour_blog\design-qa-evidence\comparison-nav-1714x160.png`
- State: homepage, light theme, page top, desktop navigation active on “主页”
- CSS viewport: `872 × 740`; document client area and each captured image: `857 × 727`; device pixel ratio: `1`
- Density normalization: source and implementation were captured from the same in-app browser viewport at DPR 1, then joined without scaling. The 15 px horizontal difference from CSS viewport is the browser scrollbar gutter in both captures.

## Full-view comparison evidence

The implementation preserves the source navigation hierarchy: a compact identity/action masthead followed by a centered, dark, rounded primary navigation rail. The implementation intentionally retains the existing cold-fir palette, personal hero artwork, three-route information architecture, and visible active-route state instead of copying the reference brand, page content, or six-route structure.

## Focused region comparison evidence

The focused `1714 × 160` comparison makes the navigation details readable. Both versions use a small avatar and name at left, utilities at right, a second-row rail near 720 px wide, equal-width route cells, restrained radii, and a dark translucent surface. The implementation uses a subtle mint active underline and a masthead surface so the persistent header remains legible over both dark homepage artwork and light article/project pages.

## Required fidelity surfaces

- Fonts and typography: navigation labels use the existing site system stack with consistent weight and line height. The three labels remain centered and unwrapped at desktop and 390 px mobile widths.
- Spacing and layout rhythm: desktop primary rail measures 716 px, closely matching the reference’s measured 720 px rail. The two tiers have a 6.7 px gap and do not overlap the hero or internal-page content. Mobile has no horizontal overflow.
- Colors and visual tokens: source structure is translated into the selected cold-fir tokens (`#1d332e`, `#f3f2e9`, `#86c7b2`) with sufficient foreground contrast and a darker primary rail.
- Image quality and asset fidelity: the actual 192 × 192 GitHub avatar is stored locally and rendered at 36 px to avoid remote loading failures. No placeholder or copied reference avatar is used.
- Copy and content: navigation contains exactly “主页 / 项目 / 文章”, matching the requested information architecture. Brand copy remains “4evour”.

## Findings

- No actionable P0, P1, or P2 findings remain.
- [P3] The masthead is more visibly surfaced than the reference. This is an intentional adaptation for legibility across the site’s light and dark pages, not an unresolved fidelity defect.

## Comparison history

1. Initial implementation: the old component-scoped flex rule survived an Astro client transition and forced the new route grid back to flex, bunching all three links at the left. Fixed by adding a global structural grid guard. Post-fix evidence shows three equal 271 px cells before rail sizing.
2. First visual comparison: the primary rail spanned 821 px while the reference measured 720 px, creating a P2 proportion mismatch. Fixed by centering the rail at `min(86%, 45rem)` and restoring `width: 100%` on mobile. Post-fix evidence shows a 716 px desktop rail at the same viewport and equal 232.8 px route cells.
3. Asset check: the remote GitHub avatar intermittently fell back to the monogram. Fixed by storing the verified 192 × 192 avatar at `/images/github-avatar.png`. Post-fix browser evidence reports a complete local image with natural dimensions `192 × 192`.

## Interaction and responsive checks

- Route sequence tested through Astro transitions: 主页 → 项目 → 文章 → 主页. Active state, three-column grid, and 106.3 px header height remained correct on every route.
- Mobile tested at `390 × 740`: three equal 115.4 px route cells, complete avatar, and no horizontal overflow.
- Article content check: all 228 direct article-body elements rendered at opacity 1; `reveal-on-scroll` count and hidden-element count were both 0.

## Implementation checklist

- [x] Two-tier navigation structure
- [x] Three equal primary routes
- [x] Stable active state across client transitions
- [x] Local GitHub avatar asset
- [x] Desktop and mobile overflow checks
- [x] Article body renders immediately without scroll-triggered reveal

final result: passed
