# 3D Printing Track

A short member assessment for the **3D Printing Track** of Tuwaiq Club at the University of Jeddah: the member's info (full name, major, academic year), then the questions in `src/data/questions.ts` (including "claim your color" and an optional note to the leaders), about 5 minutes, Arabic-first (RTL), and designed for phones first.

The assessment has 16 questions (level, tools & interests, expectations & roles, logistics, closing). Questions 1–3 are scored (01 = 1 … 04 = 4, total 3–12: 3–5 Beginner, 6–9 Intermediate, 10–12 Advanced); the score and level are saved with each response and never shown to the member. Member info is collected first and is not counted. The progress UI derives its total from `questions.length`.

**Stack:** React · Vite · TypeScript · Tailwind CSS · Framer Motion. There is no backend. Answers go to a Google Apps Script web app, which appends them to a private Google Sheet.

## Run

```bash
npm install
cp .env.example .env   # optional
npm run dev
npm run build          # outputs to dist/
npm run deploy         # builds, then deploys to the Cloudflare Pages project "tuwaiq-3d-track"
```

**Deploy target:** the Cloudflare Pages project is **`tuwaiq-3d-track`** (in `package.json` and `wrangler.toml`). It is deliberately different from `tuwaiq-init`, the live Programming Track site, so deploying this repo can never overwrite it.

If `VITE_SUBMISSION_WEBHOOK_URL` is empty, submissions are only logged to the browser console, so you can still test the whole flow.

## Structure

```
src/
  App.tsx                 stage machine: init → assessment → complete
  screens/                IntroScreen · AssessmentScreen · SuccessScreen
  components/             OptionCard · MultiSelect · TerminalInput · ColorClaim · Progress · TerminalDetail · RenderText · Icons3D · ui
  data/questions.ts       all question text and options (edit questions here)
  services/submissionService.ts   POST to Apps Script + local draft
  types/assessment.ts
google-apps-script/Code.gs
```

The member info and answers are saved to `localStorage` while the student is answering. A refresh or a failed submit therefore never loses anything: the intro offers to resume, and a failed submit shows a Retry button. The draft is versioned: a draft saved by an older version of the questions keeps only the answers that still match, and the rest start empty.

**Logo:** put the official Tuwaiq × UJ 3D Printing Track logo in `public/brand/` and set `LOGO_SRC` in `src/components/ui.tsx`.

## Google Sheets setup

Answers go to the 3D Printing Track's **own** Google Sheet. Never reuse the Programming Track's sheet, script or Web App URL.

1. Create a new Google Sheet (keep it private), e.g. **3D Printing Track — Responses**.
2. In that sheet, open **Extensions → Apps Script**. This creates a script bound to this sheet only.
3. Replace the editor contents with `google-apps-script/Code.gs` and save.
4. Optional: run **`setupSheet`** once (pick it in the function menu, then **Run**, and authorize). It creates the **`Responses`** tab with its header row. Otherwise the tab is created on the first submission. Its columns:

   `Full Name · Major · Academic Year · Submitted At · Level Score · Level · 3D Printing Experience · Project Ability · Teamwork Experience · Design Tools · Preferred Activities · Explore Preference · Explore Preference Details · Track Avoidances · Helping Preference · Project Type · Preferred Times · Activity Format · Potential Blocker · Discord & Notion Joined · Success Definition · Favorite Color · Favorite Color Hex · Note`

   Multi-select answers are stored comma-separated, and a chosen «أخرى» is saved as `أخرى: <what they typed>`. Values are written by header name, so you can reorder columns or add your own. Headers are only ever added (missing ones go at the end of row 1), and submitted rows are never touched.
5. Click **Deploy → New deployment → ⚙ → Web app**. Set *Execute as*: **Me** and *Who has access*: **Anyone**, then deploy and authorize.
6. Copy the Web app URL, which ends in **`/exec`**.
7. Check it: open the URL in a browser. It must show `"service":"tuwaiq-3d-track"`. If it shows `tuwaiq-init`, it is the Programming Track's script, so don't use it.
8. Put it in `.env` at the project root (copy `.env.example` first):

   ```
   VITE_SUBMISSION_WEBHOOK_URL=https://script.google.com/macros/s/XXXX/exec
   ```

   Then rebuild (`npm run build`, or restart `npm run dev`).

The sheet itself stays private. The web app can only append rows; it cannot read them. If you edit `Code.gs` later, go to **Deploy → Manage deployments → Edit → New version**; the URL stays the same.
