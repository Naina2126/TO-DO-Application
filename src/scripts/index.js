// Set your deployed API base URL here
const API_BASE_URL = "https://todo-node-vt12.onrender.com";

function LoadDashboard(){
    if($.cookie('userid')){
        $.ajax({
            method:"get",
            url:`pages/user_dashboard.html`,
            success: (response)=>{
                $("section").html(response);
                $("#lblUser").html($.cookie('userid'));
                $.ajax({
                    method:'get',
                    url:`${API_BASE_URL}/appointments/${$.cookie('userid')}`,
                    success:(appointments=>{
                        $("#appointments").empty();
                        appointments.map(appointment=>{
                            $(`<div class="alert alert-success alert-dismissible">
                                    <h2>${appointment.title}</h2>
                                    <p>${appointment.description}</p>
                                    <div class="bi bi-calendar"> ${appointment.date.slice(0, appointment.date.indexOf("T"))}</div>
                                    <div class="mt-3">
                                        <button value=${appointment.appointment_id} class="bi bi-pen-fill btn btn-warning mx-2 btnEdit"></button>
                                        <button value=${appointment.appointment_id} class="bi bi-trash btn btn-danger mx-2 btnDelete"></button>
                                    </div>
                                </div>`).appendTo("#appointments");
                        })
                    }),
                    error:(xhr,status,err)=>{ console.error("Error fetching appointments:", status, err); }
                })
            },
            error:(xhr,status,err)=>{ console.error("Error loading dashboard HTML:", status, err); }
        })
    } else {
        LoadPage("home.html");
    }
}

function LoadPage(page_name){
    $.ajax({
        method :"get",
        url:`pages/${page_name}`,
        success:(response)=>{
            $("section").html(response);
        },
        error:(xhr,status,err)=>{ console.error("Error loading page:", status, err); }
    })
}

$(function(){
    LoadPage("home.html");

    // New User Button
    $(document).on("click", "#btnNewUser, #btnExistingUser, #btnSignin", ()=>{ LoadPage("user_login.html"); });

    // Register Button
    $(document).on("click", "#btnRegister", ()=>{
        const user = {
            user_id : $("#user_id").val(),
            user_name : $("#user_name").val(),
            password : $("#password").val(),
            mobile :$("#mobile").val()
        }
        $.ajax({
            method:"post",
            url: `${API_BASE_URL}/register-user`,
            data : user,
            success:()=>{ alert('User Registered'); LoadPage("user_login.html"); },
            error:(xhr,status,err)=>{ console.error("Error registering user:", status, err); }
        })
    })

    // Login Button
    $(document).on("click", "#btnLogin", ()=>{
        const user_id = $("#user_id").val();
        $.ajax({
            method: 'get',
            url:`${API_BASE_URL}/users/${user_id}`,
            success:(userDetails)=>{
                if(userDetails){
                    if($("#password").val() === userDetails.password){
                        $.cookie('userid', user_id);
                        LoadDashboard();
                    } else {
                        alert('Invalid Password');
                    }
                } else {
                    alert('User Not Found');
                }
            },
            error:(xhr,status,err)=>{ console.error("Error fetching user:", status, err); }
        })
    })

    // SignOut
    $(document).on("click", "#btnSignout", ()=>{
        $.removeCookie('userid');
        LoadPage('home.html');
    })

    // New Appointment
    $(document).on("click", "#btnNewAppointment", ()=>{ LoadPage('add_appointment.html'); });
    $(document).on("click", "#btnCancel", ()=>{ LoadDashboard(); });

    // Add Appointment
    $(document).on("click", "#btnAdd", ()=>{
        const appointment = {
            appointment_id : $("#appointment_id").val(),
            title: $("#title").val(),
            description : $("#description").val(),
            date: $("#date").val(),
            user_id : $.cookie("userid")
        }
        $.ajax({
            method:"post",
            url:`${API_BASE_URL}/add-appointment`,
            data: appointment,
            success:()=>{ alert('Appointment Added'); LoadDashboard(); },
            error:(xhr,status,err)=>{ console.error("Error adding appointment:", status, err); }
        })
    })

    // Edit Appointment
    $(document).on("click", ".btnEdit", (e)=>{
        LoadPage("edit-appointment.html");
        $.ajax({
            method :"get",
            url:`${API_BASE_URL}/appointment/${e.target.value}`,
            success:(appointment=>{
                $("#appointment_id").val(appointment.appointment_id);
                $("#title").val(appointment.title);
                $("#description").val(appointment.description);
                $("#date").val(appointment.date.slice(0, appointment.date.indexOf("T")));
                sessionStorage.setItem("appointment_id", appointment.appointment_id);
            }),
            error:(xhr,status,err)=>{ console.error("Error fetching appointment:", status, err); }
        })
    })

    $(document).on("click", "#btnEditCancel", ()=>{ LoadDashboard(); });

    // Save Edited Appointment
    $(document).on("click", "#btnSave", ()=>{
        const appointment = {
            appointment_id : $("#appointment_id").val(),
            title: $("#title").val(),
            description: $("#description").val(),
            date: $("#date").val(),
            user_id : $.cookie("userid")
        }
        $.ajax({
            method:"put",
            url:`${API_BASE_URL}/edit-appointment/${sessionStorage.getItem("appointment_id")}`,
            data : appointment,
            success:()=>{ alert('Appointment Updated Successfully'); LoadDashboard(); },
            error:(xhr,status,err)=>{ console.error("Error updating appointment:", status, err); }
        })
    })

    // Delete Appointment
    $(document).on("click", ".btnDelete", (e)=>{
        if(confirm('Are you sure you want to delete?')){
            $.ajax({
                method:"delete",
                url:`${API_BASE_URL}/delete-appointment/${e.target.value}`,
                success:()=>{ alert('Appointment Deleted'); LoadDashboard(); },
                error:(xhr,status,err)=>{ console.error("Error deleting appointment:", status, err); }
            })
        }
    })
})
