// URL DE TU API (Configurada con tu puerto 7065)
const API_URL = "https://localhost:7065/api";

document.addEventListener("DOMContentLoaded", () => {
    cargarLibros();
    cargarPrestamos();
});

// --- LIBROS ---
async function cargarLibros() {
    try {
        const res = await fetch(`${API_URL}/Books`);
        const libros = await res.json();
        
        const tbody = document.getElementById("booksTableBody");
        const select = document.getElementById("bookSelect");
        
        tbody.innerHTML = "";
        select.innerHTML = '<option value="">Seleccione un Libro...</option>';

        libros.forEach(libro => {
            // Tabla principal
            tbody.innerHTML += `
                <tr>
                    <td>${libro.id}</td>
                    <td>${libro.title}</td>
                    <td>${libro.author}</td>
                    <td>${libro.isbn}</td>
                    <td><b>${libro.stock}</b></td>
                    <td>
                        <button class="btn-delete" onclick="eliminarLibro(${libro.id})">Eliminar</button>
                    </td>
                </tr>
            `;
            // Llenar el select solo si hay stock
            if(libro.stock > 0) {
                select.innerHTML += `<option value="${libro.id}">${libro.title}</option>`;
            }
        });
    } catch (error) {
        console.error("Error cargando libros:", error);
        alert("Error de conexión. Asegúrate de que la API esté corriendo.");
    }
}

async function crearLibro() {
    const title = document.getElementById("bookTitle").value;
    const author = document.getElementById("bookAuthor").value;
    const isbn = document.getElementById("bookISBN").value;
    const stock = parseInt(document.getElementById("bookStock").value);

    if (!title || !author || !isbn || !stock) return alert("Llena todos los campos");

    await fetch(`${API_URL}/Books`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, author, isbn, stock })
    });

    alert("Libro creado!");
    cargarLibros(); 
    // Limpiar campos
    document.getElementById("bookTitle").value = "";
    document.getElementById("bookAuthor").value = "";
    document.getElementById("bookISBN").value = "";
    document.getElementById("bookStock").value = "";
}

async function eliminarLibro(id) {
    if(!confirm("¿Eliminar libro?")) return;
    await fetch(`${API_URL}/Books/${id}`, { method: "DELETE" });
    cargarLibros();
}

// --- PRÉSTAMOS ---
async function cargarPrestamos() {
    try {
        const res = await fetch(`${API_URL}/Loans`);
        const prestamos = await res.json();
        
        const tbody = document.getElementById("loansTableBody");
        tbody.innerHTML = "";

        prestamos.forEach(loan => {
            const fecha = new Date(loan.loanDate).toLocaleDateString();
            const btnDevolver = loan.status === "Active" 
                ? `<button class="btn-return" onclick="devolverLibro(${loan.id})">Devolver</button>` 
                : "Devuelto";

            // Si el título del libro viene vacío, mostramos el ID como respaldo
            const tituloLibro = loan.bookTitle || 'Libro #' + loan.bookId;

            tbody.innerHTML += `
                <tr>
                    <td>${loan.id}</td>
                    <td>${tituloLibro}</td>
                    <td>${loan.studentName}</td>
                    <td>${fecha}</td>
                    <td>${loan.status}</td>
                    <td>${btnDevolver}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error cargando préstamos:", error);
    }
}

async function registrarPrestamo() {
    const bookId = document.getElementById("bookSelect").value;
    const studentName = document.getElementById("studentName").value;

    if (!bookId || !studentName) return alert("Selecciona libro y escribe nombre");

    const res = await fetch(`${API_URL}/Loans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: parseInt(bookId), studentName })
    });

    const data = await res.json();

    if (res.ok) {
        alert("Préstamo exitoso! Stock descontado.");
        cargarPrestamos();
        cargarLibros(); // Actualizar stock visualmente
    } else {
        alert("Error: " + (data.message || "No se pudo prestar"));
    }
}

async function devolverLibro(id) {
    if(!confirm("¿Confirmar devolución?")) return;
    
    const res = await fetch(`${API_URL}/Loans/return/${id}`, { method: "POST" });
    
    if (res.ok) {
        alert("Libro devuelto. Stock recuperado.");
        cargarPrestamos();
        cargarLibros();
    } else {
        alert("Error al devolver.");
    }
}