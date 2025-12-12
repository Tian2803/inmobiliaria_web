// Función para formatear números como moneda
function formatearMoneda(valor) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor);
}

// Función para obtener el resumen desde la API
async function obtenerResumen() {
  try {
    const response = await fetch("http://localhost:8080/api/producto/resumen");

    if (!response.ok) {
      throw new Error("Error al obtener el resumen");
    }

    const data = await response.json();
    renderizarResumen(data);
  } catch (error) {
    console.error("Error al cargar el resumen:", error);
    mostrarError();
  }
}

// Función para renderizar los datos en la página
function renderizarResumen(data) {
  // Estadísticas principales
  document.getElementById("resTotalProductos").textContent =
    data.totalProductos || 0;
  document.getElementById("resTotalCategorias").textContent =
    data.totalCategorias || 0;
  document.getElementById("resInventario").textContent = formatearMoneda(
    data.valorInventario || 0
  );
  document.getElementById("resPromedio").textContent = formatearMoneda(
    data.precioPromedio || 0
  );

  // Inventario por categorías
  document.getElementById("resInventarioActivo").textContent = formatearMoneda(
    data.valorInventarioCategoriasActivas || 0
  );
  document.getElementById("resInventarioInactivo").textContent =
    formatearMoneda(data.valorInventarioCategoriasInactivas || 0);

  // Producto más caro
  if (data.productoMasCaro) {
    document.getElementById("resMasCaroNombre").textContent =
      data.productoMasCaro.nombre;
    document.getElementById("resMasCaroPrecio").textContent = formatearMoneda(
      data.productoMasCaro.precio
    );
  }

  // Producto más barato
  if (data.productoMasBarato) {
    document.getElementById("resMasBaratoNombre").textContent =
      data.productoMasBarato.nombre;
    document.getElementById("resMasBaratoPrecio").textContent = formatearMoneda(
      data.productoMasBarato.precio
    );
  }

  // Productos por categoría
  renderizarProductosPorCategoria(data.productosPorCategoria || []);
}

// Función para renderizar los productos por categoría
function renderizarProductosPorCategoria(productos) {
  const contenedor = document.getElementById("resPorCategoria");

  if (!productos || productos.length === 0) {
    contenedor.innerHTML = '<p class="text-muted">No hay datos disponibles</p>';
    return;
  }

  // Calcular total para porcentajes
  const total = productos.reduce((sum, item) => sum + item.cantidad, 0);

  contenedor.innerHTML = productos
    .map((item) => {
      const porcentaje =
        total > 0 ? ((item.cantidad / total) * 100).toFixed(1) : 0;

      return `
        <div class="col-md-4">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="mb-0">${item.categoria}</h6>
                <span class="badge bg-primary">${item.cantidad}</span>
              </div>
              <div class="progress" style="height: 20px;">
                <div class="progress-bar bg-primary" role="progressbar" 
                     style="width: ${porcentaje}%;" 
                     aria-valuenow="${porcentaje}" 
                     aria-valuemin="0" 
                     aria-valuemax="100">
                  ${porcentaje}%
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

// Función para mostrar error
function mostrarError() {
  const contenedor = document.querySelector("main .container");

  const alerta = document.createElement("div");
  alerta.className = "alert alert-danger alert-dismissible fade show";
  alerta.innerHTML = `
    <i class="bi bi-exclamation-triangle-fill"></i>
    <strong>Error:</strong> No se pudo cargar el resumen del inventario.
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;

  contenedor.insertBefore(alerta, contenedor.firstChild);
}

obtenerResumen();

// Se actualizan las estadisticas cada 30 segundos
setInterval(obtenerResumen, 30000);
