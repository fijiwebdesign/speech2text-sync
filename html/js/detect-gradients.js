function detectPeaks(data, windowWidth, threshold) {
  const peaks = [];
  let inc = false;
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - windowWidth);
    const end = Math.min(data.length, i + windowWidth);
    const sumLeft = data.slice(start, i).reduce((sum, y) => sum+y, 0);
    const sumRight = data.slice(i, end).reduce((sum, y) => sum+y, 0);
    if (sumLeft + threshold < sumRight) {
      inc = true
    } else {
      if (inc === true) peaks.push(i);
      inc = false;
    }
  }
  return peaks;
}

function detectLows(data, windowWidth, threshold) {
  const peaks = [];
  let inc = false;
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - windowWidth);
    const end = Math.min(data.length, i + windowWidth);
    const sumLeft = data.slice(start, i).reduce((sum, y) => sum+y, 0);
    const sumRight = data.slice(i, end).reduce((sum, y) => sum+y, 0);
    if (sumLeft > sumRight + threshold) {
      inc = true
    } else {
      if (inc === true) peaks.push(i);
      inc = false;
    }
  }
  return peaks;
}

function detectVolume(data, windowWidth, threshold) {
  const peaks = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - windowWidth);
    const end = Math.min(data.length, i + windowWidth);
    let deltaAcc = 0;
    for (let a = start; a < end; a++) {
      deltaAcc += data[a];
    }
    if (deltaAcc/windowWidth > threshold) {
      peaks.push(i);
    }
  }
  return peaks;
}

function detectGradientInc(data, windowWidth, threshold) {
  const peaks = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - windowWidth);
    const end = Math.min(data.length, i + windowWidth);
    const sumLeft = data.slice(start, i).reduce((sum, y) => sum+y, 0);
    const sumRight = data.slice(i, end).reduce((sum, y) => sum+y, 0);
    if (sumLeft + threshold < sumRight) {
      peaks.push(i);
    }
  }
  return peaks;
}

function detectGradientDec(data, windowWidth, threshold) {
  const peaks = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - windowWidth);
    const end = Math.min(data.length, i + windowWidth);
    const sumLeft = data.slice(start, i).reduce((sum, y) => sum+y, 0);
    const sumRight = data.slice(i, end).reduce((sum, y) => sum+y, 0);
    if (sumLeft > sumRight + threshold) {
      peaks.push(i);
    }
  }
  return peaks;
}