class SortHelper {
  constructor(campoInicial = "codigo") {
    this.ordenActual = campoInicial;
    this.direccionActual = "asc";
  }

  // Cambia el ordenamiento por el campo especificado
  ordenarPor(campo, callback) {
    // Si ya está ordenando por este campo, inverte la dirección
    if (this.ordenActual === campo) {
      this.direccionActual = this.direccionActual === "asc" ? "desc" : "asc";
    } else {
      // Nuevo campo, ordenar ascendente por defecto
      this.ordenActual = campo;
      this.direccionActual = "asc";
    }

    if (callback) callback();
  }

  // Obtiene los parámetros de ordenamiento para la URL
  getParams() {
    return `sort=${this.ordenActual},${this.direccionActual}`;
  }

  // Obtiene el campo actual
  getCampo() {
    return this.ordenActual;
  }

  // Obtiene la dirección actual
  getDireccion() {
    return this.direccionActual;
  }

  // Actualiza los iconos de ordenamiento en la tabla
  actualizarIconos(campos) {
    campos.forEach((campo) => {
      const iconElement = document.getElementById(`icon-${campo}`);
      if (!iconElement) return;

      if (campo === this.ordenActual) {
        // Icono según dirección
        if (this.direccionActual === "asc") {
          iconElement.innerHTML = '<i class="bi bi-arrow-up"></i>';
        } else {
          iconElement.innerHTML = '<i class="bi bi-arrow-down"></i>';
        }
      } else {
        // icono neutral
        iconElement.innerHTML = '<i class="bi bi-arrow-down-up"></i>';
      }
    });
  }
}
