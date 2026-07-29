import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

type Phase = 'idle' | 'waiting' | 'go' | 'feedback';

@Component({
  selector: 'app-reaction',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reaction.component.html',
  styleUrls: ['./reaction.component.css']
})
export class ReactionComponent implements OnDestroy {

  juegoFlag = false;
  phase: Phase = 'idle';
  round = 0;
  readonly TOTAL_ROUNDS = 5;

  times: number[] = [];
  lastTime = 0;
  falseStarts = 0;

  private audioCtx: AudioContext | null = null;
  private timerId: any = null;
  private startGo = 0;

  private getCtx(): AudioContext {
    if (!this.audioCtx) this.audioCtx = new AudioContext();
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
    return this.audioCtx;
  }

  private playBeep(freq: number, dur = 0.25, vol = 0.12) {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  }

  private playBuzzer() {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 150;
    osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  }

  private playSuccess() {
    const ctx = this.getCtx();
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.25);
    });
  }

  ngOnDestroy(): void {
    this.clearTimers();
    if (this.audioCtx) this.audioCtx.close();
  }

  private clearTimers() {
    if (this.timerId) { clearTimeout(this.timerId); this.timerId = null; }
  }

  jugar() {
    this.juegoFlag = true;
    this.round = 0;
    this.times = [];
    this.falseStarts = 0;
    this.nextRound();
  }

  nextRound() {
    this.round++;
    this.lastTime = 0;
    if (this.round > this.TOTAL_ROUNDS) {
      this.endGame();
      return;
    }
    this.phase = 'waiting';
    this.playBeep(330, 0.15, 0.06);
    const delay = 1000 + Math.random() * 3000;
    this.timerId = setTimeout(() => this.showGo(), delay);
  }

  showGo() {
    this.phase = 'go';
    this.startGo = performance.now();
    this.playBeep(880, 0.15, 0.15);
  }

  handleTap() {
    if (!this.juegoFlag) return;

    if (this.phase === 'waiting') {
      this.falseStarts++;
      this.phase = 'feedback';
      this.lastTime = 0;
      this.playBuzzer();
      this.clearTimers();
      this.timerId = setTimeout(() => this.nextRound(), 1500);
      return;
    }

    if (this.phase === 'go') {
      const elapsed = Math.round(performance.now() - this.startGo);
      this.lastTime = elapsed;
      this.times.push(elapsed);
      this.phase = 'feedback';
      this.playSuccess();
      this.clearTimers();
      this.timerId = setTimeout(() => this.nextRound(), 1500);
    }
  }

  classify(t: number): string {
    if (t < 200) return 'Excelente 🏆';
    if (t < 300) return 'Bien ✅';
    if (t < 400) return 'Regular 😬';
    return 'Lento 🐢';
  }

  endGame() {
    this.phase = 'idle';
    this.juegoFlag = false;
    this.clearTimers();

    const avg = Math.round(this.times.reduce((a, b) => a + b, 0) / this.times.length);
    const best = Math.min(...this.times);
    const worst = Math.max(...this.times);

    Swal.fire({
      title: '¡Completaste!',
      html: `
        <div style="font-family:Inter;font-size:1.1rem;text-align:center">
          <p style="font-size:1.8rem;font-weight:800;margin:10px 0">${avg} ms</p>
          <p style="margin:4px 0">Promedio — ${this.classify(avg)}</p>
          <hr style="margin:14px 0;border:0;border-top:1px solid #ddd">
          <p>Mejor: <b>${best} ms</b> · Peor: <b>${worst} ms</b></p>
          <p>Falsos arranques: <b>${this.falseStarts}</b></p>
        </div>
      `,
      icon: 'info',
      showConfirmButton: false,
      timer: 6000,
      timerProgressBar: true,
      padding: '60px',
      customClass: {
        popup: 'swal-suramericanos',
        title: 'swal2-title',
        confirmButton: 'swal-btn-gradient'
      }
    }).then(() => this.reset());
  }

  reset() {
    this.juegoFlag = false;
    this.phase = 'idle';
    this.round = 0;
    this.times = [];
    this.falseStarts = 0;
    this.lastTime = 0;
    this.clearTimers();
  }
}
