// Copyright 2018-2026 the Deno authors. MIT license.
import { core, primordials } from "ext:core/mod.js";
const { ArrayPrototypePush, StringPrototypeCharCodeAt, Uint8Array } =
  primordials;

import { stdin } from "ext:deno_io/12_io.js";

const LF = StringPrototypeCharCodeAt("\n", 0);
const CR = StringPrototypeCharCodeAt("\r", 0);

function alert(message = "Alert") {
  if (!stdin.isTerminal()) {
    return;
  }

  core.print(`${message} [Enter] `, false);

  readLineFromStdinSync();
}

function confirm(message = "Confirm") {
  if (!stdin.isTerminal()) {
    return false;
  }

  core.print(`${message} [y/N] `, false);

  const { value: answer } = readLineFromStdinSync();

  return answer === "Y" || answer === "y";
}

function prompt(message = "Prompt", defaultValue) {
  defaultValue ??= "";

  if (!stdin.isTerminal()) {
    return null;
  }

  const formattedMessage = message.length === 0 ? "" : `${message} `;
  core.print(formattedMessage, false);

  const { value, isEof } = readLineFromStdinSync();

  // If user closed stdin (Ctrl+D), return null.
  // If user pressed Enter with no input, return the default value.
  if (isEof) {
    return null;
  }

  if (value.length === 0) {
    return defaultValue.length === 0 ? null : defaultValue;
  }

  return value;
}

function readLineFromStdinSync() {
  const c = new Uint8Array(1);
  const buf = [];
  let isEof = false;

  while (true) {
    const n = stdin.readSync(c);
    if (n === null) {
      isEof = true;
      break;
    }
    if (n === 0) {
      break;
    }
    if (c[0] === CR) {
      const n = stdin.readSync(c);
      if (c[0] === LF) {
        break;
      }
      ArrayPrototypePush(buf, CR);
      if (n === null) {
        isEof = true;
        break;
      }
      if (n === 0) {
        break;
      }
    }
    if (c[0] === LF) {
      break;
    }
    ArrayPrototypePush(buf, c[0]);
  }
  return { value: core.decode(new Uint8Array(buf)), isEof };
}

export { alert, confirm, prompt };
