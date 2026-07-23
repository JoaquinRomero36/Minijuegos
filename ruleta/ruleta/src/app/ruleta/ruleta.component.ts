import { AfterViewInit, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import Roulette from '@theblindhawk/roulette';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ruleta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ruleta.component.html',
  styleUrls: ['./ruleta.component.css']
})
export class RuletaComponent implements AfterViewInit {
  private roulette!: any;
  private readonly router = inject(Router);

  ngAfterViewInit(): void {
     const container = document.getElementById('roulette-container');
  const radius = container ? container.offsetWidth / 2 : 230; // 230px por defecto
  console.log(radius)
  const sizeImg = container ? container.offsetWidth / 7.5 : 60;
  const arrowsize = container ? container.offsetWidth / 15 : 140;
    console.log(radius)
  console.log(arrowsize)
    this.roulette = new Roulette({
      container: 'roulette-container',
      sections: [
        {
          background: '#ffffff',
          src: 'https://loteriadelchubut.com.ar/wp-content/uploads/2023/08/final_logo_nuevo_telebingo-removebg-preview.png',
          radius: sizeImg
        },
        {
          background: '#ffffff ',
          src: 'https://loteriadelchubut.com.ar/wp-content/uploads/2023/08/logo-deportivo.jpg',
          radius: sizeImg
        },
        {
          background: '#ffffff',
          src: 'https://loteriadelchubut.com.ar/wp-content/uploads/2023/08/Quiniela.png',
          radius: sizeImg
        },
        {
          background: '#ffffff',
          src: 'https://loteriadelchubut.com.ar/wp-content/uploads/2023/08/download.png',
          radius: sizeImg
        },
        {
          background: '#ffffff',
          src: 'https://loteriadelchubut.com.ar/wp-content/uploads/2023/07/sorteo-brinco-1jpg-1.webp',
          radius: sizeImg
        }
        ,
        {
          background: '#ffffff',
          src: 'https://loteriadelchubut.com.ar/wp-content/uploads/2023/07/telekino-logo-huevo-removebg-preview.png',
          radius: sizeImg
        }
      ],
      board: {
        radius: radius,
        padding: 20,
        border: {
          width: 6,
          color: '#222'
        },
        doughnut: { radius: 20, color: '#ffffffff' }
      },
      arrow: {
        element: 'sharp',
        width: arrowsize,
        height: arrowsize,
        padding: 2,
        color: '#f8430cff'
      },
      settings: {
        roll: {
          duration: 6000,
          landing: 'edge',
          delay: 0
        },
        border: {
          width: 1,
          color: '#000000ff'
        }
      },
      audio: {
        src: 'pop.mp3',
        volume: 1.0,
        play: { every: { milliseconds: 1, sections: 0.1 } }
      }
    });

    this.roulette.onstop = (section: any) => {
      Swal.fire({
        
        imageUrl: section.src,
        confirmButtonText: "Texto editable"
      });
    };
  }

  spin() {
    this.roulette.roll();
  }

togler: boolean = false

toglear(){
  this.togler = !this.togler
}

}