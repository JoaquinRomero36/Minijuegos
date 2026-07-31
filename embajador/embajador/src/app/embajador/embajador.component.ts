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
  downloading = false;
  storyDataUrl = '';
  storyReady = false;
  generatingStory = false;

  readonly HASHTAG = '#Rafaela2026';

  readonly LUGARES = [
    'Plaza 25 de Mayo',
    'Teatro Municipal',
    'Museo Usina',
    'Fábrica (galpón)',
    'Polideportivo',
    'Catedral San Rafael'
  ];

  readonly PLATOS = [
    'Asado',
    'Empanadas',
    'Alfajores santafesinos',
    'Picada',
    'Locro',
    'Helado artesanal'
  ];

  readonly MENSAJES = [
    'Te va a encantar',
    'Bienvenido/a a casa',
    'Rafaela te espera',
    'Vení a vivirla',
    'Rafaela te abraza',
    'La ciudad de la amistad'
  ];

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

  seleccionarLugar(op: string) {
    this.lugar = op;
    this.step = 3;
  }

  seleccionarPlato(op: string) {
    this.plato = op;
    this.step = 4;
  }

  seleccionarMensaje(op: string) {
    this.mensaje = op;
    this.step = 5;
    this.generarCredencial();
  }

  volverAtras() {
    if (this.step > 1) this.step--;
  }

  private async generarCredencial() {
    this.generatingQr = true;
    try {
      const contenido = [
        `${this.title} es Embajador/a de Rafaela 2026`,
        `Lugar: ${this.lugar}`,
        `Plato: ${this.plato}`,
        `Mensaje: ${this.mensaje}`,
        this.HASHTAG
      ].join('\n');
      this.qrDataUrl = await QRCode.toDataURL(contenido, { width: 400, margin: 2 });
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
        width: 1080,
        height: 1920,
        scale: 1,
        windowWidth: 1080,
        windowHeight: 1920,
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
    if (!w.require || !this.storyDataUrl) return;
    try {
      const ipc = w.require('electron').ipcRenderer;
      const fileName = this.buildFileName();
      const { url } = await ipc.invoke('save-story-png', { fileName, dataUrl: this.storyDataUrl });
      if (url) {
        this.qrDataUrl = await QRCode.toDataURL(url, { width: 400, margin: 2 });
      }
    } catch (e) {
      console.error('Error vinculando QR de descarga', e);
    }
  }

  private buildFileName(): string {
    return `embajador-rafaela-${this.nombre.trim().replace(/\s+/g, '-').toLowerCase()}.png`;
  }

  async descargar() {
    if (this.downloading) return;
    if (!this.storyDataUrl) {
      if (this.generatingStory) {
        while (this.generatingStory && !this.storyDataUrl) {
          await new Promise(r => setTimeout(r, 200));
        }
      } else {
        await this.prepararStory();
      }
    }
    if (!this.storyDataUrl) return;

    this.downloading = true;
    const btn = document.getElementById('btn-descargar');
    if (btn) {
      btn.classList.add('btn-hidden');
    }

    try {
      const dataUrl = this.storyDataUrl;
      const fileName = this.buildFileName();

      const guardado = this.saveViaNode(dataUrl, fileName);
      if (guardado) {
        Swal.fire({
          title: '¡Credencial descargada!',
          text: 'Se guardó una copia en tu equipo',
          icon: 'success',
          showConfirmButton: false,
          timer: 3500,
          timerProgressBar: true,
          padding: '60px',
          customClass: { popup: 'swal-suramericanos', title: 'swal2-title', confirmButton: 'swal-btn-gradient' }
        });
      } else {
        this.downloadViaBrowser(dataUrl, fileName);
      }
    } catch (e) {
      console.error('Error generando imagen', e);
      Swal.fire({
        title: 'No se pudo descargar',
        icon: 'error',
        showConfirmButton: false,
        timer: 2500,
        padding: '40px',
        customClass: { popup: 'swal-suramericanos', title: 'swal2-title', confirmButton: 'swal-btn-gradient' }
      });
    } finally {
      this.downloading = false;
      if (btn) btn.classList.remove('btn-hidden');
    }
  }

  private saveViaNode(dataUrl: string, fileName: string): boolean {
    try {
      const w = window as any;
      if (!w.require) return false;
      const fs = w.require('fs');
      const path = w.require('path');
      const os = w.require('os');
      const dir = path.join(os.homedir(), 'EmbajadorRafaela');
      fs.mkdirSync(dir, { recursive: true });
      const base64 = dataUrl.split(',')[1];
      fs.writeFileSync(path.join(dir, fileName), base64, 'base64');
      return true;
    } catch {
      return false;
    }
  }

  private downloadViaBrowser(dataUrl: string, fileName: string) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
  }
}
