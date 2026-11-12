import checkin from './checkin.js';
import courseSetup from './course-setup.js';
import scenarios from './scenarios.js';
import dial from './dial.js';
import kit from './kit.js';
import spot from './spot.js';
import stress from './stress.js';
import brief from './brief.js';
import branch from './branch.js';
import flipcards from './flipcards.js';
import disclosure from './disclosure.js';

// Each widget: (element, ctx) => optional cleanup function
export const widgets = { checkin, 'course-setup': courseSetup, scenarios, dial, kit, spot, stress, brief, branch, flipcards, disclosure };
