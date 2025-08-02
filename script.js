//HTML
const preguntaTexto = document.getElementById('pregunta-texto');
const opcionesDiv = document.getElementById('opciones');
const comodinesContainer = document.querySelector('.comodines-container');

//------------------------------------------------------VARIABLES-------------------------------------------------
//almacenar preguntas
let preguntas = [];
let preguntaActualIndex = 0;


//variables para llevar el registro de las opciones (mostradas, ocultas, seleccionadas,correctas)
let opcionesMostradas = 0;
let opcionSeleccionada = null;
let respuestaVerificada = false;

//variables para comodines
let comodinesUsados = {
    '50%': false,
    'Llamada': false,
    'Ruleta': false,
    'IA': false
};

//------------------------------------------------------FUNCIONES-------------------------------------------------
//Función cargar y mostrar preguntas
async function iniciarJuego() {
    try{

        // 1.Cargar preguntas
        const respuesta = await fetch("preguntas/preguntas1.json");
        preguntas =await respuesta.json();

        // 2. Si hay preguntas mostrar
        if (preguntas.length > 0) {
            mostrarPregunta();
        }
    }
    catch(error){
        console.error("Error al cargar las preguntas:",error);
        preguntaTexto.textContent = "Error al cargar las preguntas. Revisa el archivo json";
    }
}

//Función para mostrar los comodines
function actualizarComodines() {
    for (const comodin in comodinesUsados) {
        const boton = document.querySelector(`.comodin[data-comodin="${comodin}"]`);
        if (boton) {
            if (comodinesUsados[comodin]) {
                boton.classList.add('usado');
            } else {
                boton.classList.remove('usado');
            }
        }
    }
}

//Función para mostrar las preguntas
function mostrarPregunta(){
    //Obtiene la pregunta actual
    const pregunta = preguntas[preguntaActualIndex];

    //actualiza HTML
    preguntaTexto.textContent = pregunta.pregunta;

    //Vacia las opciones anteriores
    opcionesDiv.innerHTML = "";

    //Reinicia las variables
    opcionesMostradas = 0;
    opcionSeleccionada = null;
    respuestaVerificada = false;

    //Crea un botón para cada opción
    pregunta.opciones.forEach(opcionTexto=>{
        const boton = document.createElement("button");
        boton.classList.add("opcion","oculta");
        boton.textContent = opcionTexto;
        boton.setAttribute("data-opcion",opcionTexto);
        opcionesDiv.appendChild(boton);
    })
    actualizarComodines();
}
//Función para mostrar las opciones una a una
function mostrarSiguienteOpcion(){
    const botonesOpcion = opcionesDiv.querySelectorAll('.opcion');
    if (opcionesMostradas < botonesOpcion.length) {
        botonesOpcion[opcionesMostradas].classList.remove('oculta'); 
        botonesOpcion[opcionesMostradas].classList.add('visible');
        botonesOpcion[opcionesMostradas].style.pointerEvents = 'auto';
        opcionesMostradas++;
    }
}

//Función para pasar a la siguiente pregunta
function siguientePregunta(){
    //si quedan más preguntas
    if (preguntaActualIndex < preguntas.length-1){
        preguntaActualIndex ++;
        mostrarPregunta();
    }
}

//Función para pasar a la anterior pregunta
function anteriorPregunta(){
    //si no es la primera pregunta
    if (preguntaActualIndex > 0){
        preguntaActualIndex --;
        mostrarPregunta();
    }
}

//Función para verificar respuesta
function verificarRespuesta(){
    //si ya se ha verificado
    if (respuestaVerificada) return;
    //si no hay ninguna opción seleccionada
    if (!opcionSeleccionada){
        console.log("Selecciona una opción primero wn")
        return;
    }

    respuestaVerificada = true;

    const pregunta = preguntas[preguntaActualIndex];
    const respuestaCorrectaTexto = pregunta.opciones[pregunta.respuesta_correcta];
    const botonesOpcion = opcionesDiv.querySelectorAll('.opcion');

    botonesOpcion.forEach(boton => {
        //desactiva los clics
        boton.style.pointerEvents = 'none';
        //si es la respuesta correcta en verde, sino en rojo
        if (boton.textContent === respuestaCorrectaTexto) {
            boton.classList.add('correcta'); 
        } else if (boton.classList.contains('seleccionada')) {
            boton.classList.add('incorrecta'); 
        }
    });

    console.log(`Respuesta seleccionada: ${opcionSeleccionada}`);
    console.log(`Respuesta correcta: ${respuestaCorrectaTexto}`);
}

//------------------------------------------------------CONTROLES DEL TECLADO-------------------------------------------------
//cuando una tecla es presionada
document.addEventListener("keydown",(evento)=>{
    console.log("Tecla presionada:${evento.key}");

    //Siguiente pregunta pulsando flecha derecha
    if (evento.key == "ArrowRight"){
        siguientePregunta();
    }
    //Anterior pregunta pulsando flecha izquierda
    if (evento.key == "ArrowLeft"){
        anteriorPregunta();
    }
    //Mostrar siguiente opcion
    if (evento.key === ' ') {
        evento.preventDefault(); // Esto evita que la página se desplace hacia abajo
        mostrarSiguienteOpcion();
    }
    //Verificar respuesta
    if (evento.key === 'Enter') {
        verificarRespuesta();
    }
})
//------------------------------------------------------CLICS-------------------------------------------------
//Clics botones opciones
opcionesDiv.addEventListener('click', (evento) => {
    // Solo permite la selección si la respuesta no ha sido verificada
    if (evento.target.classList.contains('opcion') && !respuestaVerificada) {

        // Obtiene el botón que se ha clicado
        const botonClicado = evento.target;

        // Si la opción ya estaba seleccionada, la desmarca
        if (botonClicado.classList.contains('seleccionada')) {
            botonClicado.classList.remove('seleccionada');
            opcionSeleccionada = null; 
            console.log("Opción desmarcada.");
        } else {
            // Si no estaba seleccionada, desmarca las demás y la marca
            const botonesOpcion = opcionesDiv.querySelectorAll('.opcion');
            botonesOpcion.forEach(boton => {
                boton.classList.remove('seleccionada');
            });

            botonClicado.classList.add('seleccionada');
            opcionSeleccionada = botonClicado.textContent;
            console.log(`Opción seleccionada: ${opcionSeleccionada}`);
        }
    }
});
//Clics comodines
comodinesContainer.addEventListener('click', (evento) => {
    const botonComodin = evento.target.closest('.comodin');
    if (!botonComodin) return;

    const comodin = botonComodin.dataset.comodin;

    if (!comodinesUsados[comodin]) {
        console.log(`Comodín ${comodin} activado.`);
        // Aquí llamaré a las funciones de cada comodín
        
        // Marca el comodín como usado
        comodinesUsados[comodin] = true;
        actualizarComodines();
    } else {
        console.log(`El comodín ${comodin} ya ha sido usado.`);
    }
});

iniciarJuego();

