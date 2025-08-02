//HTML
const preguntaTexto = document.getElementById("pregunta-texto");
const opcionesDiv = document.getElementById("opciones");
const comodinesContainer = document.querySelector(".comodines-container");
const comodinLlamadaBtn = document.getElementById('comodin-llamada');
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
const seccionesRuleta = [0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3];
const anguloSeccion = 360 / seccionesRuleta.length;
let anguloTotal = 0;
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
    
    pausarContadorLlamada();
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
function pausarContadorLlamada() {
    clearInterval(intervaloLlamada);
    intervaloLlamada = null;
    console.log("El contador de la llamada ha sido pausado.");
}

function resetearComodinLlamada() {
    // Paramos el contador si está en marcha
    contadorLlamadaDiv.classList.remove("parpadeando");
    pausarContadorLlamada();
    
    // 3. Reseteamos el estado visual
    logoContainer.classList.remove('comodin-activo');
    contadorLlamadaDiv.classList.remove("comodin-activo");
    
    // 4. Reseteamos los valores del contador
    contadorLlamada = 60;
    contadorLlamadaDiv.textContent = contadorLlamada;
    
    // 5. Marcamos el comodín como no usado
    comodinesUsados['Llamada'] = false;
    actualizarComodines();
    
    console.log("Comodín 'Llamada' reseteado.");
}
//Ruleta
function generarRuleta() {
    ruletaGiratoria.innerHTML = ''; // Limpia el contenido anterior
    seccionesRuleta.forEach((numero, index) => {
        const seccion = document.createElement('div');
        seccion.classList.add('ruleta-seccion');
        seccion.style.transform = `rotate(${index * anguloSeccion}deg) skewY(${90 - anguloSeccion}deg)`;
        seccion.style.backgroundColor = getRuletaColor(numero);
        seccion.innerHTML = `<span style="transform: skewY(${-(90 - anguloSeccion)}deg) rotate(10deg);">${numero}</span>`;
        ruletaGiratoria.appendChild(seccion);
    });
}

function getRuletaColor(numero) {
    switch (numero) {
        case 0: return 'red';
        case 1: return 'green';
        case 2: return 'blue';
        case 3: return 'gold';
        default: return 'gray';
    }
}

// Función para girar la ruleta
function girarRuleta() {
    if (ruletaGiratoria.classList.contains('girando')) return;

    // Calcular el ángulo de giro aleatorio
    const girosCompletos = 5; // Número de vueltas completas
    const seccionGanadoraIndex = Math.floor(Math.random() * seccionesRuleta.length);
    const anguloGanador = 360 - (seccionGanadoraIndex * anguloSeccion);
    anguloTotal += girosCompletos * 360 + anguloGanador;

    // Iniciar la animación
    ruletaGiratoria.style.transform = `rotate(${anguloTotal}deg)`;
    ruletaGiratoria.classList.add('finalizando-giro');

    // Al finalizar la animación
    setTimeout(() => {
        ruletaGiratoria.classList.remove('finalizando-giro');
        finalizarGiroRuleta(seccionGanadoraIndex);
    }, 6000); // El tiempo de espera debe coincidir con la transición en CSS
}

// Función para mostrar el resultado
function finalizarGiroRuleta(seccionGanadoraIndex) {
    const numeroGanador = seccionesRuleta[seccionGanadoraIndex];
    resultadoRuletaDiv.textContent = `${numeroGanador} opciones eliminadas`;
    resultadoRuletaDiv.style.display = 'block';
    
    // Llamada a la función que elimina las opciones
    descartarOpcionesRuleta(numeroGanador);
}

// Función para descartar opciones
function descartarOpcionesRuleta(cantidad) {
    if (cantidad === 0) return;

    const pregunta = preguntas[preguntaActualIndex];
    const respuestaCorrectaIndex = pregunta.respuesta_correcta;
    const botonesOpcion = Array.from(opcionesDiv.querySelectorAll('.opcion.visible:not(.descartada)'));
    
    // Filtramos las opciones incorrectas
    let opcionesIncorrectasVisibles = botonesOpcion.filter((boton, index) => index !== respuestaCorrectaIndex);

    for (let i = 0; i < cantidad && opcionesIncorrectasVisibles.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * opcionesIncorrectasVisibles.length);
        const botonAEliminar = opcionesIncorrectasVisibles[randomIndex];
        botonAEliminar.classList.add('descartada');
        botonAEliminar.style.pointerEvents = 'none';
        opcionesIncorrectasVisibles.splice(randomIndex, 1);
    }
}

// Función principal del comodín Ruleta
function comodinRuleta() {
    if (comodinesUsados['Ruleta']) {
        console.log("El comodín 'Ruleta' ya está activo. Pulsa 'r' para girar.");
        return;
    }
    
    comodinesUsados['Ruleta'] = true;
    actualizarComodines();
    generarRuleta();
    ruletaContainer.classList.remove('oculta');
    console.log("Comodín 'Ruleta' activado. Pulsa 'r' para girar.");
}

// Función para resetear el comodín de la ruleta
function resetearComodinRuleta() {
    ruletaContainer.classList.add('oculta');
    resultadoRuletaDiv.style.display = 'none';
    comodinesUsados['Ruleta'] = false;
    actualizarComodines();
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
    if (evento.key === 'r' && comodinesUsados['Ruleta']) {
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

