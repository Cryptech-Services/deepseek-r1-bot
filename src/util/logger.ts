/* eslint-disable */

import chalk from 'chalk';
import moment from 'moment';
import { isMainThread, threadId } from 'worker_threads';

const withLogTime = true;

type Domain = {
  name: string;
  color?: string;
};

type Level = 'error' | 'success' | 'warning' | 'debug' | 'info';

export default class Logger {
  private domain: Domain;
  private parentLogger: Logger | null = null;
  private store: boolean;

  constructor(domain: string, color?: string, store = true) {
    this.domain = {
      name: domain,
      color: color
    };
    this.store = store;
  }

  public createSubLogger(domain: string, color?: string, store = true): Logger {
    const logger = new Logger(domain, color, store);
    logger.parentLogger = this;
    return logger;
  }

  private log(
    level: Level,
    message: string,
    data?: Record<string, any> | null,
    important = false,
    subDomains: Domain[] = [],
    store = true
  ): void {
    //if (program.quiet) return;
    if (!this.store) store = false;
    if (level === 'debug') store = false;

    if (this.parentLogger) {
      this.parentLogger.log(
        level,
        message,
        data,
        important,
        [this.domain].concat(subDomains),
        store
      );
      return;
    }

    //const time = dateFormat(new Date(), 'HH:MM:ss');
    const time = moment(new Date()).format('HH:mm:ss');
    const worker = isMainThread ? '*' : threadId;
    const l =
      level === 'error'
        ? important
          ? chalk.bgRed.white('ERR ')
          : chalk.red('ERR ')
        : level === 'warning'
          ? chalk.yellow('WARN')
          : level === 'success'
            ? important
              ? chalk.bgGreen.white('DONE')
              : chalk.green('DONE')
            : level === 'debug'
              ? chalk.gray('VERB')
              : level === 'info'
                ? chalk.blue('INFO')
                : null;
    const domains = [this.domain]
      .concat(subDomains)
      .map((d) =>
        d.color ? chalk.keyword(d.color)(d.name) : chalk.white(d.name)
      );
    const m =
      level === 'error'
        ? chalk.red(message)
        : level === 'warning'
          ? chalk.yellow(message)
          : level === 'success'
            ? chalk.green(message)
            : level === 'debug'
              ? chalk.gray(message)
              : level === 'info'
                ? message
                : null;

    let log = `${l} ${worker}\t[${domains.join(' ')}]\t${m}`;
    if (withLogTime) log = chalk.gray(time) + ' ' + log;

    console.log(important ? chalk.bold(log) : log);
  }

  public error(
    x: string | Error,
    data?: Record<string, any> | null,
    important = false
  ): void {
    if (x instanceof Error) {
      data = data || {};
      data.e = x;
      this.log('error', x.toString(), data, important);
    } else if (typeof x === 'object') {
      this.log(
        'error',
        `${(x as any).message || (x as any).name || x}`,
        data,
        important
      );
    } else {
      this.log('error', `${x}`, data, important);
    }
  }

  public warn(
    message: string,
    data?: Record<string, any> | null,
    important = false
  ): void {
    this.log('warning', message, data, important);
  }

  public succ(
    message: string,
    data?: Record<string, any> | null,
    important = false
  ): void {
    this.log('success', message, data, important);
  }

  public debug(
    message: string,
    data?: Record<string, any> | null,
    important = false
  ): void {
    if (
      Number(process.env.DEBUG) === 1 ||
      process.env.DEBUG === 'true' ||
      Number(process.env.DB_VERBOSE) === 1 ||
      process.env.DB_VERBOSE === 'true'
    ) {
      this.log('debug', message, data, important);
    }
  }

  public info(
    message: string,
    data?: Record<string, any> | null,
    important = false
  ): void {
    this.log('info', message, data, important);
  }
}
