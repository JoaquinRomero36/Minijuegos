import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

interface Card {
  id: number;
  image: string;
  flipped: boolean;
  matched: boolean;
}

@Component({
  selector: 'app-memotest',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './memotest.component.html',
  styleUrls: ['./memotest.component.css']
})
export class MemotestComponent implements OnInit, OnDestroy {

  juegoFlag : boolean = false;
  private readonly router = inject(Router);

  flipSound = new Audio('aud/flipcard.mp3');
  matchSound = new Audio('aud/correctCard.mp3');
  noMatchSound = new Audio('aud/nomatch.mp3');
  winSound = new Audio('aud/win2.mp3');
  looseSound = new Audio('aud/lose2.mp3');

  private readonly ALL_IMAGES: string[] = [
    'https://flagcdn.com/w80/ar.png',
    'https://flagcdn.com/w80/br.png',
    'https://flagcdn.com/w80/cl.png',
    'https://flagcdn.com/w80/co.png',
    'https://flagcdn.com/w80/ec.png',
    'https://flagcdn.com/w80/py.png',
    'https://flagcdn.com/w80/pe.png',
    'https://flagcdn.com/w80/uy.png'
  ];

  readonly totalPairs = 8;
  readonly timeLimit = 40;

  deck: Card[] = [];
  moves = 0;
  matchesFound = 0;
  timeLeft = this.timeLimit;
  ticking = false;

  private firstIndex: number | null = null;
  private secondIndex: number | null = null;
  busy = false;
  private timerId: any = null;

  ngOnInit(): void {
    document.documentElement.style.setProperty('--card-back-url', 'url(./cards/capi.webp)');
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  startGame(): void {
    this.stopTimer();
    this.moves = 0;
    this.matchesFound = 0;
    this.timeLeft = this.timeLimit;
    this.busy = false;
    this.firstIndex = null;
    this.secondIndex = null;

    const images = this.pickImages(this.totalPairs);
    const pairs = [...images, ...images];
    this.deck = this.shuffle(
      pairs.map((img, i) => ({
        id: i,
        image: img,
        flipped: false,
        matched: false
      }))
    );

    this.previewAndHide(5000, () => this.startTimer());
  }

  private startTimer(): void {
    this.ticking = true;
    this.timerId = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.ticking = false;
        this.busy = true;
        this.stopTimer();
        this.endGame(false);
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.ticking = false;
  }

  flipCard(index: number): void {
    if (this.busy) return;

    const card = this.deck[index];
    if (!card || card.flipped || card.matched) return;

    card.flipped = true;
    this.flipSound.play()

    if (this.firstIndex === null) {
      this.firstIndex = index;
      return;
    }

    if (this.secondIndex === null) {
      this.secondIndex = index;
      this.busy = true;
      this.moves++;

      setTimeout(() => {
        this.evaluatePair();
      }, 650);
    }
  }

  private evaluatePair(): void {
    if (this.firstIndex === null || this.secondIndex === null) {
      this.busy = false;
      return;
    }

    const a = this.deck[this.firstIndex];
    const b = this.deck[this.secondIndex];

    if (a.image === b.image) {
      a.matched = true;
      b.matched = true;
      this.matchesFound++;
      this.matchSound.play()

      if (this.matchesFound === this.totalPairs) {
        this.stopTimer();
        this.endGame(true);
      }
    } else {
      this.noMatchSound.play()
      a.flipped = false;
      b.flipped = false;
    }

    this.firstIndex = null;
    this.secondIndex = null;
    this.busy = false;
  }

  private endGame(win: boolean): void {
    if (win) {
      this.winSound.play()
      Swal.fire({
        title: '¡GANASTE!',
        icon: 'success',
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        padding: '80px',
        customClass: {
          popup: 'swal-suramericanos',
          title: 'swal2-title',
          confirmButton: 'swal-btn-gradient'
        }
      }).then(() => this.volverAJugar());
    } else {
      this.looseSound.play()
      Swal.fire({
        title: 'FUERA DE TIEMPO!',
        icon: 'error',
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        padding: '80px',
        customClass: {
          popup: 'swal-suramericanos',
          title: 'swal2-title',
          confirmButton: 'swal-btn-gradient'
        }
      }).then(() => this.volverAJugar());
    }
  }

  private pickImages(n: number): string[] {
    if (n > this.ALL_IMAGES.length) {
      console.warn(`No hay suficientes imágenes. Requeridas: ${n}, disponibles: ${this.ALL_IMAGES.length}. Se repetirán algunas.`);
    }
    const shuffled = this.shuffle([...this.ALL_IMAGES]);
    return shuffled.slice(0, n);
  }

  private shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  private previewAndHide(ms: number, callback?: () => void): void {
    this.deck.forEach(c => (c.flipped = true));
    setTimeout(() => {
      this.deck.forEach(c => (c.flipped = false));
      if (callback) callback();
    }, ms);
  }

  jugar() {
    this.juegoFlag = true;
    this.startGame();
  }

  volverAJugar() {
    this.juegoFlag = false;
    this.stopTimer();

    this.moves = 0;
    this.matchesFound = 0;
    this.timeLeft = this.timeLimit;
    this.busy = false;
    this.firstIndex = null;
    this.secondIndex = null;
    this.deck = [];
  }
}
