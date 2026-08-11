import { AfterViewInit, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import Roulette from '@theblindhawk/roulette';
import Swal from 'sweetalert2';

interface Question {
  type: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface Country {
  name: string;
  flagCode: string;
  color: string;
  questions: Question[];
}

const flagUrl = (code: string) => `https://flagcdn.com/w80/${code}.png`;

@Component({
  selector: 'app-ruleta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ruleta.component.html',
  styleUrls: ['./ruleta.component.css']
})
export class RuletaComponent implements AfterViewInit {
  private roulette!: any;

  resultVisible = false;
  resultText = '';
  resultAnimClass = '';

  private countries: Country[] = [
    {
      name: 'Argentina', flagCode: 'ar', color: '#f9004e',
      questions: [
        { type: '🏆 Suramericanos', question: '¿En qué ciudad se realizaron los primeros Juegos Suramericanos en 1978?', options: ['Buenos Aires', 'Santiago', 'Lima'], correct: 0, explanation: 'Buenos Aires fue la sede de la primera edición, con 19 deportes y 8 países participantes.' },
        { type: '🏆 Suramericanos', question: '¿Qué puesto ocupa Argentina en el medallero histórico de los Juegos Suramericanos?', options: ['1°', '2°', '3°'], correct: 0, explanation: 'Argentina lidera el medallero histórico, seguida por Brasil y Colombia.' },
        { type: '🌍 Cultura General', question: '¿Cuál es la montaña más alta de Argentina y de toda América?', options: ['Aconcagua', 'Monte Pissis', 'Cerro Bonete'], correct: 0, explanation: 'El Aconcagua, con 6.961 m, se encuentra en la provincia de Mendoza.' }
      ]
    },
    {
      name: 'Aruba', flagCode: 'aw', color: '#ff8c00',
      questions: [
        { type: '🏆 Suramericanos', question: '¿Desde qué año Aruba participa en los Juegos Suramericanos?', options: ['1978', '1986', '1994'], correct: 1, explanation: 'Aruba se unió a ODESUR como miembro asociado y debutó en los juegos de 1986.' },
        { type: '🏆 Suramericanos', question: '¿En qué deporte Aruba suele destacar en los Juegos Suramericanos?', options: ['Deportes acuáticos', 'Atletismo de campo', 'Ciclismo'], correct: 0, explanation: 'Por su geografía caribeña, Aruba tiene participación destacada en natación y deportes acuáticos.' },
        { type: '🌍 Cultura General', question: '¿Cuál es la capital de Aruba?', options: ['Willemstad', 'Oranjestad', 'Kralendijk'], correct: 1, explanation: 'Oranjestad es la capital, famosa por su arquitectura colonial neerlandesa colorida.' }
      ]
    },
    {
      name: 'Bolivia', flagCode: 'bo', color: '#5139d4',
      questions: [
        { type: '🏆 Suramericanos', question: '¿Qué ciudad boliviana fue sede de los Juegos Suramericanos de 2018?', options: ['La Paz', 'Santa Cruz', 'Cochabamba'], correct: 2, explanation: 'Cochabamba albergó los XI Juegos Suramericanos con gran éxito organizativo.' },
        { type: '🏆 Suramericanos', question: '¿En qué deporte Bolivia suele obtener sus mejores resultados en los Juegos?', options: ['Natación', 'Racquetball', 'Fútbol'], correct: 1, explanation: 'Bolivia ha destacado históricamente en racquetball, con múltiples medallas de oro.' },
        { type: '🌍 Cultura General', question: '¿Qué famoso salar se encuentra en Bolivia?', options: ['Salar de Atacama', 'Salar de Uyuni', 'Salinas Grandes'], correct: 1, explanation: 'El Salar de Uyuni es el desierto de sal más grande del mundo, con más de 10.000 km².' }
      ]
    },
    {
      name: 'Brasil', flagCode: 'br', color: '#e53935',
      questions: [
        { type: '🏆 Suramericanos', question: '¿Qué ciudad brasileña fue sede de los Juegos Suramericanos de 2002?', options: ['São Paulo', 'Río de Janeiro', 'Brasilia'], correct: 1, explanation: 'Río de Janeiro albergó los Juegos en 2002, siendo la primera ciudad brasileña en hacerlo.' },
        { type: '🏆 Suramericanos', question: '¿Qué lugar ocupa Brasil en el medallero histórico de los Juegos?', options: ['1°', '2°', '3°'], correct: 1, explanation: 'Brasil es el segundo país con más medallas, solo por detrás de Argentina.' },
        { type: '🌍 Cultura General', question: '¿Cuál es la fiesta popular más famosa de Brasil?', options: ['Oktoberfest', 'Carnaval', 'Feria de las Flores'], correct: 1, explanation: 'El Carnaval de Río de Janeiro es el más grande del mundo, con desfiles de escuelas de samba.' }
      ]
    },
    {
      name: 'Chile', flagCode: 'cl', color: '#4caf50',
      questions: [
        { type: '🏆 Suramericanos', question: '¿En qué año Santiago fue sede de los Juegos Suramericanos por primera vez?', options: ['1978', '1986', '2014'], correct: 1, explanation: 'Santiago albergó los Juegos en 1986 y nuevamente en 2014, siendo la ciudad con más ediciones organizadas.' },
        { type: '🏆 Suramericanos', question: '¿Cuál es el deporte en el que Chile ha ganado más medallas en los Juegos?', options: ['Fútbol', 'Atletismo', 'Tenis'], correct: 1, explanation: 'El atletismo es históricamente el deporte que más medallas le ha dado a Chile en los Juegos Suramericanos.' },
        { type: '🌍 Cultura General', question: '¿Cuál es el desierto más árido del mundo, ubicado en Chile?', options: ['Desierto de Atacama', 'Desierto de Sechura', 'Desierto de la Tatacoa'], correct: 0, explanation: 'El Desierto de Atacama es el más árido no polar del mundo, con zonas donde nunca se registraron lluvias.' }
      ]
    },
    {
      name: 'Colombia', flagCode: 'co', color: '#2196f3',
      questions: [
        { type: '🏆 Suramericanos', question: '¿Qué ciudad colombiana fue sede de los Juegos Suramericanos de 2010?', options: ['Bogotá', 'Medellín', 'Cali'], correct: 1, explanation: 'Medellín albergó los IX Juegos Suramericanos en 2010, considerada una de las mejores ediciones del evento.' },
        { type: '🏆 Suramericanos', question: '¿En qué deporte Colombia suele dominar los Juegos Suramericanos?', options: ['Ciclismo', 'Natación', 'Gimnasia'], correct: 0, explanation: 'Colombia es una potencia en ciclismo en los Juegos, con numerosas medallas de oro en ruta y pista.' },
        { type: '🌍 Cultura General', question: '¿Qué escritor colombiano ganó el Premio Nobel de Literatura?', options: ['Gabriel García Márquez', 'Mario Vargas Llosa', 'Pablo Neruda'], correct: 0, explanation: 'Gabriel García Márquez, autor de "Cien Años de Soledad", ganó el Nobel en 1982.' }
      ]
    },
    {
      name: 'Curaçao', flagCode: 'cw', color: '#ff5722',
      questions: [
        { type: '🏆 Suramericanos', question: '¿Desde qué año Curaçao participa como país independiente en los Juegos Suramericanos?', options: ['2006', '2010', '2014'], correct: 2, explanation: 'Curaçao debutó como nación independiente en los Juegos Suramericanos de Santiago 2014.' },
        { type: '🏆 Suramericanos', question: '¿Qué deporte de combate tiene tradición en Curaçao dentro de los Juegos?', options: ['Judo', 'Boxeo', 'Taekwondo'], correct: 1, explanation: 'Curaçao tiene una fuerte tradición boxística, con varios medallistas en los Juegos Suramericanos.' },
        { type: '🌍 Cultura General', question: '¿Cuál es el idioma oficial más hablado en Curaçao?', options: ['Neerlandés', 'Papiamento', 'Inglés'], correct: 1, explanation: 'El papiamento es la lengua criolla más hablada en Curaçao, junto al neerlandés como idioma oficial.' }
      ]
    },
    {
      name: 'Ecuador', flagCode: 'ec', color: '#9c27b0',
      questions: [
        { type: '🏆 Suramericanos', question: '¿Qué ciudad ecuatoriana fue sede de los Juegos Suramericanos de 1998?', options: ['Quito', 'Guayaquil', 'Cuenca'], correct: 2, explanation: 'Cuenca fue la sede de los VI Juegos Suramericanos en 1998, marcando un hito para el deporte ecuatoriano.' },
        { type: '🏆 Suramericanos', question: '¿En qué disciplina de atletismo Ecuador ha ganado medallas de oro históricas?', options: ['Salto largo', 'Marcha atlética', 'Lanzamiento de jabalina'], correct: 1, explanation: 'Ecuador es potencia en marcha atlética, con varios oros en Juegos Suramericanos y olímpicos.' },
        { type: '🌍 Cultura General', question: '¿Qué famosas islas volcánicas pertenecen a Ecuador?', options: ['Islas Malvinas', 'Islas Galápagos', 'Islas de Pascua'], correct: 1, explanation: 'Las Islas Galápagos, declaradas Patrimonio de la Humanidad, inspiraron la teoría de la evolución de Darwin.' }
      ]
    },
    {
      name: 'Guyana', flagCode: 'gy', color: '#00bcd4',
      questions: [
        { type: '🏆 Suramericanos', question: '¿Desde qué año Guyana participa en los Juegos Suramericanos?', options: ['1978', '1986', '1994'], correct: 0, explanation: 'Guyana es miembro de ODESUR y participa desde la primera edición en Buenos Aires 1978.' },
        { type: '🏆 Suramericanos', question: '¿Qué particularidad tiene Guyana dentro de ODESUR?', options: ['Es el único país de habla inglesa', 'Es el país más pequeño', 'Es el que más medallas tiene'], correct: 0, explanation: 'Guyana es el único país miembro de ODESUR cuyo idioma oficial es el inglés.' },
        { type: '🌍 Cultura General', question: '¿Cuál es la famosa cascada ubicada en Guyana?', options: ['Cataratas del Iguazú', 'Salto Ángel', 'Kaieteur Falls'], correct: 2, explanation: 'Kaieteur Falls es una de las cascadas de una sola caída más potentes del mundo.' }
      ]
    },
    {
      name: 'Panamá', flagCode: 'pa', color: '#ffeb3b',
      questions: [
        { type: '🏆 Suramericanos', question: '¿Desde qué año Panamá es miembro de ODESUR?', options: ['1970', '1978', '1986'], correct: 0, explanation: 'Panamá fue uno de los primeros miembros de ODESUR, incorporándose en 1970.' },
        { type: '🏆 Suramericanos', question: '¿En qué deporte Panamá ha tenido mayor éxito en los Juegos Suramericanos?', options: ['Boxeo', 'Natación', 'Atletismo'], correct: 0, explanation: 'El boxeo es el deporte que más medallas ha dado a Panamá en la historia de los Juegos.' },
        { type: '🌍 Cultura General', question: '¿Qué famoso canal conecta los océanos Atlántico y Pacífico en Panamá?', options: ['Canal de Suez', 'Canal de Panamá', 'Canal de Kiel'], correct: 1, explanation: 'El Canal de Panamá es una de las obras de ingeniería más importantes del mundo.' }
      ]
    },
    {
      name: 'Paraguay', flagCode: 'py', color: '#795548',
      questions: [
        { type: '🏆 Suramericanos', question: '¿Qué ciudad paraguaya fue sede de los Juegos Suramericanos de 2022?', options: ['Encarnación', 'Asunción', 'Ciudad del Este'], correct: 1, explanation: 'Asunción albergó los XII Juegos Suramericanos en 2022, los primeros en territorio paraguayo.' },
        { type: '🏆 Suramericanos', question: '¿En qué deporte Paraguay suele destacarse en los Juegos?', options: ['Fútbol', 'Tenis', 'Gimnasia'], correct: 0, explanation: 'Paraguay tiene una fuerte tradición futbolística, con varias medallas en los Juegos Suramericanos.' },
        { type: '🌍 Cultura General', question: '¿Cuál es la bebida tradicional paraguaya hecha con yerba mate y agua fría?', options: ['Mate', 'Tereré', 'Chimarrão'], correct: 1, explanation: 'El tereré es la bebida nacional del Paraguay, similar al mate pero con agua fría o jugo.' }
      ]
    },
    {
      name: 'Perú', flagCode: 'pe', color: '#607d8b',
      questions: [
        { type: '🏆 Suramericanos', question: '¿En qué año Lima fue sede de los Juegos Suramericanos?', options: ['1986', '1990', '1994'], correct: 1, explanation: 'Lima albergó los IV Juegos Suramericanos en 1990, siendo la primera sede peruana del evento.' },
        { type: '🏆 Suramericanos', question: '¿Qué deporte de equipo femenino ha dado grandes alegrías al Perú en los Juegos?', options: ['Básquet', 'Vóley', 'Handball'], correct: 1, explanation: 'El vóley femenino peruano ha sido históricamente exitoso en los Juegos Suramericanos.' },
        { type: '🌍 Cultura General', question: '¿Cuál es la ciudadela inca más famosa del mundo, ubicada en Perú?', options: ['Machu Picchu', 'Choquequirao', 'Sacsayhuamán'], correct: 0, explanation: 'Machu Picchu, declarada Patrimonio de la Humanidad, es una de las Siete Maravillas del Mundo Moderno.' }
      ]
    },
    {
      name: 'Suriname', flagCode: 'sr', color: '#e91e63',
      questions: [
        { type: '🏆 Suramericanos', question: '¿Qué idioma oficial tiene Suriname, único en ODESUR?', options: ['Inglés', 'Neerlandés', 'Francés'], correct: 1, explanation: 'Suriname es el único país miembro de ODESUR cuyo idioma oficial es el neerlandés.' },
        { type: '🏆 Suramericanos', question: '¿En qué deporte acuático Suriname ha tenido destacada participación?', options: ['Natación', 'Remo', 'Vela'], correct: 0, explanation: 'Suriname ha producido nadadores de nivel olímpico y ha ganado varias medallas en natación en los Juegos.' },
        { type: '🌍 Cultura General', question: '¿Cuál es la capital de Suriname?', options: ['Paramaribo', 'Georgetown', 'Cayena'], correct: 0, explanation: 'Paramaribo es la capital, conocida por su centro histórico de arquitectura colonial neerlandesa.' }
      ]
    },
    {
      name: 'Uruguay', flagCode: 'uy', color: '#3f51b5',
      questions: [
        { type: '🏆 Suramericanos', question: '¿Uruguay es miembro fundador de ODESUR? ¿Desde qué año?', options: ['1976, sí', '1978, sí', '1982, no'], correct: 0, explanation: 'Uruguay fue uno de los países fundadores de ODESUR en 1976 y participó en la primera edición de 1978.' },
        { type: '🏆 Suramericanos', question: '¿Cuál es el deporte más emblemático de Uruguay en los Juegos Suramericanos?', options: ['Fútbol', 'Remo', 'Ciclismo'], correct: 0, explanation: 'Uruguay es una potencia futbolística histórica, y el fútbol es su deporte bandera en los Juegos.' },
        { type: '🌍 Cultura General', question: '¿Qué ritmo musical y danza típica uruguaya usa tamboriles?', options: ['Tango', 'Candombe', 'Milonga'], correct: 1, explanation: 'El candombe, de raíces africanas, es la expresión cultural más auténtica de Uruguay.' }
      ]
    },
    {
      name: 'Venezuela', flagCode: 've', color: '#009688',
      questions: [
        { type: '🏆 Suramericanos', question: '¿Qué ciudad venezolana fue sede de los Juegos Suramericanos de 1994?', options: ['Caracas', 'Valencia', 'Maracaibo'], correct: 1, explanation: 'Valencia, capital del estado Carabobo, albergó los V Juegos Suramericanos en 1994.' },
        { type: '🏆 Suramericanos', question: '¿En qué lugar del medallero histórico se ubica Venezuela?', options: ['4°', '5°', '6°'], correct: 0, explanation: 'Venezuela ocupa el 4° puesto histórico, destacando en boxeo, esgrima y béisbol.' },
        { type: '🌍 Cultura General', question: '¿Cuál es la cascada más alta del mundo, ubicada en Venezuela?', options: ['Cataratas del Niágara', 'Salto Ángel', 'Cataratas Victoria'], correct: 1, explanation: 'El Salto Ángel, en el estado Bolívar, tiene una caída de 979 m, la más alta del mundo.' }
      ]
    }
  ];

  ngAfterViewInit(): void {
    const container = document.getElementById('roulette-container');
    const radius = container ? container.offsetWidth / 2 : 230;
    const arrowsize = container ? container.offsetWidth / 15 : 140;

    this.roulette = new Roulette({
      container: 'roulette-container',
      sections: this.countries.map(c => ({
        background: '#ffffff',
        src: flagUrl(c.flagCode),
        radius: 18
      })),
      board: {
        radius,
        padding: 20,
        border: { width: 6, color: '#fff' },
        doughnut: { radius: 20, color: '#ffffffff' }
      },
      arrow: {
        element: 'sharp',
        width: arrowsize,
        height: arrowsize,
        padding: 2,
        color: '#f9004e'
      },
      settings: {
        roll: { duration: 6000, landing: 'edge', delay: 0 },
        font: '"Inter", sans-serif',
        font_size: 11,
        font_weight: 700,
        font_color: '#ffffff',
        border: { width: 1.5, color: '#000000' }
      },
      audio: {
        src: 'pop.mp3',
        volume: 1.0,
        play: { every: { milliseconds: 1, sections: 0.1 } }
      }
    });

    this.roulette.onstop = (section: any) => {
      const c = this.countries[section.index];
      this.resultText = `${c.name}`;
      this.resultVisible = true;
      this.resultAnimClass = '';
      setTimeout(() => { this.resultAnimClass = 'pop'; }, 20);
      setTimeout(() => {
        this.resultVisible = false;
        this.showQuiz(c);
      }, 2200);
    };
  }

  private showQuiz(c: Country) {
    const q = c.questions[Math.floor(Math.random() * c.questions.length)];

    Swal.fire({
      title: `<img src="${flagUrl(c.flagCode)}" alt="" style="width:40px;height:40px;vertical-align:middle;border-radius:4px;margin-right:10px">${c.name}`,
      html: this.buildQuizHtml(q),
      imageUrl: 'cards/capi.webp',
      imageWidth: 140,
      imageHeight: 140,
      showConfirmButton: true,
      confirmButtonText: '¡Girar de nuevo!',
      confirmButtonColor: 'rgba(255,255,255,0.25)',
      confirmButtonAriaLabel: 'Siguiente',
      background: 'linear-gradient(135deg, #f9004e 0%, #5139d4 100%)',
      color: '#ffffff',
      padding: '2rem',
      customClass: {
        popup: 'swal-suramericanos',
        title: 'swal-title',
        confirmButton: 'swal-btn-gradient',
        image: 'swal-capi-image'
      },
      didOpen: () => {
        const options = document.querySelectorAll('.quiz-option');
        options.forEach(el => {
          el.addEventListener('click', (e) => {
            const target = e.currentTarget as HTMLElement;
            const selectedIdx = parseInt(target.dataset['index']!);
            this.handleQuizAnswer(q, selectedIdx);
          });
        });
      },
      preConfirm: () => true
    });
  }

  private buildQuizHtml(q: Question): string {
    return `
      <div class="quiz-type-badge">${q.type}</div>
      <div class="quiz-question-text">${q.question}</div>
      <div class="quiz-options">
        ${q.options.map((opt, i) => `
          <div class="quiz-option" data-index="${i}">
            <span class="quiz-option-letter">${String.fromCharCode(65 + i)}</span>
            <span class="quiz-option-text">${opt}</span>
          </div>
        `).join('')}
      </div>
      <div class="quiz-result" id="quiz-result" style="display:none">
        <div class="quiz-result-icon"></div>
        <div class="quiz-result-title"></div>
        <div class="quiz-result-explanation"></div>
      </div>
    `;
  }

  private handleQuizAnswer(q: Question, selectedIdx: number) {
    const isCorrect = selectedIdx === q.correct;
    const options = document.querySelectorAll('.quiz-option');
    options.forEach((el, i) => {
      const opt = el as HTMLElement;
      opt.style.pointerEvents = 'none';
      opt.classList.remove('quiz-option-correct', 'quiz-option-wrong', 'quiz-option-disabled');
      if (i === q.correct) {
        opt.classList.add('quiz-option-correct');
      } else if (i === selectedIdx && !isCorrect) {
        opt.classList.add('quiz-option-wrong');
      } else {
        opt.classList.add('quiz-option-disabled');
      }
    });

    const resultEl = document.getElementById('quiz-result');
    if (!resultEl) return;
    const icon = resultEl.querySelector('.quiz-result-icon') as HTMLElement;
    const title = resultEl.querySelector('.quiz-result-title') as HTMLElement;
    const expl = resultEl.querySelector('.quiz-result-explanation') as HTMLElement;
    if (title) title.textContent = isCorrect ? '¡Correcto!' : '¡Casi!';
    if (expl) {
      expl.innerHTML = isCorrect
        ? q.explanation
        : `La respuesta correcta es <strong>${q.options[q.correct]}</strong>. ${q.explanation}`;
    }
    resultEl.style.display = '';
  }

  spin() {
    this.roulette.roll();
  }
}
