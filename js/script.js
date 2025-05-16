let localMovies = []; // Variable para almacenar los datos en el frontend

async function fetchData() {
    try {
        const response = await fetch("https://carsmoviesinventoryproject-production.up.railway.app/api/v1/carsmovies?page=0&size=5&sort=carMovieYear,desc");
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const data = await response.json();

        console.log("Datos API recibidos:", data);

        if (!data || !data.Movies) {
            console.error("Error: La API no devolvió `Movies`, revisa la estructura");
            return;
        }

        localMovies = [...data.Movies]; // Guardamos los datos en la variable local
        renderTable(localMovies);
        updateDashboard(localMovies);
    } catch (error) {
        console.error("Error al obtener datos:", error);
    }
}

// Renderizar tabla con datos locales
function renderTable(items) {
    const tableBody = document.getElementById("data-table");
    tableBody.innerHTML = "";

    items.forEach((item, index) => {
        const row = `
            <tr>
                <td>${item.id || `temp-${index}`}</td>
                <td>${item.carMovieName}</td>
                <td>${item.carMovieYear}</td>
                <td>
                    <button onclick="editItem(${index})">Editar</button>
                    <button onclick="deleteItem(${index})">Eliminar</button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// Agregar nuevo registro SOLO en el Frontend
document.getElementById("crud-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("carMovieName").value;
    const year = parseInt(document.getElementById("carMovieYear").value, 10);

    if (!name || isNaN(year)) {
        alert("Por favor, ingresa un nombre y un año válidos.");
        return;
    }

    const newRecord = { carMovieName: name, carMovieYear: year };
    
    localMovies.push(newRecord);
    renderTable(localMovies);
    updateDashboard(localMovies); // Refrescar la dashboard
});

// Editar registro SOLO en el Frontend
function editItem(index) {
    const newName = prompt("Nuevo nombre:", localMovies[index].carMovieName);
    const newYear = prompt("Nuevo año:", localMovies[index].carMovieYear);

    if (newName && newYear) {
        localMovies[index].carMovieName = newName;
        localMovies[index].carMovieYear = newYear;

        renderTable(localMovies);
        updateDashboard(localMovies); // Refrescar la dashboard
    }
}

// Eliminar registro SOLO en el Frontend
function deleteItem(index) {
    localMovies.splice(index, 1);

    renderTable(localMovies);
    updateDashboard(localMovies); // Refrescar la dashboard
}

// Implementar búsqueda dinámica
document.getElementById("search").addEventListener("input", function() {
    const searchValue = this.value.toLowerCase();
    const filteredMovies = localMovies.filter(movie => 
        movie.carMovieName.toLowerCase().includes(searchValue)
    );
    renderTable(filteredMovies);
});

// Dashboard con datos locales y actualización correcta
function updateDashboard(items) {
    if (!items || items.length === 0) {
        console.error("Error: No hay datos para mostrar en la dashboard.");
        return;
    }

    const ctx = document.getElementById("dashboard-chart").getContext("2d");

    // Extraer años y cantidad de películas por año
    const movieYears = items.map(item => item.carMovieYear);
    const counts = movieYears.reduce((acc, year) => {
        acc[year] = (acc[year] || 0) + 1;
        return acc;
    }, {});

    const labels = Object.keys(counts);
    const values = Object.values(counts);

    // Destruir gráfico anterior si existe
    if (window.myChart) {
        window.myChart.destroy();
    }

    window.myChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Cantidad de Películas por Año",
                data: values,
                backgroundColor: "rgba(54, 162, 235, 0.6)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true
        }
    });
}

// Inicializar datos sin modificar la API
fetchData();