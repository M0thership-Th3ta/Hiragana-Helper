window.addEventListener('load', init);

// globals
// globals
const paragraphIds = ['one', 'two', 'three', 'four', 'five', "six", "seven", "eight"];
let activeCount = 0;
const MAX_ACTIVE = 5;
let words = [];
let locked = false;
const retryBtn = document.getElementById('retry');

function init() {
    fetch('js/data.json')
        .then(response => response.json())
        .then(data => {
            words = data.words;
            setupNewRound();
            retryBtn.addEventListener('click', setupNewRound);
        })
        .catch(error => console.error('Error loading data.json:', error));
}

function setupNewRound() {
    locked = false;
    activeCount = 0;
    retryBtn.textContent = 'retry';

    // Pick a random answer
    const randomIndex = Math.floor(Math.random() * words.length);
    const answerWord = words[randomIndex];

    // Set the question (show English, no dashes)
    document.getElementById('hiragana-question').textContent = answerWord.english.replace(/-/g, '');

    // Prepare paragraphs
    const paragraphs = getParagraphElements();
    paragraphs.forEach(p => p.innerHTML = '');

    // Pick main paragraph
    const mainParaIndex = Math.floor(Math.random() * paragraphs.length);
    const mainParagraph = paragraphs[mainParaIndex];

    // Distractors
    const distractorWords = words.filter((_, idx) => idx !== randomIndex);
    const shuffledDistractors = [...distractorWords];
    shuffleArray(shuffledDistractors);

    // Main paragraph: answer + 2 distractors
    populateMainParagraph(mainParagraph, answerWord, shuffledDistractors);

    // Other paragraphs: 3 distractors each
    const otherParagraphs = paragraphs.filter((_, idx) => idx !== mainParaIndex);
    populateOtherParagraphs(otherParagraphs, distractorWords, answerWord);
}

function getParagraphElements() {
    return paragraphIds
        .map(id => document.getElementById(id))
        .filter(p => p !== null);
}

function populateMainParagraph(paragraph, answerWord, distractorWords) {
    const choices = [
        answerWord,
        distractorWords[0],
        distractorWords[1]
    ];
    shuffleArray(choices);
    choices.forEach(choice => {
        const span = createWordSpan(choice.japanese, choice.english, answerWord.japanese);
        paragraph.appendChild(span);
    });
}

function populateOtherParagraphs(paragraphs, distractorWords, answerJapanese) {
    paragraphs.forEach(paragraph => {
        const shuffled = [...distractorWords];
        shuffleArray(shuffled);
        for (let i = 0; i < 3; i++) {
            const span = createWordSpan(shuffled[i].japanese, shuffled[i].english, answerJapanese);
            paragraph.appendChild(span);
        }
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function createWordSpan(japanese, english, answerJapanese) {
    const span = document.createElement('span');
    span.className = 'inactive';
    span.textContent = japanese;
    span.dataset.japanese = japanese;
    span.dataset.english = english;
    span.dataset.state = 'inactive';

    span.addEventListener('click', function() {
        if (span.classList.contains('inactive')) {
            if (locked || activeCount >= MAX_ACTIVE) return;
            span.classList.remove('inactive');
            span.classList.add('active');
            span.textContent = span.dataset.japanese.split('').join('-');
            span.dataset.state = 'japanese';
            activeCount++;
            // Lock if this is the correct answer
            if (span.dataset.japanese === answerJapanese) {
                locked = true;
                retryBtn.textContent = 'good job :D';
            }
        } else if (span.classList.contains('active')) {
            if (span.dataset.state === 'japanese') {
                span.textContent = span.dataset.english;
                span.dataset.state = 'english';
            } else if (span.dataset.state === 'english') {
                span.textContent = span.dataset.japanese.split('').join('-');
                span.dataset.state = 'japanese';
            }
        }
    });
    return span;
}