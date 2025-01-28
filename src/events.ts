import fs from 'fs';
import path from 'path';
import Logger from './util/logger';
import IApplicationEvent from './interfaces/IApplicationEvent';

const logger = new Logger('deepseek-r1', 'purple');
const loggerInit = logger.createSubLogger('init', 'orange');
const events = new Map<string, IApplicationEvent[]>();
const loadEvents = () => {
  const eventsPath = path.join(__dirname, 'events');
  const eventFiles = fs.readdirSync(eventsPath);

  loggerInit.debug(`Loading ${eventFiles.length} events...`);
  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const sourceCode = fs.readFileSync(filePath, 'utf8');
    const event = require(filePath).default;
    const eventHandlers = events.get(event.name) || [];
    eventHandlers.push(event);
    events.set(event.name, eventHandlers);
    // Regular expression to match the default export function name
    const defaultExportRegex = /export\s+default\s+(\w+);/;

    const match = sourceCode.match(defaultExportRegex);

    if (match && match[1]) {
      loggerInit.debug(`Loaded event '${event.name}:${match[1]}'`);
    } else {
      loggerInit.warn(`No default export found in ${file}`);
    }
  }
};

export { events, loadEvents };
