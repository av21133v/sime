
/* Arreglo donde se almacenan todos los materiales */
let materiales = [];

// Siguiente id disponible
let siguienteId = 1;

// Guarda el id del material que estamos editando
let idEditando = null;

// Referencias a los elementos del HTML
let formulario = document.querySelector("#formulario");
let campoNombre = formulario.elements.nombre;
let campoCategoria = formulario.elements.categoria;
let campoCantidad = formulario.elements.cantidad;
let campoPrecio = formulario.elements.precio;
let estado = document.querySelector("#estado");
let lista = document.querySelector("#listaMateriales");
let sinResultados = document.querySelector("#sinResultados");

// Elementos para buscar y filtrar
let buscar = document.querySelector("#buscar");
let filtroCategoria = document.querySelector("#filtroCategoria");
let filtroEstado = document.querySelector("#filtroEstado");

// Muestra un mensaje en pantalla
function mostrarMensaje(texto, tipo) {
    estado.textContent = texto;
    estado.className = tipo;
}

// Calcula si el material está disponible o agotado
function calcularEstado(material) {
    if (material.cantidad > 0) {
        return "Disponible";
    }

    return "Agotado";
}

// Guarda los materiales en localStorage
function guardarDatos() {
    let datos = JSON.stringify(materiales);
    localStorage.setItem("materiales", datos);
}

// Carga los materiales guardados
function cargarDatos() {
    let datos = localStorage.getItem("materiales");

    if (datos !== null) {
        materiales = JSON.parse(datos);

        // Actualizar el siguiente id disponible
        materiales.forEach(material => {
            if (material.id >= siguienteId) {
                siguienteId = material.id + 1;
            }
        });
    }
}

// Muestra los materiales en la tabla
function pintar() {
    lista.replaceChildren();

    // Obtener los valores de búsqueda y filtros
    let textoBuscar = buscar.value.toLowerCase().trim();
    let categoriaElegida = filtroCategoria.value;
    let estadoElegido = filtroEstado.value;

    // Filtrar los materiales
    let materialesFiltrados = materiales.filter(material => {
        // Buscar por nombre
        let coincideNombre = material.nombre
            .toLowerCase()
            .includes(textoBuscar);

        // Filtrar por categoría
        let coincideCategoria =
            categoriaElegida === "" ||
            categoriaElegida.toLowerCase() === "todos" ||
            categoriaElegida.toLowerCase() === "todas" ||
            material.categoria === categoriaElegida;

        // Filtrar por disponibilidad
        let coincideEstado =
            estadoElegido === "" ||
            estadoElegido.toLowerCase() === "todos" ||
            estadoElegido.toLowerCase() === "todas" ||
            calcularEstado(material) === estadoElegido;

        // Se deben cumplir todos los filtros seleccionados
        return coincideNombre && coincideCategoria && coincideEstado;
    });

    // Recorrer solamente los materiales que coinciden
    materialesFiltrados.forEach(material => {
        let fila = document.createElement("tr");

        // Datos del material
        let textos = [
            material.id,
            material.nombre,
            material.categoria,
            material.cantidad,
            "$" + material.precio.toFixed(2),
            calcularEstado(material)
        ];

        // Crear las celdas de información
        textos.forEach(texto => {
            let celda = document.createElement("td");
            celda.textContent = texto;
            fila.append(celda);
        });

        // Celda de acciones
        let celdaAcciones = document.createElement("td");

        // Botón Editar
        let botonEditar = document.createElement("button");
        botonEditar.textContent = "Editar";
        botonEditar.type = "button";

        botonEditar.addEventListener("click", () => {
            campoNombre.value = material.nombre;
            campoCategoria.value = material.categoria;
            campoCantidad.value = material.cantidad;
            campoPrecio.value = material.precio;

            idEditando = material.id;

            mostrarMensaje("Editando material", "exito");
            campoNombre.focus();
        });

        // Botón Eliminar
        let botonEliminar = document.createElement("button");
        botonEliminar.textContent = "Eliminar";
        botonEliminar.type = "button";

        botonEliminar.addEventListener("click", () => {
            let confirmar = confirm(
                "¿Estás seguro de que deseas eliminar este material?"
            );

            if (confirmar) {
                materiales = materiales.filter(m => m.id !== material.id);

                // Limpiar el formulario si se estaba editando
                if (idEditando === material.id) {
                    formulario.reset();
                    idEditando = null;
                }

                guardarDatos();

                mostrarMensaje("Material eliminado correctamente", "exito");
                pintar();
            }
        });

        // Agregar los botones a la celda
        celdaAcciones.append(botonEditar);
        celdaAcciones.append(botonEliminar);

        // Agregar la celda a la fila
        fila.append(celdaAcciones);

        // Agregar la fila a la tabla
        lista.append(fila);
    });

    // Mostrar aviso si no hay resultados
    sinResultados.hidden = materialesFiltrados.length > 0;
}

// Guardar un material nuevo o actualizar uno existente
formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    // Leer los datos del formulario
    let nombre = campoNombre.value.trim();
    let categoria = campoCategoria.value;
    let textoCantidad = campoCantidad.value.trim();
    let textoPrecio = campoPrecio.value.trim();

    // Validar nombre
    if (nombre === "") {
        mostrarMensaje("El nombre no puede estar vacío", "error");
        campoNombre.focus();
        return;
    }

    // Validar cantidad vacía
    if (textoCantidad === "") {
        mostrarMensaje("Escribe la cantidad", "error");
        campoCantidad.focus();
        return;
    }

    let cantidad = Number(textoCantidad);

    // Validar cantidad negativa
    if (cantidad < 0) {
        mostrarMensaje("La cantidad no puede ser negativa", "error");
        campoCantidad.focus();
        return;
    }

    // Validar que la cantidad sea entera
    if (!Number.isInteger(cantidad)) {
        mostrarMensaje("La cantidad debe ser un número entero", "error");
        campoCantidad.focus();
        return;
    }

    // Validar precio vacío
    if (textoPrecio === "") {
        mostrarMensaje("Escribe el precio", "error");
        campoPrecio.focus();
        return;
    }

    let precio = Number(textoPrecio);

    // Validar precio negativo
    if (precio < 0) {
        mostrarMensaje("El precio no puede ser negativo", "error");
        campoPrecio.focus();
        return;
    }

    // Actualizar un material existente
    if (idEditando !== null) {
        let material = materiales.find(m => m.id === idEditando);

        if (material) {
            material.nombre = nombre;
            material.categoria = categoria;
            material.cantidad = cantidad;
            material.precio = precio;
        }

        mostrarMensaje("Material actualizado correctamente", "exito");
        idEditando = null;

    } else {
        // Agregar un material nuevo
        materiales.push({
            id: siguienteId,
            nombre: nombre,
            categoria: categoria,
            cantidad: cantidad,
            precio: precio
        });

        siguienteId++;

        mostrarMensaje("Material guardado correctamente", "exito");
    }

    // Guardar los cambios
    guardarDatos();

    // Limpiar el formulario y actualizar la tabla
    formulario.reset();
    campoNombre.focus();
    pintar();
});

// Actualizar la tabla al buscar
buscar.addEventListener("input", pintar);

// Actualizar la tabla al cambiar la categoría
filtroCategoria.addEventListener("change", pintar);

// Actualizar la tabla al cambiar la disponibilidad
filtroEstado.addEventListener("change", pintar);

// Recuperar los datos al abrir la página
cargarDatos();

// Mostrar los materiales
pintar();