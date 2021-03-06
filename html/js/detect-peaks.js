let data = [
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  66,
  130,
  125,
  120,
  114,
  107,
  100,
  94,
  88,
  82,
  76,
  70,
  64,
  60,
  56,
  52,
  49,
  47,
  44,
  40,
  36,
  32,
  29,
  32,
  34,
  31,
  32,
  29,
  27,
  31,
  28,
  29,
  28,
  26,
  33,
  30,
  28,
  23,
  26,
  27,
  30,
  34,
  29,
  29,
  26,
  20,
  22,
  20,
  13,
  12,
  9,
  8,
  5,
  8,
  71,
  124,
  138,
  201,
  224,
  235,
  240,
  238,
  233,
  227,
  222,
  216,
  211,
  205,
  199,
  200,
  213,
  216,
  210,
  205,
  204,
  201,
  200,
  202,
  201,
  204,
  214,
  222,
  229,
  231,
  228,
  222,
  216,
  209,
  203,
  196,
  189,
  183,
  191,
  209,
  213,
  209,
  203,
  198,
  193,
  188,
  186,
  181,
  183,
  193,
  201,
  207,
  212,
  215,
  218,
  222,
  224,
  222,
  216,
  210,
  204,
  197,
  190,
  184,
  191,
  207,
  213,
  215,
  213,
  213,
  216,
  219,
  221,
  223,
  223,
  220,
  217,
  214,
  212,
  211,
  212,
  215,
  214,
  209,
  203,
  196,
  189,
  182,
  177,
  190,
  205,
  213,
  218,
  221,
  224,
  220,
  218,
  219,
  217,
  211,
  206,
  200,
  193,
  188,
  198,
  216,
  224,
  229,
  230,
  233,
  228,
  221,
  215,
  210,
  204,
  199,
  193,
  186,
  179,
  172,
  165,
  159,
  158,
  151,
  147,
  179,
  201,
  216,
  221,
  223,
  223,
  222,
  220,
  220,
  220,
  216,
  211,
  205,
  199,
  193,
  186,
  179,
  172,
  165,
  158,
  151,
  144,
  137,
  130,
  123,
  116,
  109,
  102,
  95,
  91,
  118,
  143,
  155,
  167,
  178,
  176,
  171,
  164,
  157,
  150,
  143,
  136,
  129,
  124,
  135,
  170,
  191,
  202,
  206,
  209,
  212,
  216,
  218,
  216,
  212,
  206,
  208,
  209,
  208,
  204,
  199,
  193,
  186,
  179,
  172,
  165,
  158,
  151,
  144,
  144,
  164,
  183,
  192,
  197,
  199,
  198,
  195,
  193,
  193,
  191,
  188,
  185,
  181,
  181,
  183,
  184,
  181,
  175,
  175,
  172,
  166,
  160,
  162,
  158
];

const height = 256 + 30; // canvas height

let windowWidth = 10;
let threshold = 100;

const detections = {
  peaks: true,
  volume: true,
  increases: true
}

const view = () => {

  const points = data.map(y => height - y)
  const peaks = detectPeaks(data, windowWidth, threshold);
  const volumes = detectVolume(data, windowWidth, threshold);
  const increases = detectGradientInc(data, windowWidth, threshold);
  const decreases = detectGradientDec(data, windowWidth, threshold);

  const overlays = {
    peaks: peaks.map(x => m("line", { x1: x, y1: 0, x2: x, y2: height, stroke: "#FF149350" })),
    volume: volumes.map(x => m("line", { x1: x, y1: 0, x2: x, y2: 10, stroke: "#BBFFBB" })),
    increases: increases.map(x => m("line", { x1: x, y1: 10, x2: x, y2: 20, stroke: "#C71585" })),
    decreases: decreases.map(x => m("line", { x1: x, y1: 20, x2: x, y2: 30, stroke: "#33FFF9" })),
  };
  const overlayEls = Object.values(overlays)

  const svg = m(
    "svg",
    {
      width: data.length,
      height,
      style: {
        border: "1px solid black",
      },
    },
    [
      ...overlayEls,
      m("polyline", {
        points: points.map((y, x) => `${x},${y}`).join(" "),
        stroke: "#4233FF",
        fill: "none",
      }),
    ],
  );

  const checkboxes = Object.keys(detections).map(name => {
    return m(
      "div",
      "",
      m("input", {
        type: "checkbox",
        checked: detections[name] ? 'checked' : '',
        value: 1,
        onclick: e => {
          ;(detections[name] = !detections[name]);

          console.log('detection changed', detections[name], name, detections)
        },
      }),
      name,
    )
  })

  return m("div", [
    svg,
    m(
      "div",
      "threshold",
      m("input", {
        type: "range",
        min: 1,
        max: 100,
        value: threshold,
        oninput: e => (threshold = e.target.valueAsNumber),
      }),
      threshold,
    ),
    m(
      "div",
      "window width",
      m("input", {
        type: "range",
        min: 1,
        max: 100,
        value: windowWidth,
        oninput: e => (windowWidth = e.target.valueAsNumber),
      }),
      windowWidth,
    ),
    checkboxes,
  ]);
};

m.mount(document.body, { view });
