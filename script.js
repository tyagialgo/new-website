const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const lockScreen = $('#lock-screen');
const lockForm = $('#lock-form');
const nameInput = $('#name-input');
const passwordInput = $('#password-input');
const lockError = $('#lock-error');
let currentQuiz = 0;

const memories = {
  past: { kicker: 'chapter 01', title: 'Before you', copy: 'I did not know what was missing yet. Then the universe quietly put you in my path.', color: 'linear-gradient(135deg,#ff735c,#f6d16b)' },
  meeting: { kicker: 'chapter 02', title: 'First meeting', copy: 'The first hello did not sound like a beginning. It became one anyway.', color: 'linear-gradient(135deg,#b8e0cf,#abc9e9)' },
  memories: { kicker: 'chapter 03', title: 'The good parts', copy: 'The tiny jokes, the long talks, the comfortable silences. I keep all of them.', color: 'linear-gradient(135deg,#bdafe2,#ff735c)' },
  today: { kicker: 'chapter 04', title: 'Today', copy: 'Today is your birthday, but you are the gift I keep getting every day.', color: 'linear-gradient(135deg,#f6d16b,#ff735c)' },
  future: { kicker: 'chapter 05', title: 'To be continued', copy: 'There are so many places left to go and memories left to make. I want all of them with you.', color: 'linear-gradient(135deg,#10141f,#bdafe2)' }
};
const quiz = [
  { question: 'Where did our story first begin?', answers: ['In a crowded room', 'Somewhere only we know', 'Inside a dream'], correct: 1 },
  { question: 'Who is the main character today?', answers: ['The cake', 'The birthday girl', 'The person writing this'], correct: 1 },
  { question: 'What happens next?', answers: ['More adventures', 'A very big hug', 'All of the above'], correct: 2 }
];

function beginBoot() {
  if (sessionStorage.getItem('birthday-unlocked') === 'true') { unlock(); return; }
  let progress = 0;
  const timer = window.setInterval(() => {
    progress += 20;
    $('#boot-progress').style.width = `${progress}%`;
    $('#boot-status').innerHTML = `Initializing memories... <strong>${String(progress).padStart(2, '0')}%</strong>`;
    if (progress >= 100) { window.clearInterval(timer); $('.access-form').classList.add('is-ready'); }
  }, 240);
}
function unlock() {
  sessionStorage.setItem('birthday-unlocked', 'true');
  lockScreen.classList.add('is-unlocked');
  document.body.classList.remove('is-locked');
  const name = nameInput.value.trim() || localStorage.getItem('birthday-recipient-name') || 'beautiful';
  localStorage.setItem('birthday-recipient-name', name);
  $('#phone-name').textContent = name;
  $('#letter-recipient').textContent = name;
  burst();
}
lockForm?.addEventListener('submit', (event) => { event.preventDefault(); if (passwordInput.value.trim().toLowerCase() !== 'bby') { lockError.classList.add('is-visible'); passwordInput.select(); return; } unlock(); });
$('#reset-access')?.addEventListener('click', () => { sessionStorage.removeItem('birthday-unlocked'); location.reload(); });
document.body.classList.add('is-locked');
beginBoot();

$$('[data-open-phone]').forEach((button) => button.addEventListener('click', () => $('#phone').scrollIntoView({ behavior: 'smooth' })));

function openModal(title, kicker, content) { $('#modal-title').textContent = title; $('#modal-kicker').textContent = kicker; $('#modal-content').innerHTML = content; $('#modal').classList.add('is-open'); $('#modal').setAttribute('aria-hidden', 'false'); }
function closeModal() { $('#modal').classList.remove('is-open'); $('#modal').setAttribute('aria-hidden', 'true'); }
document.addEventListener('click', (event) => {
  const closeTarget = event.target.closest('[data-close-modal]');
  if (!closeTarget) return;
  closeModal();
  if (closeTarget.dataset.closeModal === 'go-cake') $('#cake').scrollIntoView({ behavior: 'smooth' });
});
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModal(); });
const panels = {
  chat: ['our chats', 'the messages I keep', '<p>“Are you awake?”</p><p>“Always, when it is you.”</p><p>Some conversations become little homes. Ours is one of them.</p>'],
  gallery: ['gallery', 'proof we were here', '<div class="modal-photo-grid"><div>first laugh</div><div>best day</div><div>still us</div></div><p>Add your favorite photo in the main memory world soon.</p>'],
  reasons: ['reasons', 'three of approximately one million', '<ol><li>Your laugh changes the temperature of a room.</li><li>You make ordinary things feel like stories.</li><li>You are completely, wonderfully yourself.</li></ol>'],
  song: ['our song', 'track 04 / you & me', '<p>Press play in your head: the song that makes every drive feel like a tiny adventure.</p><button class="modal-play" id="modal-play">♫ play our little melody</button>'],
  memory: ['memories', 'coordinates of us', '<p>One day we will pin every place we have been. For now, this is the most important one:</p><p class="big-quote">wherever you are.</p>'],
  secret: ['for your eyes only', 'access granted ♥', '<p>Okay... this part is only for you.</p><p class="big-quote">I would choose you in every universe.</p>'],
  letter: ['the letter', 'open when you need a reminder', '<p>You are loved on the easy days, the messy days, and all the days in between. Especially then.</p><p>Keep this close.</p>'],
  cake: ['make a wish', 'post-credits scene', '<p>The candles are waiting downstairs. You know what to do.</p><button class="modal-play" data-close-modal="go-cake">go to the cake ↓</button>']
};
$$('[data-panel]').forEach((button) => button.addEventListener('click', () => { const panel = panels[button.dataset.panel]; if (panel) openModal(panel[1], panel[0], panel[2]); }));

$$('.timeline-stop').forEach((stop) => stop.addEventListener('click', () => { $$('.timeline-stop').forEach((item) => item.classList.remove('is-active')); stop.classList.add('is-active'); const memory = memories[stop.dataset.memory]; $('#timeline-kicker').textContent = memory.kicker; $('#timeline-card-title').textContent = memory.title; $('#timeline-card-copy').textContent = memory.copy; $('#timeline-image').style.background = memory.color; }));

function renderQuiz() { const item = quiz[currentQuiz]; $('#quiz-count').textContent = `${String(currentQuiz + 1).padStart(2, '0')} / ${quiz.length}`; $('#quiz-question').textContent = item.question; $('#quiz-options').innerHTML = item.answers.map((answer, index) => `<button class="quiz-option" data-answer="${index}">${String.fromCharCode(65 + index)} / ${answer}</button>`).join(''); $('#quiz-progress').style.width = `${((currentQuiz + 1) / quiz.length) * 100}%`; $('#quiz-result').textContent = ''; $$('.quiz-option').forEach((option) => option.addEventListener('click', () => answerQuiz(Number(option.dataset.answer)))); }
function answerQuiz(answer) { const item = quiz[currentQuiz]; const correct = answer === item.correct; $$('.quiz-option')[answer].classList.add(correct ? 'is-correct' : 'is-wrong'); $('#quiz-result').textContent = correct ? 'Obviously. You are the main character. ♥' : 'Cute guess. The answer is still you. ♥'; window.setTimeout(() => { if (currentQuiz < quiz.length - 1) { currentQuiz += 1; renderQuiz(); } else { $('#quiz-question').textContent = 'Score: 100 / 100'; $('#quiz-options').innerHTML = ''; $('#quiz-result').textContent = 'You passed. You are my favorite person.'; } }, 850); }
renderQuiz();

const starMessages = ['You make my world softer.', 'I love the life we are still building.', 'You are my favorite place to come home to.'];
starMessages.forEach((message, index) => { const star = document.createElement('button'); star.className = 'star'; star.textContent = '✦'; star.style.left = `${18 + [7, 54, 73][index]}%`; star.style.top = `${20 + [42, 12, 60][index]}%`; star.setAttribute('aria-label', 'Discover a memory'); star.addEventListener('click', () => { if (!star.classList.contains('is-found')) { star.classList.add('is-found'); star.textContent = '♥'; $('#star-count').textContent = `${$$('.star.is-found').length} / 3 discovered`; openModal('a star for you', 'memory unlocked', `<p class="big-quote">${message}</p>`); if ($$('.star.is-found').length === 3) burst(); } }); $('#starfield').appendChild(star); });

$('#cake-stage')?.addEventListener('click', () => { const stage = $('#cake-stage'); if (stage.classList.contains('is-wished')) return; stage.classList.add('is-wished'); $('#wish-message').textContent = 'Wish made. I hope this year gives you everything you deserve.'; burst(); });
function burst() { const layer = $('#confetti-layer'); for (let index = 0; index < 34; index += 1) { const piece = document.createElement('span'); piece.className = 'confetti'; piece.textContent = index % 3 ? '✦' : '♥'; piece.style.left = `${Math.random() * 100}%`; piece.style.color = ['#ff735c', '#f6d16b', '#b8e0cf', '#fffaf2'][index % 4]; piece.style.animationDelay = `${Math.random() * .7}s`; layer.appendChild(piece); window.setTimeout(() => piece.remove(), 3500); } }
