# Layout: respectable, conventional, built for the skim

## How the page is read

Eye-tracking studies of recruiters (TheLadders' is the best known) found a first pass of about 6 to 7 seconds, in an F-shaped pattern:
- down the left edge
- across the top lines
- across the first words of the lines below

Fixations land on:
- the name
- the current title and company
- the previous title and company
- dates
- education
- anything that breaks the pattern, such as a number, bold text, or a short line among long ones

So the layout's job is to put the strongest facts where those fixations land, and to stay out of the way everywhere else. Fancy design costs more than it gains: it breaks applicant tracking systems (ATS) and reads as compensating.

## The default layout (what `build_resume.js` renders)

- **One page,** single column, US Letter. Margins 0.5" at the sides and 0.45" top and bottom; never below 0.4".
- **Header, centered.**
  - Name in 18pt bold.
  - A headline in 12pt regular that names the target role the way job postings do. A two-part headline such as "Data Analyst | Analytics Engineer" helps a candidate between titles.
  - Contact on one line at 9.5pt: city plus remote preference, phone, email, LinkedIn, GitHub or portfolio.
- **Summary:** two or three lines, no heading gymnastics.
- **Section headings:** 11pt bold caps with a full-width rule. Use standard names so ATS can parse them: Summary, Experience, Projects, Skills, Education and Certifications.
- **Each company:**
  - Company name in bold, then " | " and a one-line descriptor so an outsider knows the scale and domain ("payments API used by 3,000 online stores").
  - Then the title in bold on the left and the dates on the right. Title and dates are what the skimming eye jumps between.
  - A title note like "(promoted from Analyst)" sits in regular weight after the title.
- **Bullets:** 10pt.
  - At most two lines each.
  - Strongest first.
  - About 6 for the current role, 2 or 3 for older ones.
  - Readers stop after about three, so the first two carry the role.
- **Bold** only the key number in a bullet. The default is at most one per role; a role with six or more strong bullets may carry two (set `max_bold_per_role` in `constraints.json`). Bold everywhere is bold nowhere.
- **Skills:** one line per group, each line fitting on one line.
- **Education and certifications:** one line.

## Order

- Current job first by default. Two "Present" roles with the side project first can read as moonlighting. For founder-friendly roles, test the side project first as a named variant rather than assuming either order.
- Put the side project's headline facts in the summary, so they're still read in the first six seconds.
- Label side ventures honestly, e.g. "Founder (part-time)".
- For a role where projects matter more than titles, a Projects section may come before Experience, but test that as a leap rather than defaulting to it.

## Polish that readers notice without knowing why

- No line holding only a word or two at the end of a bullet. `render.sh` flags any last line under 15% full. Fix it by trimming a few words.
- Every skills line and the contact line fit on one line.
- Consistent date format ("2022 – Present"), and consistent separators.
- White space at the bottom is fine. A crammed page reads as unedited.

## Fonts

Arial or Helvetica at 10pt body is the safe default: installed everywhere, ATS-friendly and plain. Calibri is fine in Word but isn't installed on every machine. If the font the PDF is rendered with isn't installed where you render, every preview is a lie. Always check the preview of the actual PDF, never a substituted-font preview of the DOCX.

## PDF or DOCX

Submit the PDF. It locks the layout, and modern ATS (Greenhouse, Lever, Ashby, Workday) parse text PDFs well. Send the DOCX only when a portal requires it, after opening it in Word to confirm it's still one page; Word's line breaking differs slightly from Chrome's. Name the uploaded file `First-Last-Resume.pdf`.

## Don't

- Two columns, tables, text boxes, icons, photos, skill bars, or graphics (ATS and readability).
- Headers or footers holding contact details (some ATS skip them).
- Colour beyond black, or a single restrained accent at most.
- Fonts under 10pt for body text.
