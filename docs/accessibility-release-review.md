# Accessibility release review

Automated tests are useful but cannot establish full accessibility conformance. Complete this manual review on a physical device and browser before launch.

## Keyboard and focus
- [ ] Use keyboard-only navigation to traverse every route.
- [ ] Confirm skip links move focus to the main content.
- [ ] Confirm focus indicators are visible and not obscured.
- [ ] Check menus, filters and search controls are operable without a pointer.
- [ ] Check focus order follows the visual and semantic order.

## Screen readers
- [ ] Test at least one desktop screen reader and one mobile screen reader.
- [ ] Confirm headings, landmarks and link text make sense when read out of context.
- [ ] Confirm search/filter changes and empty states are understandable.
- [ ] Confirm video titles and embedded media labels are meaningful.

## Visual accessibility
- [ ] Check contrast for normal text, small text, buttons, labels and focus indicators.
- [ ] Zoom to 200% and confirm content reflows without loss or horizontal scrolling.
- [ ] Test text spacing overrides.
- [ ] Check reduced-motion preference.

## Mobile
- [ ] Test navigation on a real Android device.
- [ ] Check touch targets, bottom navigation and safe-area spacing.
- [ ] Check landscape orientation.
- [ ] Check slow connections and disabled external embeds.

Record date, device, browser, tester and issues. Automated browser emulation is not a substitute for this review.
