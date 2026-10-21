function inicializarInventario() {
    // Arreglo donde se almacenan todos los materiales
    let materiales = [];

    // Siguiente id disponible
    let siguienteId = 1;

    // Guarda el id del material que estamos editando
    let idEditando = null;

    // Referencias a los elementos del HTML del formulario y listado
    let formulario = document.querySelector("#formulario");
    let campoNombre = formulario.elements.nombre;
    let campoCategoria = formulario.elements.categoria;
    let campoCantidad = formulario.elements.cantidad;
    let campoPrecio = formulario.elements.precio;
    let estadoApp = document.querySelector("#estado");
    let lista = document.querySelector("#listaMateriales");
    let sinResultados = document.querySelector("#sinResultados");

    // Elementos para buscar y filtrar en la tabla
    let buscar = document.querySelector("#buscar");
    let filtroCategoria = document.querySelector("#filtroCategoria");
    let filtroEstado = document.querySelector("#filtroEstado");

    // Muestra un mensaje en pantalla (éxito o error)
    function mostrarMensaje(texto, tipo) {
        estadoApp.textContent = texto;
        estadoApp.className = tipo;
    }

    // Calcula si el material está disponible o agotado según su cantidad
    function calcularEstado(material) {
        if (material.cantidad > 0) {
            return "Disponible";
        }
        return "Agotado";
    }

    // Guarda los materiales actuales en el almacenamiento local (localStorage)
    function guardarDatos() {
        let datos = JSON.stringify(materiales);
        localStorage.setItem("materiales", datos);
    }

    // Carga los materiales guardados previamente en localStorage al abrir la página
    function cargarDatos() {
        let datos = localStorage.getItem("materiales");

        if (datos !== null) {
            materiales = JSON.parse(datos);

            // Actualizar el siguiente id disponible para que no se repita
            materiales.forEach(material => {
                if (material.id >= siguienteId) {
                    siguienteId = material.id + 1;
                }
            });
        }
    }

    // Muestra y actualiza los materiales en la tabla aplicando los filtros de búsqueda
    function pintar() {
        lista.replaceChildren();

        // Obtener los valores de búsqueda y filtros seleccionados
        let textoBuscar = buscar.value.toLowerCase().trim();
        let categoriaElegida = filtroCategoria.value;
        let estadoElegido = filtroEstado.value;

        // Filtrar los materiales según los criterios
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

            // Filtrar por disponibilidad (estado)
            let coincideEstado =
                estadoElegido === "" ||
                estadoElegido.toLowerCase() === "todos" ||
                estadoElegido.toLowerCase() === "todas" ||
                calcularEstado(material) === estadoElegido;

            // Se deben cumplir todos los filtros seleccionados
            return coincideNombre && coincideCategoria && coincideEstado;
        });

        // Recorrer solamente los materiales que coinciden con los filtros
        materialesFiltrados.forEach(material => {
            let fila = document.createElement("tr");

            // Datos del material que irán en las celdas
            let textos = [
                material.id,
                material.nombre,
                material.categoria,
                material.cantidad,
                "$" + material.precio.toFixed(2),
                calcularEstado(material)
            ];

            // Crear las celdas de información y agregarlas a la fila
            textos.forEach(texto => {
                let celda = document.createElement("td");
                celda.textContent = texto;
                fila.append(celda);
            });

            // Celda para los botones de acciones (Editar y Eliminar)
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

                    // Limpiar el formulario si se estaba editando justo el elemento borrado
                    if (idEditando === material.id) {
                        formulario.reset();
                        idEditando = null;
                    }

                    guardarDatos();
                    mostrarMensaje("Material eliminado correctamente", "exito");
                    pintar();
                }
            });

            // Agregar los botones a la celda de acciones
            celdaAcciones.append(botonEditar);
            celdaAcciones.append(botonEliminar);

            // Agregar la celda de acciones a la fila
            fila.append(celdaAcciones);

            // Agregar la fila completa a la tabla principal
            lista.append(fila);
        });

        // Mostrar aviso si no hay resultados que mostrar en la tabla
        sinResultados.hidden = materialesFiltrados.length > 0;
    }

    // Evento para guardar un material nuevo o actualizar uno existente mediante el formulario
    formulario.addEventListener("submit", (evento) => {
        evento.preventDefault();

        // Leer los datos ingresados en el formulario
        let nombre = campoNombre.value.trim();
        let categoria = campoCategoria.value;
        let textoCantidad = campoCantidad.value.trim();
        let textoPrecio = campoPrecio.value.trim();

        // Validar que el nombre no esté vacío
        if (nombre === "") {
            mostrarMensaje("El nombre no puede estar vacío", "error");
            campoNombre.focus();
            return;
        }

        // Validar que la cantidad no esté vacía
        if (textoCantidad === "") {
            mostrarMensaje("Escribe la cantidad", "error");
            campoCantidad.focus();
            return;
        }

        let cantidad = Number(textoCantidad);

        // Validar que la cantidad no sea negativa
        if (cantidad < 0) {
            mostrarMensaje("La cantidad no puede ser negativa", "error");
            campoCantidad.focus();
            return;
        }

        // Validar que la cantidad sea un número entero
        if (!Number.isInteger(cantidad)) {
            mostrarMensaje("La cantidad debe ser un número entero", "error");
            campoCantidad.focus();
            return;
        }

        // Validar que el precio no esté vacío
        if (textoPrecio === "") {
            mostrarMensaje("Escribe el precio", "error");
            campoPrecio.focus();
            return;
        }

        let precio = Number(textoPrecio);

        // Validar que el precio no sea negativo
        if (precio < 0) {
            mostrarMensaje("El precio no puede ser negativo", "error");
            campoPrecio.focus();
            return;
        }

        // Si idEditando tiene un valor, actualizamos el material existente
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
            // Si no estamos editando, agregamos un material nuevo al arreglo
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

        // Guardar los cambios actualizados en localStorage
        guardarDatos();

        // Limpiar el formulario, enfocar el campo de nombre y actualizar la tabla
        formulario.reset();
        campoNombre.focus();
        pintar();
    });

    // Actualizar la tabla automáticamente al escribir en el buscador
    buscar.addEventListener("input", pintar);

    // Actualizar la tabla al cambiar el selector de categoría
    filtroCategoria.addEventListener("change", pintar);

    // Actualizar la tabla al cambiar el selector de estado
    filtroEstado.addEventListener("change", pintar);

    // Recuperar los datos guardados al abrir o recargar la página
    cargarDatos();

    // Mostrar los materiales iniciales en la tabla
    pintar();
}



//CONTROL DE VISTAS Y MENÚ DE NAVEGACIÓN

// Estado de la aplicación para saber qué práctica mostrar en pantalla
const estado = {
    vistaActual: "SIME" // Vista por defecto al cargar el sitio
};

// Función para cambiar de vista según el botón que presione el usuario
function cambiarVista(nuevaVista) {
    estado.vistaActual = nuevaVista;
    render(); // Vuelve a renderizar el HTML correspondiente en el contenedor app
}

// Función que resalta visualmente con la clase .activo el botón del menú que está seleccionado
function actualizarMenuVisual() {
    const botones = document.querySelectorAll('nav[name="menu"] button');
    botones.forEach((btn) => {
        if (btn.dataset.vista === estado.vistaActual) {
            btn.classList.add("activo");
        } else {
            btn.classList.remove("activo");
        }
    });
}

// Asignar el evento click al menú de navegación cuando el documento HTML esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
    const menuNav = document.querySelector('nav[name="menu"]');

    if (menuNav) {
        menuNav.addEventListener("click", (e) => {
            // Verificamos que el elemento presionado sea un botón que tenga el atributo data-vista
            if (e.target.tagName === "BUTTON" && e.target.dataset.vista) {
                const vistaSeleccionada = e.target.dataset.vista;
                cambiarVista(vistaSeleccionada);
            }
        });
    }

    // Renderizado inicial al cargar la página por primera vez
    render();
});


//VISTAS

function render() {
    const contenedorApp = document.getElementById("app");
    if (!contenedorApp) return;

    // Evaluamos qué vista mostrar y asignamos el innerHTML correspondiente según la opción elegida
    if (estado.vistaActual === "practica1") {
        contenedorApp.innerHTML = `
            <h2>Vista 1: Notas Rápidas</h2>
            <p>Contenido de la Práctica 1</p>
            <form>
                <input placeholder="Título de la nota" />
                <textarea placeholder="Escribe tu nota..."></textarea>
                <button type="submit">Guardar</button>
            </form>
        `;
    } 
    else if (estado.vistaActual === "practica2") {
        contenedorApp.innerHTML = `
            <h2>Vista 2: Lista de Tareas</h2>
            <p>Contenido de la Práctica 2</p>
            <input placeholder="Nueva tarea" />
            <button>Agregar Tarea</button>
        `;
    } 
    else if (estado.vistaActual === "SIME") {
        contenedorApp.innerHTML = `
            <header style="margin-bottom: 25px;">
                <p class="eyebrow">Proyecto Local Storage SIME</p>
                <h1>Inventario actual de materiales escolares</h1>
            </header>

            <!-- Estadísticas -->
            <section class="indicadores">
                <div class="indicador">
                    <span>Total de productos</span>
                    <strong id="totalProductos">0</strong>
                </div>

                <div class="indicador">
                    <span>Total de unidades</span>
                    <strong id="totalUnidades">0</strong>
                </div>

                <div class="indicador">
                    <span>Agotados</span>
                    <strong id="totalAgotados">0</strong>
                </div>

                <div class="indicador">
                    <span>Valor del inventario</span>
                    <strong id="valorInventario">$0.00</strong>
                </div>
            </section>

            <div class="contenido">
                <!-- Formulario de alta y edición -->
                <section class="registro">
                    <h2>Material</h2>

                    <form id="formulario" novalidate>
                        <label for="nombre">Nombre</label>
                        <input id="nombre" name="nombre" type="text" placeholder="Ej. Cuaderno" required>

                        <label for="categoria">Categoría</label>
                        <select id="categoria" name="categoria" required>
                            <option value="Papelería">Papelería</option>
                            <option value="Tecnología">Tecnología</option>
                            <option value="Limpieza">Limpieza</option>
                            <option value="Otros">Otros</option>
                        </select>

                        <label for="cantidad">Cantidad</label>
                        <input id="cantidad" name="cantidad" type="number" min="0" step="1" placeholder="0" required>

                        <label for="precio">Precio (MXN)</label>
                        <input id="precio" name="precio" type="number" min="0" step="0.01" placeholder="0.00" required>

                        <button id="guardarMaterial" type="submit">Guardar material</button>
                        <button id="cancelarEdicion" type="button" hidden>Cancelar edición</button>
                    </form>

                    <!-- Lo usare para mensajes de error y éxito -->
                    <p id="estado" role="status" ></p>
                </section>

                <!-- Búsqueda, filtros y tabla -->
                <section class="listado">
                    <h2>Materiales registrados</h2>

                    <div class="filtros">
                        <label for="buscar">Buscar por nombre</label>
                        <input id="buscar" type="search" placeholder="Buscar...">

                        <label for="filtroCategoria">Categoría</label>
                        <select id="filtroCategoria">
                            <option value="todas">Todas</option>
                            <option value="Papelería">Papelería</option>
                            <option value="Tecnología">Tecnología</option>
                            <option value="Limpieza">Limpieza</option>
                            <option value="Otros">Otros</option>
                        </select>

                        <label for="filtroEstado">Estado</label>
                        <select id="filtroEstado">
                            <option value="todos">Todos</option>
                            <option value="Disponible">Disponible</option>
                            <option value="Agotado">Agotado</option>
                        </select>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Categoría</th>
                                <th>Cantidad</th>
                                <th>Precio</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <!-- Las filas se crearan desde JavaScript -->
                        <tbody id="listaMateriales"></tbody>
                    </table>

                    <p id="sinResultados" hidden>No hay materiales que mostrar.</p>
                </section>
            </div>

            <!-- será la confirmación para eliminar-->
            <dialog id="dialogoEliminar">
                <p id="textoConfirmacion"></p>
                <button id="confirmarEliminar" type="button">Eliminar</button>
                <button id="cancelarEliminar" type="button">Cancelar</button>
            </dialog>
        `;

        // Una vez que se dibuja el HTML de SIME en pantalla, inicializamos la lógica de su inventario
        inicializarInventario();
    }

    // Actualizamos el estado visual de los botones del menú (clase .activo)
    actualizarMenuVisual();
}