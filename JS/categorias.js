const tblCategorias = document.getElementById("tablaCategorias");
let categoriasGlobales = [];
let paginaActual = 0;
let totalPaginas = 0;
const sortHelper = new SortHelper("codigo");

function obtenerCategorias(pagina = 0) {
  let url = `http://localhost:8080/api/categoria/listar?page=${pagina}&size=20&${sortHelper.getParams()}`;

  // Se obtienen los valores de los filtros
  const codigo = document.getElementById("filtroCodigo")?.value.trim();
  const nombre = document.getElementById("filtroNombre")?.value.trim();
  const activo = document.getElementById("filtroActivo")?.value;

  // Se agregan los filtros a la URL si tienen valor
  if (codigo) {
    url += `&codigo=${encodeURIComponent(codigo)}`;
  }
  if (nombre) {
    url += `&nombre=${encodeURIComponent(nombre)}`;
  }
  if (activo !== "") {
    url += `&activo=${activo}`;
  }

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      // La API devuelve una respuesta paginada (objeto con 'content')
      const lista = Array.isArray(data) ? data : data.content || [];
      categoriasGlobales = lista;

      // Guardar información de paginación
      if (!Array.isArray(data)) {
        paginaActual = data.number || 0;
        totalPaginas = data.totalPages || 1;
      }

      renderizarCategorias(categoriasGlobales);
      actualizarControlesPaginacion();
    })
    .catch((error) => console.error("Error:", error));
}

function renderizarCategorias(categorias) {
  if (!tblCategorias) return;

  tblCategorias.innerHTML = categorias
    .map(
      (categoria) =>
        `<tr>
          <td>${categoria.codigo || ""}</td>
          <td>${categoria.nombre || ""}</td>
          <td>${categoria.descripcion || ""}</td>
          <td>${categoria.activo ? "Sí" : "No"}</td>
          <td style="text-align: center;">
            <button class="edit-button" onclick="editarCategoria('${
              categoria.id
            }')" title="Editar"><i class="bi bi-pencil-square"></i></button>
            <button class="delete-button" onclick="eliminarCategoria('${
              categoria.id
            }')" title="Eliminar"><i class="bi bi-trash-fill"></i></button>
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
    obtenerCategorias(pagina);
  }
}

function paginaAnterior() {
  if (paginaActual > 0) {
    obtenerCategorias(paginaActual - 1);
  }
}

function paginaSiguiente() {
  if (paginaActual < totalPaginas - 1) {
    obtenerCategorias(paginaActual + 1);
  }
}

function ordenarPor(campo) {
  sortHelper.ordenarPor(campo, () => {
    sortHelper.actualizarIconos(["codigo", "nombre", "activo"]);
    obtenerCategorias(paginaActual);
  });
}

// Función para limpiar filtros
function limpiarFiltros() {
  document.getElementById("filtroCodigo").value = "";
  document.getElementById("filtroNombre").value = "";
  document.getElementById("filtroActivo").value = "";
  obtenerCategorias(0);
}

obtenerCategorias();

async function registrarCategoria(event) {
  event.preventDefault();
  const categoria = {
    codigo: document.getElementById("code").value,
    nombre: document.getElementById("name").value,
    descripcion: document.getElementById("description").value,
    activo: document.getElementById("active").value === "1",
  };

  try {
    const response = await fetch(
      "http://localhost:8080/api/categoria/registrar",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoria),
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
          if (errores.descripcion)
            mensajes.push(`Descripción: ${errores.descripcion}`);

          if (mensajes.length > 0) {
            alert(`${mensajes.join("\n")}`);
          } else {
            alert(errorData.error || "No se logró crear la categoría");
          }
        } else {
          alert(errorData.error || "No se logró crear la categoría");
        }
      } catch (e) {
        alert("No se logró crear la categoría");
      }
      return;
    }
    alert("Categoria registrada exitosamente");
    location.href = "categorias.html";
  } catch (error) {
    return console.error("Error:", error);
  }
}

function editarCategoria(id) {
  // Busca la categoría en el array global
  const categoria = categoriasGlobales.find((c) => c.id == id);

  if (categoria) {
    // Guarda en sessionStorage la categoria para usarla en la página de edición
    sessionStorage.setItem("categoriaEditar", JSON.stringify(categoria));
  }

  window.location.href = `editarCategoria.html?id=${id}`;
}

function eliminarCategoria(id) {
  if (!confirm("¿Está seguro de eliminar la categoría?")) return;

  fetch(`http://localhost:8080/api/categoria/${id}`, {
    method: "DELETE",
  })
    .then(async (response) => {
      if (!response.ok) {
        try {
          const errorData = await response.json();
          const mensajeError =
            errorData.error || "Error al eliminar la categoría";
          alert(mensajeError);
        } catch (e) {
          alert("Error al eliminar la categoría");
        }
        return;
      }
      alert("Categoría eliminada");
      obtenerCategorias();
    })
    .catch(() => {
      alert("Error de conexión al intentar eliminar la categoría");
    });
}

function actualizarCategoria(event) {
  event.preventDefault();
  const id = new URLSearchParams(window.location.search).get("id");

  const categoria = {
    codigo: document.getElementById("code").value,
    nombre: document.getElementById("name").value,
    descripcion: document.getElementById("description").value,
    activo: document.getElementById("active").value === "1",
  };

  fetch(`http://localhost:8080/api/categoria/actualizar/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(categoria),
  })
    .then(async (response) => {
      if (!response.ok) {
        try {
          const errorData = await response.json();

          // Manejo de errores de validación con campos específicos
          if (errorData.errores) {
            const errores = errorData.errores;
            let mensajes = [];

            if (errores.codigo) mensajes.push(`Código: ${errores.codigo}`);
            if (errores.nombre) mensajes.push(`Nombre: ${errores.nombre}`);
            if (errores.descripcion)
              mensajes.push(`Descripción: ${errores.descripcion}`);

            if (mensajes.length > 0) {
              alert(`${mensajes.join("\n")}`);
            } else {
              alert(errorData.error || "No se logró crear la categoría");
            }
          } else {
            alert(errorData.error || "No se logró crear la categoría");
          }
        } catch (e) {
          alert("No se logró crear la categoría");
        }
        return;
      }
      alert("Categoria actualizada exitosamente");
      location.href = "categorias.html";
    })
    .catch((error) => console.error("Error:", error));
}

function cargarDatosCategoria() {
  // Obtener la categoría del sessionStorage
  const categoriaStr = sessionStorage.getItem("categoriaEditar");

  if (categoriaStr) {
    const categoria = JSON.parse(categoriaStr);

    document.getElementById("code").value = categoria.codigo || "";
    document.getElementById("name").value = categoria.nombre || "";
    document.getElementById("description").value = categoria.descripcion || "";
    document.getElementById("active").value = categoria.activo ? "1" : "0";

    // Limpiar sessionStorage después de cargar los datos de la categoría
    sessionStorage.removeItem("categoriaEditar");
  }
}

function filtrarCategorias() {
  const input = document.getElementById("filtroGeneral");
  if (!input) return;

  const filtroGeneral = input.value.toLowerCase();
  const filtradas = categoriasGlobales.filter((categoria) => {
    const codigo = (categoria.codigo || "").toString().toLowerCase();
    const nombre = (categoria.nombre || "").toString().toLowerCase();
    const descripcion = (categoria.descripcion || "").toString().toLowerCase();
    const activo = (categoria.activo ? "si" : "no").toLowerCase();
    return (
      codigo.includes(filtroGeneral) ||
      nombre.includes(filtroGeneral) ||
      descripcion.includes(filtroGeneral) ||
      activo.includes(filtroGeneral)
    );
  });

  renderizarCategorias(filtradas);
}
