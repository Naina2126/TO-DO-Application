
// Backend Base URL
// Change this when you deploy
// ========================
//const API_BASE = "http://127.0.0.1:4040"; 
// Example after deployment:
const API_BASE = "https://todo-app-ijzx.onrender.com";


// Load Dashboard

function LoadDashboard() {
    if ($.cookie("userid")) {
        $.ajax({
            method: "get",
            url: "public/pages/user_dashboard.html", // fixed relative path
            success: (response) => {
                $("section").html(response);
                $("#lblUser").html($.cookie("userid"));

                // Fetch appointments from backend
                $.ajax({
                    method: "get",
                    url: `${API_BASE}/appointments/${$.cookie("userid")}`,
                    success: (appointments) => {
                        $("#appointments").empty();
                        appointments.map((appointment) => {
                            $(`<div class="alert alert-success alert-dismissible">
                                <h2>${appointment.title}</h2>
                                <p>${appointment.description}</p>
                                <div class="bi bi-calendar">
                                    ${appointment.date.slice(0, appointment.date.indexOf("T"))}
                                </div>
                                <div class="mt-3">
                                    <button data-id="${appointment.appointment_id}" class="btnEdit btn btn-warning m-2">
                                        <i class="bi bi-pen-fill"></i> Edit
                                    </button>
                                    <button data-id="${appointment.appointment_id}" class="btnDelete btn btn-danger m-2">
                                        <i class="bi bi-trash"></i> Delete
                                    </button>
                                </div>
                            </div>`).appendTo("#appointments");
                        });
                    },
                    error: (err) => {
                        console.error("Error loading appointments:", err);
                    }
                });
            }
        });
    } else {
        LoadPage("home.html");
    }
}


// Load Page

function LoadPage(page_name) {
    $.ajax({
        method: "get",
        url: `public/pages/${page_name}`, // fixed relative path
        success: (response) => {
            $("section").html(response);
        },
        error: () => {
            console.error(`Error loading page: ${page_name}`);
        }
    });
}


// Main Code

$(function () {
    LoadPage("home.html");

    // Home Page Navigation
    $(document).on("click", "#btnNewUser", () => LoadPage("new_user.html"));
    $(document).on("click", "#btnSignin", () => LoadPage("user_login.html"));
    $(document).on("click", "#btnExistingUser", () => LoadPage("user_login.html"));

    // Register New User
    $(document).on("click", "#btnRegister", () => {
        const user = {
            user_id: $("#user_id").val(),
            user_name: $("#user_name").val(),
            password: $("#password").val(),
            mobile: $("#mobile").val()
        };

        $.ajax({
            method: "post",
            url: `${API_BASE}/register-user`,
            data: user,
            success: () => {
                alert("User Registered Successfully");
                LoadPage("user_login.html");
            },
            error: (err) => {
                alert("Error registering user");
                console.error(err);
            }
        });
    });

    // Login Existing User
    $(document).on("click", "#btnLogin", () => {
        const user_id = $("#user_id").val();
        const password = $("#password").val();

        $.ajax({
            method: "get",
            url: `${API_BASE}/users/${user_id}`,
            success: (userDetails) => {
                if (userDetails) {
                    if (password === userDetails.password) {
                        $.cookie("userid", user_id);
                        LoadDashboard();
                    } else {
                        alert("Invalid Password");
                    }
                } else {
                    alert("User Not Found");
                }
            },
            error: (err) => {
                alert("Error logging in");
                console.error(err);
            }
        });
    });

    // Signout
    $(document).on("click", "#btnSignout", () => {
        $.removeCookie("userid");
        LoadPage("home.html");
    });

    // New Appointment Page
    $(document).on("click", "#btnNewAppointment", () => {
        LoadPage("add_appointment.html");
    });

    // Cancel Button (back to dashboard)
    $(document).on("click", "#btnCancel", () => {
        LoadDashboard();
    });

   
    //  Edit Appointment
    
    $(document).on("click", ".btnEdit", function () {
        const id = $(this).data("id");
        alert("Edit appointment with ID: " + id);
        // TODO: Load edit_appointment.html and pre-fill form
        // Then call PUT API: `${API_BASE}/edit-appointment/${id}`
    });

    
    //  Delete Appointment
    
    $(document).on("click", ".btnDelete", function () {
        const id = $(this).data("id");
        if (confirm("Are you sure you want to delete this appointment?")) {
            $.ajax({
                method: "delete",
                url: `${API_BASE}/delete-appointment/${id}`,
                success: (res) => {
                    alert(res.message);
                    LoadDashboard(); // Refresh after delete
                },
                error: (err) => {
                    alert("Error deleting appointment");
                    console.error(err);
                }
            });
        }
    });
});
