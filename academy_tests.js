// ----------------------------------------------------
// ----------------------------------------------------
// TEST TIP ACADEMIE (Chronological Ordering Practice)
// Generates infinite practice questions from window.events:
// picks 3 random nearby events, shows them shuffled and lettered A-C,
// then asks the user to pick the correct chronological order
// among 4 multiple-choice letter sequences (1 correct + 3 distractors).
// ----------------------------------------------------
// ----------------------------------------------------

let academyState = {
  score: 0,
  totalQuestions: 0,
  currentItems: [],     // [{ letter: "A", event: {...} }, ...] in DISPLAY (shuffled) order
  correctOrder: ""       // e.g. "C A B" - the letter sequence in true chronological order
};

// DOM Nodes
function getAcademyDom() {
  return {
    title: document.getElementById("academy-question-title"),
    itemsList: document.getElementById("academy-items-list"),
    optionsContainer: document.getElementById("academy-options-container"),
    scoreText: document.getElementById("academy-score"),
    feedbackDiv: document.getElementById("academy-feedback"),
    feedbackText: document.getElementById("academy-feedback-text"),
    btnNext: document.getElementById("btn-next-academy-question")
  };
}

// Returns a numeric year for any event date format
function getAcademyEventYear(event) {
  const dateStr = (event.date || "").trim();

  if (event.isCentury || /^[IVXLCDM]+$/i.test(dateStr)) {
    const century = romanToInt(dateStr.toUpperCase());
    return (century - 1) * 100 + 50; 
  }

  if (event.isRange || /^(-?\d{1,4})-(\d{3,4})$/.test(dateStr)) {
    const parts = dateStr.split("-");
    const a = parseInt(parts[0], 10);
    const b = parseInt(parts[parts.length - 1], 10);
    return (a + b) / 2;
  }

  const match = dateStr.match(/^-?\d{1,4}/);
  if (match) return parseInt(match[0], 10);

  return NaN;
}

// Fisher-Yates shuffle that returns a NEW array
function shuffledCopy(array) {
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Generates all permutations of an array
function permutations(array) {
  if (array.length <= 1) return [array];
  const result = [];
  for (let i = 0; i < array.length; i++) {
    const rest = array.slice(0, i).concat(array.slice(i + 1));
    const restPerms = permutations(rest);
    restPerms.forEach(p => result.push([array[i]].concat(p)));
  }
  return result;
}

function startAcademyGame() {
  academyState.score = 0;
  academyState.totalQuestions = 0;
  const dom = getAcademyDom();
  if (dom.scoreText) dom.scoreText.textContent = `Scor: 0/0`;
  loadNextAcademyQuestion();
}

function loadNextAcademyQuestion() {
  const dom = getAcademyDom();
  if (!dom.title || !dom.itemsList || !dom.optionsContainer) return;

  // Reset feedback UI
  if (dom.feedbackDiv) dom.feedbackDiv.className = "quiz-feedback hidden";
  dom.optionsContainer.innerHTML = "";

  // 1. Colectăm toate evenimentele valide și le sortăm cronologic
  const allSortedEvents = (window.events || [])
    .filter(e => e && e.title && !isNaN(getAcademyEventYear(e)))
    .sort((a, b) => getAcademyEventYear(a) - getAcademyEventYear(b));

  if (allSortedEvents.length < 3) {
    dom.title.textContent = "Nu sunt suficiente evenimente în baza de date pentru acest test.";
    return;
  }

  // 2. Extragem un prim element pivot aleatoriu pentru a decide tipul întrebării (Secole vs Ani/Intervale)
  const pivotEvent = allSortedEvents[Math.floor(Math.random() * allSortedEvents.length)];
  const trimmedPivotDate = (pivotEvent.date || "").trim();
  const isPivotCentury = pivotEvent.isCentury || /^[IVXLCDM]+$/i.test(trimmedPivotDate);

  // 3. Filtrăm lista pentru a păstra doar evenimente de același tip (omogenitate totală)
  const homogeneousEvents = allSortedEvents.filter(e => {
    const trimmedDate = (e.date || "").trim();
    const isCentury = e.isCentury || /^[IVXLCDM]+$/i.test(trimmedDate);
    return isCentury === isPivotCentury;
  });

  if (homogeneousEvents.length < 3) {
    dom.title.textContent = "Nu sunt suficiente evenimente de același tip pentru a genera grila.";
    return;
  }

  // 4. Aplicăm pool-ul glisant de maximum 40 de evenimente consecutive pe lista omogenă
  const poolSize = Math.min(40, homogeneousEvents.length);
  const maxStartIndex = homogeneousEvents.length - poolSize;
  const startIndex = Math.floor(Math.random() * (maxStartIndex + 1));
  const localPool = homogeneousEvents.slice(startIndex, startIndex + poolSize);

  // 5. Extragem 3 evenimente unice care au ANI STRICT DIFERIȚI
  let picked = [];
  let safetyCounter = 0;
  const poolCopy = localPool.slice();

  while (picked.length < 3 && poolCopy.length > 0 && safetyCounter < 400) {
    safetyCounter++;
    const randIdx = Math.floor(Math.random() * poolCopy.length);
    const candidate = poolCopy[randIdx]; // Luăm doar ca referință temporară
    
    const candidateYear = getAcademyEventYear(candidate);
    
    // Verificăm dublurile de titlu/dată
    const alreadyPicked = picked.some(e => e.title === candidate.title && e.date === candidate.date);
    // CORECTARE CRITICALĂ: Ne asigurăm că anul rotunjit/brut este complet diferit de cele deja alese
    const hasSameYear = picked.some(e => getAcademyEventYear(e) === candidateYear);
    
    if (!alreadyPicked && !hasSameYear) {
      // Dacă este valid, îl scoatem definitiv din pool-ul temporar și îl salvăm
      poolCopy.splice(randIdx, 1);
      picked.push(candidate);
    } else {
      // Dacă dădea conflict de an, îl scoatem din variantele acestei runderi ca să nu îl mai testăm inutil
      poolCopy.splice(randIdx, 1);
    }
  }

  // Fallback de urgență extremă: dacă pool-ul restrâns de 40 era atât de dens încât toți anii se suprapuneau,
  // lărgim căutarea în toată baza de date omogenă pentru a garanta ani diferiți
  if (picked.length < 3) {
    picked = [];
    const globalCopy = shuffledCopy(homogeneousEvents);
    for (let i = 0; i < globalCopy.length && picked.length < 3; i++) {
      const candidate = globalCopy[i];
      const candidateYear = getAcademyEventYear(candidate);
      if (!picked.some(e => getAcademyEventYear(e) === candidateYear)) {
        picked.push(candidate);
      }
    }
  }

  // Dacă nici după fallback nu avem 3 (bază de date incompletă), afișăm o eroare discretă
  if (picked.length < 3) {
    dom.title.textContent = "Eroare: Datele din baza de date sunt prea dense pe același an.";
    return;
  }

  // 6. Determinăm ordinea cronologică adevărată (TRUE)
  const chronological = picked.slice().sort((a, b) => getAcademyEventYear(a) - getAcademyEventYear(b));

  // 7. Amestecăm elementele pentru AFIȘARE și le mapăm la etichetele A, B, C
  const displayOrder = shuffledCopy(picked);
  const letters = ["A", "B", "C"];
  academyState.currentItems = displayOrder.map((event, idx) => ({ letter: letters[idx], event }));

  // 8. Calculăm șirul corect de răspuns separat prin spații (ex: "C A B")
  const correctOrderLetters = chronological.map(event => {
    const match = academyState.currentItems.find(item => item.event === event);
    return match.letter;
  }).join(" ");
  academyState.correctOrder = correctOrderLetters;

  // 9. Randarea cerinței și a listei (A., B., C.) exact ca în grila de examen
  dom.title.textContent = "Marcați pe foaia de concurs litera corespunzătoare ordinii cronologice pe care o considerați corectă.";
  dom.itemsList.innerHTML = academyState.currentItems.map(item => {
    let displayTitle = item.event.title.replace(/\(\d+.*?\)/g, "").replace(/\(-\d+.*?\)/g, "").trim();
    return `<li><strong>${item.letter}.</strong> ${displayTitle};</li>`;
  }).join("");

  // 10. Generarea celor 4 opțiuni de răspuns (cea corectă + 3 permutări unice)
  const allPerms = shuffledCopy(permutations(letters).map(p => p.join(" ")));
  const optionsSet = new Set([correctOrderLetters]);
  for (let i = 0; i < allPerms.length && optionsSet.size < 4; i++) {
    optionsSet.add(allPerms[i]);
  }
  const finalOptions = shuffledCopy(Array.from(optionsSet));

  const choicePrefixes = ["a) ", "b) ", "c) ", "d) "];

  finalOptions.forEach((optionStr, index) => {
    const btn = document.createElement("button");
    btn.className = "quiz-option-btn";
    btn.textContent = `${choicePrefixes[index]}${optionStr};`;
    
    btn.addEventListener("click", () => handleAcademyAnswer(btn, optionStr));
    dom.optionsContainer.appendChild(btn);
  });
}

function handleAcademyAnswer(selectedBtn, selectedOrder) {
  const dom = getAcademyDom();
  const buttons = dom.optionsContainer.querySelectorAll(".quiz-option-btn");
  buttons.forEach(btn => btn.disabled = true);

  academyState.totalQuestions++;
  const isCorrect = selectedOrder === academyState.correctOrder;

  if (isCorrect) {
    academyState.score++;
    selectedBtn.classList.add("correct");
    if (dom.feedbackText) {
      dom.feedbackText.innerHTML = `<strong>Corect!</strong> Ordinea cronologică este: <strong>${academyState.correctOrder}</strong>.`;
    }
    if (dom.feedbackDiv) dom.feedbackDiv.className = "quiz-feedback success";
  } else {
    selectedBtn.classList.add("wrong");
    buttons.forEach(btn => {
      if (btn.textContent.includes(academyState.correctOrder)) {
        btn.classList.add("correct");
      }
    });
    if (dom.feedbackText) {
      dom.feedbackText.innerHTML = `<strong>Incorect.</strong> Ordinea corectă este <strong>${academyState.correctOrder}</strong>. Ai ales ${selectedOrder}.`;
    }
    if (dom.feedbackDiv) dom.feedbackDiv.className = "quiz-feedback error";
  }

  // Recapitulare sub feedback cu anii reali vizibili pentru învățare rapidă
  if (dom.feedbackText) {
    const recap = academyState.currentItems
      .slice()
      .sort((a, b) => academyState.correctOrder.replace(/ /g, "").indexOf(a.letter) - academyState.correctOrder.replace(/ /g, "").indexOf(b.letter))
      .map(item => `${item.letter}) ${formatDateRO(item.event.date)} — ${item.event.title}`)
      .join("<br>");
    dom.feedbackText.innerHTML += `<br><br><em>Recapitulare:</em><br>${recap}`;
  }

  if (dom.scoreText) dom.scoreText.textContent = `Scor: ${academyState.score}/${academyState.totalQuestions}`;
  if (dom.feedbackDiv) dom.feedbackDiv.classList.remove("hidden");
}

// Event listener la încărcarea paginii pentru butonul Următoarea Întrebare
document.addEventListener("DOMContentLoaded", () => {
  const dom = getAcademyDom();
  if (dom.btnNext) {
    dom.btnNext.addEventListener("click", loadNextAcademyQuestion);
  }
});