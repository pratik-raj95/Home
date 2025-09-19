// Configuration for API base URL
const API_BASE_URL = 'https://home-tuition-truelearning-2hcl.onrender.com';

// Check if admin token exists, else redirect to login
if (!sessionStorage.getItem("adminToken")) {
    window.location.href = "adminlogin.html";
}

// Logout button handler
document.getElementById("logout-btn").addEventListener("click", () => {
    sessionStorage.removeItem("adminToken");
    window.location.href = "adminlogin.html";
});

// Load admin data (students, teachers, and contact messages) from backend API
async function loadAdminData() {
    const token = sessionStorage.getItem('adminToken');
    if (!token) {
        window.location.href = 'adminlogin.html';
        return;
    }

    try {
        const [students, teachers, contacts] = await Promise.all([
            fetch(`${API_BASE_URL}/api/admin/students`, {
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                }
            }).then(res => res.ok ? res.json() : Promise.reject(res)),

            fetch(`${API_BASE_URL}/api/admin/teachers`, {
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                }
            }).then(res => res.ok ? res.json() : Promise.reject(res)),

            fetch(`${API_BASE_URL}/api/admin/contact-messages`, {
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                }
            }).then(res => res.ok ? res.json() : Promise.reject(res))
        ]);

        // Populate students table
        document.getElementById('student-data').innerHTML = students.map(s => `
            <tr>
        <td data-label="Name"><span>${s.name}</span></td>
        <td data-label="Class"><span>${s.class}</span></td>
        <td data-label="Subjects"><span>${s.subjects || '-'}</span></td>
        <td data-label="Phone"><span>${s.phone || '-'}</span></td>
        <td data-label="School"><span>${s.schoolName || '-'}</span></td>
        <td data-label="Home Address"><span>${s.homeAddress || '-'}</span></td>
        <td data-label="Teacher Salary"><span>${s.teacherSalary || '-'}</span></td>
        <td data-label="Action">
            <button onclick="deleteStudent('${s._id}')">Delete</button>
        </td>
            </tr>
        `).join('');

        // Populate teachers table
        document.getElementById('teacher-data').innerHTML = teachers.map(t => `
            <tr>
                <td data-label="Name"><span>${t.name}</span></td>
                <td data-label="Email"><span>${t.email}</span></td>
                <td data-label="Subject"><span>${t.subject || '-'}</span></td>
                <td data-label="Experience"><span>${t.experience || 0} yrs</span></td>
                <td data-label="Phone"><span>${t.phone || '-'}</span></td>
                <td data-label="Address"><span>${t.address || '-'}</span></td>
                <td data-label="Qualifications"><span>${t.qualifications || '-'}</span></td>
                <td data-label="Class of Teaching"><span>${t.classOfTeaching || '-'}</span></td>
                <td data-label="Working School"><span>${t.workingSchool || '-'}</span></td>
                <td data-label="Preferred Location"><span>${t.preferredLocation || '-'}</span></td>
                <td data-label="Action">
                    <button onclick="deleteTeacher('${t._id}')">Delete</button>
                </td>
            </tr>
        `).join('');

        // Populate contact messages table
        document.getElementById('contact-data').innerHTML = contacts.map(c => `
            <tr>
                <td data-label="ID"><span>${c._id}</span></td>
                <td data-label="Name"><span>${c.name}</span></td>
                <td data-label="Email"><span>${c.email}</span></td>
                <td data-label="Message"><span>${c.message}</span></td>
                <td data-label="Date"><span>${new Date(c.createdAt).toLocaleString()}</span></td>
                <td data-label="Action">
                    <button onclick="deleteContactMessage('${c._id}')">Delete</button>
                </td>
            </tr>
        `).join('');

    } catch(err) {
        console.error(err);
        alert('Error fetching admin data. Please login again.');
        sessionStorage.removeItem('adminToken');
        window.location.href = 'adminlogin.html';
    }
}

// Delete student
async function deleteStudent(id) {
    if(!confirm("Are you sure you want to delete this student?")) return;

    const token = sessionStorage.getItem('adminToken');
    try {
        const res = await fetch(`${API_BASE_URL}/api/admin/student/delete/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        });
        const data = await res.json();
        if(res.ok){
            alert(data.message);
            loadAdminData(); // Refresh table
        } else {
            alert(data.message || 'Error deleting student');
        }
    } catch(err) {
        console.error(err);
        alert('Server error');
    }
}

// Delete teacher
async function deleteTeacher(id) {
    if(!confirm("Are you sure you want to delete this teacher?")) return;

    const token = sessionStorage.getItem('adminToken');
    try {
        const res = await fetch(`${API_BASE_URL}/api/admin/teacher/delete/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        });
        const data = await res.json();
        if(res.ok){
            alert(data.message);
            loadAdminData(); // Refresh table
        } else {
            alert(data.message || 'Error deleting teacher');
        }
    } catch(err) {
        console.error(err);
        alert('Server error');
    }
}

        
// Load data on page load
loadAdminData();

// Delete contact message
async function deleteContactMessage(id) {
    if(!confirm("Are you sure you want to delete this contact message?")) return;

    const token = sessionStorage.getItem('adminToken');
    try {
        const res = await fetch(`${API_BASE_URL}/api/admin/contact-message/delete/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        });
        const data = await res.json();
        if(res.ok){
            alert(data.message);
            loadAdminData(); // Refresh table
        } else {
            alert(data.message || 'Error deleting contact message');
        }
    } catch(err) {
        console.error(err);
        alert('Server error');
    }
}



