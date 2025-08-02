//almacenar preguntas
let preguntas = [];
let preguntaActualIndex = 0;


//HTML
const preguntaTexto = document.getElementById('pregunta-texto');
const opcionesDiv = document.getElementById('opciones');

// Conexión WebSocket
const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
    console.log('Conectado al servidor de WebSockets.');
    // Identificar este cliente como la pantalla principal
    ws.send(JSON.stringify({ type: 'IDENTIFY', role: 'pantalla' }));
};

ws.onmessage = message => {
    const data = JSON.parse(message.data);
    console.log('Mensaje del servidor:', data);

    // Lógica para manejar los comandos del móvil
    if (data.type === 'COMANDO') {
        if (data.accion === 'siguiente') {
            siguientePregunta();
        }
        // Aquí puedes añadir más comandos (ej: 'mostrar-50-50', 'quitar-opciones', etc.)
    }
};


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

//Función para mostrar las preguntas
function mostrarPregunta(){
    //Obtiene la pregunta actual
    const pregunta = preguntas[preguntaActualIndex];

    //actualiza HTML
    preguntaTexto.textContent = pregunta.pregunta;

    //Vacia las opciones anteriores
    opcionesDiv.innerHTML = "";

    //Crea un botón para cada opción
    pregunta.opciones.forEach(opcionTexto=>{
        const boton = document.createElement("button");
        boton.classList.add("opcion");
        boton.textContent = opcionTexto;
        boton.setAttribute("data-opcion",opcionTexto);
        opcionesDiv.appendChild(boton);
    })

}

//Función para pasar a la siguiente pregunta
function siguientePregunta(){
    preguntaActualIndex ++;

    //si quedan más preguntas
    if (preguntaActualIndex < preguntas.length){
        mostrarPregunta();
    } else{ //si no quedan más
        preguntaTexto.textContent = "adivina quién tiene un euro más en la cuenta";
        opcionesDiv.innerHTML = "";
    }
}

//Clics botones opciones
opcionesDiv.addEventListener("click", (evento)=>{
    if (evento.target.classList.contains("opcion")){
        const opcionSeleccionada = evento.target.dataset.opcion;
        console.log("Se ha seleccionado la opción:",opcionSeleccionada);
    }
})

iniciarJuego();

