    const url = "https://raw.githubusercontent.com/CesarMCuellarCha/apis/refs/heads/main/SENA-CTPI.matriculados.json";
    window.datos = [];

    const loginContainer = document.getElementById('login-container');
    const mainContainer = document.getElementById('main-container');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const userDisplay = document.getElementById('user-display');
    const logoutBtn = document.getElementById('logout-btn');

    document.addEventListener('DOMContentLoaded', () => {
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
        userDisplay.textContent = savedUsername;
        loginContainer.classList.add('hidden');
        mainContainer.classList.remove('hidden');
        cargarFichas();
    } else {
        loginContainer.classList.remove('hidden');
        mainContainer.classList.add('hidden');
    }
    });

    loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (password === 'adso3064975') {
        localStorage.setItem('username', username);
        userDisplay.textContent = username;
        loginContainer.classList.add('hidden');
        mainContainer.classList.remove('hidden');
        cargarFichas();
    } else {
        loginError.textContent = 'Contraseña incorrecta. La válida es: adso3064975';
    }
    });

    logoutBtn.addEventListener('click', () => {
    localStorage.clear();
    loginContainer.classList.remove('hidden');
    mainContainer.classList.add('hidden');
    loginForm.reset();
    loginError.textContent = '';
    });

    async function cargarFichas() {
    const input = document.getElementById("selectFicha");
    const lista = document.getElementById("listaFichas");
    if (input) {
        input.value = "";
        input.placeholder = "Cargando fichas…";
        input.disabled = true;
    }
    try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const raw = await response.json();

        const datos = Array.isArray(raw)
        ? raw.map((r) => ({
            codigoFicha: r.FICHA,
            nombrePrograma: r.PROGRAMA,
            nivelFormacion: r.NIVEL_DE_FORMACION,
            estadoFicha: r.ESTADO_FICHA,
            tipoDocumento: r.TIPO_DOCUMENTO,
            numeroDocumento: r.NUMERO_DOCUMENTO,
            nombre: r.NOMBRE,
            primerApellido: r.PRIMER_APELLIDO,
            segundoApellido: r.SEGUNDO_APELLIDO,
            estadoAprendiz: r.ESTADO_APRENDIZ,
            }))
        : [];

        window.datos = datos;

        const fichas = [...new Set(datos.map((a) => a.codigoFicha).filter(Boolean))];

        if (lista) {
        lista.innerHTML = "";
        fichas.forEach((f) => {
            const opt = document.createElement("option");
            opt.value = f;
            lista.appendChild(opt);
        });
        }

        if (input) {
        input.disabled = false;
        input.placeholder = fichas.length
            ? "Escribe o selecciona una ficha"
            : "No hay fichas disponibles";
        }
    } catch (err) {
        console.error("Error cargando fichas:", err);
        alert("No pudimos cargar las fichas. Revisa tu conexión.");
        if (input) {
        input.disabled = false;
        input.placeholder = "Error al cargar fichas";
        }
    }
    }

    function mostrarFicha() {
    const inputEl = document.getElementById("selectFicha");
    const codigo = inputEl ? inputEl.value.trim() : "";
    if (!codigo) {
        alert("Por favor selecciona o escribe una ficha.");
        return;
    }

    const aprendices = Array.isArray(window.datos)
        ? window.datos.filter((a) => String(a.codigoFicha) === String(codigo))
        : [];

    const tabla = document.getElementById("tablaAprendices");
    if (aprendices.length > 0) {
        localStorage.setItem("codigoFicha", codigo);
        localStorage.setItem("nombrePrograma", aprendices[0].nombrePrograma);
        localStorage.setItem("nivelFormacion", aprendices[0].nivelFormacion);
        localStorage.setItem("estadoFicha", aprendices[0].estadoFicha);
        document.getElementById("nombrePrograma").textContent = aprendices[0].nombrePrograma;

        tabla.innerHTML = `
        <thead class="table-dark">
            <tr>
            <th>Tipo de documento</th>
            <th>Número de documento</th>
            <th>Nombre</th>
            <th>Primer apellido</th>
            <th>Segundo apellido</th>
            <th>Estado del aprendiz</th>
            </tr>
        </thead>
        <tbody></tbody>
        `;
        const tbody = tabla.querySelector("tbody");

        aprendices.forEach((a) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${a.tipoDocumento}</td>
            <td>${a.numeroDocumento}</td>
            <td>${a.nombre}</td>
            <td>${a.primerApellido}</td>
            <td>${a.segundoApellido ?? "-"}</td>
        `;

        const estadoCell = document.createElement("td");
        estadoCell.textContent = a.estadoAprendiz;

        if (
            a.estadoAprendiz &&
            a.estadoAprendiz.toLowerCase().includes("retiro voluntario")
        ) {
            estadoCell.classList.add("estado-retiro");
        }

        row.appendChild(estadoCell);
        tbody.appendChild(row);
        });
    } else {
        tabla.innerHTML = `
        <thead class="table-dark">
            <tr>
            <th>Tipo de documento</th>
            <th>Número de documento</th>
            <th>Nombre</th>
            <th>Primer apellido</th>
            <th>Segundo apellido</th>
            <th>Estado del aprendiz</th>
            </tr>
        </thead>
        <tbody>
            <tr><td colspan="6" class="text-center">No hay aprendices para esta ficha.</td></tr>
        </tbody>
        `;
    }
    }
