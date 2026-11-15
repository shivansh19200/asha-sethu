# DESIGN.md: Asha Sethu (v7)

Follow this file exactly for every screen. If something here conflicts with a later request, ask first.
Stack: React + Vite, plain JavaScript, plain CSS with CSS variables. No UI kit, no Tailwind needed.

## 1. Principles
- Calm, clear, clinical but warm. Easy on the eye for long days outdoors.
- Every screen has: a small top row, ONE header (22px), ONE short label under it, the content, ONE main action.
- Headers and short section labels are good. No explainer paragraphs, no captions under buttons, no "powered by AI" badges, no sparkles, no gradients, no glow, no emoji, no drop shadows.
- Red, amber and green mean danger level ONLY. They always come with an icon AND a word. Never colour alone. A fourth level, Unsure, uses the amber colours with its own icon and word (see Components).
- Light and dark mode both. Follow the phone setting by default, with a toggle in Settings.

## 2. Colour tokens
Put these on `:root[data-theme="light"]` and `:root[data-theme="dark"]`.

```css
:root[data-theme="light"]{
  --bg:#FCFBF8;      /* near-white, barely warm */
  --card:#FFFFFF;
  --ink:#1B2B33;
  --mut:#66695E;     /* muted text */
  --pri:#1F5E9E;     /* hospital blue */
  --onpri:#FFFFFF;
  --acc:#1F5E9E;     /* links, section labels, ticks */
  --sky:#E6EFE6;     /* soft sage, calm surfaces */
  --skyink:#2B4A35;
  --bd:#DAD5C7;      /* card border */
  --bds:#7F9BB5;     /* control border: buttons, tiles. Must stay clearly visible */
  --ring:#6FA3D6;
  --ambbg:#FBE2C4;  --ambink:#6B3205;
}
:root[data-theme="dark"]{
  --bg:#11181A; --card:#18232A; --ink:#ECE7DA; --mut:#A4AD9F;
  --pri:#6FA8E0; --onpri:#0F1A24; --acc:#86B8E8;
  --sky:#1D2B22; --skyink:#BFE0C6;
  --bd:#2A352E; --bds:#5A7A96; --ring:#86B8E8;
  --ambbg:#3A2008; --ambink:#FFB26B;
}
```
Urgency colours (fixed, both modes): RED fill `#B3261E` with white text. AMBER uses `--ambbg` / `--ambink`. GREEN uses a clear green fill with its own icon and word. The sage `--sky` is never used for danger level.

## 3. Type, shape, spacing
- Font: Hind (or Noto Sans Devanagari) for English and Hindi. Two weights only: 400 and 500.
- Body 18px minimum on phone screens in the real app. Header 22px / 500. Section label 11px, 500, uppercase, letter-spacing .06em, colour `--acc`. Small label 11px `--mut`.
- Radius: buttons 14px, cards 14px to 18px, phone frame (preview only) 26px, pills 999px.
- Controls: min height 56px on phone (preview shows 48px at reduced scale). Gaps 8px, 10px, 12px, 14px.

## 4. Components
- Button (default): background `--card`, text `--ink`, border `1.5px solid var(--bds)`, radius 14px, weight 500. The border must be clearly visible against `--bg`.
- Button (fill): background `--pri`, text `--onpri`, border `1.5px solid var(--pri)`. Only ONE fill button per screen.
- Press: `transition: transform 120ms ease-out`; `:active { transform: scale(.97) }`.
- Tile (Mother, Newborn): `--card` background, `1.5px solid var(--bds)`, radius 18px, illustration 38px at top-left, label 16px / 500 at the bottom.
- Chip: `--sky` background, `--skyink` text, 11px, pill.
- Level pill: icon + word. Red: alert-triangle + "Red". Amber: alert-circle + "Amber". Green: check-circle + "Green". Unsure: help-circle + "Unsure", using `--ambbg` / `--ambink`. Unsure is never shown as Green.
- Source tag (in "What the assistant did"): a chip with one of four words: "AI suggested", "Worker confirmed", "From rules (doctor reviewed)", "Done". Same chip style as above, no new colours. Each tag has its own Tabler outline icon (sparkles is NOT allowed; use bulb, user-check, book, circle-check). Words carry the meaning, not the icon.
- Checklist row (Describe screen): `--card`, `1.5px solid var(--bds)`, radius 14px, min height 56px, sign name left, a square tick box right. Groups have a section label.
- Patient code: small label 11px `--mut`, shown as a short random code (for example K7M2). No names and no initials anywhere.
- Row (inbox): `--card`, `1px solid var(--bd)`, radius 14px, padding 12px 14px.
- Stat card: `--card`, `1px solid var(--bd)`, radius 14px, label 11px `--mut`, number 26px / 500.
- DEMO DATA tag: pill, `1.5px dashed var(--bds)`, 11px / 500, `--mut`. Shown on any screen using made-up data.
- Icons: Tabler outline icons only, one consistent set, 20px. No filled icons.

## 5. Phone screens (360px wide, light and dark)
1. Home
   - Top row: ASHA name and village (small label), language toggle "EN | हि" as a bordered pill.
   - Header: "Start a visit". Label: "Who is the visit for?"
   - Hero: sage panel (`--sky`, 1px `--bd`, radius 18px, 112px tall) with the mother-and-baby scene (section 8).
   - Two tiles side by side: Mother, Newborn.
   - Bottom row, top border `--bd`: "2 follow-ups" with an amber pill "1 overdue" (clock icon + word) when overdue.
2. Describe
   - Top row: back arrow, "Newborn" or "Mother" label.
   - Header: "Describe the visit". Label: "Speak or type what you see".
   - Centre: 88px mic circle (`--pri`), two breathing rings. Under it: section label "What I heard" and the transcript, 17px / 500.
   - Below the transcript: section label "Signs checklist" and the checklist rows (a visit can be done with no typing). Typed signs and ticked signs are always added together.
   - Bottom: fill button "Continue". A "Type instead" link sits under the mic, `--acc`, underlined.
3. Question
   - Top row: back arrow, patient type label.
   - 56px round baby portrait (`--sky`, 1px `--bd`) beside header "Question 3" and a one-word topic label (for example "Feeding"). Never "of N".
   - Question text 22px / 500, vertically centred.
   - Buttons: Yes (fill), No, Not sure (default). Under them: link "Show result now", always visible.
4. Result
   - Full-width banner, no illustration. RED: `#B3261E`, white text, alert-triangle icon, word "Red" 26px / 500, one action sentence ("Go to the hospital now.").
   - Section label "Signs found" with chips. Section label "What the assistant did" with tick steps, each carrying its source tag.
   - UNSURE: same full-width banner in `--ambbg` / `--ambink`, help-circle icon, word "Unsure" 26px / 500, one action sentence ("Could not rule out danger. Check the list again or ask a doctor."). Same reveal as Amber, no pulse.
   - Fill button "Review and send". Footer 11px `--mut`: "This is an alert aid, not a diagnosis."
5. Confirm, Note and Record, Review and send, Settings: same header and border rules; fields use the default button border style; one fill button per screen.
   - Confirm: chips for understood and ticked signs (removable), an "Add a sign" default button, fill button "Confirm". AI-found signs show the "AI suggested" tag until the worker confirms.
   - Note and Record: editable fields, fill button "Confirm and save". Nothing is saved before this tap.
   - Review and send: header "Review and send", label "Check the referral, then send", the referral summary, fill button "Send referral". Nothing is sent before this tap. On RED the banner still shows at once; only saving and sending wait.

## 6. Doctor inbox (laptop width, behind the access code; a prototype gate, not real security)
- Header 20px / 500 "Doctor inbox", label "Sorted by urgency, then newest". DEMO DATA tag top-right whenever data is made up.
- Container: `--bg`, `1px solid var(--bd)`, radius 18px, padding 18px.
- Row per referral: level pill (min-width 74px), patient type and age (500) with signs under it (small label), village and time (small label), then a button "Received" with a `--pri` border and `--pri` text. After tap it becomes a tick and the word "Received".
- Order: Red first, then Amber, then newest. No patient names and no initials; show the patient code only.

## 7. Supervisor view (laptop width, behind the access code)
- Header "Supervisor view", label "This week, counts only, no patient names". DEMO DATA tag when needed.
- Three stat cards: Visits, Red cases, Not confirmed reached.
- Table by village: Village, Visits, Red, Not reached, Watch. Watch shows an amber pill ("3 fever cases") when 3 or more cases of one sign appear in a village in 7 days, otherwise "None".
- Check-back alert: sage row (`--sky`) with clock icon, bold title "Check-back alert", one short sentence, and a default button "Run check now".

## 8. Illustrations (original, flat, no gradients)
Skin and hair colours are fixed; clothing follows `--pri` so dark mode works. Define once in a hidden SVG and reuse with `<use href="#baby">`.

```html
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
<symbol id="baby" viewBox="0 0 64 64"><path d="M8 64c0-14 10-22 24-22s24 8 24 22z" fill="var(--pri)"/><circle cx="32" cy="30" r="17" fill="#E0AE86"/><path d="M16 27c2-11 10-15 17-14 8 1 13 7 14 14-5-4-10-6-15-6-6 0-11 2-16 6z" fill="#2B2118"/><circle cx="26" cy="33" r="1.8" fill="#2B2118"/><circle cx="38" cy="33" r="1.8" fill="#2B2118"/><path d="M28 40q4 3 8 0" stroke="#8A4B2F" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="22" cy="38" r="3" fill="#E58E7A" opacity=".5"/><circle cx="42" cy="38" r="3" fill="#E58E7A" opacity=".5"/></symbol>
<symbol id="mom" viewBox="0 0 64 64"><path d="M6 64c0-15 11-23 26-23s26 8 26 23z" fill="var(--pri)"/><rect x="27" y="38" width="10" height="9" rx="4" fill="#D9A57A"/><circle cx="32" cy="9" r="7" fill="#2B2118"/><circle cx="32" cy="26" r="17" fill="#2B2118"/><circle cx="32" cy="30" r="14" fill="#D9A57A"/><circle cx="26" cy="30" r="1.7" fill="#2B2118"/><circle cx="38" cy="30" r="1.7" fill="#2B2118"/><path d="M27 37q5 4 10 0" stroke="#8A4B2F" stroke-width="1.8" fill="none" stroke-linecap="round"/></symbol>
</svg>
```
Hero scene (234 x 112 viewBox): a soft circle top-right (`--ring`, 45% opacity), two faint leaf shapes (`--skyink`, 25%), `<use href="#mom" x="44" y="22" width="92" height="92"/>` and `<use href="#baby" x="118" y="56" width="60" height="60"/>`.
No illustration on the Result screen. Other empty states may reuse the same two symbols.

## 9. Motion (alive but controlled)
```css
@keyframes up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes pop{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:none}}
@keyframes reveal{from{clip-path:inset(0 0 100% 0)}to{clip-path:inset(0 0 0 0)}}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
@keyframes breathe{0%{opacity:.55;transform:scale(1)}100%{opacity:0;transform:scale(1.55)}}
```
- Items on each screen enter with `up`, 420ms, `cubic-bezier(.2,.7,.2,1)`, staggered about 80ms apart, header first.
- Mic button: `pop` 520ms `cubic-bezier(.2,.9,.3,1.2)`, plus two 2px rings using `breathe` 2.6s ease-out infinite, the second delayed 1.3s. Rings use `--ring`, animate transform and opacity only (no shadows).
- Home hero illustration: `bob` 4s ease-in-out infinite.
- Result RED banner: `reveal` 560ms once, icon `pop`, then the word and action sentence `up`. Trace steps then appear one by one, about 350ms apart. NEVER flash or pulse on RED.
- Screen changes: under 250ms.
- `@media (prefers-reduced-motion: reduce)`: turn every animation off and show content immediately; hide the rings.

## 10. Rules for any new screen
Reuse the components above. Do not invent new colours. Every control keeps a clear border. If a screen needs a new component, ask first.
