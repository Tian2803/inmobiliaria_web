const tablaProductos = document.getElementById("tablaProductos");
let productosGlobales = [];
let paginaActual = 0;
let totalPaginas = 0;
const sortHelper = new SortHelper("codigo");

function obtenerProductos(pagina = 0) {
  const url = `http://localhost:8080/api/producto/listar?page=${pagina}&size=20&${sortHelper.getParams()}`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      // La API devuelve una respuesta paginada (objeto con 'content')
      const lista = Array.isArray(data) ? data : data.content || [];
      productosGlobales = lista;

      // Guardar información de paginación
      if (!Array.isArray(data)) {
        paginaActual = data.number || 0;
        totalPaginas = data.totalPages || 1;
      }

      renderizarProductos(productosGlobales);
      actualizarControlesPaginacion();
    })
    .catch((error) => console.error("Error:", error));
}

function renderizarProductos(productos) {
  if (!tablaProductos) return;

  tablaProductos.innerHTML = productos
    .map(
      (producto) =>
        `<tr>
          <td>${producto.codigo || ""}</td>
          <td>${producto.nombre || ""}</td>
          <td>${producto.descripcion || ""}</td>
          <td>${producto.marca || ""}</td>
          <td>${producto.categoria?.nombre || producto.categoria || ""}</td>
          <td>$${producto.precio || ""}</td>
          <td style="text-align: center;">
            <button class="edit-button" onclick="editarProducto(${
              producto.id
            })" title="Editar"><i class="bi bi-pencil-square"></i></button>
            <button class="delete-button" onclick="eliminarProducto(${
              producto.id
            })" title="Eliminar"><i class="bi bi-trash-fill"></i></button>
            </td>
            </tr>`
    )
    .join("");
}

function actualizarControlesPaginacion() {
  const paginacionDiv = document.getElementById("paginacion");
  if (!paginacionDiv) return;

  const btnAnterior = document.getElementById("btnAnterior");
  const btnSiguiente = document.getElementById("btnSiguiente");
  const infoPagina = document.getElementById("infoPagina");

  if (btnAnterior) btnAnterior.disabled = paginaActual === 0;
  if (btnSiguiente) btnSiguiente.disabled = paginaActual >= totalPaginas - 1;
  if (infoPagina)
    infoPagina.textContent = `Página ${paginaActual + 1} de ${totalPaginas}`;
}

function irAPagina(pagina) {
  if (pagina >= 0 && pagina < totalPaginas) {
    obtenerProductos(pagina);
  }
}

function paginaAnterior() {
  if (paginaActual > 0) {
    obtenerProductos(paginaActual - 1);
  }
}

function paginaSiguiente() {
  if (paginaActual < totalPaginas - 1) {
    obtenerProductos(paginaActual + 1);
  }
}

function ordenarPor(campo) {
  sortHelper.ordenarPor(campo, () => {
    sortHelper.actualizarIconos([
      "codigo",
      "nombre",
      "marca",
      "categoria",
      "precio",
    ]);
    obtenerProductos(paginaActual);
  });
}

obtenerProductos();

function editarSuscriptor(idSuscriptor) {
  window.location.href = `editSuscriptor.html?id=${idSuscriptor}`;
}

function eliminarProducto(id) {
  if (!confirm("¿Está seguro de eliminar el producto?")) return;

  fetch(`http://localhost:8080/api/producto/${id}`, {
    method: "DELETE",
  })
    .then(async (response) => {
      if (!response.ok) {
        try {
          const errorData = await response.json();
          const mensajeError =
            errorData.error || "No se logro eliminar el producto.";
          alert(mensajeError);
        } catch (e) {
          alert("No se logro eliminar el producto.");
        }
        return;
      }
      alert("Producto eliminado exitosamente.");
      obtenerProductos();
    })
    .catch(() => {
      alert("Error de conexión al intentar eliminar el producto");
    });
}

// Cargar categorías desde el backend para el selector
async function cargarCategorias(categoriaPreseleccionar = null) {
  try {
    const response = await fetch(
      "http://localhost:8080/api/categoria/listar-nombre"
    );
    if (!response.ok) throw new Error("Error al cargar categorías");

    const data = await response.json();
    const categorias = Array.isArray(data) ? data : data.content || [];

    const selectCategoria = document.getElementById("category");
    if (!selectCategoria) return;

    // Se limpian las opciones existentes excepto la primera
    selectCategoria.innerHTML =
      '<option value="">Seleccione una categoría...</option>';

    // Se agregan las opciones de las categorías
    categorias.forEach((categoria) => {
      const option = document.createElement("option");
      option.value = categoria.id;
      option.textContent = categoria.nombre;
      selectCategoria.appendChild(option);
    });

    // Permite proporcionar una categoría para preseleccionar (Cargar categoria del producto a editar)
    if (categoriaPreseleccionar) {
      // Permite buscar la categoria por el ID o por el nombre
      const categoriaId = categoriaPreseleccionar.id || categoriaPreseleccionar;
      const categoriaNombre =
        categoriaPreseleccionar.nombre || categoriaPreseleccionar;

      // Al iniciar intenta seleccionar por ID primero
      const opcionPorId = Array.from(selectCategoria.options).find(
        (opt) => opt.value == categoriaId
      );

      if (opcionPorId) {
        selectCategoria.value = categoriaId;
      } else {
        // Si no encuentra por ID, buscar por nombre
        const opcionPorNombre = Array.from(selectCategoria.options).find(
          (opt) => opt.textContent === categoriaNombre
        );
        if (opcionPorNombre) {
          selectCategoria.value = opcionPorNombre.value;
        }
      }
    }
  } catch (error) {
    console.error("Error al cargar categorías:", error);
    alert("Error al cargar las categorías");
  }
}

async function registrarProducto(event) {
  event.preventDefault();

  const categoriaId = document.getElementById("category").value;

  const producto = {
    codigo: document.getElementById("code").value,
    nombre: document.getElementById("name").value,
    descripcion: document.getElementById("description").value,
    marca: document.getElementById("brand").value,
    precio: parseFloat(document.getElementById("price").value),
    categoria: parseInt(categoriaId),
  };

  try {
    const response = await fetch(
      "http://localhost:8080/api/producto/registrar",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(producto),
      }
    );
    if (!response.ok) {
      try {
        const errorData = await response.json();

        // Manejar errores de validación con campos específicos
        if (errorData.errores) {
          const errores = errorData.errores;
          let mensajes = [];

          if (errores.codigo) mensajes.push(`Código: ${errores.codigo}`);
          if (errores.nombre) mensajes.push(`Nombre: ${errores.nombre}`);
          if (errores.marca) mensajes.push(`Marca: ${errores.marca}`);
          if (errores.descripcion)
            mensajes.push(`Descripción: ${errores.descripcion}`);
          if (errores.precio) mensajes.push(`Precio: ${errores.precio}`);

          if (mensajes.length > 0) {
            alert(`${mensajes.join("\n")}`);
          } else {
            alert(errorData.error || "No se logró crear el producto");
          }
        } else {
          alert(errorData.error || "No se logró crear el producto");
        }
      } catch (e) {
        alert("No se logró crear el producto");
      }
      return;
    }
    alert("Producto registrado exitosamente");
    location.href = "productos.html";
  } catch (error) {
    return console.error("Error:", error);
  }
}

function editarProducto(id) {
  // Busca la categoría en el array global
  const producto = productosGlobales.find((c) => c.id == id);

  if (producto) {
    // Guarda en sessionStorage el producto para usarlo en la página de edición
    sessionStorage.setItem("productoEditar", JSON.stringify(producto));
  }

  window.location.href = `editarProducto.html?id=${id}`;
}

async function cargarDatosProducto() {
  // Se obtiene el producto del sessionStorage
  const productoStr = sessionStorage.getItem("productoEditar");

  if (productoStr) {
    const producto = JSON.parse(productoStr);

    document.getElementById("code").value = producto.codigo || "";
    document.getElementById("name").value = producto.nombre || "";
    document.getElementById("description").value = producto.descripcion || "";
    document.getElementById("brand").value = producto.marca || "";
    document.getElementById("price").value = producto.precio || "";

    // Se cargan las categorías y se preselecciona la del producto
    await cargarCategorias(producto.categoria);

    // Limpia el sessionStorage después de cargar los datos del producto
    sessionStorage.removeItem("productoEditar");
  }
}

async function actualizarProducto(event) {
  event.preventDefault();

  const id = new URLSearchParams(window.location.search).get("id");
  const categoriaId = document.getElementById("category").value;

  const producto = {
    codigo: document.getElementById("code").value,
    nombre: document.getElementById("name").value,
    descripcion: document.getElementById("description").value,
    marca: document.getElementById("brand").value,
    precio: parseFloat(document.getElementById("price").value),
    categoria: parseInt(categoriaId),
  };

  try {
    const response = await fetch(
      `http://localhost:8080/api/producto/actualizar/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(producto),
      }
    );
    if (!response.ok) {
      try {
        const errorData = await response.json();

        // Manejar errores de validación con campos específicos
        if (errorData.errores) {
          const errores = errorData.errores;
          let mensajes = [];

          if (errores.codigo) mensajes.push(`Código: ${errores.codigo}`);
          if (errores.nombre) mensajes.push(`Nombre: ${errores.nombre}`);
          if (errores.marca) mensajes.push(`Marca: ${errores.marca}`);
          if (errores.descripcion)
            mensajes.push(`Descripción: ${errores.descripcion}`);
          if (errores.precio) mensajes.push(`Precio: ${errores.precio}`);

          if (mensajes.length > 0) {
            alert(`${mensajes.join("\n")}`);
          } else {
            alert(errorData.error || "No se logró actualizar el producto");
          }
        } else {
          alert(errorData.error || "No se logró actualizar el producto");
        }
      } catch (e) {
        alert("No se logró actualizar el producto");
      }
      return;
    }
    alert("Producto actualizado exitosamente");
    location.href = "productos.html";
  } catch (error) {
    return console.error("Error:", error);
  }
}
