import { Component, inject, NgModule, OnDestroy, OnInit } from '@angular/core';
import { pregunta } from './interfaces';
import Swal from "sweetalert2"
import { PREGUNTAS } from './preguntas';
import { CommonModule, NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-trivia',
  standalone: true,
  imports: [NgClass, CommonModule, FormsModule],
  templateUrl: './trivia.component.html',
  styleUrl: './trivia.component.css'
})
export class TriviaComponent implements OnInit, OnDestroy {

private readonly router = inject(Router);

  correct = new Audio('aud/correctCard.mp3');
  incorrect = new Audio('aud/nomatch.mp3');
  winSound = new Audio('aud/win2.mp3');
  looseSound = new Audio('aud/lose2.mp3');

  adult: boolean = true;

  chekFlag: boolean = false;
  triviaFlag: boolean = false; 
  tracker: number = 0;
  respuestasCorrectas : number = 0

  // Timer visual (30s)
  timeLeft: number = 3;
  interval: any;

  selectedAnswer: any = null;

    ngOnDestroy(): void {
    clearInterval(this.interval);
  }

  selectAnswer(ans: any) {
    this.selectedAnswer = ans;
    if(ans.correct){
            this.correct.play()
    }
    else{
            this.incorrect.play()
    }
    // mostramos el color por 1s antes de verificar
    setTimeout(() => {
      this.verificar(ans.correct);
      this.selectedAnswer = null; // reseteo color
    }, 1000);
  }

ngOnInit(): void {
this.CreateMAtch()
}

CreateMAtch(){
  this.tracker = 0;
  this.respuestasCorrectas = 0;
  this.preguntas = PREGUNTAS
    .filter(p => p.adult === this.adult)
    .sort(() => Math.random() - 0.5) // shuffle
    .slice(0, 3);
}

startTimer() {
  // Reiniciamos cualquier timer previo
  clearInterval(this.interval);
  this.timeLeft = 15;

  this.interval = setInterval(() => {
    if (this.timeLeft > 0) {
      this.timeLeft--;
    } else {
      // tiempo terminado, marcamos como incorrecta
      clearInterval(this.interval);
      this.incorrect.play();
      this.verificar(false);
    }
  }, 1000);
}


preguntas : pregunta[] = []

 
verificar(coorecto: boolean) {
  // Paramos el timer de la pregunta actual
  clearInterval(this.interval);

  if (coorecto) {
    this.respuestasCorrectas++;
    this.correct.play();
  } else {
    this.incorrect.play();
  }

  // Pasamos a la siguiente pregunta o terminamos
  if (this.tracker >= this.preguntas.length - 1) {
    this.finJuego();
  } else {
    this.tracker++;
    // Reiniciamos el timer para la siguiente pregunta
    this.startTimer();
  }

  console.log(this.respuestasCorrectas);
}

finJuego(){
  if(this.respuestasCorrectas > 1){
    this.winSound.play()

      Swal.fire({ title: '¡Ganaste!', 
                  icon: 'success',  
                  showConfirmButton: false,  
                  timer: 4000,              
                  timerProgressBar: true,
               //   width: '1600px',
                  padding: '80px',
                      customClass: {
                        popup: 'swal2-popup',
                        title: 'swal2-title',
                        confirmButton: 'swal2-confirm'
                      }
          }).then(() => {
            this.timeLeft = 15
        this.chekFlag = true;
  })
    }
    else{
      this.looseSound.play()
      Swal.fire({ titleText: 'Perdiste!', 
                  icon: 'error', 
                  showConfirmButton: false,  
                  timer: 4000,              
                  timerProgressBar: true,
            //      width: '1600px',
                  padding: '80px',
                  customClass: {
                    popup: 'swal2-popup',
                    title: 'swal2-title',
                    confirmButton: 'swal2-confirm'
                  }
                }).then(() => {
                  this.timeLeft = 15
                  this.chekFlag = true;
  })
    }
  }
  adultSwitch(adult: boolean){
    if(!adult){
      this.adult = false
        Swal.fire({  titleText: 'Recordá que las apuestas en juegos de azar son solo para mayores de 18 años',   
               showConfirmButton: true, 
               confirmButtonText: "COMENZAR", 
       //        width: '1600px',
               color: '#3ca935',
               padding: '80px',
                  customClass: {
                    popup: 'swal2-popup',
                    title: 'swal2-title',
                    confirmButton: 'swal2-confirm'
                  }
      }).then(() => {
        this.startTimer();
    this.triviaFlag = !this.triviaFlag;
  })
    }
    else{
      this.adult = true
        Swal.fire({  title: '¿Cuánto conocés de los juegos de azar?',   
               showConfirmButton: true, 
               confirmButtonText: "COMENZAR", 
               color: '#3ca935',
        //       width: '1600px',
               padding: '80px',
                  customClass: {
                    popup: 'swal2-popup',
                    title: 'swal2-title',
                    confirmButton: 'swal2-confirm'
                  }
      }).then(() => {
        this.startTimer();
    this.triviaFlag = !this.triviaFlag;
  })
    }
  }
  checkSwitch(list: {checked: boolean}[]) {
    
    if(this.allChecked(list)){
      this.winSound.play()
       Swal.fire({ titleText: 'Ganaste un premio sorpresa!', 
                  showConfirmButton: false,  
                  timer: 4000,              
                  timerProgressBar: true,
            //      width: '1600px',
                  padding: '80px',
                  customClass: {
                    popup: 'swal2-popup',
                    title: 'swal2-title',
                    confirmButton: 'swal2-confirm'
                  }
                }).then(() => {
                  this.chekFlag = false;
    this.triviaFlag = false;
    list.forEach(item => item.checked = false);
    this.CreateMAtch()
  })
    } else{
    this.chekFlag = false;
    this.triviaFlag = false;
    list.forEach(item => item.checked = false);
    this.CreateMAtch()
  }
  }
 

  //cheks
    adultChecks = [
    { text: 'Jugaré por diversión', checked: false },
    { text: 'Mantendré un equilibrio', checked: false },
    { text: 'Estableceré un límite de tiempo', checked: false },
    { text: 'No intentaré recuperar pérdidas', checked: false },
    { text: 'Haré pausas', checked: false },
    { text: 'Disfrutaré de otras actividades', checked: false },
    { text: 'Definiré un presupuesto antes de jugar', checked: false },
  ];

  minorChecks = [
    { text: 'Las apuestas en juegos de azar son solo para mayores de 18 años', checked: false },
    { text: 'Jugaré por diversión', checked: false },
    { text: 'Respetaré mis tiempos de estudio, descanso y deportes', checked: false },
    { text: 'Haré pausas cuando juegue videojuegos', checked: false },
    { text: 'No me dejaré llevar por la frustración de perder', checked: false },
    { text: 'Disfrutaré también de actividades fuera de la pantalla', checked: false },
    { text: 'Cuidaré a mis amigos y los alentaré a jugar con equilibrio', checked: false },
  ];

  checkboxes = [false, false, false, false, false, false, false]; // uno por cada checkbox

  allChecked(list: {checked: boolean}[]): boolean {
    return list.every(item => item.checked);
  }
}
