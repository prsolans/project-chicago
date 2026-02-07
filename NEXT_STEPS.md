# Build Improvements - Next Steps

## Project: Semantic Category Tabs + Story Builder Mode

### Completed

1. **Types Updated** (`src/types/phraseFragments.ts`)
   - Added `SemanticCategory` type: `'WHO' | 'DO' | 'FEEL' | 'WHAT' | 'HOW' | 'LINK' | 'VOICE'`
   - Added `emotionTag` to `FragmentType`
   - Added TTS categories: `tts_emotion`, `tts_effect`, `tts_pacing`
   - Added `SEMANTIC_CATEGORY_MAP` constant mapping categories to fragment types
   - Added `getSemanticCategory()` helper function

2. **Emotion Tag Fragments Added** (`src/data/phraseFragments.ts`)
   - 12 new emotion tag fragments for TTS voice modification:
     - Emotions: `[excited]`, `[sad]`, `[angry]`, `[scared]`, `[happy]`, `[serious]`
     - Effects: `[laughs]`, `[sighs]`, `[whispers]`, `[shouts]`
     - Pacing: `[fast]`, `[slow]`
   - Added to `allFragments` array

3. **Store Updated** (`src/store/phraseFragmentStore.ts`)
   - Added `activeCategory: SemanticCategory` state
   - Added `setActiveCategory()` action
   - Added `getSuggestedCategory()` - returns suggested next category based on SVO pattern
   - Added `getFragmentsBySemanticCategory()` - returns fragments sorted by commonality then usage
   - Added `computeSuggestedCategory()` helper following English sentence patterns

---

### In Progress

4. **PhraseBuilder UI Refactor** (`src/components/PhraseBuilder/PhraseBuilder.tsx`)

   Need to:
   - Replace grammatical type logic with semantic categories
   - Create `CategoryTab` component with dwell detection
   - Add color-coded category tabs:
     | Category | Label | Color |
     |----------|-------|-------|
     | WHO | "Who" | Blue |
     | DO | "Do" | Green |
     | FEEL | "Feel" | Pink |
     | WHAT | "What" | Orange |
     | HOW | "How" | Purple |
     | LINK | "+" | Gray |
     | VOICE | "🎭" | Violet |
   - Show suggested category with subtle highlight (not enforcement)
   - Sort fragments: very_common first, then by usage count

---

### Pending

5. **Story Builder Store** (`src/store/storyBuilderStore.ts` - NEW FILE)

   Create new Zustand store with:
   ```typescript
   interface StoryLine {
     id: string;
     fragments: PhraseFragment[];
     text: string;
   }

   interface StoryBuilderState {
     lines: StoryLine[];
     currentLineFragments: PhraseFragment[];
     currentLineText: string;
     editingLineIndex: number | null;
     storyTitle: string;
     storyDescription: string;
     storyCategory: string;

     // Actions
     addFragmentToCurrentLine: (fragment: PhraseFragment) => void;
     removeLastFragmentFromCurrentLine: () => void;
     clearCurrentLine: () => void;
     addCurrentLineToStory: () => void;
     editLine: (index: number) => void;
     deleteLine: (index: number) => void;
     saveAsStory: () => Promise<string>;
     clearStory: () => void;
   }
   ```

6. **Story Builder Mode UI**

   Add to PhraseBuilder:
   - Mode toggle: `[Phrase Mode]` `[Story Mode]`
   - Story preview panel showing built lines with line numbers
   - Line management: edit, delete buttons per line
   - "Add to Story" button to add current line
   - "Save as Story" button integrating with `simpleStoryStore`

---

### Design Reference

**Semantic Category UI Layout:**
```
+------------------------------------------------------------------+
| BUILDING: "I really love"              [Undo] [Clear] [Speak]    |
+------------------------------------------------------------------+
| [WHO] [DO*] [FEEL] [WHAT] [HOW] [+] [🎭]     (* = suggested next) |
+------------------------------------------------------------------+
| Core fragments (very_common) shown first                          |
| [I] [you] [we] [Tony] [Michael] [Claire] [they] [he] [she]...    |
+------------------------------------------------------------------+
```

**Story Builder UI Layout:**
```
+------------------------------------------------------------------+
| [Phrase Mode] [Story Mode <- active]                              |
+------------------------------------------------------------------+
| STORY PREVIEW                                          3 lines    |
| 1. [excited] I love telling this story               [Edit][X]   |
| 2. It happened when I was young                      [Edit][X]   |
| 3. [laughs] Tony was so surprised                    [Edit][X]   |
| ─────────────────────────────────────────────────────────────────|
| 4. (Building current line...)                                    |
+------------------------------------------------------------------+
| CURRENT LINE: "he" [Add to Story] [Clear Line]                   |
+------------------------------------------------------------------+
| [Semantic Category Tabs]                                          |
+------------------------------------------------------------------+
| [Fragment Grid]                                                   |
+------------------------------------------------------------------+
| [Save as Story] [Clear All]                                       |
+------------------------------------------------------------------+
```

---

### Key Files to Reference

- **Plan file**: `~/.claude/plans/ticklish-weaving-cocke.md`
- **Types**: `src/types/phraseFragments.ts`
- **Fragment data**: `src/data/phraseFragments.ts`
- **Fragment store**: `src/store/phraseFragmentStore.ts`
- **PhraseBuilder**: `src/components/PhraseBuilder/PhraseBuilder.tsx`
- **Story store**: `src/store/simpleStoryStore.ts` (for integration)
- **Dwell hook**: `src/hooks/useDwellDetection.ts`
- **Emotion tags**: `src/utils/emotionTags.ts`

---

### Research Sources

- [AssistiveWare - Teaching AAC Grammar](https://www.assistiveware.com/learn-aac/teach-grammar)
- [Minspeak Academy](https://minspeak.com/)
- [English SVO Patterns](https://englishpartner.com/blog/common-sentence-patterns-in-english-svo-sv-svc-etc/)
