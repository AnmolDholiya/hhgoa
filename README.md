# Goa Builder Pass

HH GOA 2026 — BUILDER ID GENERATOR

Modify the existing project. DO NOT rebuild the project from scratch if working functionality already exists.

Reference website:

https://hhgoa.com/

The two supplied ID-card images are the MASTER ID-CARD DESIGN.

---

🚨 CRITICAL RULE — DO NOT CHANGE THE ID CARD DESIGN

This is the most important requirement.

The supplied front and back ID-card images are the exact final artwork.

DO NOT redesign, recreate, reinterpret, modernize, improve, simplify, restyle, or replace the ID-card design.

Treat the supplied ID-card artwork as a LOCKED TEMPLATE.

The goal is:

EXACT SAME ID CARD + DIFFERENT USER DATA

NOT:

NEW ID CARD INSPIRED BY THE REFERENCE

Do not change:

- Card dimensions

- Aspect ratio

- Border

- Rounded corners

- Parchment background

- Navy colors

- Gold colors

- Typography style

- Font sizing of static elements

- Illustrations

- Palm trees

- Goa scenery

- Buildings

- Church

- Scooter/Vespa

- Jeep

- Surfboards

- Turtle

- Decorative elements

- Stamps

- Header

- Footer

- "HH GOA"

- "HACKER HOUSE"

- "गोवा"

- "#FRAMEINGOA"

- "HACKER HOUSE GOA 2026"

- Photo-frame shape

- Name-plate design

- Information-grid design

- Decorative borders

- Static icons

- Static labels

- Static artwork positioning

If an element is not explicitly listed as dynamic below, it MUST remain unchanged.

---

1. USE THE PROVIDED ID CARD AS THE ACTUAL TEMPLATE

Do NOT recreate the illustrations with new CSS/SVG.

Do NOT ask AI to generate new artwork.

Use the supplied ID-card artwork as the base/template and place dynamic HTML/canvas layers only where required.

The card should be implemented as:

STATIC ID CARD ARTWORK

+

DYNAMIC USER DATA

This is extremely important because visual accuracy is more important than recreating the design using CSS.

---

2. FRONT SIDE — DYNAMIC

The FRONT side shown in the supplied reference image is the side that contains the Builder information.

The front artwork must remain unchanged.

ONLY these elements are allowed to change:

1. PHOTO

User uploads a photo.

Place the uploaded photo exactly inside the existing photo area.

Requirements:

- Same position

- Same dimensions

- Same rounded shape

- Same border

- Same crop area

- Same visual proportions

- "object-fit: cover"

- No distortion

- No change to surrounding artwork

The photo replaces ONLY the photo area.

---

2. FULL NAME

The current sample name is:

"KRISH BHINGRADAIYA"

This is only sample data.

Replace it with:

"Full Name"

The name must appear in the existing name plate.

Do NOT change:

- Name plate

- Name position

- Name typography style

- Name alignment

- Name color

- Decorative elements

Only the name text changes.

---

3. BUILDER CLASS

Example:

"FULL STACK BUILDER"

Allow the user to enter/select their Builder Class.

Examples:

- FULL STACK BUILDER

- FRONTEND BUILDER

- BACKEND BUILDER

- AI BUILDER

- ML BUILDER

- WEB3 BUILDER

- DESIGNER

- PRODUCT BUILDER

Only replace the Builder Class value.

Do not redesign the Builder Class section.

---

4. STACK

Example:

"REACT • NODE.JS • AI • SUPABASE"

Allow the user to enter their technology stack.

Examples:

"React • Node.js • MongoDB"

or

"Python • FastAPI • AI"

or

"Next.js • TypeScript • Supabase"

Only replace the stack value.

Keep the existing Stack label, icon, position and design unchanged.

---

5. BUILDER ID

Example:

"#HH-GOA-2026-0001"

Allow the user to enter or generate a Builder ID.

The Builder ID must be used as the source for the barcode.

Example:

"#HH-GOA-2026-0042"

The displayed Builder ID must change dynamically.

The surrounding card design must NOT change.

---

3. QR CODE — WEBSITE / VERIFICATION

There must be ONE QR CODE on the front card.

The QR code is for opening a website/verification URL.

Add a form field:

"Website / Verification URL"

Example:

"https://hhgoa.com/"

or a future builder verification/profile URL.

When the user enters the URL:

- Generate the QR code dynamically.

- Put it exactly in the existing QR-code position.

- Preserve the existing QR container/design.

- Do not move the QR section.

- Do not redesign the QR section.

The QR code should open the supplied URL when scanned.

Default QR content:

"https://hhgoa.com/"

---

4. BARCODE — BUILDER ID

The barcode is NOT a QR code.

The barcode must represent the user's:

"BUILDER ID"

Example:

"#HH-GOA-2026-0042"

When Builder ID changes:

Barcode must automatically regenerate.

Use a reliable barcode library such as JsBarcode if compatible with the existing project.

Keep:

- Exact barcode position

- Exact barcode area

- Existing visual styling

- Existing surrounding design

Only the barcode data changes.

---

5. BACK SIDE — COMPLETELY STATIC

This is extremely important.

The supplied BACK ID-card image must remain 100% unchanged.

Do NOT add:

- User photo

- User name

- Builder class

- Stack

- Builder ID

- New QR

- New barcode

- New text

- New graphics

The back side should simply use the supplied back-card artwork exactly as provided.

No dynamic modifications are required on the back.

---

6. DATA MODEL

Create a simple local state object such as:

BuilderData

fullName

photo

builderClass

stack

builderId

websiteUrl

Only these values should control dynamic content.

Do not add unnecessary fields.

No database is required.

No authentication is required.

No Supabase is required.

No backend is required.

Use local React state.

---

7. WEBSITE UI/UX — HACKERHOUSE GOA STYLE

The generator WEBSITE should visually belong to the HackerHouse Goa ecosystem.

Reference:

https://hhgoa.com/

Use the website as inspiration for the website interface only.

The HackerHouse Goa site has a distinctive developer/hacker identity, large editorial typography, dark/navy visual elements, Goa atmosphere, terminal/build language, strong section hierarchy and a minimal-but-bold presentation.

Build the generator UI around that visual language.

---

8. IMPORTANT SEPARATION

There are TWO different design systems.

WEBSITE

Use HackerHouse Goa-inspired UI/UX.

ID CARD

Use the supplied ID-card artwork EXACTLY.

Never mix these two.

For example:

DO NOT take the website's colors and redesign the ID card.

DO NOT take the website's typography and replace the ID card typography.

DO NOT change the card to look like a website.

The website surrounds the ID-card generator.

The ID card itself is locked artwork.

---

9. GENERATOR PAGE

Create a polished HackerHouse Goa-inspired generator page.

Suggested structure:

HEADER

HH GOA 2026

Navigation should be minimal and developer-oriented.

Possible navigation:

"HOME"

"BUILDER ID"

"ABOUT HH GOA"

Use the same general visual attitude as the HackerHouse Goa website.

---

10. HERO SECTION

Heading:

"BUILD YOUR BUILDER ID"

Supporting text:

"Create your HH Goa 2026 Builder ID in seconds."

Use a bold editorial/developer aesthetic inspired by HH Goa.

Primary CTA:

"CREATE ID"

Secondary visual:

Live ID-card preview.

---

11. GENERATOR UI

Use a clean two-column layout on desktop.

LEFT

Input panel.

RIGHT

Live ID-card preview.

The input panel should contain:

BUILDER DETAILS

Full Name

Photo Upload

Builder Class

Stack

Builder ID

VERIFICATION

Website / Verification URL

---

12. PHOTO UPLOAD

Support:

- Drag and drop

- File picker

- Image preview

- Replace image

- Remove image

The uploaded image should immediately appear inside the exact photo area of the ID card.

No manual cropping should be required.

Automatically crop using:

"object-fit: cover"

---

13. LIVE PREVIEW

The card preview must update instantly.

Example:

If user changes:

"KRISH BHINGRADAIYA"

to:

"ROMIT KAKADIYA"

ONLY the name changes.

If user changes:

"REACT • NODE.JS • AI"

to:

"PYTHON • FASTAPI • AI"

ONLY the stack changes.

If user uploads a different image:

ONLY the photo changes.

If user changes Builder ID:

ONLY the Builder ID and barcode change.

If user changes Website URL:

ONLY the QR code changes.

Everything else must remain identical.

---

14. FRONT / BACK PREVIEW

Provide:

"FRONT"

and

"BACK"

tabs.

FRONT:

Dynamic version.

BACK:

Static supplied artwork.

Do not accidentally make the back dynamic.

---

15. DOWNLOAD

Provide:

"DOWNLOAD FRONT"

"DOWNLOAD BACK"

"DOWNLOAD BOTH"

Export the exact visual result shown in the preview.

Use high-resolution PNG.

Preserve the original aspect ratio.

No stretching.

No distortion.

No unexpected cropping.

Filename:

"HH-GOA-2026_<NAME>.png"

Example:

"HH-GOA-2026_ROMIT-KAKADIYA.png"

---

16. SHARE

Because the HackerHouse Goa task specifically emphasizes shareable output, provide a simple:

"SHARE"

button if browser capabilities allow it.

For X/Twitter sharing, prepare a share action containing:

"#FrameInGoa"

and the generated card/image URL where technically possible.

Do not add unnecessary backend infrastructure.

The core generator must work without authentication or a database.

---

17. RESPONSIVE WEBSITE

Website must work on:

- Desktop

- Laptop

- Tablet

- Mobile

Desktop:

Form + card preview side by side.

Mobile:

Form first.

Preview below.

The complete ID card must scale proportionally.

Never alter the card's internal dimensions or proportions.

---

18. DO NOT BREAK EXISTING FUNCTIONALITY

Before modifying the project:

1. Inspect the existing implementation.

2. Keep working components.

3. Keep working export functionality.

4. Keep working photo upload.

5. Keep working preview.

6. Modify only what is necessary.

7. Do not replace the whole application unnecessarily.

This is an enhancement, not a complete redesign of the existing generator.

---

19. FINAL ACCEPTANCE TEST

The implementation is correct ONLY if all of these are true:

PHOTO

Changing photo changes only the photo.

NAME

Changing name changes only the name.

BUILDER CLASS

Changing Builder Class changes only Builder Class.

STACK

Changing Stack changes only Stack.

BUILDER ID

Changing Builder ID changes:

- Builder ID text

- Barcode

and nothing else.

WEBSITE URL

Changing Website URL changes only the QR code.

BACK CARD

Back card remains completely static.

ID CARD DESIGN

No redesign occurs.

No new illustration occurs.

No new colors occur.

No new borders occur.

No new typography occurs.

No layout changes occur.

No decorative elements move.

---

🔴 FINAL NON-NEGOTIABLE INSTRUCTION

DO NOT REDESIGN THE ID CARD.

DO NOT RECREATE THE ID CARD.

DO NOT IMPROVE THE ID CARD.

DO NOT MAKE THE ID CARD "INSPIRED BY" HACKERHOUSE GOA.

The ID card supplied by the user IS the final design.

Use it as the master artwork.

Only overlay these dynamic values:

1. Photo

2. Full Name

3. Builder Class

4. Stack

5. Builder ID

6. QR Code — Website/Verification URL

7. Barcode — Builder ID

Everything else is LOCKED.

The website UI/UX can be inspired by:

https://hhgoa.com/

But the ID-card UI/UX must remain exactly as supplied.

STATIC CARD = LOCKED

USER DATA = EDITABLE

WEBSITE UI = HACKERHOUSE GOA INSPIRED

BACK CARD = 100% STATIC

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/288268e8-e2ca-4d1b-8b23-ec76ede24be8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
