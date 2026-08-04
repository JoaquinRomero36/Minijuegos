import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-embajador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './embajador.component.html',
  styleUrls: ['./embajador.component.css']
})
export class EmbajadorComponent {

  step = 0; // 0=inicio 1=nombre 2=lugar 3=plato 4=mensaje 5=credencial
  nombre = '';
  lugar = '';
  plato = '';
  mensaje = '';

  qrDataUrl = '';
  generatingQr = false;
  storyDataUrl = '';
  storyReady = false;
  generatingStory = false;
  qrMode: 'idle' | 'generating' | 'url' | 'invite' | 'dev' = 'idle';

  readonly HASHTAG = '#Rafaela2026';

  private audioCtx: AudioContext | null = null;

  private getCtx(): AudioContext {
    if (!this.audioCtx) this.audioCtx = new AudioContext();
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
    return this.audioCtx;
  }

  private playSuccess() {
    try {
      const ctx = this.getCtx();
      [523, 659, 784, 1047].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const t = ctx.currentTime + i * 0.12;
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.3);
      });
    } catch {
      // audio no disponible
    }
  }

  get title(): string {
    const n = this.nombre.trim();
    return n ? n : 'Visitante';
  }

  get displayNombre(): string {
    const n = this.nombre.trim();
    return n ? n : 'NOMBRE';
  }

  empezar() {
    this.step = 1;
  }

  confirmarNombre() {
    if (!this.nombre.trim()) {
      Swal.fire({
        title: 'Ingresá tu nombre',
        text: 'Necesitamos tu nombre para armar tu credencial',
        icon: 'warning',
        showConfirmButton: false,
        timer: 2000,
        padding: '40px',
        customClass: { popup: 'swal-suramericanos', title: 'swal2-title', confirmButton: 'swal-btn-gradient' }
      });
      return;
    }
    this.step = 2;
  }

  seleccionarLugar() {
    if (!this.lugar.trim()) {
      Swal.fire({
        title: 'Completá este campo',
        text: 'Escribí qué lugar de Rafaela visitarías',
        icon: 'warning',
        showConfirmButton: false,
        timer: 2000,
        padding: '40px',
        customClass: { popup: 'swal-suramericanos', title: 'swal2-title', confirmButton: 'swal-btn-gradient' }
      });
      return;
    }
    this.step = 3;
  }

  seleccionarPlato() {
    if (!this.plato.trim()) {
      Swal.fire({
        title: 'Completá este campo',
        text: 'Escribí qué plato típico probarías',
        icon: 'warning',
        showConfirmButton: false,
        timer: 2000,
        padding: '40px',
        customClass: { popup: 'swal-suramericanos', title: 'swal2-title', confirmButton: 'swal-btn-gradient' }
      });
      return;
    }
    this.step = 4;
  }

  seleccionarMensaje() {
    if (!this.mensaje.trim()) {
      Swal.fire({
        title: 'Completá este campo',
        text: 'Escribí el mensaje que le dejarías a los visitantes',
        icon: 'warning',
        showConfirmButton: false,
        timer: 2000,
        padding: '40px',
        customClass: { popup: 'swal-suramericanos', title: 'swal2-title', confirmButton: 'swal-btn-gradient' }
      });
      return;
    }
    this.step = 5;
    this.generarCredencial();
  }

  volverAtras() {
    if (this.step > 1) this.step--;
  }

  private buildInviteText(): string {
    return `${this.title} es Embajador/a de Rafaela 2026\nVeni a crear la tuya en el stand de los Juegos Suramericanos\n${this.HASHTAG}`;
  }

  private async generarCredencial() {
    this.generatingQr = true;
    this.qrMode = 'generating';
    this.qrDataUrl = '';
    try {
      this.playSuccess();
    } catch (e) {
      console.error('Error generando QR', e);
    } finally {
      this.generatingQr = false;
    }
    this.prepararStory();
  }

  private async prepararStory() {
    if (this.storyReady || this.generatingStory) return;
    const card = document.getElementById('story-card');
    if (!card) return;
    this.generatingStory = true;
    try {
      const canvas = await html2canvas(card, {
        width: 1920,
        height: 1080,
        scale: 1,
        windowWidth: 1920,
        windowHeight: 1080,
        useCORS: true
      });
      this.storyDataUrl = canvas.toDataURL('image/png');
      this.storyReady = true;
      await this.vincularQrDescarga();
    } catch (e) {
      console.error('Error generando story', e);
    } finally {
      this.generatingStory = false;
    }
  }

  private async vincularQrDescarga() {
    const w = window as any;
    if (!w.require || !this.storyDataUrl) {
      this.qrMode = 'dev';
      return;
    }
    try {
      const ipc = w.require('electron').ipcRenderer;
      const fileName = this.buildFileName();
      const res = await ipc.invoke('save-story-png', { fileName, dataUrl: this.storyDataUrl });
      if (res && res.url) {
        this.qrDataUrl = await QRCode.toDataURL(res.url, { width: 400, margin: 2 });
        this.qrMode = 'url';
        return;
      }
    } catch (e) {
      console.error('Error vinculando QR de descarga', e);
    }
    this.qrMode = 'invite';
    this.qrDataUrl = await QRCode.toDataURL(this.buildInviteText(), { width: 400, margin: 2 });
  }

  private buildFileName(): string {
    return `embajador-rafaela-${this.nombre.trim().replace(/\s+/g, '-').toLowerCase()}.png`;
  }

  reiniciar() {
    this.step = 0;
    this.nombre = '';
    this.lugar = '';
    this.plato = '';
    this.mensaje = '';
    this.qrDataUrl = '';
    this.storyDataUrl = '';
    this.storyReady = false;
    this.qrMode = 'idle';
  }
}
