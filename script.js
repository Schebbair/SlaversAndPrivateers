//HTML
const preguntaTexto = document.getElementById("pregunta-texto");
const opcionesDiv = document.getElementById("opciones");
const comodinesContainer = document.querySelector(".comodines-container");
const contadorLlamadaDiv = document.getElementById('contador-llamada');
const logoContainer = document.getElementById('logo-container');
const ruletaContainer = document.getElementById('ruleta-container');
const ruletaGiratoria = document.querySelector('.ruleta-giratoria');
const resultadoRuletaDiv = document.getElementById('resultado-ruleta');

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
    "50%": false,
    "Llamada": false,
    "Ruleta": false,
    "IA": false
};
let contadorLlamada = 60;
let intervaloLlamada;
let estaGirando = false;
let anguloTotal = 0;
const anguloPorSeccion = 360 / 12; // Hay 12 secciones en la imagen
const resultadosPorColor  = {
    // Los ángulos son aproximados, puedes ajustarlos con la imagen real
    rojo: 3,   // 3 opciones descartadas (la sección más pequeña)
    azul: 1,   // 1 opción descartada
    verde: 2,  // 2 opciones descartadas
    negro: 0   // 0 opciones descartadas
};
//------------------------------------------------------FUNCIONES-------------------------------------------------
//Función auxiliar
function dormir(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//Función cargar y mostrar preguntas
async function iniciarJuego() {
    try{

        // 1.Cargar preguntas
        const respuesta = await fetch("preguntas/preguntas2.json");
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
    const botonesComodin = comodinesContainer.querySelectorAll(".comodin");
    botonesComodin.forEach(boton => {
        const comodin = boton.dataset.comodin;
        if (comodinesUsados[comodin]) {
            boton.classList.add("usado");
        } else {
            boton.classList.remove("usado");
        }
    });
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
    const botonesOpcion = opcionesDiv.querySelectorAll(".opcion");
    if (opcionesMostradas < botonesOpcion.length) {
        botonesOpcion[opcionesMostradas].classList.remove("oculta"); 
        botonesOpcion[opcionesMostradas].classList.add("visible");
        botonesOpcion[opcionesMostradas].style.pointerEvents = "auto";
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
    const botonesOpcion = opcionesDiv.querySelectorAll(".opcion");

    botonesOpcion.forEach(boton => {
        //desactiva los clics
        boton.style.pointerEvents = "none";
        //si es la respuesta correcta en verde, sino en rojo
        if (boton.textContent === respuestaCorrectaTexto) {
            boton.classList.add("correcta"); 
        } else if (boton.classList.contains("seleccionada")) {
            boton.classList.add("incorrecta"); 
        }
    });

    console.log(`Respuesta seleccionada: ${opcionSeleccionada}`);
    console.log(`Respuesta correcta: ${respuestaCorrectaTexto}`);
}

//Función para usar los comodines
function usarComodin(comodin) {
    if (comodinesUsados[comodin]) {
        console.log(`Reactivando comodín ${comodin}.`);
        comodinesUsados[comodin] = false;
        
        // Si se reactiva el 50/50, vuelve a mostrar todas las opciones
        if (comodin === '50%') {
            const botonesOpcion = opcionesDiv.querySelectorAll('.opcion');
            botonesOpcion.forEach(boton => {
                boton.classList.remove('descartada');
                boton.style.pointerEvents = 'auto';
            });
        }
        if (comodin === "Llamada") {
            resetearComodinLlamada();
        }
        if (comodin === "IA"){
            //ya lo rellenaré de alguna forma
        }
        if (comodin === 'Ruleta') {
            resetearComodinRuleta();
        }
    } else {
        // Si no está usado, lo marca como usado y ejecuta su función
        console.log(`Comodín ${comodin} activado.`);
        comodinesUsados[comodin] = true;
        
        // Ejecuta la función específica del comodín
        if (comodin === "50%") {
            comodin5050();
        }
        if (comodin == "Llamada"){
            comodinLlamada();
        }
        if (comodin == "IA"){
            //ya pondré algo 
        }
        if (comodin === 'Ruleta') {
            comodinRuleta();
        }
    }
    actualizarComodines();
}

//------------------------COMODINES------------------------
//50/50
function comodin5050(){
    //si la respuesta esta verificada, no se puede usar el comodín
    if (respuestaVerificada){
        console.log("pero si ya se ha visto la respuesta wn");
        return;
    }
    // Identifica todas las opciones disponibles (visibles o no)
    const botonesOpcion = opcionesDiv.querySelectorAll(".opcion");
    const pregunta = preguntas[preguntaActualIndex];
    const respuestaCorrectaIndex = pregunta.respuesta_correcta;

    // Identifica las opciones incorrectas que están visibles
    let opcionesIncorrectasVisibles = [];
    botonesOpcion.forEach((boton, index) => {
        // La condición para que se pueda ocultar es que sea incorrecta
        if (index !== respuestaCorrectaIndex && !boton.classList.contains('oculta')) {
            opcionesIncorrectasVisibles.push(boton);
        }
    });
    
    // Si ya solo quedan dos opciones visibles (una correcta y una incorrecta), no se puede usar el comodín de nuevo.
    if (opcionesIncorrectasVisibles.length <= 1) {
        console.log("Ya solo quedan dos opciones o menos, no se puede usar 50/50 de nuevo.");
        return;
    }

    // Descarta exactamente dos opciones incorrectas 
    for (let i = 0; i < 2; i++) {
        // Verifica si hay opciones incorrectas para eliminar
        if (opcionesIncorrectasVisibles.length > 1) {
            // Elege una opción incorrecta al azar
            const randomIndex = Math.floor(Math.random() * opcionesIncorrectasVisibles.length);
            const botonAEliminar = opcionesIncorrectasVisibles[randomIndex];

            // Oculta el botón
            botonAEliminar.classList.add("descartada");
            botonAEliminar.style.pointerEvents = "none";
            
            // Elimina el botón de nuestra lista para no volver a elegirlo
            opcionesIncorrectasVisibles.splice(randomIndex, 1);
        }
    }

}
//Llamada
function comodinLlamada() {
    
    // 2. Desvanecer el logo y mostrar el contador
    // Para esto usaremos la clase 'comodin-activo' que ya creamos en el CSS
    logoContainer.classList.add('comodin-activo');
    contadorLlamadaDiv.classList.add("comodin-activo");
    contadorLlamada = 60;
    contadorLlamadaDiv.textContent = contadorLlamada;
    // En este punto, el contador se muestra pero no está en marcha.
    // El contador está "pausado" por defecto en 60.
    console.log("Comodín 'Llamada' activado. Pulsa 't' para iniciar/pausar la cuenta atrás.");
}
// NUEVAS FUNCIONES: Control del cronómetro
function iniciarContadorLlamada() {
    if (intervaloLlamada) return; // Si ya está corriendo, no hacemos nada
    
    intervaloLlamada = setInterval(() => {
        contadorLlamada--;
        contadorLlamadaDiv.textContent = contadorLlamada;

        if (contadorLlamada <= 0) {
            contadorLlamadaDiv.classList.add("parpadeando");
            pausarContadorLlamada();
        }
    }, 1000);
}

// --- ESTA ES LA FUNCIÓN QUE FALTABA ---
async function pausarContadorLlamada() {
    clearInterval(intervaloLlamada);
    intervaloLlamada = null;
    console.log("El contador de la llamada ha sido pausado.");
    await dormir(3000);
    resetearComodinLlamada();
}

function resetearComodinLlamada() {
    // Paramos el contador si está en marcha
    logoContainer.classList.remove('comodin-activo');
    contadorLlamadaDiv.classList.remove("comodin-activo");
    contadorLlamadaDiv.classList.remove("parpadeando");
    
    // 4. Reseteamos los valores del contador
    contadorLlamada = 60;
    contadorLlamadaDiv.textContent = contadorLlamada;
    
    console.log("Comodín 'Llamada' reseteado.");

}
//Ruleta
// Función principal del comodín Ruleta
function comodinRuleta() {
    ruletaContainer.classList.add('visible');
}
function girarRuleta(){
    // Evita que la ruleta gire de nuevo si ya está girando
    if (estaGirando) {
        console.log("La ruleta ya está girando.");
        return;
    }

    estaGirando = true;
    console.log("¡La ruleta comienza a girar!");

    // Calcular el ángulo de giro
    // Por ahora, solo haremos que dé unas cuantas vueltas.
    // '5' vueltas completas * 360 grados + un ángulo aleatorio entre 0 y 360
    const girosCompletos = 5; 
    const seccionGanadoraIndex = Math.floor(Math.random() * 12);
    const anguloGanador = 360 - (seccionGanadoraIndex * anguloPorSeccion);
    anguloTotal += girosCompletos * 360 + anguloGanador;

    // Aplicar el giro y la animación de transición
    ruletaGiratoria.style.transition = 'transform 6s ease-out'; // Duración total del giro
    ruletaGiratoria.style.transform = `rotate(${anguloTotal}deg)`;

    // Al finalizar la animación, reseteamos el estado
    setTimeout(() => {
        estaGirando = false;
        console.log("La ruleta se ha detenido.");
        // Aquí iría la lógica para determinar el resultado
        // por ahora, simplemente resetea el estilo
        procesarResultadoRuleta(seccionGanadoraIndex);
        // Puedes poner el resultado de la ruleta aquí
    }, 6000); // El tiempo de espera debe coincidir con la transición en CSS (6s)
}
function procesarResultadoRuleta(seccionIndex) {
    // Mapeamos el índice de la sección a un color (ajústalo según tu imagen)
    // Orden de colores: Rojo, Negro, Verde, Azul, Verde, Negro, Azul, Verde, Negro, Azul, Verde, Negro
    const coloresEnRuleta = ['rojo', 'negro', 'verde', 'azul', 'verde', 'negro', 'azul', 'verde', 'negro', 'azul', 'verde', 'negro'];
    
    const colorGanador = coloresEnRuleta[seccionIndex];
    const opcionesADescartar = resultadosPorColor[colorGanador];
    
    console.log(`El puntero ha caído en la sección ${seccionIndex} (${colorGanador}).`);
    console.log(`El resultado es descartar ${opcionesADescartar} opciones.`);

    descartarOpcionesRuleta(opcionesADescartar);
    ruletaContainer.classList.remove("visible");


}
function descartarOpcionesRuleta(cantidad) {
    if (cantidad === 0) {
        console.log("La ruleta ha caído en 0. No se descartan opciones.");
        return; // No hace nada si la cantidad es 0
    }

    const pregunta = preguntas[preguntaActualIndex];
    const respuestaCorrectaTexto = pregunta.opciones[pregunta.respuesta_correcta];
    const botonesOpcion = Array.from(opcionesDiv.querySelectorAll('.opcion.visible'));
    
    // Filtramos las opciones incorrectas y que aún no han sido descartadas
    let opcionesIncorrectasVisibles = botonesOpcion.filter(boton => boton.textContent !== respuestaCorrectaTexto && !boton.classList.contains('descartada'));

    // Si la cantidad de opciones incorrectas disponibles es menor que la cantidad a descartar,
    // solo descartamos las que quedan.
    const aDescartar = Math.min(cantidad, opcionesIncorrectasVisibles.length);

    console.log(`Descartando ${aDescartar} opciones...`);

    for (let i = 0; i < aDescartar; i++) {
        const randomIndex = Math.floor(Math.random() * opcionesIncorrectasVisibles.length);
        const botonAEliminar = opcionesIncorrectasVisibles[randomIndex];
        
        // Añadimos la clase 'descartada' y deshabilitamos los clics
        botonAEliminar.classList.add('descartada');
        botonAEliminar.style.pointerEvents = 'none';

        // Eliminamos el botón del array para no volver a elegirlo
        opcionesIncorrectasVisibles.splice(randomIndex, 1);
    }
}
function resetearComodinRuleta() {
    ruletaContainer.classList.remove('visible');
    // ... (otras líneas de código) ...
    
    // Restablecer opciones descartadas
    const botonesOpcion = opcionesDiv.querySelectorAll('.opcion');
    botonesOpcion.forEach(boton => {
        boton.classList.remove('descartada');
        boton.style.pointerEvents = 'auto';
    });
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
    if (evento.key === " ") {
        evento.preventDefault(); // Esto evita que la página se desplace hacia abajo
        mostrarSiguienteOpcion();
    }
    //Verificar respuesta
    if (evento.key === "Enter") {
        verificarRespuesta();
    }
    //Usar comodines 
    const comodinPorTecla = document.querySelector(`.comodin[data-tecla="${evento.key}"]`);
    if (comodinPorTecla) {
        const comodin = comodinPorTecla.dataset.comodin;
        usarComodin(comodin);
    }
    if (evento.key === 't' && comodinesUsados['Llamada']) {
        if (intervaloLlamada) {
            pausarContadorLlamada();
        } else {
            iniciarContadorLlamada();
        }
    }
    if (evento.key === "r" && comodinesUsados["Ruleta"] && !estaGirando){
        girarRuleta();
    }


})
//------------------------------------------------------CLICS-------------------------------------------------
//Clics botones opciones
opcionesDiv.addEventListener("click", (evento) => {
    // Solo permite la selección si la respuesta no ha sido verificada
    if (evento.target.classList.contains("opcion") && !respuestaVerificada) {

        // Obtiene el botón que se ha clicado
        const botonClicado = evento.target;

        // Si la opción ya estaba seleccionada, la desmarca
        if (botonClicado.classList.contains("seleccionada")) {
            botonClicado.classList.remove("seleccionada");
            opcionSeleccionada = null; 
            console.log("Opción desmarcada.");
        } else {
            // Si no estaba seleccionada, desmarca las demás y la marca
            const botonesOpcion = opcionesDiv.querySelectorAll(".opcion");
            botonesOpcion.forEach(boton => {
                boton.classList.remove("seleccionada");
            });

            botonClicado.classList.add("seleccionada");
            opcionSeleccionada = botonClicado.textContent;
            console.log(`Opción seleccionada: ${opcionSeleccionada}`);
        }
    }
});
//Clics comodines
comodinesContainer.addEventListener("click", (evento) => {
    const botonComodin = evento.target.closest(".comodin");
    if (!botonComodin) return;

    const comodin = botonComodin.dataset.comodin;
    usarComodin(comodin);
});

iniciarJuego();

