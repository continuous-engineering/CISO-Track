/* =============================================
   FLASHCARD ENGINE
   ============================================= */

class FlashcardDeck {
  constructor(cards, containerId) {
    this.cards = this.shuffle([...cards]);
    this.index = 0;
    this.container = document.getElementById(containerId);
    this.flipped = false;
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

    const card = this.container.querySelector('.flashcard');
    if (card) card.addEventListener('click', () => this.flip());

    const btnPrev = this.container.querySelector('[data-fc="prev"]');
    const btnNext = this.container.querySelector('[data-fc="next"]');
    const btnShuffle = this.container.querySelector('[data-fc="shuffle"]');

    if (btnPrev) btnPrev.addEventListener('click', (e) => { e.stopPropagation(); this.prev(); });
    if (btnNext) btnNext.addEventListener('click', (e) => { e.stopPropagation(); this.next(); });
    if (btnShuffle) btnShuffle.addEventListener('click', (e) => { e.stopPropagation(); this.reshuf(); });

    // Keyboard nav
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); this.next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); this.prev(); }
      if (e.key === 'Enter') { e.preventDefault(); this.flip(); }
    });
  }

  render() {
    const card = this.cards[this.index];
    const fc = this.container.querySelector('.flashcard');
    const front = fc?.querySelector('.flashcard-face.front .flashcard-text');
    const back = fc?.querySelector('.flashcard-face.back .flashcard-answer');
    const counter = this.container.querySelector('.fc-counter');

    if (front) front.textContent = card.front;
    if (back) back.innerHTML = card.back;
    if (counter) counter.textContent = `${this.index + 1} / ${this.cards.length}`;

    if (fc) fc.classList.remove('flipped');
    this.flipped = false;
  }

  flip() {
    const fc = this.container.querySelector('.flashcard');
    if (!fc) return;
    this.flipped = !this.flipped;
    fc.classList.toggle('flipped', this.flipped);
  }

  next() {
    this.index = (this.index + 1) % this.cards.length;
    this.render();
  }

  prev() {
    this.index = (this.index - 1 + this.cards.length) % this.cards.length;
    this.render();
  }

  reshuf() {
    this.cards = this.shuffle([...this.cards]);
    this.index = 0;
    this.render();
  }
}
