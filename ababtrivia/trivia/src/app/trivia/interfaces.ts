export interface pregunta{
    qestion: string
    answers: respuesta[]
    adult: boolean;
}
export interface respuesta{
    text: string
    correct: boolean
}