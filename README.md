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
- Six original practice MCQs and one starter essay lesson.
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
