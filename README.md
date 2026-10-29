# Study Garden

An independent UPSC study website built with **React, Next.js and TypeScript**. Host it on Vercel or any Node.js host, including Railway. No ChatGPT login or runtime connection is required.

## Run

Requires Node.js 22.13 or later.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Production: `npm run build`, then `npm start`.

## GitHub and Vercel

Push this directory to a GitHub repository, then import it in Vercel. Choose the Next.js framework and repository root. Use the default build command (`npm run build`). No database credentials or environment variables are required for this initial version. Commits can deploy automatically through Vercel's Git integration. Vercel Hobby is for personal, noncommercial projects and has usage limits; a custom domain is optional.

## Saved work

Highlights, bookmarks, tags, personal notes, revision dates, personal topics, quiz attempts and written answers are stored in IndexedDB in the current browser. They survive reloads and ordinary browser restarts. They are not automatically synced across devices or domains. Clearing browser storage removes them; private-browsing sessions may remove them when closed.

Use **Export my study data** for backups. **Restore a backup** merges records by ID and accepts the version-1 JSON format used by the earlier Garden site. Before changing domains or devices, export at the old location and restore at the new one. Cloud synchronisation requires a separate database integration.

## Included content

- 18 Post-Independence India and 20 World History chapters.
- 38 keyword revision cards and two full reference-guide texts.
- 31 PYQ study routes: 13 provisional transcriptions and 18 paraphrased demands. This is a selected history index, not a complete original-paper-verified PYQ collection.
- Six original practice MCQs and the preserved starter essay lesson.
- A numbered 19-day Essay classroom: Days 9–14 and 17–19 contain imported concept cards, recall questions, decoding, frameworks, outlines, complete model essays, source links and writing prompts. Days 1–8 and 15–16 show the recovered lesson plan only and are clearly marked **awaiting original text**. They are not fabricated replacements or records of completed study.
- GS2–GS4 shelves ready for future content.

The reader offers Learn, Quick revision and Linked PYQs. **Create my short notes** makes an editable draft from selected passages or chapter keywords. No paid AI generation is used.

## Checks

```sh
npm run typecheck
npm test
npm run build
```

Tests cover browser-storage operations, record validation, backup data, topic links, short-note generation and India-time revision scheduling.

## Future notes

Use **Add topic notes** for personal material saved on your device, or edit `data/topics.json` to publish shared material. Topic IDs and block IDs are annotation anchors: preserve existing IDs and text where possible. Changing text can move old highlight offsets. Add new topics with new IDs. Keep actual PYQs, paraphrases and original practice clearly distinguished.

## Daily essay archive

Open **Essay classroom** or use `/#essay-classroom`. Full lesson links use stable IDs such as `/#essay-day-09`, `/#essay-day-17` and `/#essay-day-19`. Existing starter and history topic IDs are unchanged.

`data/essay-course.json` records the recovered 19-day plan and explicit availability. Full recovered lesson text lives in `data/essays/day-09.json` through `day-14.json`, plus `day-17.json` through `day-19.json`; `lib/essay-lessons.ts` creates stable reader blocks and revision cards. Counts and day totals derive from the course data. Missing messages must be supplied before changing a day to `imported`. Do not turn inferred titles into claimed original lessons. Optional `recallCard` and `dailyRoutine` fields preserve the specific closing exercises in newly imported lessons without changing existing annotation blocks.

Imported PYQ metadata retains the attribution from the original chat lesson and links its sources. Importing is not a new verification against original UPSC paper scans. Original practice is labelled separately. The imported essays are retained at their original length rather than silently edited to a new word count.

Each lesson supports the existing highlights, bookmarks, tags and personal notes, plus quick revision, source links, section navigation and a lesson-specific 150-word writing target. The archive does not create fake study completion or recall history. Browser-local storage and backup behaviour are unchanged.
