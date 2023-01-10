// Copyright (C) 2020-2022 Acala Foundation.
// SPDX-License-Identifier: Apache-2.0

// Copyright 2022 Webb Technologies Inc.
// SPDX-License-Identifier: Apache-2.0
// This file has been modified by Webb Technologies Inc.

import { EventBus } from '@webb-tools/app-util';

export type LogEvent = {
  log: {
    ctx: string;
    log: string;
    level: LogLevel;
  };
};

export class LoggerEvent extends EventBus<LogEvent> {
  constructor() {
    super();
    this.sendEvent = this.emit;
  }
}

export enum Color {
  Reset = '\x1b[0m',
  Bright = '\x1b[1m',
  Dim = '\x1b[2m',
  Underscore = '\x1b[4m',
  Blink = '\x1b[5m',
  Reverse = '\x1b[7m',
  Hidden = '\x1b[8m',
  FgBlack = '\x1b[30m',
  FgRed = '\x1b[31m',
  FgGreen = '\x1b[32m',
  FgYellow = '\x1b[33m',
  FgBlue = '\x1b[34m',
  FgMagenta = '\x1b[35m',
  FgCyan = '\x1b[36m',
  FgWhite = '\x1b[37m',
  BgBlack = '\x1b[40m',
  BgRed = '\x1b[41m',
  BgGreen = '\x1b[42m',
  BgYellow = '\x1b[43m',
  BgBlue = '\x1b[44m',
  BgMagenta = '\x1b[45m',
  BgCyan = '\x1b[46m',
  BgWhite = '\x1b[47m',
}

export enum LogLevel {
  trace,
  log,
  info,
  warn,
  debug,
  error,
}

type LoggersMaps = Record<string, LoggerService>;
type LoggerFn = (...message: any[]) => void;

export class LoggerService {
  public static readonly eventBus = new LoggerEvent();
  private static _loggers: LoggersMaps = {};
  public static _enabled = true;

  static new(ctx: string, logLevel: LogLevel = LogLevel.trace): LoggerService {
    const logger = new LoggerService(ctx, logLevel);

    LoggerService._loggers[ctx] = logger;

    return logger;
  }

  static get(ctx: string): LoggerService {
    const cachedLogger = LoggerService._loggers[ctx];

    if (cachedLogger) {
      return cachedLogger;
    }

    return LoggerService.new(ctx);
  }

  constructor(readonly ctx: string, readonly logLevel: LogLevel) {
    return this;
  }

  private logger(
    this: LoggerService,
    level: LogLevel = LogLevel.trace,
    color: Color,
    ...message: any[]
  ): any[] | void {
    let m = '';

    try {
      m = JSON.stringify(message, null, 2);
    } catch (e) {
      m = 'Cant show message';
    }

    LoggerService.eventBus.sendEvent?.('log', {
      ctx: this.ctx,
      level,
      log: m,
    });

    if (!LoggerService._enabled) {
      return;
    }

    if (this.logLevel <= level) {
      const date = new Date();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      return [
        `${color}[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}], [${
          this.ctx
        }] `,
        ...message,
      ];
    }
  }

  mutedLogger = (): null => null;

  debug = function debug(this: LoggerService, ...message: any[]) {
    const log = this.logger(LogLevel.debug, Color.FgBlack, ...message);

    if (!log) {
      return this.mutedLogger;
    }

    return Function.prototype.bind.call(
      console.log,
      console,
      ...log
    ) as LoggerFn;
  }.call(this);

  error = function error(this: LoggerService, ...message: any[]) {
    const log = this.logger(LogLevel.error, Color.FgRed, ...message);

    if (!log) {
      return this.mutedLogger;
    }

    return Function.prototype.bind.call(
      console.log,
      console,
      ...log
    ) as LoggerFn;
  }.call(this);

  info = function info(this: LoggerService, ...message: any[]) {
    const log = this.logger(LogLevel.info, Color.FgCyan, ...message);

    if (!log) {
      return this.mutedLogger;
    }

    return Function.prototype.bind.call(
      console.log,
      console,
      ...log
    ) as LoggerFn;
  }.call(this);

  warn = function warn(this: LoggerService, ...message: any[]) {
    const log = this.logger(LogLevel.warn, Color.FgYellow, ...message);

    if (!log) {
      return this.mutedLogger;
    }

    return Function.prototype.bind.call(
      console.log,
      console,
      ...log
    ) as LoggerFn;
  }.call(this);

  trace = function trace(this: LoggerService, ...message: any[]) {
    const log = this.logger(LogLevel.trace, Color.FgBlack, ...message);

    if (!log) {
      return this.mutedLogger;
    }

    return Function.prototype.bind.call(
      console.log,
      console,
      ...log
    ) as LoggerFn;
  }.call(this);

  log = function log(this: LoggerService, ...message: any[]) {
    const log = this.logger(LogLevel.log, Color.FgBlack, ...message);

    if (!log) {
      return this.mutedLogger;
    }

    return Function.prototype.bind.call(
      console.log,
      console,
      ...log
    ) as LoggerFn;
  }.call(this);
}
