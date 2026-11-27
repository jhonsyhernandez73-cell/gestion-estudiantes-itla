const studentForm = document.getElementById("studentForm");
const studentTable = document.getElementById("studentTable");
const searchInput = document.getElementById("searchInput");
const submitButton = document.getElementById("submitButton");

let students = JSON.parse(localStorage.getItem("students")) || [];

function saveStudents() {
    localStorage.setItem("students", JSON.stringify(students));
}

function renderStudents(list = students) {
    studentTable.innerHTML = "";
    document.getElementById("totalStudents").textContent = students.length;

const careers = new Set(
    students.map(student => student.carrera.trim().toLowerCase())
);

document.getElementById("totalCareers").textContent = careers.size;

    if (list.length === 0) {
        studentTable.innerHTML = `
            <tr>
                <td colspan="5">No hay estudiantes registrados.</td>
            </tr>
        `;
        return;
    }

    list.forEach(student => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHTML(student.nombre)}</td>
            <td>${escapeHTML(student.matricula)}</td>
            <td>${escapeHTML(student.correo)}</td>
            <td>${escapeHTML(student.carrera)}</td>
            <td>
                <button class="action-button" onclick="editStudent('${student.id}')">
                    Editar
                </button>
                <button class="action-button delete-button" onclick="deleteStudent('${student.id}')">
                    Eliminar
                </button>
            </td>
        `;

        studentTable.appendChild(row);
    });
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

studentForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const id = document.getElementById("studentId").value;
    const nombre = document.getElementById("nombre").value.trim();
    const matricula = document.getElementById("matricula").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const carrera = document.getElementById("carrera").value.trim();

    if (!nombre || !matricula || !correo || !carrera) {
        alert("Completa todos los campos.");
        return;
    }

    const duplicate = students.some(student =>
        student.matricula.toLowerCase() === matricula.toLowerCase() &&
        student.id !== id
    );

    if (duplicate) {
        alert("Ya existe un estudiante con esa matrícula.");
        return;
    }

    if (id) {
        students = students.map(student =>
            student.id === id
                ? { id, nombre, matricula, correo, carrera }
                : student
        );

        alert("Estudiante actualizado correctamente.");
    } else {
        const newStudent = {
            id: crypto.randomUUID(),
            nombre,
            matricula,
            correo,
            carrera
        };

        students.push(newStudent);
        alert("Estudiante registrado correctamente.");
    }

    saveStudents();
    renderStudents();
    studentForm.reset();
    document.getElementById("studentId").value = "";
    submitButton.textContent = "Guardar estudiante";
});

function editStudent(id) {
    const student = students.find(item => item.id === id);

    if (!student) return;

    document.getElementById("studentId").value = student.id;
    document.getElementById("nombre").value = student.nombre;
    document.getElementById("matricula").value = student.matricula;
    document.getElementById("correo").value = student.correo;
    document.getElementById("carrera").value = student.carrera;

    submitButton.textContent = "Actualizar estudiante";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function deleteStudent(id) {
    const confirmation = confirm("¿Estás seguro de eliminar este estudiante?");

    if (!confirmation) return;

    students = students.filter(student => student.id !== id);

    saveStudents();
    renderStudents();

    alert("Estudiante eliminado correctamente.");
}

searchInput.addEventListener("input", function() {
    const search = searchInput.value.toLowerCase().trim();

    const filteredStudents = students.filter(student =>
        student.nombre.toLowerCase().includes(search) ||
        student.matricula.toLowerCase().includes(search)
    );

    renderStudents(filteredStudents);
});

renderStudents();
const exportButton = document.getElementById("exportButton");

exportButton.addEventListener("click", function() {
    if (students.length === 0) {
        alert("No hay estudiantes para exportar.");
        return;
    }

    const headers = ["Nombre", "Matricula", "Correo", "Carrera"];

    const rows = students.map(student => [
        student.nombre,
        student.matricula,
        student.correo,
        student.carrera
    ]);

    const csvContent = [headers, ...rows]
        .map(row => row.map(value =>
            `"${String(value).replace(/"/g, '""')}"`
        ).join(","))
        .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "estudiantes.csv";
    link.click();

    URL.revokeObjectURL(url);
});