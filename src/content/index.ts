import { registerItems } from '../game/items';
import { items } from './items';

registerItems(items);

export { dialogues, entries, type EntryId, type NodeId } from './dialogues';
export { documents, type Document, type DocumentId } from './documents';
export { caught, endings, type Ending } from './endings';
export { checkStory, derived, flags, holds, type CountName, type DerivedFlag, type Flag, type StoryFlag } from './flags';
export { items, miscPhoto, miscPhotoCaptions, type Item, type ItemId } from './items';
export { notebook, notebookGoals, type NotebookEntry, type NotebookGoal } from './notebook';
export { namesHeardIn, speakerLabel, speakers } from './speakers';
export { splitTranslation } from './translation';
