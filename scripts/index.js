'use strict';

class Pista {
    constructor(nombre, duracion) {
        if (!nombre) throw new Error("El nombre de la pista no puede estar vacío.");
        if (isNaN(duracion) || duracion < 0 || duracion > 7200) throw new Error("La duración debe ser un número entre 0 y 7200 segundos.");
        this.nombre = nombre;
        this.duracion = duracion; 
    }
}

class Disco {
    constructor(nombre, artista, id, portada) {
        if (!nombre) throw new Error("El nombre del disco no puede estar vacío.");
        if (!artista) throw new Error("El nombre del artista no puede estar vacío.");
        if (!portada) throw new Error("El link de la portada no puede estar vacío.");
        if (isNaN(id) || id < 1 || id > 999) throw new Error("El código debe ser un número entre 1 y 999.");
        this.nombre = nombre;
        this.artista = artista;
        this.id = id;
        this.portada = portada; 
        this.pistas = [];
    }

    agregarPista(pista) {
        this.pistas.push(pista);
    }

    duracionTotal() {
        return this.pistas.reduce((total, pista) => total + pista.duracion, 0);
    }

    pistaMasLarga() {
        return this.pistas.reduce((max, pista) => (pista.duracion > max.duracion ? pista : max), this.pistas[0]);
    }
}

let discos = [];

async function cargarDatosJson() {
    try {
        const response = await fetch('discos.json');
        const discosJson = await response.json();
        console.log("Discos cargados desde JSON:", discosJson);

        discosJson.forEach(discoData => {
            try {
                const nuevoDisco = new Disco(discoData.nombre, discoData.artista, discoData.id, discoData.portada);
                discoData.pistas.forEach(pista => {
                    nuevoDisco.agregarPista(new Pista(pista.nombre, pista.duracion));
                });
                if (discos.find(d => d.id === nuevoDisco.id)) {
                    throw new Error(`El código ${nuevoDisco.id} ya existe. Debe ser único.`);
                }
                discos.push(nuevoDisco);
            } catch (error) {
                console.error(`Error en la carga del disco: ${error.message}`);
            }
        });

    } catch (error) {
        console.error("Error al cargar el JSON de discos:", error);
    }
}

async function cargar() {
    const artista = prompt("Ingrese el nombre de la banda:");
    if (!artista) return alert("El nombre de la banda no puede estar vacío.");

    const nombre = prompt("Ingrese el nombre del disco:");
    if (!nombre) return alert("El nombre del disco no puede estar vacío.");

    let codigoNumerico;
    do {
        codigoNumerico = parseInt(prompt("Ingrese un código numérico único del disco (1-999):"), 10);
        if (isNaN(codigoNumerico) || codigoNumerico < 1 || codigoNumerico > 999) {
            alert("El código debe ser un número entre 1 y 999.");
            continue;
        }
        if (discos.find(d => d.id === codigoNumerico)) {
            alert("El código ingresado ya ha sido utilizado. Ingrese uno diferente.");
        } else {
            break;
        }
    } while (true);

    const portada = prompt("Ingrese el link a la imagen de la portada del disco:");
    if (!portada) return alert("El link de la portada no puede estar vacío.");

    const nuevoDisco = new Disco(nombre, artista, codigoNumerico, portada);

    let agregarMasPistas;
    do {
        const nombrePista = prompt("Ingrese el nombre de la pista:");
        if (!nombrePista) return alert("El nombre de la pista no puede estar vacío.");

        let duracionPista;
        do {
            duracionPista = parseInt(prompt("Ingrese la duración de la pista (en segundos, entre 0 y 7200):"), 10);
            if (isNaN(duracionPista) || duracionPista < 0 || duracionPista > 7200) {
                alert("La duración debe ser un número entre 0 y 7200 segundos.");
            } else {
                break;
            }
        } while (true);

        const nuevaPista = new Pista(nombrePista, duracionPista);
        nuevoDisco.agregarPista(nuevaPista);

        agregarMasPistas = confirm("¿Desea agregar otra pista?");
    } while (agregarMasPistas);

    discos.push(nuevoDisco);
    alert("Disco cargado exitosamente.");
}

function mostrar() {
    const contenedor = document.getElementById('discosContainer');
    contenedor.innerHTML = '';

    discos.forEach(disco => {
        const divDisco = document.createElement('div');
        divDisco.className = 'col-md-4 mb-4';
        divDisco.innerHTML = `
            <div class="card" style="background-color: rgba(255, 255, 255, 0.8);">
                <img src="${disco.portada}" class="card-img-top" alt="Portada de ${disco.nombre}">
                <div class="card-body">
                    <h5 class="card-title">${disco.nombre}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">${disco.artista}</h6>
                    <p><strong>Código:</strong> ${disco.id}</p>
                    <p><strong>Cantidad de pistas:</strong> ${disco.pistas.length}</p>
                    <p><strong>Duración total:</strong> ${formatearDuracion(disco.duracionTotal())}</p>
                    <p><strong>Pista más larga:</strong> ${disco.pistaMasLarga().nombre} (${formatearDuracion(disco.pistaMasLarga().duracion)})</p>
                    <p><strong>Pistas:</strong></p>
                    <ul>
                        ${disco.pistas.map(p => `
                            <li${p.duracion > 180 ? ' style="color: red;"' : ''}>
                                ${p.nombre} (${formatearDuracion(p.duracion)})
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `;
        contenedor.appendChild(divDisco);
    });

    document.getElementById('informacionDiscos').textContent = `Se han cargado ${discos.length} discos.`;
}

function formatearDuracion(duracion) {
    const minutos = Math.floor(duracion / 60);
    const segundos = duracion % 60;
    return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}

window.addEventListener('load', () => {
    cargarDatosJson();
});

document.getElementById('cargarDiscoBtn').addEventListener('click', cargar);
document.getElementById('mostrarDiscosBtn').addEventListener('click', mostrar);
