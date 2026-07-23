import { pregunta } from "./interfaces";

export const PREGUNTAS: pregunta[] = [
  // +18
  {
    qestion: "¿En Argentina, a partir de qué edad está permitido participar en apuestas de dinero en juegos de azar?",
    adult: true,
    answers: [
      { text: "16 años", correct: false },
      { text: "18 años", correct: true },
      { text: "21 años", correct: false }
    ]
  },
  {
    qestion: "¿Qué significa jugar de manera responsable?",
    adult: true,
    answers: [
      { text: "Apostar todo lo que uno tiene", correct: false },
      { text: "Jugar por entretenimiento, con límites claros", correct: true },
      { text: "Apostar para solucionar problemas económicos", correct: false }
    ]
  },
  {
    qestion: "¿Cuál de estas prácticas es una señal de alerta de juego problemático?",
    adult: true,
    answers: [
      { text: "Ver los juegos como distracción ocasional", correct: false },
      { text: "Gastar más dinero o tiempo del que se planeó", correct: true },
      { text: "Jugar en familia o con amigos de vez en cuando", correct: false }
    ]
  },
  {
    qestion: "¿Qué símbolo debe estar siempre presente en los productos y comunicaciones de juegos de azar?",
    adult: true,
    answers: [
      { text: "+16", correct: false },
      { text: "+18", correct: true },
      { text: "“Prohibido jugar”", correct: false }
    ]
  },
  {
    qestion: "Si un jugador necesita ayuda o asesoramiento por problemas con el juego, ¿qué debe hacer?",
    adult: true,
    answers: [
      { text: "Guardarlo en secreto", correct: false },
      { text: "Buscar apoyo en la línea de ayuda de Juego Responsable 2804-999-777", correct: true },
      { text: "Seguir jugando hasta recuperar lo perdido", correct: false }
    ]
  },
  {
    qestion: "¿Cuál es el principal objetivo del JUEGO RESPONSABLE?",
    adult: true,
    answers: [
      { text: "Que el jugador se divierta de forma segura", correct: true },
      { text: "Que el casino siempre gane", correct: false },
      { text: "Que todos jueguen sin importar la edad", correct: false }
    ]
  },
  {
    qestion: "Si un familiar o amigo te cuenta que está jugando más de lo que debería, ¿qué hacés?",
    adult: true,
    answers: [
      { text: "Lo ignorás", correct: false },
      { text: "Le aconsejás que busque ayuda y lo acompañás", correct: true },
      { text: "Le decís que siga, la suerte siempre cambia", correct: false }
    ]
  },

  // -18
  {
    qestion: "¿Qué significa jugar de manera responsable en videojuegos o juegos online?",
    adult: false,
    answers: [
      { text: "Jugar sin parar toda la noche", correct: false },
      { text: "Jugar con límites de tiempo y sin descuidar otras actividades", correct: true },
      { text: "Jugar solo si se gana siempre", correct: false }
    ]
  },
  {
    qestion: "¿Cuál de estas es una señal de que el juego ya no es saludable?",
    adult: false,
    answers: [
      { text: "Jugar un rato con amigos", correct: false },
      { text: "Dejar de dormir, estudiar o entrenar por jugar demasiado", correct: true },
      { text: "Reírse y pasarla bien", correct: false }
    ]
  },
  {
    qestion: "Si ves el símbolo +18 en una app o publicidad de juegos de azar, ¿qué significa?",
    adult: false,
    answers: [
      { text: "Que es un juego más difícil", correct: false },
      { text: "Que solo es para adultos", correct: true },
      { text: "Que la descarga es gratuita", correct: false }
    ]
  },
  {
    qestion: "Cuando jugás online, ¿qué debería ser lo más importante?",
    adult: false,
    answers: [
      { text: "Ganar a toda costa", correct: false },
      { text: "Pasarla bien y divertirse", correct: true },
      { text: "Jugar aunque te haga sentir mal", correct: false }
    ]
  },
  {
    qestion: "¿Qué podés hacer para mantener el equilibrio con los juegos online?",
    adult: false,
    answers: [
      { text: "Poner un límite de tiempo", correct: true },
      { text: "Jugar sin parar hasta cansarte", correct: false },
      { text: "No hacer pausas nunca", correct: false }
    ]
  },
  {
    qestion: "Si un amigo tuyo juega demasiado y descuida otras cosas, ¿qué harías?",
    adult: false,
    answers: [
      { text: "Ignorarlo", correct: false },
      { text: "Aconsejarlo para que haga pausas y se organice", correct: true },
      { text: "Decirle que juegue más que vos", correct: false }
    ]
  }
];

