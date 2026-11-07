const topics = [
  ['1.5 Linear Functions', [
    ['01. Explain Slope', `Teach: What does slope tell us?\nSlope describes a line's steepness.\nIt is change in y over change in x.\nThink: rise divided by run.\nIn y = 2x + 3, the slope is 2.\nMove right 1, then move up 2.\nA positive slope rises to the right.\nA negative slope falls to the right.\nA horizontal line has slope zero.\nTry: Describe a slope of -3.`],
    ['02. Find the Intercepts', `Teach: How do we find intercepts?\nIntercepts are axis crossings.\nAt the x-axis, y equals zero.\nAt the y-axis, x equals zero.\nExample: x + y = 6.\nSet y = 0: x = 6.\nThe x-intercept is (6, 0).\nSet x = 0: y = 6.\nThe y-intercept is (0, 6).\nTry: Find both for x + y = 4.`]
  ]],
  ['1.6.1 Piecewise Functions', [
    ['03. Choose the Right Rule', `Teach: How does piecewise work?\nDifferent inputs use different rules.\nRead the input condition first.\nUse f(x) = 2x when x < 0.\nUse f(x) = 3 when x >= 0.\nFor x = -2, use the first rule.\nSo f(-2) = 2(-2) = -4.\nFor x = 1, use the second rule.\nSo f(1) = 3, not 2.\nTry: Explain why f(0) = 3.`],
    ['04. Open and Closed Dots', `Teach: What do endpoint dots mean?\nAn open dot excludes that point.\nA closed dot includes that point.\nUse an open dot for < or >.\nUse a closed dot for <= or >=.\nGraph each rule only where allowed.\nFor y = 2x when x < 0:\nDraw only to the left of x = 0.\nLeave an open dot at (0, 0).\nTry: What changes for x <= 0?`]
  ]],
  ['1.6.2 Step Functions', [
    ['05. Explain a Step Function', `Teach: Why does the graph have steps?\nEach interval has one fixed output.\nThat makes each piece horizontal.\nThe output can jump at a boundary.\nThink of fees by parking time.\nOne time bracket has one price.\nThe next bracket may cost more.\nCheck which bracket owns an endpoint.\nOpen dots exclude; closed include.\nTry: Describe another step model.`],
    ['06. Round Down with Floor', `Teach: What does floor(x) mean?\nChoose the greatest integer <= x.\nThis means round down, not to zero.\nfloor(3.8) = 3.\nfloor(3) = 3.\nfloor(-0.2) = -1, not 0.\nfloor(-6.35) = -7, not -6.\nOn 2 <= x < 3, floor(x) = 2.\nInclude 2; exclude 3 on that step.\nTry: Explain floor(-2.4).`]
  ]],
  ['1.6.3 Absolute Value', [
    ['07. Distance Makes a V', `Teach: What is absolute value?\nIt is distance from zero.\nDistance cannot be negative.\nSo |-5| = 5 and |5| = 5.\nThe graph of y = |x| is a V.\nIts vertex is (0, 0).\nOpposite inputs give equal outputs.\nThe domain is all real numbers.\nThe range is y >= 0.\nTry: Why is |-8| not -8?`],
    ['08. Solve Absolute Value', `Teach: Why can there be two answers?\nTwo numbers can share a distance.\nExample: |x - 1| = 4.\nWrite x - 1 = 4 or x - 1 = -4.\nSolve to get x = 5 or x = -3.\nBoth are 4 units away from 1.\nCheck both in the original equation.\nIsolate the absolute value first.\n|x| = -4 has no real solution.\nTry: Solve |x| = 3 and explain.`]
  ]],
  ['1.7.1 Parent Functions', [
    ['09. Recognize Parent Shapes', `Teach: What is a parent function?\nIt is a family's basic function.\nTransformations build related graphs.\ny = x is a straight diagonal line.\ny = |x| makes a V shape.\ny = x^2 makes a curved parabola.\ny = 3 makes a horizontal line.\nShape helps you choose a model.\nDo not confuse a V with a curve.\nTry: Sketch y = |x| and y = x^2.`],
    ['10. Domain Versus Range', `Teach: Compare domain and range.\nDomain means allowed inputs.\nRange means possible outputs.\nFor y = x^2, any real x works.\nBut squaring never gives a negative.\nDomain: all real numbers.\nRange: y >= 0.\nFor y = 3, any real x still works.\nIts range contains only 3.\nTry: Give the range of y = |x|.`]
  ]],
  ['1.7.2 Translations', [
    ['11. Read Graph Shifts', `Teach: How do we read a translation?\nA translation moves the whole graph.\nIt does not change the shape.\nIn g(x) = f(x - h) + k:\nh moves right; k moves up.\nNegative h moves left.\nNegative k moves down.\nExample: y = (x - 3)^2 + 2.\nShift y = x^2 right 3 and up 2.\nTry: Describe y = (x + 4)^2 - 1.`],
    ['12. Move a Known Point', `Teach: How do graph points shift?\nMove every point the same distance.\nExample: y = |x - 2| + 3.\nStart with parent y = |x|.\nMove right 2 and up 3.\nThe vertex (0, 0) becomes (2, 3).\nThe point (1, 1) becomes (3, 4).\nCheck: |3 - 2| + 3 = 4.\nThe V keeps the same shape.\nTry: Where does (-1, 1) move?`]
  ]],
  ['1.7.3 Dilations', [
    ['13. Stretch Vertically', `Teach: What does a*f(x) change?\nIt multiplies each output by a.\nThe x-coordinate stays the same.\nFor y = 3x^2, multiply heights by 3.\n(1, 1) becomes (1, 3).\nThis is a vertical stretch by 3.\nFor y = (1/2)x^2, halve heights.\nThat is a vertical compression.\nA negative a also flips over x-axis.\nTry: Describe y = -2x^2.`],
    ['14. Scale Horizontally', `Teach: What does f(b*x) change?\nIt divides x-coordinates by b.\nFor b = 2, widths are halved.\nThis is a horizontal compression.\nFor b = 1/2, widths are doubled.\nThis is a horizontal stretch.\nIn y = |2x|, start from y = |x|.\n(2, 2) becomes (1, 2).\nA negative b also flips over y-axis.\nTry: Describe y = |x/3|.`]
  ]],
  ['1.7.3 Combined Transformations', [
    ['15. Combine Flip and Shift', `Teach: How can changes work together?\nStart with y = x^2.\nExample: y = -2(x - 1)^2 + 3.\nStretch vertically by 2.\nReflect across the x-axis.\nThen shift right 1 and up 3.\nThe new vertex is (1, 3).\nThe parabola opens downward.\nIts maximum output is 3.\nTry: Why is 3 a maximum here?`],
    ['16. Factor the Inside First', `Teach: Why factor before shifting?\nThe raw constant can mislead you.\nExample: g(x) = |2x - 6|.\nFactor: g(x) = |2(x - 3)|.\nThe horizontal shift is right 3.\nIt is not a shift right 6.\nThere is also a width factor of 1/2.\nThe vertex occurs when 2x - 6 = 0.\nSo the vertex is (3, 0).\nTry: Find the vertex of |2x - 4|.`]
  ]],
  ['2.3 Linear Equations', [
    ['17. Read Slope-Intercept Form', `Teach: What does y = mx + b tell us?\nm is the slope, or rate of change.\nb is the y-intercept's y-value.\nExample: y = 25x + 40.\nA gym charges $40 to join.\nEach month adds another $25.\nLet x be months and y be dollars.\nAt x = 0, the total is $40.\nAt x = 2, y = 25(2) + 40 = 90.\nTry: Explain the 25 in words.`],
    ['18. Write a Line from a Point', `Teach: What is point-slope form?\nUse y - y1 = m(x - x1).\nYou need a slope and one point.\nExample: m = 2 through (1, 3).\nSubstitute: y - 3 = 2(x - 1).\nExpand: y - 3 = 2x - 2.\nAdd 3: y = 2x + 1.\nCheck the point by using x = 1.\nThen y = 2(1) + 1 = 3.\nTry: Write a line, m = 3, at (0, 2).`]
  ]],
  ['2.4 Graphing Systems', [
    ['19. Explain an Intersection', `Teach: What solves a system?\nOne point must satisfy both rules.\nGraph both lines on the same axes.\nTheir intersection is the solution.\nExample: y = 2x - 1.\nAlso graph y = -x + 5.\nThey meet at (2, 3).\nFirst check: 3 = 2(2) - 1.\nSecond check: 3 = -2 + 5.\nTry: Why must both checks work?`],
    ['20. Count System Solutions', `Teach: Can two lines fail to meet?\nYes: distinct parallel lines do not.\nThey give a system with no solution.\nDifferent slopes give one crossing.\nThat means exactly one solution.\nIdentical lines share every point.\nThey give infinitely many solutions.\nCompare y = 2x + 1 and y = 2x - 3.\nSame slope, different intercepts.\nTry: How many solutions? Explain.`]
  ]],
  ['2.5 Algebraic Systems', [
    ['21. Solve by Substitution', `Teach: What does substitution do?\nReplace a variable with its equal.\nExample: y = 2x and x + y = 6.\nReplace y in the second equation.\nThen x + 2x = 6.\nCombine: 3x = 6, so x = 2.\nUse y = 2x to get y = 4.\nThe solution is (2, 4).\nCheck: 4 = 2(2) and 2 + 4 = 6.\nTry: Explain why we replaced y.`],
    ['22. Solve by Elimination', `Teach: What does elimination do?\nIt cancels one variable's terms.\nExample: x + y = 5.\nSecond equation: x - y = 1.\nAdd the equations: 2x = 6.\nThe +y and -y cancel each other.\nSo x = 3.\nUse 3 + y = 5 to get y = 2.\nCheck: 3 + 2 = 5 and 3 - 2 = 1.\nTry: When would subtraction help?`]
  ]],
  ['2.6 Inequality Systems', [
    ['23. Draw and Shade a Boundary', `Teach: How do we graph y > x + 1?\nFirst draw the boundary y = x + 1.\nUse dashes because > excludes =.\nShade above: y must be larger.\nFor >=, use a solid boundary.\nTest a point away from the line.\nTry (0, 3): 3 > 1 is true.\nSo its side must be shaded.\nFlip the sign if dividing by -1.\nTry: Graph y <= x + 1 instead.`],
    ['24. Keep Only the Overlap', `Teach: What solves two inequalities?\nA point must satisfy both at once.\nExample: y >= x and y <= 4.\nShade above or on y = x.\nShade below or on y = 4.\nKeep only the shared region.\n(1, 3) works: 3 >= 1 and 3 <= 4.\n(5, 2) fails because 2 < 5.\nNo overlap means no solution.\nTry: Does (2, 4) satisfy both?`]
  ]],
  ['2.7 Linear Programming', [
    ['25. Goal Versus Limits', `Teach: What is linear programming?\nIt finds a best value within limits.\nThe objective states your goal.\nConstraints state the limits.\nExample goal: maximize P = 3x + 2y.\nRequire x >= 0 and y >= 0.\nAlso require x + y <= 8.\nThe feasible region meets all limits.\nMaximize means find the largest P.\nTry: What does minimize mean?`],
    ['26. Test the Corners', `Teach: How can corners find the best?\nUse a closed, bounded polygon.\nFor a linear goal, test each vertex.\nExample: x >= 0, y >= 0, x + y <= 4.\nVertices: (0, 0), (4, 0), (0, 4).\nMaximize P = 3x + 2y.\nThe values are 0, 12, and 8.\nThe maximum is 12 at (4, 0).\nCheck that point meets every limit.\nTry: Find the minimum P here.`]
  ]]
];

export const cards = topics.flatMap(([topic, entries]) => entries.map(([title, body]) => ({ topic, title, lines: body.split('\n') })));

export function renderFlashcards(escapeHTML, loadAlgebraNotes) {
  const notes = loadAlgebraNotes();
  const styles = `
    .flash-intro { padding-block: 44px 24px; }
    .flash-intro h1 { font-size: clamp(34px, 4.5vw, 54px); font-weight: normal; }
    .flash-intro p { color: var(--muted); line-height: 1.7; }
    .flash-topics { padding-block: 8px 40px; }
    .flash-topic { border-top: 1px solid var(--rule); padding-block: 20px; scroll-margin-top: 16px; }
    .flash-topic h2 { font-size: 24px; font-weight: normal; }
    .topic-nav { display: flex; flex-wrap: wrap; gap: 8px 18px; font: 12px/1.6 system-ui, sans-serif; }
    .flash-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
    .flash-card { min-width: 0; border: 1px solid var(--rule); background: #fffefb; padding: 14px; }
    .flash-card h3 { font-size: 18px; font-weight: normal; margin: 0 0 12px; }
    .flash-card details { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; direction: ltr; text-align: left; }
    .flash-card summary { cursor: pointer; white-space: nowrap; font-size: 14px; line-height: 1.6; list-style-position: inside; }
    .flash-card ol { padding-inline-start: 2.2em; margin: 12px 0 0; font-size: 14px; line-height: 1.7; }
    .flash-card li { white-space: nowrap; }
    .flash-card li:first-child { font-weight: bold; }
    .back { margin-top: 10px; font: 12px/1.6 system-ui, sans-serif; }
    @media (max-width: 960px) { .flash-grid { grid-template-columns: minmax(0, 1fr); } }
    @media (max-width: 520px) { .flash-card { padding: 10px; } .flash-card summary, .flash-card ol { font-size: clamp(9px, 2.75vw, 13px); } }
    @media print {
      header, footer, .skip, .topic-nav, .back { display: none; }
      .flash-intro { padding: 0; }
      .flash-grid { display: block; }
      .flash-topic { break-inside: auto; padding-block: 5mm; }
      .flash-card { break-inside: avoid; margin-bottom: 6mm; }
      .flash-card details { display: block; }
      .flash-card details::details-content { display: block; content-visibility: visible; }
      .flash-card details:not([open])::details-content { display: block; content-visibility: visible; }
      .flash-card summary { list-style: none; }
    }`;
  const cards = topics.map(([topic, entries], group) => {
    const cardsHTML = entries.map(([title, body], index) => {
      const id = `card-${String(group * 2 + index + 1).padStart(2, '0')}`;
      const lines = body.split('\n');
      return `
        <article class="flash-card">
          <h3>${escapeHTML(title)}</h3>
          <details id="${id}">
            <summary>${escapeHTML(lines[0])}</summary>
            <ol>${lines.slice(1).map(line => `<li>${escapeHTML(line)}</li>`).join('')}</ol>
          </details>
          <p class="back"><a href="algebra-2.html#topic-${escapeHTML(notes[group].file.replaceAll('.', '-'))}">Back to ${escapeHTML(notes[group].label)} notes</a></p>
        </article>`;
    }).join('');
    return `
      <section class="flash-topic" id="flash-topic-${group}" aria-labelledby="flash-topic-${group}-title">
        <h2 id="flash-topic-${group}-title">${escapeHTML(topic)}</h2>
        <div class="flash-grid">${cardsHTML}
        </div>
      </section>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="26 Algebra 2 teaching flashcards, two per topic.">
  <title>Algebra 2 Teaching Flashcards</title>
  <link rel="stylesheet" href="styles/site.css">
  <style>${styles}
  </style>
</head>
<body>
  <a class="skip" href="#cards">Skip to flashcards</a>
  <div class="wrap">
    <header>
      <div class="masthead"><p class="wordmark">Joltlined</p><p class="masthead-note">Notes &amp; literary analysis</p></div>
      <nav class="subjects" aria-label="Subjects"><a href="index.html">Home</a><a href="ap-lang.html">AP Lang Notes</a><a href="ap-world.html">AP World History Notes</a><a href="algebra-2.html">Algebra 2 Notes</a><a href="out-of-my-mind.html">Out Of My Mind Analysis</a><a href="of-mice-and-men.html">Of Mice And Men Analysis</a><a href="fahrenheit-451.html">Fahrenheit 451 Analysis</a></nav>
      <div class="flash-intro">
        <p class="eyebrow">Algebra 2 / Modules 1B &amp; 2A</p>
        <h1>Teaching Flashcards</h1>
        <p>26 cards · two per topic. Read the Teach prompt aloud, answer, then open the card to check the complete explanation.</p>
        <p><a href="algebra-2.html">Back to Algebra 2 notes</a></p>
        <nav class="topic-nav" aria-label="Flashcard topics">${topics.map(([topic], index) => `<a href="#flash-topic-${index}">${escapeHTML(topic)}</a>`).join('')}</nav>
      </div>
    </header>
    <main class="flash-topics" id="cards">${cards}
    </main>
    <footer><a href="algebra-2.html">Back to Algebra 2 notes</a></footer>
  </div>
</body>
</html>
`;
}
