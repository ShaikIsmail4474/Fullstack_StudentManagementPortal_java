document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#studentTable tbody');
    const branchFilter = document.querySelector('#branchFilter');
    const sectionFilter = document.querySelector('#sectionFilter');
    const filterButton = document.querySelector('#filterButton');
    const addStudentForm = document.querySelector('#addStudentForm');
    const searchButton = document.querySelector('#searchButton');
    const rollNoInput = document.querySelector('#rollNumber');
    const studentDetailsSection = document.querySelector('#studentDetailsSection'); // Section to show student details

    // Function to fetch and display students (with optional filtering)
    function fetchStudents(branch = '', section = '', rollNumber = '') {
        let url = 'http://localhost:8080/api/students';

        // Apply filters only if both branch and section are provided
        if (branch && section) {
            url = `http://localhost:8080/api/students/filter?branch=${branch}&section=${section}`;
        }

        // Apply roll number search if provided
        if (rollNumber) {
            url = `http://localhost:8080/api/students/rollnumber/${rollNumber}`;
        }

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                tableBody.innerHTML = ''; // Clear table before inserting new data

                if (data.length === 0) {
                    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No students found</td></tr>`;
                    return;
                }

                data.forEach(student => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${student.name}</td>
                        <td>${student.rollNumber}</td>
                        <td>${student.contactNumber}&nbsp;
                            <a href="tel:${student.contactNumber}">📞</a>&nbsp;
                            <a href="sms:${student.contactNumber}">📩</a>
                        </td>
                        <td>${student.branch}</td>
                        <td>${student.section}</td>
                        <td>${student.year}</td>
                        <td><a href="login1.html"><button class="deleteButton" data-id="${student.id}">Delete</button></a></td>
                    `;
                    tableBody.appendChild(row);
                });

                // Add delete event listeners to the delete buttons
                const deleteButtons = document.querySelectorAll('.deleteButton');
                deleteButtons.forEach(button => {
                    button.addEventListener('click', deleteStudent);
                });
            })
            .catch(error => console.error('Error fetching students:', error));
    }

    // Fetch all students when the page loads
    fetchStudents();

    // Filter students when the filter button is clicked
    filterButton.addEventListener('click', () => {
        const branch = branchFilter.value.trim();
        const section = sectionFilter.value.trim();
        fetchStudents(branch, section);
    });

    // Search for students by roll number
    searchButton.addEventListener('click', () => {
        const rollNumber = rollNoInput.value.trim();
        if (!rollNumber) {
            alert("Please enter a roll number.");
            return;
        }
        fetchStudents('', '', rollNumber); // Fetch students by roll number
    });

    // Add Student Form Submission
    addStudentForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const studentData = {
            name: document.querySelector('#name').value.trim(),
            rollNumber: document.querySelector('#rollNumber').value.trim(),
            contactNumber: document.querySelector('#contactNumber').value.trim(),
            branch: document.querySelector('#branch').value.trim(),
            section: document.querySelector('#section').value.trim(),
            year: parseInt(document.querySelector('#year').value.trim(), 10)
        };
        // Validate required fields before sending request
        if (!studentData.name || !studentData.rollNumber || !studentData.contactNumber || 
            !studentData.branch || !studentData.section || !studentData.year) {
            alert('Please fill in all fields.');
            return;
        }

        fetch('http://localhost:8080/api/students/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(() => {
            alert('Student added successfully!');
            addStudentForm.reset();
            fetchStudents(); // Refresh student list
        })
        .catch(error => console.error('Error adding student:', error));
    });

    // Function to delete student by ID
    function deleteStudent(event) {
        const studentId = event.target.getAttribute('data-id');
        fetch(`http://localhost:8080/api/students/${studentId}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
           
        })
        .catch(error => {
            console.error('Error deleting student:', error);
            alert('Failed to delete student');
        });
    }

    // Function to fetch student by roll number
    function fetchStudentByRollNumber(rollNumber) {
        fetch(`http://localhost:8080/api/students/rollnumber/${rollNumber}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Student not found for roll number ${rollNumber}`);
                }
                return response.json();
            })
            .then(student => {
                displayStudentDetails(student); // Function to display student details
            })
            .catch(error => {
                console.error('Error fetching student by roll number:', error);
                alert(error.message);
            });
    }

    // Function to display student details
    function displayStudentDetails(student) {
        studentDetailsSection.innerHTML = `
            <h2>Student Details</h2>
            <p><strong>Name:</strong> ${student.name}</p>
            <p><strong>Roll Number:</strong> ${student.rollNumber}</p>
            <p><strong>Contact:</strong> ${student.contactNumber}</p>
            <p><strong>Branch:</strong> ${student.branch}</p>
            <p><strong>Section:</strong> ${student.section}</p>
            <p><strong>Year:</strong> ${student.year}</p>
        `;
    }
});
