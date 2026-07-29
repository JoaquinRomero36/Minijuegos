import { Component, OnDestroy, OnInit } from '@angular/core';
import { pregunta } from './interfaces';
import Swal from "sweetalert2"
import { PREGUNTAS } from './preguntas';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-trivia',
  standalone: true,
  imports: [NgClass, CommonModule, FormsModule],
  templateUrl: './trivia.component.html',
  styleUrl: './trivia.component.css'
})
export class TriviaComponent implements OnInit, OnDestroy {

  correct = new Audio('aud/correctCard.mp3');
  incorrect = new Audio('aud/nomatch.mp3');
  winSound = new Audio('aud/win2.mp3');
  looseSound = new Audio('aud/lose2.mp3');

  triviaFlag: boolean = false;
  tracker: number = 0;
  respuestasCorrectas: number = 0

  timeLeft: number = 3;
  interval: any;

  selectedAnswer: any = null;

  countdownVisible = false;
  countdownText = '';
  countdownAnimClass = '';

  private audioCtx: AudioContext | null = null;
  private melodyInterval: any = null;
  private melodyIdx = 0;

  private getCtx(): AudioContext {
    if (!this.audioCtx) this.audioCtx = new AudioContext();
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
    return this.audioCtx;
  }

  private playBeep(freq: number, dur = 0.25) {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  }

  private melodyNotes = [262, 294, 330, 392, 523, 392, 330, 294];

  private startMelody() {
    this.melodyIdx = 0;
    const ctx = this.getCtx();
    const playNote = () => {
      if (this.melodyIdx >= this.melodyNotes.length) this.melodyIdx = 0;
      const freq = this.melodyNotes[this.melodyIdx];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      const t = ctx.currentTime + 0.03;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.06, t + 0.06);
      gain.gain.linearRampToValueAtTime(0.06, t + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.start(t);
      osc.stop(t + 0.42);
      this.melodyIdx++;
    };
    playNote();
    this.melodyInterval = setInterval(playNote, 350);
  }

  private stopMelody() {
    clearInterval(this.melodyInterval);
    this.melodyInterval = null;
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
    this.stopMelody();
    if (this.audioCtx) this.audioCtx.close();
  }

  selectAnswer(ans: any) {
    this.selectedAnswer = ans;
    if (ans.correct) {
      this.correct.play()
    } else {
      this.incorrect.play()
    }
    setTimeout(() => {
      this.verificar(ans.correct);
      this.selectedAnswer = null;
    }, 1000);
  }

  ngOnInit(): void {
    this.CreateMAtch()
  }

  CreateMAtch() {
    this.tracker = 0;
    this.respuestasCorrectas = 0;
    this.preguntas = PREGUNTAS
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);
  }

  startTimer() {
    clearInterval(this.interval);
    this.timeLeft = 15;
    this.stopMelody();
    this.startMelody();

    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        clearInterval(this.interval);
        this.incorrect.play();
        this.verificar(false);
      }
    }, 1000);
  }

  preguntas: pregunta[] = []

  verificar(coorecto: boolean) {
    clearInterval(this.interval);
    this.stopMelody();

    if (coorecto) {
      this.respuestasCorrectas++;
      this.correct.play();
    } else {
      this.incorrect.play();
    }

    if (this.tracker >= this.preguntas.length - 1) {
      setTimeout(() => this.finJuego(), 1500);
    } else {
      this.tracker++;
      this.startTimer();
    }

    console.log(this.respuestasCorrectas);
  }

  finJuego() {
    if (this.respuestasCorrectas > 2) {
      this.winSound.play()

      Swal.fire({
        title: '¡Ganaste!',
        text: `Acertaste ${this.respuestasCorrectas} de ${this.preguntas.length} preguntas`,
        icon: 'success',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        padding: '80px',
        customClass: {
          popup: 'swal-suramericanos',
          title: 'swal2-title',
          confirmButton: 'swal-btn-gradient'
        }
      }).then(() => {
        this.timeLeft = 15;
        this.triviaFlag = false;
        this.CreateMAtch();
      })
    }
    else {
      this.looseSound.play()
      Swal.fire({
        titleText: '¡Perdiste!',
        text: `Acertaste ${this.respuestasCorrectas} de ${this.preguntas.length} preguntas`,
        icon: 'error',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        padding: '80px',
        customClass: {
          popup: 'swal-suramericanos',
          title: 'swal2-title',
          confirmButton: 'swal-btn-gradient'
        }
      }).then(() => {
        this.timeLeft = 15;
        this.triviaFlag = false;
        this.CreateMAtch();
      })
    }
  }

  empezar() {
    this.countdownVisible = true;
    this.runCountdown();
  }

  runCountdown() {
    const steps = ['3', '2', '1', 'EMPIEZA'];
    let i = 0;
    const showNext = () => {
      if (i < steps.length) {
        this.countdownText = steps[i];
        this.countdownAnimClass = '';
        this.playBeep(steps[i] === 'EMPIEZA' ? 880 : 440);
        setTimeout(() => {
          this.countdownAnimClass = steps[i] === 'EMPIEZA' ? 'pop empieza' : 'pop';
        }, 20);
        i++;
        setTimeout(showNext, 900);
      } else {
        this.countdownVisible = false;
        this.startTimer();
        this.triviaFlag = true;
      }
    };
    showNext();
  }
}
