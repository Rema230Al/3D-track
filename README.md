# TUWAIQ INIT

A short member assessment for the **Programming Track** of Tuwaiq Club at the University of Jeddah: the member's info (full name, major, academic year), then the questions in `src/data/questions.ts` (including "claim your color" and an optional note to the leaders), about 5 minutes, Arabic-first (RTL), and designed for phones first.

The assessment has 18 questions in five sections (current experience, interests, expectations & roles, logistics, closing). Member info is collected first and is not counted. The progress UI derives its total from `questions.length`.

**Stack:** React · Vite · TypeScript · Tailwind CSS · Framer Motion. There is no backend. Answers go to a Google Apps Script web app, which appends them to a private Google Sheet.

## Run

```bash
npm install
cp .env.example .env   # optional
npm run dev
npm run build          # outputs to dist/
```

If `VITE_SUBMISSION_WEBHOOK_URL` is empty, submissions are only logged to the browser console, so you can still test the whole flow.

## Structure

```
src/
  App.tsx                 stage machine: init → assessment → complete
  screens/                IntroScreen · AssessmentScreen · SuccessScreen
  components/             OptionCard · MultiSelect · TerminalInput · ColorClaim · Progress · TerminalDetail · ui
  data/questions.ts       all question text and options (edit questions here)
  services/submissionService.ts   POST to Apps Script + local draft
  types/assessment.ts
google-apps-script/Code.gs
```

The member info and answers are saved to `localStorage` while the student is answering. A refresh or a failed submit therefore never loses anything: the intro offers to resume, and a failed submit shows a Retry button. The draft is versioned: a draft saved by an older version of the questions keeps only the answers that still match, and the rest start empty.

**Logo:** put the official Tuwaiq × UJ Programming logo in `public/brand/` and set `LOGO_SRC` in `src/components/ui.tsx`.

## Google Sheets setup

1. Create a Google Sheet (keep it private).
2. Submissions go to a tab named **`Responses v2`**, created automatically with its header row on the first submission. To create it (or update its headers) right away, run **`setupSheet`** once from the Apps Script editor. Its columns:

   `Full Name · Major · Academic Year · Submitted At · Programming Experience · Build Ability · Git/GitHub Usage · AI Usage · Teamwork Experience · Technologies Used · Interests · Preferred Activities · Learning Preference · Learning Preference Details · Track Avoidances · Helping Preference · Preferred Team Role · Preferred Times · Activity Format · Potential Blocker · Success Definition · Favorite Color · Favorite Color Hex · Leadership Note`

   Multi-select answers are stored comma-separated. Values are written by header name, so you can reorder columns or add your own. Headers are only ever added (missing ones go at the end of row 1): columns from the previous question set and every submitted row stay untouched. The first version's tab, **`Responses`**, is never read, written or cleared.
3. Open **Extensions → Apps Script**.
4. Paste the contents of `google-apps-script/Code.gs` and save.
5. Click **Deploy → New deployment → Web app**. Set *Execute as*: **Me** and *Who has access*: **Anyone**, then deploy and authorize.
6. Copy the Web app URL, which ends in **`/exec`**.
7. Put it in `.env` (or in your hosting provider's environment variables):

   ```
   VITE_SUBMISSION_WEBHOOK_URL=https://script.google.com/macros/s/XXXX/exec
   ```

   Then rebuild.

The sheet itself stays private. The web app can only append rows; it cannot read them. If you edit `Code.gs` later, go to **Deploy → Manage deployments → Edit → New version**; the URL stays the same.
