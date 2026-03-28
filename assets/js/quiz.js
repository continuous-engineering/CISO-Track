/* =============================================
   QUIZ ENGINE
   ============================================= */

class Quiz {
  constructor(questions, containerId, quizId) {
    this.questions = this.shuffle([...questions]);
    this.container = document.getElementById(containerId);
    this.quizId = quizId;
    this.answers = {};
    this.submitted = false;
    this.init();
  }

  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  init() {
    if (!this.container) return;
    this.render();
  }

  render() {
    const html = this.questions.map((q, qi) => `
      <div class="quiz-question" id="q-${qi}">
        <div class="q-number">Question ${qi + 1} of ${this.questions.length}</div>
        <div class="q-text">${q.q}</div>
        <ul class="quiz-options">
          ${q.options.map((opt, oi) => `
            <li class="quiz-option" data-qi="${qi}" data-oi="${oi}">
              <span class="opt-letter">${'ABCD'[oi]}.</span>
              <span>${opt}</span>
            </li>
          `).join('')}
        </ul>
        <div class="quiz-explanation" id="exp-${qi}">
          <strong>Explanation:</strong> ${q.explanation || ''}
        </div>
      </div>
    `).join('');

    this.container.innerHTML = html + `
      <div style="text-align:center;margin-top:1.5rem;">
        <button class="btn btn-primary" id="quiz-submit">Submit Answers</button>
        <button class="btn" id="quiz-reset" style="margin-left:0.5rem;display:none;">Reset</button>
      </div>
      <div class="quiz-score" id="quiz-score" style="display:none;margin-top:1.5rem;"></div>
    `;

    this.container.querySelectorAll('.quiz-option').forEach(el => {
      el.addEventListener('click', () => this.select(parseInt(el.dataset.qi), parseInt(el.dataset.oi)));
    });

    document.getElementById('quiz-submit')?.addEventListener('click', () => this.submit());
    document.getElementById('quiz-reset')?.addEventListener('click', () => this.reset());
  }

  select(qi, oi) {
    if (this.submitted) return;
    this.answers[qi] = oi;
    const qEl = document.getElementById(`q-${qi}`);
    qEl.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
    qEl.querySelectorAll('.quiz-option')[oi].classList.add('selected');
  }

  submit() {
    if (this.submitted) return;
    this.submitted = true;

    let correct = 0;
    this.questions.forEach((q, qi) => {
      const opts = document.getElementById(`q-${qi}`).querySelectorAll('.quiz-option');
      const chosen = this.answers[qi];
      const right = q.answer;

      opts.forEach((o, oi) => {
        if (oi === right) o.classList.add('correct');
        else if (oi === chosen && chosen !== right) o.classList.add('incorrect');
      });

      if (chosen === right) correct++;

      const exp = document.getElementById(`exp-${qi}`);
      if (exp) exp.classList.add('visible');
    });

    const pct = Math.round(correct / this.questions.length * 100);
    const passed = pct >= 75;

    const scoreEl = document.getElementById('quiz-score');
    if (scoreEl) {
      scoreEl.style.display = 'block';
      scoreEl.innerHTML = `
        <div class="score-number ${passed ? 'pass' : 'fail'}">${pct}%</div>
        <p style="margin-top:0.5rem;color:var(--text-muted);">${correct} / ${this.questions.length} correct</p>
        <p style="font-size:0.85rem;margin-top:0.25rem;color:${passed ? 'var(--accent2)' : 'var(--accent4)'}">
          ${passed ? '✓ Passing score (75%+)' : '✗ Below passing. Review weak areas and retry.'}
        </p>
      `;
    }

    document.getElementById('quiz-submit').style.display = 'none';
    const resetBtn = document.getElementById('quiz-reset');
    if (resetBtn) resetBtn.style.display = 'inline-flex';

    // Save score
    if (typeof saveQuizScore === 'function') saveQuizScore(this.quizId, correct, this.questions.length);
  }

  reset() {
    this.answers = {};
    this.submitted = false;
    this.questions = this.shuffle([...this.questions]);
    this.render();
  }
}
