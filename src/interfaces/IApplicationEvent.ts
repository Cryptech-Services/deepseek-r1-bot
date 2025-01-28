import { Client, Events } from 'discord.js';
import Logger from '../util/logger';

export default interface IApplicationEvent {
  name: Events.ClientReady;
  once: true;
  execute: (
    client: Client<boolean>,
    logger: Logger,
    ...args: any[] //eslint-disable-line @typescript-eslint/no-explicit-any
  ) => Promise<void>;
}
