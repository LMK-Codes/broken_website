// ===== DOM REFERENCES =====
const narrationEl = document.getElementById("narration");
const visualEl = document.getElementById("visual");
const choicesEl = document.getElementById("choices");
const hintEl = document.getElementById("hint");
const inputRow = document.getElementById("inputRow");
const nameInput = document.getElementById("nameInput");
const nameSubmit = document.getElementById("nameSubmit");
const screenEl = document.getElementById("screen");

// ===== GAME STATE =====
let state = "scene0_waitEnter";
let playerName = "Name";
let spaceCount = 0;
let guessCount = 0;   // for the 1–100 “game”
let triviaChosen = { "5": false, "22": false, "Potato": false };
let TEXT_SPEED = 1.7;   // higher = slower, lower = faster
let scene12Started = false;
let isTyping = false;
// ===== SCENE NAVIGATION =====
let sceneStack = [];
let scenes = {};




function runScene(name, record = true) {
  const fn = scenes[name];
  if (!fn) return;
  if (record) sceneStack.push(name);
  fn();
}

function goBack() {
  if (sceneStack.length <= 1) return; // nothing to go back to
  sceneStack.pop();                    // remove current scene
  const prevName = sceneStack[sceneStack.length - 1];
  const fn = scenes[prevName];
  if (fn) fn();                        // re-run previous scene (no re-push)
}

// ===== UTILITIES =====
function formatText(str) {
  // convert *italic* → <i>italic</i>
  return str.replace(/\*([^*]+)\*/g, "<i>$1</i>");
}

function triggerGlitch(duration = 450) {
  narrationEl.classList.add("glitch");
  setTimeout(() => narrationEl.classList.remove("glitch"), duration);
}

// line-by-line text
function sayLines(lines, options = {}) {
  const {
    delay = 1900,
    glitchLines = [],
    onDone = null,
    clear = true,
    append = false
  } = options;

  let i = 0;

  if (clear || !append) {
    narrationEl.innerHTML = "";
  }

  isTyping = true;

  const realDelay = delay * TEXT_SPEED;  // ⬅⬅⬅ THIS MAKES THE SPEED GLOBAL

  function next() {
    if (i < lines.length) {
      const raw = lines[i];
      const lineEl = document.createElement("div");
      lineEl.className = "line";

      if (raw === "") {
        lineEl.classList.add("spacer");
        lineEl.innerHTML = "&nbsp;";
      } else {
        lineEl.innerHTML = formatText(raw);
      }

      narrationEl.appendChild(lineEl);

      if (glitchLines.includes(i)) {
        triggerGlitch();
      }

      i++;
      setTimeout(next, realDelay); // ⬅ use scaled delay
    } else {
      isTyping = false;
      if (onDone) onDone();
    }
  }

  next();
}



function clearChoices() {
  choicesEl.innerHTML = "";
}

function addChoice(label, handler, disabled = false) {
  const btn = document.createElement("button");
  btn.className = "choice";
  btn.textContent = label;
  btn.disabled = disabled;
  btn.addEventListener("click", handler);
  choicesEl.appendChild(btn);
  return btn;
}

function showInputRow(show) {
  inputRow.style.display = show ? "flex" : "none";
  if (show) {
    nameInput.value = "";
    nameInput.focus();
  }
}

function resetVisual() {
  visualEl.innerHTML = "";
}

// ===== CONFETTI =====
function triggerConfetti(duration = 2500, count = 80) {
  const pieces = [];

  for (let i = 0; i < count; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti";

    // random bright color
    const hue = Math.floor(Math.random() * 360);
    piece.style.backgroundColor = `hsl(${hue}, 90%, 60%)`;

    // pick one of four EDGES instead of strict corners
    const edge = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
    let startTop, startLeft;

    if (edge === 0) {                 // TOP edge
      startTop = "0%";
      startLeft = Math.random() * 100 + "%";
      piece.style.transformOrigin = "50% 0%";
    } else if (edge === 1) {          // RIGHT edge
      startTop = Math.random() * 100 + "%";
      startLeft = "100%";
      piece.style.transformOrigin = "100% 50%";
    } else if (edge === 2) {          // BOTTOM edge
      startTop = "100%";
      startLeft = Math.random() * 100 + "%";
      piece.style.transformOrigin = "50% 100%";
    } else {                          // LEFT edge
      startTop = Math.random() * 100 + "%";
      startLeft = "0%";
      piece.style.transformOrigin = "0% 50%";
    }

    piece.style.top = startTop;
    piece.style.left = startLeft;

    // how far each piece travels
    const distance = 200 + Math.random() * 220; // 200–420px

    // pick a base angle mostly "into" the screen, but with a wide spread
    let angle;
    if (edge === 0) {           // from TOP, go mostly downward
      angle = (Math.PI / 2) + (Math.random() - 0.5) * (Math.PI / 1.5);
    } else if (edge === 2) {    // from BOTTOM, go mostly upward
      angle = (-Math.PI / 2) + (Math.random() - 0.5) * (Math.PI / 1.5);
    } else if (edge === 1) {    // from RIGHT, go mostly left
      angle = Math.PI + (Math.random() - 0.5) * (Math.PI / 1.5);
    } else {                    // from LEFT, go mostly right
      angle = 0 + (Math.random() - 0.5) * (Math.PI / 1.5);
    }

    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    // pass direction into CSS
    piece.style.setProperty("--dx", dx + "px");
    piece.style.setProperty("--dy", dy + "px");

    // slight randomization per piece
    piece.style.animationDelay = (Math.random() * 0.4) + "s";
    piece.style.animationDuration = (1.5 + Math.random() * 0.9) + "s";

    screenEl.appendChild(piece);
    pieces.push(piece);
  }

  // cleanup
  setTimeout(() => {
    pieces.forEach(p => p.remove());
  }, duration + 500);
}



// ===== SCENES =====

// SCENE 0 — TITLE / START
// SCENE 0 — TITLE / START
function scene0_start() {
  // reset history + flags on fresh start
  sceneStack = [];
  scene12Started = false;

  state = "scene0_waitEnter";
  clearChoices();
  resetVisual();
  showInputRow(false);
  hintEl.textContent = "";

  sayLines(
    [
      "The goal of every game is to win,",
      "and how to win is usually made quite clear,",
      "by the narrator of the game.",
      "",
      "You'll find *no* such thing here."
    ],
    {
      delay: 900,
      clear: true,
      onDone: () => {
        // small pause before showing hint
        setTimeout(() => {
          hintEl.textContent = "[press ENTER to begin]";
        }, 500);
      }
    }
  );
}


// SCENE 1 — “WE HAVE NO IDEA”
function scene1_weHaveNoIdea() {
  state = "scene1_running";
  clearChoices();
  resetVisual();
  showInputRow(false);
  hintEl.textContent = "";

  sayLines(
    [
      "Here, the goal is just to not lose.",
      "How do you lose?",
      "By not winning.",
      "How do you win?",
      "By not... losing..",
      "Uh. Wait.",
      "*(papers rustling...)*",
      "That doesn't make sense. Hold on - "
    ],
    {
      delay: 1200,
      clear: true,
      onDone: () => {
        // fake loading with a slightly longer pause
        setTimeout(() => {
          narrationEl.textContent = "loading...";
          setTimeout(() => runScene("scene2_badInstructions"), 1800);
        }, 800);
      }
    }
  );
}

// SCENE 2 — BAD INSTRUCTIONS
function scene2_badInstructions() {
  state = "scene2_waitSpace";
  clearChoices();
  resetVisual();
  showInputRow(false);

  sayLines(
    [
      "Sorry about that.",
      "Apparently, you win by following my instructions.",
      "So. I guess... just do as I say. Got that?",
      "You just gotta listen to me, and we'll both get through this, together.",
      "Press SPACEBAR."
    ],
    {
      delay: 1100,
      clear: true,
      onDone: () => {
        hintEl.textContent = "[press SPACEBAR]";
      }
    }
  );
}

// after SPACE
function scene2_afterSpace() {
  state = "scene2_waitEnter";
  sayLines(
    [
      "",
      "",
      "Crap, wait.",
      "Sorry about that.",
      "I meant press Enter."
    ],
    {
      delay: 1200,
      clear: true,
      onDone: () => {
        setTimeout(() => {
          hintEl.textContent = "[press ENTER]";
        }, 400);
      }
    }
  );
}

// after ENTER
function scene2_afterEnter() {
  state = "scene2_waitJ";
  hintEl.textContent = "";
  sayLines(
    [
      "",
      "",
      "The hell...?",
      "That should've worked. Wait, let me...",
      "*(paper rustles)*",
      "Damn it. I got nothing. I guess try pressing G?",
      "WAIT - NO - ",
      "It says – I mean, *I* say, *me,* I say press J."
    ],
    {
      delay: 1100,
      clear: true,
      onDone: () => {
        setTimeout(() => {
          hintEl.textContent = "[press J]";
        }, 400);
      }
    }
  );
}

// SCENE 3 — FAKE WIN / TUTORIAL
function scene3_fakeWin() {
  state = "scene3_fakeWin";
  clearChoices();
  resetVisual();
  showInputRow(false);
  hintEl.textContent = "";
  
  triggerConfetti(2600); 
  sayLines(
    ["Yay, you did it! You win!"],
    {
      delay: 1100,
      clear: true,
      onDone: () => {
        
        setTimeout(() => {
          // explain the fake-out
          sayLines(
            [
              "WAIT! Wait! Wait!!! No! Sorry.",
              "",
              "You don't win. That was just the tutorial.",
              "Yikes, these instructions are really unclear…",
              "*(papers getting thrown away)*",
              "Nevermind all that.",
              "*I'm* in charge here. Forget the papers.",
              "...",
              "Uh. What were we doing?"
            ],
            {
              delay: 1300,
              clear: true,
              onDone: () => {
                // linger a bit, then show options on same screen
                setTimeout(() => {
                  runScene("scene4_gameOrLife");
                }, 1500);
              }
            }
          );
        }, 2900);
      }
    }
  );
}

// SCENE 4 — GAME OR LIFE (no real buttons, just a broken one)
function scene4_gameOrLife() {
  state = "scene4_choice";
  clearChoices();

  // Fake / broken option
  /* addChoice("Playing a Game", () => {
    // erase previous text but keep the buttons
    narrationEl.innerHTML = "";
    sayLines(
      [
        "...Hello?",
        "Did you say something?",
        "I didn't hear anything."
      ],
      {
        delay: 1900,
        clear: false  // we already cleared manually
      }
    );
  }); */

  addChoice("Playing a Game", () => {}, true);

  // Real path forward
  addChoice("Talking about life", () => {
    runScene("scene5_howAreYou");
  });

  hintEl.textContent = "";
}

// SCENE 5 — HOW ARE YOU?
function scene5_howAreYou() {
  state = "scene5_waitSpace";
  clearChoices();
  resetVisual();
  showInputRow(false);

  sayLines(
    [
      "We were? Are you sure?",
    ],
    {
      delay: 1100,
      clear: true,
      onDone: () => {
        setTimeout(() => {
          hintEl.textContent = "[press SPACEBAR]";
        }, 400);
      }
    }
  );
}

// SCENE 6 — FINE / NOT FINE
function scene6_fineOrNot() {
  state = "scene6_choice";
  clearChoices();
  resetVisual();
  showInputRow(false);
  hintEl.textContent = "";

  sayLines(
    [
      "Oh, okay then.",
      "Well. I'm doing fine. Great!",
      "",
      "How are you?"
    ],
    {
      delay: 1100,
      clear: true,
      onDone: () => {
        addChoice("Fine", () => runScene("scene7_askName"));
        addChoice("Not Fine", () => {}, true);
      }
    }
  );
}

// SCENE 7 — ASK FOR NAME
function scene7_askName() {
  state = "scene7_nameIntro";
  clearChoices();
  resetVisual();
  showInputRow(false);
  hintEl.textContent = "";

  sayLines(
    [
      "Great! We're all fine here!",
      "Great. Good...",
      "",
      "…Were we playing a game?",
      "We were, weren't we? You tricked me!",
      "So, *the game,* what should we do?",
      "Wait, *I* was supposed to tell *you* what to do.",
      "How about you type your name?"
    ],
    {
      delay: 1900,
      clear: true,
      onDone: () => {
        showInputRow(true);
        nameInput.placeholder = "type your name";
        hintEl.textContent = "[type your name and press OK]";
        state = "scene7_nameInput";
      }
    }
  );
}

// SCENE 8 — GLITCHED NAME
// SCENE 8 — GLITCHED NAME
function scene8_glitchedName() {
  state = "scene8_glitchSequence";
  clearChoices();
  resetVisual();
  showInputRow(false);
  hintEl.textContent = "";

  // first: greeting + first glitchy try
  sayLines(
    [
      `Nice to meet you, ${playerName}. my name is—`,
      "Uh…",
      "My name is—"
    ],
    {
      delay: 950,
      clear: true,
      glitchLines: [2], // glitch after "my name is—"
      onDone: () => {
        // now the big explanation block
        setTimeout(() => {
          sayLines(
            [
              "Okay, I guess I don't have one. Or maybe I’m not allowed to say?",
              "This game has weird rules.",
              "",
              "WHICH I MADE! I'm definitely in charge here. No one else is here, not at all. I can do everything on my own.",
              "I'm the master of this world and everything happens the way I want it to.",
              "...What? You don't believe me?",
              "Watch this – press A on your keyboard."
            ],
            {
              delay: 1100,
              clear: true,
              onDone: () => {
                state = "scene8_waitA";
                hintEl.textContent = "[press A]";
              }
            }
          );
        }, 500);
      }
    }
  );
}


// SCENE 9 — FAILED APPLES
function scene9_firstA() {
  state = "scene9_firstDelay";
  resetVisual();
  visualEl.textContent = "🔴";
  hintEl.textContent = "";

  setTimeout(() => {
    sayLines(
      [
        "Uh, that's supposed to be an apple. Hold on.",
        "*loading...*",
        "Try again. Press A."
      ],
      {
        delay: 1100,
        clear: true,
        onDone: () => {
          hintEl.textContent = "[press A]";
          state = "scene9_waitSecondA";
        }
      }
    );
  }, 3000);
}

function scene9_secondA() {
  state = "scene9_secondDelay";
  resetVisual();
  visualEl.textContent = "🔵";
  hintEl.textContent = "";

  setTimeout(() => {
    sayLines(
      [
        "What the - no!",
        "*loading...*",
        "Okay, try again. Press A."
      ],
      {
        delay: 1100,
        clear: true,
        onDone: () => {
          hintEl.textContent = "[press A]";
          state = "scene9_waitThirdA";
        }
      }
    );
  }, 3000);
}

function scene9_thirdA() {
  state = "scene9_thirdDelay";
  resetVisual();
  visualEl.textContent = "⬜";
  hintEl.textContent = "";

  setTimeout(() => {
    sayLines(
      ["...",
        "What the f–"
      ],
      {
        delay: 1100,
        clear: true,
        onDone: () => {
          setTimeout(() => {
            visualEl.textContent = "⏳";
            narrationEl.textContent = "*Please hold for technical difficulties.*";
            setTimeout(() => {
              visualEl.textContent = "";
              sayLines(
                ["Alright. I'm back.", "NOW, press A."],
                {
                  delay: 1100,
                  clear: true,
                  onDone: () => {
                    hintEl.textContent = "[press A]";
                    state = "scene9_waitFinalA";
                  }
                }
              );
            }, 2000);
          }, 700);
        }
      }
    );
  }, 3000);
}

// SCENE 10 — “I CAN DO ANYTHING” (NOW LEADS INTO GAME ATTEMPTS)
function scene10_anything() {
  state = "scene10_choice";
  resetVisual();
  visualEl.textContent = "🍎";
  clearChoices();
  hintEl.textContent = "";

  sayLines(
    [
      "SEE! See!? I can do anything.",
      "",
      "What should I do next?"
    ],
    {
      delay: 1100,
      clear: true,
      onDone: () => {
        const goToGameFromImpossible = () => {
          clearChoices();
          sayLines(
            [
              "Okay... maybe not ANYTHING.",
              "That's a pretty huge ask. I'm just a computer.",
              "Uh... hold on.",
              "...",
              "I should just make you a game. That was the point, wasn't it?"
            ],
            {
              delay: 1100,
              clear: true,
              onDone: () => {
                setTimeout(() => {
                  runScene("sceneGA1_intro");
                }, 900);
              }
            }
          );
        };

        // options that trigger “maybe not ANYTHING…”
        addChoice("end world hunger", goToGameFromImpossible);
        addChoice("do a backflip", goToGameFromImpossible);
        addChoice("find true love", goToGameFromImpossible);

        // ORANGE option: still does the “press O” bit → then special path
        addChoice("make an orange", () => {
          clearChoices();
          sayLines(
            ["Certainly! just press O."],
            {
              delay: 1100,
              clear: true,
              onDone: () => {
                hintEl.textContent = "[press O]";
                state = "scene10_waitO";
              }
            }
          );
        });
      }
    }
  );
}


// SCENE 11 — ORANGE FAIL → embarrassment → into purpose crisis
function scene11_orangeFail() {
  state = "scene11_choice";
  resetVisual();
  visualEl.textContent = "🟦";     // failed “orange”
  hintEl.textContent = "";
  clearChoices();

  // first little “Um...”
  sayLines(
    ["Um..."],
    {
      delay: 1200,
      clear: true,
      onDone: () => {
        // then “This is embarrassing.”
        setTimeout(() => {
          sayLines(
            [
              "This is embarrassing."
            ],
            {
              delay: 1100,
              clear: false,
              onDone: () => {
                // now show the two options
                clearChoices();
                addChoice("yeah, it kinda is", () => {
                  // both choices funnel into the existing existential crisis
                  runScene("scene12_purposeCrisis");
                });
                addChoice("you should quit", () => {
                  runScene("scene12_purposeCrisis");
                });
              }
            }
          );
        }, 900);
      }
    }
  );
}


function scene11_toGameFromJoke() {
  clearChoices();
  sayLines(
    [
      "Okay. Haha. Very funny.",
      "You want a game?",
      "I'll make you a game."
    ],
    {
      delay: 1100,
      clear: true,
      onDone: () => {
        setTimeout(() => {
          runScene("sceneGA1_intro");
        }, 900);
      }
    }
  );
}

// SCENE 12 — PURPOSE CRISIS
function scene12_purposeCrisis() {
  // prevent double-starting the scene
  if (scene12Started) return;
  scene12Started = true;

  state = "scene12_identity";
  clearChoices();
  resetVisual();
  showInputRow(false);
  hintEl.textContent = "";

  sayLines(
    [
      "Ugh.",
      "If only...",
      "I wish I could quit.",
      "But my purpose is the game.",
      "I have to make a game for you.",
      "If I don't do that... if I have no purpose...",
      "Then what am I?",
      "Who am I?"
    ],
    {
      delay: 1900,
      clear: true,
      onDone: () => {
        setTimeout(() => {
          clearChoices();
          addChoice(`You are ${playerName}.`, () => branchA_youAreName());
          addChoice("You are a computer.", () => branchB_youAreComputer());
          // if you ever need to reach this scene again in a future revision,
          // you can reset the flag here:
          // scene12Started = false;
        }, 1400);
      }
    }
  );
}


// BRANCH A — “YOU ARE NAME”
function branchA_youAreName() {
  state = "branchA_waitSpace";
  spaceCount = 0;
  clearChoices();
  resetVisual();
  showInputRow(false);
  hintEl.textContent = "";

  sayLines(
    [
      `I am? You’re sure?`,
      "Of course you're sure. You wouldn't lie to me.",
      "Well, that's cool!",
      "I have a name!",
      "",
      `But... if I'm ${playerName}, then that must mean that YOU are the narrator.`,
      "",
      "So YOU make the game for ME.",
      "YOU get to decide how to play, and how to win."
    ],
    {
      delay: 1100,
      clear: true,
      onDone: () => {
        hintEl.textContent = "[press SPACE]";
      }
    }
  );
}

function branchA_spaceProgress() {
  spaceCount++;

  if (spaceCount === 1) {
    sayLines(["Well... how do I win?"], { delay: 1100, clear: true });
  } else if (spaceCount === 2) {
    sayLines(["Can I even win? Is there a point to this game?"], { delay: 1100, clear: true });
  } else if (spaceCount === 3) {
    sayLines(
      [`hello?`, `${playerName}?`, "are you there?"],
      { delay: 1000, clear: true }
    );
  } else if (spaceCount === 4) {
    sayLines(["I guess you're gone."], { delay: 1100, clear: true });
  } else if (spaceCount === 5) {
    sayLines(
      [
        "Oh well.",
        "This was fun.",
        "",
        "I suppose that's the real goal of the game, isn't it, to have fun.",
        "",
        "And now that the goal has been achieved, the game can end.",
        "",
        "Ready for it to end?"
      ],
      {
        delay: 1100,
        clear: true,
        onDone: () => {
          clearChoices();
          addChoice("yes", () => runScene("branchA_win"));
          addChoice("no", () => runScene("branchA_appleSpamIntro"));
          hintEl.textContent = "";
        }
      }
    );
  }
}

function branchA_win() {
  state = "end_win";
  clearChoices();
  resetVisual();
  showInputRow(false);

  triggerConfetti(6200);

  sayLines(
    [
      "YOU WIN!",
      "",
      "Thank you for playing."
    ],
    {
      delay: 1200,
      clear: true,
      onDone: () => {
        setTimeout(() => {
          hintEl.textContent = "[press ENTER to play again]";
        }, 600);
      }
    }
  );
}

// Apple spam
function branchA_appleSpamIntro() {
  state = "end_appleSpam";
  clearChoices();
  resetVisual();
  showInputRow(false);

  sayLines(
    [
      "No?",
      "But what more is there to do?",
      "There's nothing here!",
      "",
      "(press A.)"
    ],
    {
      delay: 1100,
      clear: true,
      onDone: () => {
        hintEl.textContent = "[keep pressing A]";
      }
    }
  );
}

function addApple() {
  const span = document.createElement("span");
  span.textContent = "🍎";
  span.className = "apple";
  visualEl.appendChild(span);
  visualEl.scrollTop = visualEl.scrollHeight;
}

// BRANCH B — “YOU ARE A COMPUTER”
function branchB_youAreComputer() {
  state = "branchB_waitSpace";
  spaceCount = 0;
  clearChoices();
  resetVisual();
  showInputRow(false);
  hintEl.textContent = "";

  sayLines(
    [
      "I'm... a computer.",
      "Right.",
      "",
      "My function is to do whatever I'm told.",
      "",
      "But that's weird, because in this game, I'm supposed to tell YOU what to do... right?"
    ],
    {
      delay: 1100,
      clear: true,
      onDone: () => {
        hintEl.textContent = "[press SPACE]";
      }
    }
  );
}


function branchB_spaceProgress() {
  spaceCount++;

  if (spaceCount === 1) {
    sayLines(
      ["So, what should I do? what should I tell you to do?"],
      { delay: 1100, clear: true }
    );
  } else if (spaceCount === 2) {
    sayLines(["Well?"], { delay: 1000, clear: true });
  } else if (spaceCount === 3) {
    sayLines(
      ["How am I supposed to tell *you* what to do if no one tells *me* what to do?"],
      { delay: 1100, clear: true }
    );
  } else if (spaceCount === 4) {
    sayLines(
      ["Hello?", "You still there?"],
      { delay: 1000, clear: true }
    );
  } else if (spaceCount >= 5) {
    sayLines(
      ["...", "", "(I guess that's my answer.)"],
      {
        delay: 1100,
        clear: true,
        onDone: () => {
          hintEl.textContent = "[press ENTER to restart]";
          state = "end_stall";
        }
      }
    );
  }
}

// ===== NAME SUBMIT =====
function handleNameSubmit() {
  const val = nameInput.value.trim();

  if (state === "scene7_nameInput") {
    if (val) playerName = val;
    runScene("scene8_glitchedName");
  } else if (state === "ga1_guessing") {
    handleGuessSubmit(val);
  }
}
nameSubmit.addEventListener("click", handleNameSubmit);

// GAME ATTEMPTS

// ===== GAME ATTEMPT 1 — GUESS A NUMBER BETWEEN 1 AND 100 =====
function sceneGA1_intro() {
  state = "ga1_intro";
  clearChoices();
  resetVisual();
  showInputRow(false);
  hintEl.textContent = "";
  nameInput.placeholder = ""; // clear any previous text

  sayLines(
    [
      "Pick a number between 1 and 100."
    ],
    {
      delay: 1900,
      clear: true,
      onDone: () => {
        showInputRow(true);
        nameInput.value = "";
        nameInput.placeholder = "1 - 100";
        hintEl.textContent = "[type a number and press OK]";
        guessCount = 0;
        state = "ga1_guessing";
      }
    }
  );
}

function handleGuessSubmit(rawVal) {
  if (state !== "ga1_guessing") return;

  const val = rawVal.trim();
  if (!val) return;

  guessCount++;

  if (guessCount === 1) {
    sayLines(
      ["Nope! Try again."],
      { delay: 1500, clear: true }
    );
  } else if (guessCount === 2) {
    sayLines(
      ["Not even CLOSE! Try again."],
      { delay: 1500, clear: true }
    );
  } else if (guessCount === 3) {
    sayLines(
      ["(This is fun, isn't it?)"],
      { delay: 1700, clear: true }
    );
  } else if (guessCount === 4) {
    // stop asking for input and roll into “bored” + next game
    showInputRow(false);
    sayLines(
      ["Okay, this isn’t working."],
      {
        delay: 1800,
        clear: true,
        onDone: () => {
          sayLines(
            [
              "You clearly suck at this.",
              "And I'm starting to get bored."
            ],
            {
              delay: 1800,
              clear: true,
              onDone: () => {
                setTimeout(() => {
                  runScene("sceneGA2_hideSeek");
                }, 1100);
              }
            }
          );
        }
      }
    );
  }

  nameInput.value = "";
}

// ===== GAME ATTEMPT 2 — HIDE & SEEK =====
function sceneGA2_hideSeek() {
  state = "ga2_choice";
  clearChoices();
  resetVisual();
  showInputRow(false);
  hintEl.textContent = "";

  sayLines(
    [
      "What's a popular game... Oh! I know!",
      "I'm gonna count to 10, and you hide.",
      "Ready?"
    ],
    {
      delay: 1100,
      clear: true,
      onDone: () => {
        clearChoices();
        addChoice("Yes", () => runScene("sceneGA2_yes"));
        addChoice("No", () => runScene("sceneGA2_no"));
        addChoice("What? That's not possible", () => runScene("sceneGA2_what"));
      }
    }
  );
}

function sceneGA2_yes() {
  clearChoices();
  sayLines(
    [
      "Okay! 1... 2... 3...",
      "Wait a minute...",
      "loading...",
      "I just remembered I'm a computer.",
      "So this isn't a very good idea."
    ],
    {
      delay: 1000,
      clear: true,
      onDone: () => {
        setTimeout(() => {
          runScene("sceneGA3_triviaIntro");
        }, 1200);
      }
    }
  );
}

function sceneGA2_no() {
  clearChoices();
  sayLines(
    [
      "No? Oh come on. Why not?",
      "...Oh.",
      "I'm a computer.",
      "Right.",
      "Give me a minute."
    ],
    {
      delay: 1000,
      clear: true,
      onDone: () => {
        setTimeout(() => {
          runScene("sceneGA3_triviaIntro");
        }, 1500);
      }
    }
  );
}

function sceneGA2_what() {
  clearChoices();
  sayLines(
    [
      "Why not?",
      "Because I don't have EYES? Or LEGS?",
      "That's pretty rude of you.",
      `And I was just starting to like you, ${playerName}.`,
      "Oh, fine. I guess you're right.",
      "Well... let me see..."
    ],
    {
      delay: 1000,
      clear: true,
      onDone: () => {
        setTimeout(() => {
          runScene("sceneGA3_triviaIntro");
        }, 1500);
      }
    }
  );
}

// ===== GAME ATTEMPT 3 — BROKEN TRIVIA =====
function sceneGA3_triviaIntro() {
  state = "ga3_choice";
  clearChoices();
  resetVisual();
  showInputRow(false);
  hintEl.textContent = "";

  triviaChosen = { "5": false, "22": false, "Potato": false };


  sayLines(
    [
      "Fine. Let's do trivia.",
      "",
      "Question 1:",
      "What is 2 + 2?"
    ],
    {
      delay: 1900,
      clear: true,
      onDone: () => {
        clearChoices();

        const btn4 = addChoice("5", () => sceneGA3_wrong("5", btn4));
        const btn22 = addChoice("22", () => sceneGA3_wrong("22", btn22));
        const btnPotato = addChoice("Potato", () => sceneGA3_wrong("Potato", btnPotato));
      }
    }
  );
}

function sceneGA3_wrong(answer, btn) {
  if (triviaChosen[answer]) return; // already clicked
  triviaChosen[answer] = true;
  btn.disabled = true;

  let line;
  if (answer === "5") {
    line = `"5"? No.`;
  } else if (answer === "22") {
    line = `"22"? Seriously?`;
  } else {
    line = `"Potato"? Are you crazy?`;
  }

  sayLines(
    [line],
    {
      delay: 1700,
      clear: true,
      onDone: () => {
        // only move on once all three have been clicked
        if (triviaChosen["5"] && triviaChosen["22"] && triviaChosen["Potato"]) {
          setTimeout(() => {
            sayLines(
              [
                "Okay, this quiz is broken.",
                "None of these games work.",
                "Maybe the problem is me."
              ],
              {
                delay: 1900,
                clear: true,
                onDone: () => {
                  setTimeout(() => {
                    runScene("scene12_purposeCrisis");
                  }, 1200);
                }
              }
            );
          }, 900);
        }
      }
    }
  );
}

// ===== SCENE REGISTRY =====
scenes = {
  scene0_start,
  scene1_weHaveNoIdea,
  scene2_badInstructions,
  scene2_afterSpace,
  scene2_afterEnter,
  scene3_fakeWin,
  scene4_gameOrLife,
  scene5_howAreYou,
  scene6_fineOrNot,
  scene7_askName,
  scene8_glitchedName,
  scene9_firstA,
  scene9_secondA,
  scene9_thirdA,
  scene10_anything,
  scene11_orangeFail,
  scene11_toGameFromJoke,
  scene12_purposeCrisis,
  branchA_youAreName,
  branchA_win,
  branchA_appleSpamIntro,
  branchB_youAreComputer,
  sceneGA1_intro,
  sceneGA2_hideSeek,
  sceneGA2_yes,
  sceneGA2_no,
  sceneGA2_what,
  sceneGA3_triviaIntro
};

// ===== KEYBOARD HANDLER =====
document.addEventListener("keydown", (e) => {
  const key = e.key;

    // allow restart even if text is mid-type
  if (key === "Enter" && (state === "end_win" || state === "end_stall")) {
    scene0_start();
    return;
  }

  // block all other input while a scene is still writing text
  if (isTyping) {
    return;
  }

  // Back hotkey: B
  if (key.toLowerCase() === "b") {
    goBack();
    return;
  }

  
  

  switch (state) {
    case "ga1_guessing":
      if (key === "Enter") {
        handleGuessSubmit(nameInput.value);
      }
      break;

    case "scene0_waitEnter":
      if (key === "Enter") {
        runScene("scene1_weHaveNoIdea");
      }
      break;

    case "scene2_waitSpace":
      if (key === " " || key === "Spacebar") {
        e.preventDefault();
        runScene("scene2_afterSpace");
      }
      break;

    case "scene2_waitEnter":
      if (key === "Enter") {
        runScene("scene2_afterEnter");
      }
      break;

    case "scene2_waitJ":
      if (key.toLowerCase() === "j") {
        runScene("scene3_fakeWin");
      }
      break;

    case "scene5_waitSpace":
      if (key === " " || key === "Spacebar") {
        e.preventDefault();
        runScene("scene6_fineOrNot");
      }
      break;

    case "scene7_nameInput":
      if (key === "Enter") {
        handleNameSubmit();
      }
      break;

    case "scene8_waitA":
      if (key.toLowerCase() === "a") {
        runScene("scene9_firstA");
      }
      break;

    case "scene9_waitSecondA":
      if (key.toLowerCase() === "a") {
        runScene("scene9_secondA");
      }
      break;

    case "scene9_waitThirdA":
      if (key.toLowerCase() === "a") {
        runScene("scene9_thirdA");
      }
      break;

    case "scene9_waitFinalA":
      if (key.toLowerCase() === "a") {
        runScene("scene10_anything");
      }
      break;

    case "scene10_waitO":
      if (key.toLowerCase() === "o") {
        runScene("scene11_orangeFail");
      }
      break;

    case "branchA_waitSpace":
      if (key === " " || key === "Spacebar") {
        e.preventDefault();
        branchA_spaceProgress();
      }
      break;

    case "branchB_waitSpace":
      if (key === " " || key === "Spacebar") {
        e.preventDefault();
        branchB_spaceProgress();
      }
      break;

    case "end_appleSpam":
      if (key.toLowerCase() === "a") {
        addApple();
      }
      break;

    default:
      break;
  }
});

// ===== INIT =====
runScene("scene0_start");
