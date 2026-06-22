/*
 * Minimal QR code encoder — a trimmed TypeScript port of Project Nayuki's
 * "QR Code generator library" (https://www.nayuki.io/page/qr-code-generator-library),
 * MIT License, Copyright (c) Project Nayuki.
 *
 * Trimmed to what the device frame needs: byte mode (UTF-8), error correction
 * level M, automatic version (1-40) and automatic mask selection. Vendored so
 * the kit folder works with zero npm dependencies.
 */

const ECC_M_FORMAT_BITS = 0;

// Index 0 is padding. Values are for error correction level M.
const ECC_CODEWORDS_PER_BLOCK = [
  -1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26,
  26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28,
  28, 28, 28,
];
const NUM_ERROR_CORRECTION_BLOCKS = [
  -1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17,
  17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49,
];

function getNumRawDataModules(ver: number): number {
  let result = (16 * ver + 128) * ver + 64;
  if (ver >= 2) {
    const numAlign = Math.floor(ver / 7) + 2;
    result -= (25 * numAlign - 10) * numAlign - 55;
    if (ver >= 7) result -= 36;
  }
  return result;
}

function getNumDataCodewords(ver: number): number {
  return (
    Math.floor(getNumRawDataModules(ver) / 8) -
    ECC_CODEWORDS_PER_BLOCK[ver] * NUM_ERROR_CORRECTION_BLOCKS[ver]
  );
}

function reedSolomonMultiply(x: number, y: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z;
}

function reedSolomonComputeDivisor(degree: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < degree - 1; i++) result.push(0);
  result.push(1);
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < result.length; j++) {
      result[j] = reedSolomonMultiply(result[j], root);
      if (j + 1 < result.length) result[j] ^= result[j + 1];
    }
    root = reedSolomonMultiply(root, 0x02);
  }
  return result;
}

function reedSolomonComputeRemainder(data: number[], divisor: number[]): number[] {
  const result: number[] = divisor.map(() => 0);
  for (const b of data) {
    const factor = b ^ (result.shift() as number);
    result.push(0);
    divisor.forEach((coef, i) => {
      result[i] ^= reedSolomonMultiply(coef, factor);
    });
  }
  return result;
}

function addEccAndInterleave(ver: number, data: number[]): number[] {
  const numBlocks = NUM_ERROR_CORRECTION_BLOCKS[ver];
  const blockEccLen = ECC_CODEWORDS_PER_BLOCK[ver];
  const rawCodewords = Math.floor(getNumRawDataModules(ver) / 8);
  const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
  const shortBlockLen = Math.floor(rawCodewords / numBlocks);

  const blocks: number[][] = [];
  const rsDiv = reedSolomonComputeDivisor(blockEccLen);
  for (let i = 0, k = 0; i < numBlocks; i++) {
    const dat = data.slice(
      k,
      k + shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1),
    );
    k += dat.length;
    const ecc = reedSolomonComputeRemainder(dat, rsDiv);
    if (i < numShortBlocks) dat.push(0);
    blocks.push(dat.concat(ecc));
  }

  const result: number[] = [];
  for (let i = 0; i < blocks[0].length; i++) {
    blocks.forEach((block, j) => {
      if (i !== shortBlockLen - blockEccLen || j >= numShortBlocks) {
        result.push(block[i]);
      }
    });
  }
  return result;
}

function getBit(x: number, i: number): boolean {
  return ((x >>> i) & 1) !== 0;
}

/** Encodes text (UTF-8, byte mode, ECC M) into a square module matrix. */
export function encodeQr(text: string): boolean[][] {
  const data = Array.from(new TextEncoder().encode(text));

  // Smallest version whose data capacity fits the byte-mode segment.
  let version = -1;
  for (let ver = 1; ver <= 40; ver++) {
    const ccBits = ver <= 9 ? 8 : 16;
    const neededBits = 4 + ccBits + data.length * 8;
    if (neededBits <= getNumDataCodewords(ver) * 8) {
      version = ver;
      break;
    }
  }
  if (version === -1) throw new Error("QR payload too long");

  // Bit buffer: mode indicator, char count, data, terminator, padding.
  const bits: number[] = [];
  const appendBits = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1);
  };
  appendBits(0x4, 4); // byte mode
  appendBits(data.length, version <= 9 ? 8 : 16);
  for (const b of data) appendBits(b, 8);

  const capacityBits = getNumDataCodewords(version) * 8;
  appendBits(0, Math.min(4, capacityBits - bits.length));
  appendBits(0, (8 - (bits.length % 8)) % 8);
  for (let pad = 0xec; bits.length < capacityBits; pad ^= 0xec ^ 0x11) {
    appendBits(pad, 8);
  }

  const dataCodewords: number[] = [];
  bits.forEach((bit, i) => {
    if (i % 8 === 0) dataCodewords.push(0);
    dataCodewords[dataCodewords.length - 1] |= bit << (7 - (i % 8));
  });

  const allCodewords = addEccAndInterleave(version, dataCodewords);

  // --- Matrix drawing ---
  const size = version * 4 + 17;
  const modules: boolean[][] = Array.from({ length: size }, () =>
    new Array(size).fill(false),
  );
  const isFunction: boolean[][] = Array.from({ length: size }, () =>
    new Array(size).fill(false),
  );

  const setFunctionModule = (x: number, y: number, dark: boolean) => {
    modules[y][x] = dark;
    isFunction[y][x] = true;
  };

  const drawFinderPattern = (x: number, y: number) => {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        const xx = x + dx;
        const yy = y + dy;
        if (xx >= 0 && xx < size && yy >= 0 && yy < size) {
          setFunctionModule(xx, yy, dist !== 2 && dist !== 4);
        }
      }
    }
  };

  const drawAlignmentPattern = (x: number, y: number) => {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        setFunctionModule(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }
    }
  };

  const drawFormatBits = (mask: number) => {
    const data = (ECC_M_FORMAT_BITS << 3) | mask;
    let rem = data;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const formatBits = ((data << 10) | rem) ^ 0x5412;

    for (let i = 0; i <= 5; i++) setFunctionModule(8, i, getBit(formatBits, i));
    setFunctionModule(8, 7, getBit(formatBits, 6));
    setFunctionModule(8, 8, getBit(formatBits, 7));
    setFunctionModule(7, 8, getBit(formatBits, 8));
    for (let i = 9; i < 15; i++) setFunctionModule(14 - i, 8, getBit(formatBits, i));

    for (let i = 0; i < 8; i++) setFunctionModule(size - 1 - i, 8, getBit(formatBits, i));
    for (let i = 8; i < 15; i++) setFunctionModule(8, size - 15 + i, getBit(formatBits, i));
    setFunctionModule(8, size - 8, true);
  };

  const drawVersionInfo = () => {
    if (version < 7) return;
    let rem = version;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const versionBits = (version << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const color = getBit(versionBits, i);
      const a = size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      setFunctionModule(a, b, color);
      setFunctionModule(b, a, color);
    }
  };

  const getAlignmentPatternPositions = (): number[] => {
    if (version === 1) return [];
    const numAlign = Math.floor(version / 7) + 2;
    const step =
      version === 32
        ? 26
        : Math.ceil((version * 4 + 4) / (numAlign * 2 - 2)) * 2;
    const result = [6];
    for (let pos = size - 7; result.length < numAlign; pos -= step) {
      result.splice(1, 0, pos);
    }
    return result;
  };

  // Function patterns
  for (let i = 0; i < size; i++) {
    setFunctionModule(6, i, i % 2 === 0);
    setFunctionModule(i, 6, i % 2 === 0);
  }
  drawFinderPattern(3, 3);
  drawFinderPattern(size - 4, 3);
  drawFinderPattern(3, size - 4);

  const alignPatPos = getAlignmentPatternPositions();
  const numAlign = alignPatPos.length;
  for (let i = 0; i < numAlign; i++) {
    for (let j = 0; j < numAlign; j++) {
      const isCorner =
        (i === 0 && j === 0) ||
        (i === 0 && j === numAlign - 1) ||
        (i === numAlign - 1 && j === 0);
      if (!isCorner) drawAlignmentPattern(alignPatPos[i], alignPatPos[j]);
    }
  }
  drawFormatBits(0); // reserve the modules; real mask drawn after selection
  drawVersionInfo();

  // Codeword placement (zigzag, skipping the vertical timing column)
  let bitIndex = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vert : vert;
        if (!isFunction[y][x] && bitIndex < allCodewords.length * 8) {
          modules[y][x] = getBit(
            allCodewords[bitIndex >>> 3],
            7 - (bitIndex & 7),
          );
          bitIndex++;
        }
      }
    }
  }

  const maskPredicates: Array<(x: number, y: number) => boolean> = [
    (x, y) => (x + y) % 2 === 0,
    (_x, y) => y % 2 === 0,
    (x) => x % 3 === 0,
    (x, y) => (x + y) % 3 === 0,
    (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
    (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
    (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
    (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
  ];

  const applyMask = (mask: number) => {
    const predicate = maskPredicates[mask];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (!isFunction[y][x] && predicate(x, y)) modules[y][x] = !modules[y][x];
      }
    }
  };

  const getPenaltyScore = (): number => {
    let result = 0;
    // Rule 1: runs of >=5 same-colored modules in rows and columns.
    for (let y = 0; y < size; y++) {
      let runColor = modules[y][0];
      let runLen = 1;
      for (let x = 1; x < size; x++) {
        if (modules[y][x] === runColor) {
          runLen++;
          if (x === size - 1 && runLen >= 5) result += runLen - 2;
        } else {
          if (runLen >= 5) result += runLen - 2;
          runColor = modules[y][x];
          runLen = 1;
        }
      }
    }
    for (let x = 0; x < size; x++) {
      let runColor = modules[0][x];
      let runLen = 1;
      for (let y = 1; y < size; y++) {
        if (modules[y][x] === runColor) {
          runLen++;
          if (y === size - 1 && runLen >= 5) result += runLen - 2;
        } else {
          if (runLen >= 5) result += runLen - 2;
          runColor = modules[y][x];
          runLen = 1;
        }
      }
    }
    // Rule 2: 2x2 blocks of the same color.
    for (let y = 0; y < size - 1; y++) {
      for (let x = 0; x < size - 1; x++) {
        const c = modules[y][x];
        if (c === modules[y][x + 1] && c === modules[y + 1][x] && c === modules[y + 1][x + 1]) {
          result += 3;
        }
      }
    }
    // Rule 3: finder-like 1:1:3:1:1 patterns with 4-module light flank.
    const hasPattern = (bits: boolean[]): boolean => {
      const p1 = [true, false, true, true, true, false, true, false, false, false, false];
      const p2 = [false, false, false, false, true, false, true, true, true, false, true];
      return (
        bits.length === 11 &&
        (bits.every((b, i) => b === p1[i]) || bits.every((b, i) => b === p2[i]))
      );
    };
    for (let y = 0; y < size; y++) {
      for (let x = 0; x <= size - 11; x++) {
        const row = modules[y].slice(x, x + 11);
        const col: boolean[] = [];
        if (y <= size - 11) {
          for (let k = 0; k < 11; k++) col.push(modules[y + k][x]);
        }
        if (hasPattern(row)) result += 40;
        if (col.length === 11 && hasPattern(col)) result += 40;
      }
    }
    // Rule 4: dark module proportion deviation from 50%.
    let dark = 0;
    for (const row of modules) for (const m of row) if (m) dark++;
    const total = size * size;
    result += Math.floor(Math.abs(dark * 20 - total * 10) / total) * 10;
    return result;
  };

  // Pick the mask with the lowest penalty (any mask is a valid QR code; the
  // penalty just optimizes scannability).
  let bestMask = 0;
  let bestPenalty = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    applyMask(mask);
    drawFormatBits(mask);
    const penalty = getPenaltyScore();
    if (penalty < bestPenalty) {
      bestPenalty = penalty;
      bestMask = mask;
    }
    applyMask(mask); // undo (XOR mask is its own inverse)
  }
  applyMask(bestMask);
  drawFormatBits(bestMask);

  return modules;
}

/** Encodes text into an SVG path string (1 unit per module) plus matrix size. */
export function qrSvgPath(text: string): { d: string; size: number } {
  const modules = encodeQr(text);
  const size = modules.length;
  const parts: string[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (modules[y][x]) parts.push(`M${x},${y}h1v1h-1z`);
    }
  }
  return { d: parts.join(""), size };
}
