import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-jackpot',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './jackpot.component.html',
  styleUrls: ['./jackpot.component.css']
})
export class JackpotComponent {

  private readonly SYMBOLS: string[] = [
    'https://flagcdn.com/w80/ar.png',
    'https://flagcdn.com/w80/br.png',
    'https://flagcdn.com/w80/cl.png',
    'https://flagcdn.com/w80/co.png',
    'https://flagcdn.com/w80/ec.png',
    'https://flagcdn.com/w80/py.png',
    'https://flagcdn.com/w80/pe.png',
    'https://flagcdn.com/w80/uy.png',
    'cards/capi.webp'
  ];

  private readonly ITEM_HEIGHT = 150;

  strips: string[][] = [[], [], []];
  offsets: number[] = [0, 0, 0];
  transitions: string[] = ['none', 'none', 'none'];
  spinning = false;
  reelSpinning: boolean[] = [false, false, false];

  private audioCtx: AudioContext | null = null;

  ngOnInit() {
    this.initReels();
  }

  private initReels() {
    for (let i = 0; i < 3; i++) {
      this.strips[i] = Array.from({ length: 4 }, () => this.randomSymbol());
      this.offsets[i] = -this.ITEM_HEIGHT;
    }
  }

  private getCtx(): AudioContext {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
    }
    return this.audioCtx;
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'square', volume = 0.1) {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  private playTick() { this.playTone(900, 0.03, 'square', 0.04); }

  private playReelStop() { this.playTone(200, 0.15, 'triangle', 0.12); }

  private playWin() {
    const ctx = this.getCtx();
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.15;
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  }

  private playJackpot() {
    const ctx = this.getCtx();
    [523, 659, 784, 1047, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.2;
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.35);
    });
  }

  private playLose() {
    const ctx = this.getCtx();
    [400, 350, 300].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.25;
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  }

  private randomSymbol(): string {
    return this.SYMBOLS[Math.floor(Math.random() * this.SYMBOLS.length)];
  }

  private shiftStrip(i: number) {
    this.strips[i].shift();
    this.strips[i].push(this.randomSymbol());
  }

  spin() {
    if (this.spinning) return;
    this.spinning = true;
    this.reelSpinning = [true, true, true];

    const tickSound = setInterval(() => this.playTick(), 100);
    const results = [this.randomSymbol(), this.randomSymbol(), this.randomSymbol()];
    const stopDelays = [1200, 2600, 4000];
    const intervals = [90, 80, 70];

    const spinFn = (i: number): void => {
      if (i > 2) return;
      let stopped = false;

      const tick = () => {
        if (stopped) return;
        this.transitions[i] = 'none';
        this.shiftStrip(i);
        this.offsets[i] = -this.ITEM_HEIGHT * 2;

        setTimeout(() => {
          if (stopped) return;
          this.transitions[i] = `transform ${intervals[i]}ms linear`;
          this.offsets[i] = -this.ITEM_HEIGHT;
          setTimeout(tick, intervals[i]);
        }, 0);
      };

      this.offsets[i] = -this.ITEM_HEIGHT * 2;
      setTimeout(() => {
        this.transitions[i] = `transform ${intervals[i]}ms linear`;
        this.offsets[i] = -this.ITEM_HEIGHT;
        setTimeout(tick, intervals[i]);
      }, 0);

      setTimeout(() => {
        stopped = true;
        this.transitions[i] = 'none';
        this.strips[i][0] = this.strips[i][1];
        this.strips[i][1] = results[i];
        this.offsets[i] = -this.ITEM_HEIGHT * 2;

        setTimeout(() => {
          this.transitions[i] = 'transform 250ms cubic-bezier(0.15, 0.85, 0.3, 1.05)';
          this.offsets[i] = -this.ITEM_HEIGHT;
          this.reelSpinning[i] = false;
          this.playReelStop();

          setTimeout(() => {
            this.transitions[i] = 'none';
          }, 300);

          if (i === 2) {
            setTimeout(() => {
              this.stopSpin(tickSound, results);
            }, 400);
          }
        }, 0);
      }, stopDelays[i]);
    };

    spinFn(0); spinFn(1); spinFn(2);
  }

  private stopSpin(tickSound: any, results: string[]) {
    clearInterval(tickSound);
    this.spinning = false;
    this.evaluateResult(results);
  }

  private evaluateResult(results: string[]) {
    const allSame = results[0] === results[1] && results[1] === results[2];
    const anyPair = results[0] === results[1] || results[1] === results[2] || results[0] === results[2];

    const showSwal = (title: string, html: string, icon: any, timer: number) => {
      Swal.fire({
        title,
        html,
        icon,
        padding: '60px',
        timer,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: { popup: 'swal-suramericanos', title: 'swal2-title', confirmButton: 'swal-btn-gradient' }
      });
    };

    if (allSame) {
      setTimeout(() => this.playJackpot(), 300);
      setTimeout(() => showSwal('¡JACKPOT!', '<img src="cards/capi.webp" style="width:100px;height:100px;border-radius:50%;margin-bottom:10px"><br>¡Los tres iguales!', 'success', 5000), 500);
    } else if (anyPair) {
      setTimeout(() => this.playWin(), 300);
      setTimeout(() => showSwal('¡Dos iguales!', 'Casi llegas al jackpot. ¡Seguí intentando!', 'success', 4000), 500);
    } else {
      setTimeout(() => this.playLose(), 300);
      setTimeout(() => showSwal('Sin suerte', 'Ninguno coincidió. ¡Intentá de nuevo!', 'error', 3000), 500);
    }
  }
}
