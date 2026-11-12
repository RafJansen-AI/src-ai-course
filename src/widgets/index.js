import checkin from './checkin.js';
import courseSetup from './course-setup.js';
import scenarios from './scenarios.js';
import dial from './dial.js';
import kit from './kit.js';

// Each widget: (element, ctx) => optional cleanup function
export const widgets = { checkin, 'course-setup': courseSetup, scenarios, dial, kit };
