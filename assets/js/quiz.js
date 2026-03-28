/* =============================================
   QUIZ ENGINE — CISO CERT TRACK
   Scoring, explanations, celebrations, badges
   ============================================= */

class Quiz {
  constructor(questions, containerId, quizId, opts = {}) {
    this.questions = this.shuffle([...questions]);
    this.container = document.getElementById(containerId);
    this.quizId = quizId;
    this.domainName = opts.domainName || 'Quiz';
    this.answers = {};
    this.submitted = false;
    this.startTime = Date.now();
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
      <div style="text-align:center;margin-top:1.5rem;display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;">
        <button class="btn btn-primary" id="quiz-submit">Submit Answers</button>
        <button class="btn" id="quiz-reset" style="display:none;">Try Again</button>
      </div>
      <div class="quiz-score" id="quiz-score" style="display:none;margin-top:1.5rem;"></div>
    `;

    this.container.querySelectorAll('.quiz-option').forEach(el => {
      el.addEventListener('click', () => this.select(+el.dataset.qi, +el.dataset.oi));
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

  async submit() {
    if (this.submitted) return;
    const unanswered = this.questions.length - Object.keys(this.answers).length;
    if (unanswered > 0) {
      if (!confirm(`${unanswered} question(s) unanswered. Submit anyway?`)) return;
    }
    this.submitted = true;

    const timeTaken = Math.round((Date.now() - this.startTime) / 1000);
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
    const passed = pct >= 80;
    const mins = Math.floor(timeTaken / 60);
    const secs = timeTaken % 60;
    const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

    const scoreEl = document.getElementById('quiz-score');
    if (scoreEl) {
      scoreEl.style.display = 'block';
      scoreEl.innerHTML = `
        <div class="score-number ${passed ? 'pass' : 'fail'}">${pct}%</div>
        <p style="margin-top:0.5rem;color:var(--text-muted);">
          ${correct} / ${this.questions.length} correct · ${timeStr}
        </p>
        <p style="font-size:0.875rem;margin-top:0.25rem;color:${passed ? 'var(--accent2)' : 'var(--accent4)'}">
          ${passed ? '✓ Passed (80%+ gate)' : '✗ Below 80% — review weak areas and retry'}
        </p>
      `;
    }

    document.getElementById('quiz-submit').style.display = 'none';
    const rb = document.getElementById('quiz-reset');
    if (rb) rb.style.display = 'inline-flex';

    // Save to IndexedDB
    if (typeof CertDB !== 'undefined') {
      await CertDB.saveQuizScore(this.quizId, correct, this.questions.length);
    }

    // Celebrations
    if (typeof celebrateQuizPass === 'function') {
      celebrateQuizPass(pct, this.domainName);
    }
  }

  reset() {
    this.answers = {};
    this.submitted = false;
    this.startTime = Date.now();
    this.questions = this.shuffle([...this.questions]);
    this.render();
  }
}
