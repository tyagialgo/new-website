const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const lockScreen = $('#lock-screen');
const lockForm = $('#lock-form');
const nameInput = $('#name-input');
const passwordInput = $('#password-input');
const lockError = $('#lock-error');
let currentQuiz = 0;
let foundStars = 0;
let unlockedChapters = 1;

const memories = {
  beginning: ['chapter 01 / 19 nov 2024', 'The beginning', 'I did not know it then, but this was going to become one of my favourite stories.', 'linear-gradient(135deg,#f3b49d,#e9d5a1)'],
  memory: ['chapter 02 / first memory', 'The first memory', 'I still remember the little details. And maybe you do not know this, but that moment stayed with me.', 'linear-gradient(135deg,#a8d5c0,#adc9e8)'],
  favourite: ['chapter 03 / the one I keep', 'My favourite', 'The laughs, the quiet, the little things. I keep choosing these moments because they feel like us.', 'linear-gradient(135deg,#d8b4d8,#ef9b87)'],
  today: ['chapter 04 / today', 'Today', 'Today is your birthday, but you are the gift I keep getting every day.', 'linear-gradient(135deg,#f4d27b,#ed987d)'],
  future: ['chapter 05 / to be continued', 'To be continued', 'Because I do not want our story to end on this website. There is still so much more to come.', 'linear-gradient(135deg,#60749b,#b9a1c9)']
};
const places = ['The place where it all began.', 'That corner that still makes me smile.', 'Somewhere only we know.', 'We need to come here someday ♥'];
const quiz = [
  { question: 'Who is more likely to say “I am not hungry” and then eat your food?', answers: ['Me', 'You', 'The cake'], correct: 1 },
  { question: 'Who is the main character today?', answers: ['The cake', 'You, obviously', 'The person writing this'], correct: 1 },
  { question: 'What happens next?', answers: ['More adventures', 'A very big hug', 'All of the above'], correct: 2 }
];
const giftMessages = {
  memory: ['memory found', 'I keep the small moments because they are the ones that quietly become everything. ♥'],
  message: ['message found', 'You make ordinary days feel different. That is a bigger gift than you realize. ♥'],
  secret: ['secret found', 'I would choose you in every universe. I would probably still steal your snacks. ♥']
};

function beginBoot() {
  let progress = 0;
  const timer = window.setInterval(() => {
    progress += 20;
    $('#boot-progress').style.width = `${progress}%`;
    $('#boot-status').innerHTML = `ACCESS: ONLY HER ♥ <strong>${String(progress).padStart(2, '0')}%</strong>`;
    if (progress >= 100) { window.clearInterval(timer); $('.access-form').classList.add('is-ready'); }
  }, 240);
}
function unlock() {
  sessionStorage.setItem('birthday-unlocked', 'true');
  lockScreen.classList.add('is-unlocked');
  document.body.classList.remove('is-locked');
  const name = nameInput.value.trim() || localStorage.getItem('birthday-recipient-name') || 'beautiful';
  localStorage.setItem('birthday-recipient-name', name);
  $('#hero-name').textContent = name;
  $('#recipient-value').textContent = name;
  $('#letter-recipient').textContent = name;
  $('#final-name').textContent = name;
  burst();
}
lockForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (passwordInput.value.trim().toLowerCase() !== 'bby') { lockError.classList.add('is-visible'); passwordInput.select(); return; }
  unlock();
});
$('#reset-access')?.addEventListener('click', () => { sessionStorage.removeItem('birthday-unlocked'); location.reload(); });
document.body.classList.add('is-locked');
beginBoot();

$$('[data-scroll]').forEach((button) => button.addEventListener('click', () => $(button.dataset.scroll)?.scrollIntoView({ behavior: 'smooth' })));
$$('[data-gallery-image]').forEach((photo) => photo.addEventListener('click', () => {
  const stories = { 'Memory #01': '19 NOV 2024. I still remember... and maybe you do not know this, but this moment stayed with me.', 'Memory #02': 'A small moment, kept forever because it felt like us.', 'The person behind this': 'The person who spent way too much time making this for you.', 'A favourite memory': 'The kind of memory I would choose again.' };
  openModal(photo.dataset.galleryTitle, 'memory unlocked', `<img class="modal-gallery-image" src="${photo.dataset.galleryImage}" alt="${photo.dataset.galleryTitle}"><p class="big-quote">${stories[photo.dataset.galleryTitle] || 'A little piece of us.'}</p>`);
  $('#memory-story').textContent = stories[photo.dataset.galleryTitle] || 'A little piece of us.';
}));
$$('.reason-card').forEach((card) => card.addEventListener('click', () => {
  const next = Number(card.dataset.reason) + 1;
  card.classList.add('is-read');
  if ($(`[data-reason="${next}"]`)) $(`[data-reason="${next}"]`).classList.add('is-visible');
  else $('#reasons-end').classList.add('is-visible');
}));

function openModal(title, kicker, content) { $('#modal-title').textContent = title; $('#modal-kicker').textContent = kicker; $('#modal-content').innerHTML = content; $('#modal').classList.add('is-open'); $('#modal').setAttribute('aria-hidden', 'false'); }
function closeModal() { $('#modal').classList.remove('is-open'); $('#modal').setAttribute('aria-hidden', 'true'); }
document.addEventListener('click', (event) => { if (event.target.closest('[data-close-modal]')) closeModal(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModal(); });

$$('.timeline-stop').forEach((stop) => stop.addEventListener('click', () => {
  const chapter = $$('.timeline-stop').indexOf(stop) + 1;
  if (chapter > unlockedChapters) { $('#timeline-card-copy').textContent = 'This chapter is still locked. Find more of the story first. ♥'; return; }
  $$('.timeline-stop').forEach((item) => item.classList.remove('is-active')); stop.classList.add('is-active');
  const memory = memories[stop.dataset.memory];
  $('#timeline-kicker').textContent = memory[0]; $('#timeline-card-title').textContent = memory[1]; $('#timeline-card-copy').textContent = memory[2]; $('#timeline-image').style.background = memory[3];
}));
$$('.map-pin').forEach((pin) => pin.addEventListener('click', () => { $('#map-caption').textContent = places[Number(pin.dataset.place)]; $$('.map-pin').forEach((item) => item.classList.remove('is-active')); pin.classList.add('is-active'); }));

function renderQuiz() {
  const item = quiz[currentQuiz];
  $('#quiz-count').textContent = `${String(currentQuiz + 1).padStart(2, '0')} / ${quiz.length}`;
  $('#quiz-question').textContent = item.question;
  $('#quiz-options').innerHTML = item.answers.map((answer, index) => `<button class="quiz-option" data-answer="${index}">${String.fromCharCode(65 + index)} / ${answer}</button>`).join('');
  $('#quiz-progress').style.width = `${((currentQuiz + 1) / quiz.length) * 100}%`;
  $('#quiz-result').textContent = '';
  $$('.quiz-option').forEach((option) => option.addEventListener('click', () => answerQuiz(Number(option.dataset.answer))));
}
function answerQuiz(answer) {
  const item = quiz[currentQuiz]; const correct = answer === item.correct;
  $$('.quiz-option')[answer].classList.add(correct ? 'is-correct' : 'is-wrong');
  $('#quiz-result').textContent = correct ? 'You know us too well. ♥' : 'INCORRECT. We need to talk.';
  if (!correct) return;
  window.setTimeout(() => { if (currentQuiz < quiz.length - 1) { currentQuiz += 1; renderQuiz(); } else { $('#quiz-question').textContent = 'RELATIONSHIP KNOWLEDGE / 100%'; $('#quiz-options').innerHTML = ''; $('#quiz-result').textContent = 'STATUS: You know us better than anyone. ♥'; } }, 700);
}
renderQuiz();

function revealFourthStar() {
  const star = document.createElement('button'); star.className = 'star hidden-star'; star.textContent = '✦'; star.style.left = '48%'; star.style.top = '47%'; star.setAttribute('aria-label', 'Discover the hidden star');
  star.addEventListener('click', () => { openModal('me', 'the hidden star', '<p class="big-quote">Because somehow, you became one of the best parts of my life.</p>'); star.remove(); }); $('#starfield').appendChild(star); $('#hidden-star-message').classList.add('is-visible');
}
['You make my world softer.', 'I love the life we are still building.', 'You are my favourite place to come home to.'].forEach((message, index) => { const star = document.createElement('button'); star.className = 'star'; star.textContent = '✦'; star.style.left = `${18 + [7, 54, 73][index]}%`; star.style.top = `${20 + [42, 12, 60][index]}%`; star.setAttribute('aria-label', `Discover ${['a memory', 'a reason', 'a secret'][index]}`); star.addEventListener('click', () => { if (!star.classList.contains('is-found')) { star.classList.add('is-found'); star.textContent = '♥'; foundStars += 1; $('#star-count').textContent = `${foundStars} / 3 discovered`; openModal(['memory', 'reason', 'secret'][index], 'memory unlocked', `<p class="big-quote">${message}</p>`); if (foundStars === 3) { burst(); revealFourthStar(); } } }); $('#starfield').appendChild(star); });

$$('.gift-choice').forEach((gift) => gift.addEventListener('click', () => { gift.classList.add('is-open'); const result = giftMessages[gift.dataset.gift]; openModal(result[0], 'gift opened', `<p class="big-quote">${result[1]}</p>`); $('#gift-message').textContent = 'One gift found. Two more are waiting for you.'; $('#gift-message').classList.add('is-visible'); if (!gift.dataset.seen) { gift.dataset.seen = 'true'; unlockedChapters = Math.min(5, unlockedChapters + 1); const chapter = $$('.timeline-stop')[unlockedChapters - 1]; chapter?.classList.remove('is-locked'); } }));
$('#cake-stage')?.addEventListener('click', () => { const stage = $('#cake-stage'); if (stage.classList.contains('is-wished')) return; stage.classList.add('is-wished'); $('#wish-message').textContent = `HAPPY BIRTHDAY, ${$('#hero-name').textContent} ♥ I hope at least one wish comes true. And maybe... I can be part of one of them.`; ringBirthdaySong(); speakBirthday(); burst(); });
function ringBirthdaySong() { const AudioContext = window.AudioContext || window.webkitAudioContext; if (!AudioContext) return; const audio = new AudioContext(); const notes = [262,262,294,262,349,330,262,262,294,262,392,349]; notes.forEach((frequency, index) => { const start = audio.currentTime + index * .24; const oscillator = audio.createOscillator(); const gain = audio.createGain(); oscillator.frequency.value = frequency; gain.gain.setValueAtTime(.0001, start); gain.gain.exponentialRampToValueAtTime(.28, start + .02); gain.gain.exponentialRampToValueAtTime(.0001, start + .2); oscillator.connect(gain).connect(audio.destination); oscillator.start(start); oscillator.stop(start + .22); }); window.setTimeout(() => audio.close(), 3200); }
function speakBirthday() { if (!('speechSynthesis' in window)) return; speechSynthesis.cancel(); for (let repeat = 0; repeat < 3; repeat += 1) { const voice = new SpeechSynthesisUtterance('Happy birthday, dear sweetheart. May you live a happy life, always.'); voice.volume = 1; voice.rate = .85; voice.pitch = 1.12; voice.lang = 'en-US'; window.setTimeout(() => speechSynthesis.speak(voice), repeat * 5000); } }
$('#open-final')?.addEventListener('click', () => { $('#open-final').classList.add('is-hidden'); $('#final-reveal').classList.add('is-visible'); burst(); window.setTimeout(() => $('#psst-button').classList.add('is-visible'), 3500); });
$('#psst-button')?.addEventListener('click', () => $('#secret-level').classList.add('is-visible'));
$('[data-video-message]')?.addEventListener('click', () => openModal('your message', 'video memory', '<video class="modal-video" controls playsinline preload="metadata"><source src="image/message.mp4" type="video/mp4">Your browser cannot play this video.</video>'));

const letter = `I still remember 19 November 2024, the beginning of a story I did not know would matter this much. I remember the funny little moments too, the ones that probably looked ordinary from the outside but stayed with me anyway. I admire how you make people feel comfortable, how you keep being yourself even when you do not notice how special that is. You probably do not realize how much light you bring into a normal day. I hope the future gives us more places to go, more food to steal from each other, more ridiculous jokes, and more quiet moments that become favourite memories. I made this because one message did not feel big enough for everything I wanted to say. Happy Birthday, my favourite person. Thank you for being you.`;
let letterIndex = 0; function typeLetter() { if (letterIndex < letter.length) { $('#typed-letter').textContent += letter[letterIndex++]; window.setTimeout(typeLetter, 20); } }
new IntersectionObserver((entries) => { if (entries[0].isIntersecting && !letterIndex) typeLetter(); }, { threshold: .3 }).observe($('#typed-letter'));
function burst() { const layer = $('#confetti-layer'); for (let index = 0; index < 34; index += 1) { const piece = document.createElement('span'); piece.className = 'confetti'; piece.textContent = index % 3 ? '✦' : '♥'; piece.style.left = `${Math.random() * 100}%`; piece.style.color = ['#f07b68', '#e8c66a', '#9ecdbb', '#fffaf2'][index % 4]; piece.style.animationDelay = `${Math.random() * .7}s`; layer.appendChild(piece); window.setTimeout(() => piece.remove(), 3500); } }
