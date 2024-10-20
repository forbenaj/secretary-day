/*

███████ ████████  █████  ██████  ████████ ██    ██ ██████  
██         ██    ██   ██ ██   ██    ██    ██    ██ ██   ██ 
███████    ██    ███████ ██████     ██    ██    ██ ██████  
     ██    ██    ██   ██ ██   ██    ██    ██    ██ ██      
███████    ██    ██   ██ ██   ██    ██     ██████  ██      
                                                           
*/                                                           


/* STARTUP is the first script that runs.
It contains the most important global variables
and the functions that initialize the rest of the scripts. */


// L I S T   O F   P R O G R A M S
// All the scripts that will be attached to the document
// Each listed program corresponds to a script in /program-files}
// If a new program is created, it must be added to this list.

var programFiles = [
    {
        name: "Calendar",
        type: "app",
        src: "program-files/Calendar.js"
    },
    {
        name: "Comunicator",
        type: "app",
        src: "program-files/Comunicator.js"
    },
    {
        name: "PatientSearch",
        type: "app",
        src: "program-files/PatientSearch.js"
    },
    {
        name: "Console",
        type: "app",
        src: "program-files/Console.js"
    },
    {
        name: "Calculator",
        type: "app",
        src: "program-files/Calculator.js"
    },
    {
        name: "Notepad",
        type: "app",
        src: "program-files/Notepad.js"
    },
    {
        name: "Paint",
        type: "app",
        src: "program-files/Paint.js"
    },
    {
        name: "Settings",
        type: "app",
        src: "program-files/Settings.js"
    },
    {
        name: "TestProgram",
        type: "app",
        src: "program-files/TestProgram.js"
    }
]

// Here are the programs that are initialized automatically.
var startPrograms = [
        "Calendar",
        "Comunicator",
        "PatientSearch"
    ]



// Placeholder variables for classes and instances
var programClasses = {}
var programInstances = {}
/* Habíamos quedado en que cada script se encargaba de crear su propia instancia de clase al momento de adjuntar,
cosa que hubiera una sola instancia por cada programa, pero me pareció que tenía más sentido crear cada instancia
desde la función initProgram().

Ahora que lo pienso capaz es al pedo, no hace falta tener dos listas.
Algunas Apps, como GovernApp, NECESITAN ser persistentes para que no se borre la info cada vez que la cerras.
De todas formas eso se puede manejar aparte, con alguna función para tener la app en segundo plano.*/


// Lista de programas ejecutándose. Cada vez que se ejecuta un programa, se pushea la instancia acá
var runningPrograms = []


// ACÁ EMPIEZA TODO

// La primera función que se ejecuta cuando el body is ready ( ͡° ͜ʖ ͡°)
function onStartup() {


    // Carga todos los scripts con una promesa. Una vez que todos carguen, se pueden ejecutar programas
    Promise.all(programFiles.map(loadScript))
        .then(() => {

            // Acá adentro ya se puede usar cualquier script adjuntado
            // En éste punto, cada programa guardó una referencia a su propia clase en programClasses (lo hicieron en su propio script, lo vemos más adelante)

            console.log("All scripts have been loaded!");

            desktop = new Desktop() // Se crea una instancia de escritorio, y se adjunta solito al html
            
            // Arranca los programas de inicio automático
            for(let programName of startPrograms) {
                initProgram(programName)
            }
            
        })
        .catch((error) => {

            console.error("Error loading scripts:", error);
        });
}



// La función polémica. Instanciamos las clases acá? Se encarga cada programa? Cómo saberlo
function initProgram(programName) {

    // Crea una nueva instancia del programa
    let program = new programClasses[programName]()

    // Aloja la instancia bajo el nombre del programa
    programInstances[programName] = program

    // Ejecuta el programa
    program.run()

    //runningPrograms.push(programInstance) // Por ahora ésto lo maneja cada programa

}


// La función que añade los scripts al html
function loadScript(program) {

    return new Promise((resolve, reject) => {
        let script = document.createElement("script")
        script.src = program.src
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script)
    })
}


/* Con ésto ya se adjuntaron los scripts de todos los programas,
cada programa alojó su clase en programClasses,
se inicializó el escritorio y se inicializaron los tres programas principales.

Te recomiendo seguir con el [program-files/Program.js] para entender
cómo funcionan los programas
*/