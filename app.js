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
    let botonCancelarEdicion = document.querySelector("#cancelarEdicion");
    let botonGuardarMaterial = document.querySelector("#guardarMaterial");
    let estadoApp = document.querySelector("#estado");
    let lista = document.querySelector("#listaMateriales");
    let sinResultados = document.querySelector("#sinResultados");

    // Elementos para buscar y filtrar en la tabla
    let buscar = document.querySelector("#buscar");
    let filtroCategoria = document.querySelector("#filtroCategoria");
    let filtroEstado = document.querySelector("#filtroEstado");

    // Elementos para las estadísticas (indicadores)
    let totalProductos = document.querySelector("#totalProductos");
    let totalUnidades = document.querySelector("#totalUnidades");
    let totalAgotados = document.querySelector("#totalAgotados");
    let valorInventario = document.querySelector("#valorInventario");

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

    // Calcula y muestra los indicadores superiores y el valor del inventario
    function actualizarIndicadores() {
        let sumaUnidades = 0;
        let contadorAgotados = 0;
        let sumaValor = 0;

        // Recorrer todos los materiales para hacer las sumas
        materiales.forEach(material => {
            // Sumar la cantidad de unidades de cada material
            sumaUnidades = sumaUnidades + material.cantidad;

            // Multiplicar cantidad por precio y sumarlo al valor total
            sumaValor = sumaValor + (material.cantidad * material.precio);

            // Si la cantidad es 0, aumentar el contador de agotados
            if (material.cantidad === 0) {
                contadorAgotados++;
            }
        });

        // Mostrar los resultados en el HTML
        totalProductos.textContent = materiales.length;
        totalUnidades.textContent = sumaUnidades;
        totalAgotados.textContent = contadorAgotados;
        valorInventario.textContent = "$" + sumaValor.toFixed(2);
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
                botonCancelarEdicion.hidden = false;
                botonGuardarMaterial.textContent = "Guardar cambios";

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
                        botonCancelarEdicion.hidden = true;
                        botonGuardarMaterial.textContent = "Guardar material";
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

        // Mostrar aviso si no hay resultados que mostrar en la tabla
        sinResultados.hidden = materialesFiltrados.length > 0;

        // Actualizar los indicadores superiores
        actualizarIndicadores();
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
        botonCancelarEdicion.hidden = true;
        botonGuardarMaterial.textContent = "Guardar material";
        campoNombre.focus();
        pintar();
    });

    // Actualizar la tabla automáticamente al escribir en el buscador
    buscar.addEventListener("input", pintar);

    // Actualizar la tabla al cambiar el selector de categoría
    filtroCategoria.addEventListener("change", pintar);

    // Actualizar la tabla al cambiar el selector de estado
    filtroEstado.addEventListener("change", pintar);

    // Cancelar una edición y limpiar el formulario
    botonCancelarEdicion.addEventListener("click", () => {
        formulario.reset();
        idEditando = null;
        botonCancelarEdicion.hidden = true;
        botonGuardarMaterial.textContent = "Guardar material";
        mostrarMensaje("Edición cancelada", "exito");
        campoNombre.focus();
    });

    // Recuperar los datos guardados al abrir o recargar la página
    cargarDatos();

    // Mostrar los materiales iniciales en la tabla
    pintar();
}




// CONTROL DE VISTAS DEL PROYECTO
const estadoVistas = { vistaActual: "SIME", vistaProyectos: "inicio" };
const contenedorApp = document.querySelector("#app");
const botonesMenu = document.querySelectorAll('nav[name="menu"] button');

botonesMenu.forEach((boton) => {
    boton.addEventListener("click", () => {
        estadoVistas.vistaActual = boton.dataset.vista;
        render();
    });
});

function actualizarMenuVisual() {
    botonesMenu.forEach((boton) => {
        boton.classList.toggle("activo", boton.dataset.vista === estadoVistas.vistaActual);
    });
}

function render() {
    if (!contenedorApp) return;
    actualizarMenuVisual();

    if (estadoVistas.vistaActual === "SIME") {
        renderSIME();
    } else if (estadoVistas.vistaActual === "practica1") {
        renderListaTareas();
    } else if (estadoVistas.vistaActual === "practica2") {
        renderTablero();
    } else if (estadoVistas.vistaActual === "practica3") {
        renderCarrito();
    } else if (estadoVistas.vistaActual === "practica4") {
        renderGestorProyectos();
    } else if (estadoVistas.vistaActual === "practica5") {
        renderNomina();
    } else if (estadoVistas.vistaActual === "practica6") {
        renderEncuesta();
    } else if (estadoVistas.vistaActual === "practica7") {
        renderPromedio();
    } else if (estadoVistas.vistaActual === "practica8") {
        renderDescuentos();
    } else if (estadoVistas.vistaActual === "examen") {
        renderContador();
    } else if (estadoVistas.vistaActual === "videos") {
    renderVideos();
}
}

// VISTA PRINCIPAL: SIME
function renderSIME() {
    contenedorApp.innerHTML = `
        <header class="vista-header">
            <p class="eyebrow">Proyecto Local Storage SIME</p>
            <h1>Inventario actual de materiales escolares</h1>
        </header>
        <section class="indicadores">
            <div class="indicador"><span>Total de productos</span><strong id="totalProductos">0</strong></div>
            <div class="indicador"><span>Total de unidades</span><strong id="totalUnidades">0</strong></div>
            <div class="indicador"><span>Agotados</span><strong id="totalAgotados">0</strong></div>
            <div class="indicador"><span>Valor del inventario</span><strong id="valorInventario">$0.00</strong></div>
        </section>
        <div class="contenido">
            <section class="registro">
                <h2>Material</h2>
                <form id="formulario" novalidate>
                    <label for="nombre">Nombre</label>
                    <input id="nombre" name="nombre" type="text" placeholder="Ej. Cuaderno" required>
                    <label for="categoria">Categoría</label>
                    <select id="categoria" name="categoria" required>
                        <option value="Papelería">Papelería</option><option value="Tecnología">Tecnología</option>
                        <option value="Limpieza">Limpieza</option><option value="Otros">Otros</option>
                    </select>
                    <label for="cantidad">Cantidad</label>
                    <input id="cantidad" name="cantidad" type="number" min="0" step="1" placeholder="0" required>
                    <label for="precio">Precio (MXN)</label>
                    <input id="precio" name="precio" type="number" min="0" step="0.01" placeholder="0.00" required>
                    <button id="guardarMaterial" type="submit">Guardar material</button>
                    <button id="cancelarEdicion" type="button" hidden>Cancelar edición</button>
                </form>
                <p id="estado" role="status"></p>
            </section>
            <section class="listado">
                <h2>Materiales registrados</h2>
                <div class="filtros">
                    <label for="buscar">Buscar por nombre</label><input id="buscar" type="search" placeholder="Buscar...">
                    <label for="filtroCategoria">Categoría</label>
                    <select id="filtroCategoria"><option value="todas">Todas</option><option value="Papelería">Papelería</option><option value="Tecnología">Tecnología</option><option value="Limpieza">Limpieza</option><option value="Otros">Otros</option></select>
                    <label for="filtroEstado">Estado</label>
                    <select id="filtroEstado"><option value="todos">Todos</option><option value="Disponible">Disponible</option><option value="Agotado">Agotado</option></select>
                </div>
                <div class="tabla-contenedor"><table><thead><tr><th>ID</th><th>Nombre</th><th>Categoría</th><th>Cantidad</th><th>Precio</th><th>Estado</th><th>Acciones</th></tr></thead><tbody id="listaMateriales"></tbody></table></div>
                <p id="sinResultados" hidden>No hay materiales que mostrar.</p>
            </section>
        </div>`;
    inicializarInventario();
}

// PRÁCTICA 1: LISTA DE TAREAS PERSISTENTE
function renderListaTareas() {
    let tareas = JSON.parse(localStorage.getItem("listaTareas")) || [];
    let formulario;
    let completados = Number(localStorage.getItem("tareasCompletadas")) || 0;
    let pendientes = Math.max(0, tareas.length - completados);

    // La vista se construye con innerHTML, igual que las otras vistas del proyecto.
    contenedorApp.innerHTML = `
        <section class="vista-card">
            <h1>Práctica 1: Lista de tareas persistente</h1>
            <form id="formularioTareas" class="form-fila">
                <input type="text" id="tarea" name="tarea" placeholder="Escribe una tarea" required>
                <button type="submit">Agregar tarea</button>
            </form>
            <div>
                <p>Total: <strong id="totalTareas">0</strong></p>
                <p>Pendientes: <strong id="pendiente">0</strong></p>
                <p>Completadas: <strong id="completada">0</strong></p>
            </div>
            <ul id="listaTareas" class="lista-simple"></ul>
        </section>
    `;

    formulario = document.querySelector("#formularioTareas");

    function guardar() {
        localStorage.setItem("listaTareas", JSON.stringify(tareas));
        localStorage.setItem("tareasCompletadas", completados);
    }

    function pintar() {
        document.querySelector("#listaTareas").replaceChildren();
        document.querySelector("#totalTareas").textContent = tareas.length;
        document.querySelector("#completada").textContent = completados;
        document.querySelector("#pendiente").textContent = pendientes;

        tareas.forEach((tarea, indice) => {
            let elemento = document.createElement("li");
            elemento.innerHTML = `<span></span><br><button type="button" ${tarea.startsWith(">>") ? "disabled" : ""}>Completar</button><button type="button">Eliminar</button>`;
            elemento.querySelector("span").textContent = tarea;

            elemento.querySelectorAll("button")[0].addEventListener("click", () => {
                // Completa la tarea de la lista.
                tareas[indice] = `>> ${tarea}`;
                completados++;
                pendientes--;
                document.querySelector("#completada").textContent = completados;
                document.querySelector("#pendiente").textContent = pendientes;
                guardar();
                pintar();
            });

            elemento.querySelectorAll("button")[1].addEventListener("click", () => {
                // Elimina la tarea de la lista.
                if (!tarea.startsWith(">>")) {
                    pendientes = Math.max(0, pendientes - 1);
                } else {
                    completados = Math.max(0, completados - 1);
                }
                tareas.splice(indice, 1);
                guardar();
                pintar();
            });

            document.querySelector("#listaTareas").appendChild(elemento);
        });
    }

    formulario.addEventListener("submit", (evento) => {
        evento.preventDefault();
        let tarea = document.querySelector("#tarea").value;
        tareas.push(tarea);
        pendientes++;
        guardar();
        pintar();
        formulario.reset();
    });

    pintar();
}

// PRÁCTICA 2: TABLERO DE ACTIVIDADES
function renderTablero() {
    let tarjetas = JSON.parse(localStorage.getItem("tableroKanban") || "[]");
    let tarjetaEnEdicion = null;

    contenedorApp.innerHTML = `
        <section class="vista-card">
            <h1>Práctica 2: Tablero de actividades</h1>
            <p class="eyebrow">Ejercicio Tablero de Actividades</p>
            <form id="formularioTablero" class="form-fila">
                <input type="text" name="titulo" placeholder="Nueva actividad" required>
                <select name="estado">
                    <option value="pendiente">Pendiente</option>
                    <option value="proceso">En proceso</option>
                    <option value="terminado">Terminado</option>
                </select>
                <button type="submit">Agregar</button>
                <button type="button" id="cancelarEdicion" hidden>Cancelar edición</button>
            </form>
            <section class="tablero">
                <div><h2>Pendiente</h2><section id="pendiente"></section></div>
                <div><h2>En proceso</h2><section id="proceso"></section></div>
                <div><h2>Terminado</h2><section id="terminado"></section></div>
            </section>
        </section>
    `;

    let formulario = document.querySelector("#formularioTablero");
    let botonCancelar = document.querySelector("#cancelarEdicion");

    function guardar() {
        // Guarda el tablero completo para conservar sus columnas.
        localStorage.setItem("tableroKanban", JSON.stringify(tarjetas));
    }

    function pintar() {
        ["pendiente", "proceso", "terminado"].forEach((estado) => {
            document.querySelector(`#${estado}`).replaceChildren();
        });

        tarjetas.forEach((tarjeta, indice) => {
            let contenedor = document.querySelector(`#${tarjeta.estado}`);
            let elemento = document.createElement("article");
            elemento.className = "tarjeta";
            elemento.innerHTML = "<span></span><br><button type=\"button\">Avanzar</button><button type=\"button\">Retroceder</button><button type=\"button\">Editar</button><button type=\"button\">Eliminar</button>";
            elemento.querySelector("span").textContent = tarjeta.titulo;

            elemento.querySelectorAll("button")[0].addEventListener("click", () => {
                // Avanza a la siguiente tarjeta.
                let estados = ["pendiente", "proceso", "terminado"];
                tarjeta.estado = estados[Math.min(estados.indexOf(tarjeta.estado) + 1, 2)];
                guardar();
                pintar();
            });

            elemento.querySelectorAll("button")[1].addEventListener("click", () => {
                // Retrocede a la tarjeta anterior.
                let estados = ["pendiente", "proceso", "terminado"];
                tarjeta.estado = estados[Math.max(estados.indexOf(tarjeta.estado) - 1, 0)];
                guardar();
                pintar();
            });

            elemento.querySelectorAll("button")[2].addEventListener("click", () => {
                // Edita la tarjeta del tablero.
                tarjetaEnEdicion = tarjeta;
                formulario.elements.titulo.value = tarjeta.titulo;
                formulario.elements.estado.value = tarjeta.estado;
                botonCancelar.hidden = false;
            });

            elemento.querySelectorAll("button")[3].addEventListener("click", () => {
                // Elimina la tarjeta del tablero.
                tarjetas.splice(indice, 1);
                if (tarjetaEnEdicion === tarjeta) cancelarEdicion();
                guardar();
                pintar();
            });

            contenedor.append(elemento);
        });
    }

    formulario.addEventListener("submit", (evento) => {
        // Crea una tarjeta en la columna seleccionada.
        evento.preventDefault();
        const datosFormulario = Object.fromEntries(new FormData(evento.target));

        if (tarjetaEnEdicion) {
            tarjetaEnEdicion.titulo = datosFormulario.titulo;
            tarjetaEnEdicion.estado = datosFormulario.estado;
        } else {
            tarjetas.push(datosFormulario);
        }

        guardar();
        cancelarEdicion();
        pintar();
    });

    function cancelarEdicion() {
        tarjetaEnEdicion = null;
        formulario.reset();
        botonCancelar.hidden = true;
    }

    botonCancelar.addEventListener("click", cancelarEdicion);
    cancelarEdicion();
    pintar();
}

// PRÁCTICA 3: CARRITO DE COMPRAS
function renderCarrito() {
    // Catálogo fijo de productos almacenados en un arreglo.
    let producto = [
        { id: 1, nombre: "Libro JS", precio: 450 },
        { id: 2, nombre: "Libro PHP", precio: 5000000 },
        { id: 3, nombre: "Libro CSS", precio: 25000 }
    ];

    // Se intenta leer el carrito o se crea uno nuevo.
    let carrito;
    try {
        carrito = JSON.parse(localStorage.getItem("carritoVersionado")) || {
            version: 1,
            productos: [],
            actualizado: Date.now()
        };
    } catch (error) {
        carrito = { version: 1, productos: [], actualizado: Date.now() };
    }

    // Garantiza que los datos antiguos tengan la estructura correcta.
    if (!carrito.version) {
        carrito = {
            version: 1,
            productos: carrito.productos || [],
            actualizado: Date.now()
        };
    }

    contenedorApp.innerHTML = `
        <section class="vista-card">
            <h1>Práctica 3: Carrito de compras</h1>
            <p id="estadoCarrito"></p>
            <section id="productos" class="tarjetas-producto"></section>
            <h2 id="totalCarrito"></h2>
            <button type="button" id="vaciar">Vaciar carrito</button>
        </section>
    `;

    function guardar() {
        // Actualiza la fecha y guarda el carrito.
        carrito.actualizado = Date.now();
        localStorage.setItem("carritoVersionado", JSON.stringify(carrito));
    }

    function pintar() {
        // Muestra el catálogo de productos.
        let contenedor = document.querySelector("#productos");
        contenedor.replaceChildren();

        producto.forEach((producto) => {
            let item = document.createElement("article");
            item.className = "tarjeta";
            item.innerHTML = `<h2>${producto.nombre}</h2><p>Precio: $${producto.precio}</p><button type="button">Agregar</button>`;
            item.querySelector("button").addEventListener("click", () => {
                // Incrementa una línea de producto o crea una nueva en localStorage.
                let existente = carrito.productos.find((p) => p.id === producto.id);
                existente
                    ? existente.cantidad++
                    : carrito.productos.push({ ...producto, cantidad: 1 });
                guardar();
                mostrarTotal();
            });
            contenedor.append(item);
        });

        mostrarTotal();
    }

    function mostrarTotal() {
        // Suma el precio por cantidad y actualiza la información.
        let total = carrito.productos.reduce(
            (suma, item) => suma + item.precio * item.cantidad,
            0
        );
        document.querySelector("#totalCarrito").textContent = `Total: $${total}`;
        document.querySelector("#estadoCarrito").textContent = `Versión: ${carrito.version} · ${carrito.productos.length} productos`;
    }

    document.querySelector("#vaciar").addEventListener("click", () => {
        // Conserva la estructura del carrito y solo vacía los productos.
        carrito.productos = [];
        guardar();
        mostrarTotal();
    });

    pintar();
}

// PRÁCTICA 4: GESTOR DE PROYECTOS CON LOCALSTORAGE
function renderGestorProyectos() {
    const clave = "aplicacionProyectos";
    const valoresIniciales = { proyectos: [], vista: "inicio" };
    let estadoProyectos = JSON.parse(localStorage.getItem(clave)) || valoresIniciales;

    contenedorApp.innerHTML = `
        <section class="vista-card">
            <h1>Práctica 4: Gestor de proyectos</h1>
            <nav class="subnav">
                <button type="button" data-subvista="inicio">Inicio</button>
                <button type="button" data-subvista="proyectos">Proyectos</button>
                <button type="button" data-subvista="ajustes">Ajustes</button>
            </nav>
            <section id="contenidoProyectos"></section>
        </section>
    `;

    const contenido = document.querySelector("#contenidoProyectos");

    function guardar() {
        localStorage.setItem(clave, JSON.stringify(estadoProyectos));
    }

    function pintar(contenedor = contenido) {
        estadoProyectos.proyectos.forEach((proyecto, indice) => {
            const elemento = document.createElement("article");
            elemento.className = "tarjeta";
            elemento.innerHTML = `<h3></h3><p></p><button type="button" class="boton-borrar">Eliminar</button>`;
            elemento.querySelector("h3").textContent = `Nombre: ${proyecto.nombre}`;
            elemento.querySelector("p").textContent = `Descripción: ${proyecto.descripcion}`;
            elemento.querySelector("button").addEventListener("click", () => {
                // Elimina el proyecto seleccionado y actualiza los datos guardados.
                estadoProyectos.proyectos.splice(indice, 1);
                guardar();
                mostrarVista();
            });
            contenedor.append(elemento);
        });
    }

    function mostrarVista() {
        contenido.innerHTML = "";

        if (estadoProyectos.vista === "inicio") {
            const titulo = document.createElement("h2");
            titulo.textContent = "Resumen";
            const contador = document.createElement("p");
            contador.textContent = `Proyectos: ${estadoProyectos.proyectos.length}`;
            contenido.append(titulo, contador);
        } else if (estadoProyectos.vista === "proyectos") {
            const formulario = document.createElement("form");
            formulario.id = "formularioProyecto";
            formulario.className = "form-columna";
            formulario.innerHTML = `
                <label for="nombreProyecto">Nombre del proyecto</label>
                <input type="text" id="nombreProyecto" placeholder="Nombre del proyecto" required>
                <label for="descripcionProyecto">Descripción</label>
                <textarea id="descripcionProyecto" placeholder="Descripción del proyecto" required></textarea>
                <button type="submit">Crear proyecto</button>
            `;
            formulario.addEventListener("submit", (evento) => {
                evento.preventDefault();
                const nombre = formulario.querySelector("#nombreProyecto").value.trim();
                const descripcion = formulario.querySelector("#descripcionProyecto").value.trim();
                if (!nombre || !descripcion) return;
                estadoProyectos.proyectos.push({ nombre, descripcion, estado: "activo" });
                guardar();
                mostrarVista();
            });
            contenido.append(formulario);
            pintar(contenido);
        } else if (estadoProyectos.vista === "ajustes") {
            const mensaje = document.createElement("p");
            mensaje.style.display = "none";
            mensaje.style.color = "#16a34a";
            const boton = document.createElement("button");
            boton.type = "button";
            boton.className = "boton-borrar";
            boton.textContent = "Borrar todos los proyectos";
            contenido.innerHTML = "<h2>Ajustes</h2><p>Los datos se almacenan en localStorage.</p>";
            boton.addEventListener("click", () => {
                // Vacía la lista y guarda los cambios.
                estadoProyectos.proyectos = [];
                guardar();
                mensaje.textContent = "Todos los proyectos han sido eliminados.";
                mensaje.style.display = "block";
            });
            contenido.append(boton, mensaje);
        }

        document.querySelectorAll("[data-subvista]").forEach((boton) => {
            boton.classList.toggle("activo", boton.dataset.subvista === estadoProyectos.vista);
        });
    }

    document.querySelectorAll("[data-subvista]").forEach((boton) => {
        boton.addEventListener("click", () => {
            estadoProyectos.vista = boton.dataset.subvista;
            guardar();
            mostrarVista();
        });
    });

    mostrarVista();
}

// PRÁCTICA 5: NÓMINA SEMANAL
function renderNomina() {
    let info = JSON.parse(localStorage.getItem("info")) || [];

    contenedorApp.innerHTML = `
        <section class="vista-card">
            <h1>Práctica 5: Nómina semanal</h1>
            <form id="formularioNomina" class="form-columna">
                <label for="nombreNomina">Nombre:</label>
                <input type="text" id="nombreNomina" required>
                <label for="horasNomina">Horas trabajadas:</label>
                <input type="number" id="horasNomina" min="1" required>
                <label for="pagoHoraNomina">Pago por hora:</label>
                <input type="number" id="pagoHoraNomina" min="0" step="0.01" required>
                <button type="submit">Calcular pago</button>
            </form>
            <h2>Resultado</h2>
            <div id="resultadoNomina">
                <p id="resultadoNombre"></p>
                <p id="resultadoHoras"></p>
                <p id="resultadoHorasExtra"></p>
                <p id="resultadoTotal"></p>
            </div>
        </section>
    `;

    const formulario = document.querySelector("#formularioNomina");
    const resNombre = document.querySelector("#resultadoNombre");
    const resHoras = document.querySelector("#resultadoHoras");
    const resHorasExtra = document.querySelector("#resultadoHorasExtra");
    const resTotal = document.querySelector("#resultadoTotal");

    formulario.addEventListener("submit", function(evento) {
        evento.preventDefault();

        const nombre = document.querySelector("#nombreNomina").value;
        const horas = Number(document.querySelector("#horasNomina").value);
        const pagoHoras = Number(document.querySelector("#pagoHoraNomina").value);

        let horasNormales = 0;
        let horasExtras = 0;
        let pagoTotal = 0;

        if (horas <= 40) {
            horasNormales = horas;
            pagoTotal = horasNormales * pagoHoras;
        } else {
            horasNormales = 40;
            horasExtras = horas - 40;
            pagoTotal = (pagoHoras * 40) + (pagoHoras * 1.50) * horasExtras;
        }

        resNombre.textContent = `Nombre: ${nombre}`;
        resHoras.textContent = `Horas Normales: ${horasNormales}`;
        resHorasExtra.textContent = `Horas Extra: $${horasExtras}`;
        resTotal.textContent = `Total a pagar: $${pagoTotal.toFixed(2)}`;

        info.push({
            nombre: nombre,
            horasNormales: horasNormales,
            horasExtras: horasExtras,
            pagoTotal: pagoTotal.toFixed(2)
        });
        guardar();
    });

    function guardar() {
        localStorage.setItem("info", JSON.stringify(info));
    }
}

// PRÁCTICA 6: ENCUESTA DEL CURSO
function renderEncuesta() {
    let datos = JSON.parse(localStorage.getItem("datosEncuesta")) || [];

    contenedorApp.innerHTML = `
        <section class="vista-card">
            <h1>Práctica 6: Encuesta del curso</h1>
            <form id="formularioEncuesta" class="form-columna">
                <label for="nombreEncuesta">Nombre</label>
                <input type="text" id="nombreEncuesta" name="nombre" required>
                <label for="grupoEncuesta">Grupo</label>
                <input type="text" id="grupoEncuesta" name="grupo" required>
                <label for="cursoEncuesta">Tema favorito</label>
                <select id="cursoEncuesta" name="curso" required>
                    <option value="">Seleccione un tema</option>
                    <option value="tema1">Variables</option>
                    <option value="tema2">Ciclos</option>
                    <option value="tema3">POO</option>
                </select>
                <label>Calificación</label>
                <div class="opciones-radio">
                    <label><input type="radio" name="calificacion" value="1" required> 1</label>
                    <label><input type="radio" name="calificacion" value="2"> 2</label>
                    <label><input type="radio" name="calificacion" value="3"> 3</label>
                    <label><input type="radio" name="calificacion" value="4"> 4</label>
                    <label><input type="radio" name="calificacion" value="5"> 5</label>
                </div>
                <label for="comentariosEncuesta">Comentarios</label>
                <textarea id="comentariosEncuesta" name="comentarios" rows="4" placeholder="Comentarios"></textarea>
                <button type="submit">Enviar encuesta</button>
            </form>
            <section id="resultadosEncuesta">
                <h2>Resultados de la encuesta</h2>
                <ul id="lista-resultados" class="lista-simple"></ul>
            </section>
        </section>
    `;

    let formulario = document.querySelector("#formularioEncuesta");

    formulario.addEventListener("submit", function(evento) {
        evento.preventDefault();
        let nombre = document.querySelector("#nombreEncuesta").value;
        let grupo = document.querySelector("#grupoEncuesta").value;
        let curso = document.querySelector("#cursoEncuesta").value;
        let calificacion = document.querySelector('input[name="calificacion"]:checked').value;
        let comentarios = document.querySelector("#comentariosEncuesta").value;

        let datosFormulario = {
            nombre: nombre,
            grupo: grupo,
            curso: curso,
            calificacion: calificacion,
            comentarios: comentarios
        };

        datos.push(datosFormulario);
        guardar();
        formulario.reset();
        pintar();
    });

    function guardar() {
        localStorage.setItem("datosEncuesta", JSON.stringify(datos));
    }

    function pintar() {
        let listaResultados = document.querySelector("#lista-resultados");
        listaResultados.innerHTML = "";

        datos.forEach(function(dato) {
            let li = document.createElement("li");
            li.textContent = `Nombre: ${dato.nombre}, Grupo: ${dato.grupo}, Tema: ${dato.curso}, Calificación: ${dato.calificacion}, Comentarios: ${dato.comentarios}`;
            listaResultados.append(li);
        });
    }

    pintar();
}

// PRÁCTICA 7: PROMEDIO DE TRES CALIFICACIONES
function renderPromedio() {
    contenedorApp.innerHTML=`<section class="vista-card"><h1>Práctica 7: Promedio de tres calificaciones</h1>
        <form id="formPromedio" class="form-columna"><label>Nombre del alumno</label><input id="promNombre" required>
        <label>Primera calificación</label><input id="cal1" type="number" min="0" max="100" step="0.1" required>
        <label>Segunda calificación</label><input id="cal2" type="number" min="0" max="100" step="0.1" required>
        <label>Tercera calificación</label><input id="cal3" type="number" min="0" max="100" step="0.1" required>
        <button type="submit">Calcular promedio</button></form><p id="resultadoPromedio" role="status"></p></section>`;
    document.querySelector("#formPromedio").addEventListener("submit",e=>{
        e.preventDefault();const nombre=document.querySelector("#promNombre").value.trim();
        const notas=[Number(document.querySelector("#cal1").value),Number(document.querySelector("#cal2").value),Number(document.querySelector("#cal3").value)];
        if(!nombre || notas.some(n=>n<0||n>100)) return;
        const promedio=notas.reduce((a,b)=>a+b,0)/3;
        document.querySelector("#resultadoPromedio").textContent=`Alumno: ${nombre}. Promedio: ${promedio.toFixed(2)} - ${promedio>=70?"Aprobado":"No aprobado"}`;
    });
}

// PRÁCTICA 8: CÁLCULO DE DESCUENTOS
function renderDescuentos() {
    contenedorApp.innerHTML=`<section class="vista-card"><h1>Práctica 8: Cálculo de descuentos</h1>
        <form id="formDescuento" class="form-columna"><label>Nombre del producto</label><input id="descProducto" required>
        <label>Precio de compra (MXN)</label><input id="descPrecio" type="number" min="0" step="0.01" required>
        <label>Descuento (%)</label><input id="descPorcentaje" type="number" min="0" max="100" step="1" required>
        <button type="submit">Calcular total</button></form><p id="resultadoDescuento" role="status"></p></section>`;
    document.querySelector("#formDescuento").addEventListener("submit",e=>{
        e.preventDefault();const nombre=document.querySelector("#descProducto").value.trim();const precio=Number(document.querySelector("#descPrecio").value);const porcentaje=Number(document.querySelector("#descPorcentaje").value);
        if(!nombre||document.querySelector("#descPrecio").value===""||document.querySelector("#descPorcentaje").value===""||precio<0||porcentaje<0||porcentaje>100)return;
        const descuento=precio*porcentaje/100;const total=precio-descuento;
        document.querySelector("#resultadoDescuento").textContent=`Producto: ${nombre} · Descuento: $${descuento.toFixed(2)} · Total a pagar: $${total.toFixed(2)}`;
    });
}

// EXAMEN: CONTADOR PERSISTENTE
function renderContador() {
    const clave = "contadorExamen";
    // Carga el contador guardado en localStorage.
    let datos = JSON.parse(localStorage.getItem(clave)) || 0;
    let contador = datos;

    contenedorApp.innerHTML = `
        <section class="vista-card">
            <h1>Examen: Contador persistente</h1>
            <form id="formularioContador">
                <p id="cantidad"></p>
                <button type="submit">Aumentar</button>
                <button type="button" id="reiniciar">Reiniciar</button>
            </form>
        </section>
    `;

    const formulario = document.querySelector("#formularioContador");

    // Guarda los datos en localStorage.
    function guardar() {
        localStorage.setItem(clave, JSON.stringify(contador));
    }

    // Cuando se presiona, aumenta en uno el contador.
    formulario.addEventListener("submit", function(evento) {
        evento.preventDefault();
        contador = contador + 1;
        document.querySelector("#cantidad").innerHTML = `Cantidad de clicks: ${contador}`;
        guardar();
    });

    // Cuando se presiona, reinicia el contador.
    document.querySelector("#reiniciar").addEventListener("click", function() {
        contador = 0;
        document.querySelector("#cantidad").innerHTML = `Cantidad de clicks: ${contador}`;
        guardar();
    });

    // Pinta la cantidad al iniciar.
    function cargar() {
        document.querySelector("#cantidad").innerHTML = `Cantidad de clicks: ${contador}`;
    }

    cargar();
}

// VIDEOS SIME 
function renderVideos() {
    contenedorApp.innerHTML = `
        <h2>Videos tutoriales de SIME</h2>

        <h3>Video 1</h3>
        <iframe width="560" height="315" src="https://www.youtube.com/embed/ixDox8xmkZk?si=4HDabfruOpJaJWXC" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        <h3>Video 2</h3>
        <iframe width="560" height="315" src="https://www.youtube.com/embed/KS4ucnU0ky0?si=rirqwrJ37OxfadSF" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        <h3>Video 3</h3>
        <iframe width="560" height="315" src="https://www.youtube.com/embed/ZT453nePyvI?si=ipguhKcEIp8Jic-U" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

        <h3>Video 4</h3>
        <iframe src="https://www.youtube.com/embed/ID_VIDEO_4"
            width="400" height="225" allowfullscreen></iframe>
    `;
}

document.addEventListener("DOMContentLoaded", render);
