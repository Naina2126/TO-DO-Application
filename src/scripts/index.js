const API_BASE_URL = "https://todo-app-ijzx.onrender.com"; // change to your deployed backend

function LoadDashboard(){
    if($.cookie('userid')){
        $.ajax({
            method:"get",
            url:`public/pages/user_dashboard.html`, // relative path for GitHub Pages
            success: (response)=>{
                $("section").html(response);
                $("#lblUser").html($.cookie('userid'));
                $.ajax({
                    method:'get',
                    url:`${API_BASE_URL}/appointments/${$.cookie('userid')}`,
                    success:(appointments=>{
                        appointments.forEach(appointment=>{
                            $(`<div class="alert alert-success alert-dismissible">
                                    <h2>${appointment.title}</h2>
                                    <p>${appointment.description}</p>
                                    <div class="bi bi-calendar"> ${appointment.date.slice(0, appointment.date.indexOf("T"))}</div>
                                    <div class="mt-3">
                                        <button value="${appointment.appointment_id}" id="btnEdit" class="bi bi-pen-fill btn btn-warning mx-2"></button>
                                        <button value="${appointment.appointment_id}" id="btnDelete" class="bi bi-trash btn btn-danger mx-2"></button>
                                    </div>
                                </div>`).appendTo("#appointments");
                        })
                    })  
                })
            }
        })
    } else {
        LoadPage("home.html");
    }
}

function LoadPage(page_name){
    $.ajax({
        method :"get",
        url:`public/pages/${page_name}`, // relative path for GitHub Pages
        success:(response)=>{
            $("section").html(response);
        }
    })
}

$(function(){
    LoadPage("home.html");

    //New User Button Click- on home
    $(document).on("click", "#btnNewUser", ()=>{
        LoadPage("new_user.html");
    })

    //Signin Button Click - on home
    $(document).on("click", "#btnSignin",()=>{
        LoadPage("user_login.html");
    })

    $(document).on("click", "#btnExistingUser", ()=>{
        LoadPage("user_login.html");
    })


    $(document).on("click", "#btnRegister", ()=>{
        var user = {
            user_id : $("#user_id").val(),
            user_name : $("#user_name").val(),
            password : $("#password").val(),
            mobile :$("#mobile").val()
        }

        $.ajax({
            method:"post",
            url: `${API_BASE_URL}/register-user`,
            data : user,
            success:()=> alert('User Registered')
        })
        LoadPage("user_login.html"); 
    });

    $(document).on("click", "#btnLogin", ()=>{
        var user_id = $("#user_id").val();

        $.ajax({
            method: 'get',
            url:`${API_BASE_URL}/users/${user_id}`,
            success:(userDetails)=>{
                if(userDetails){
                    if($("#password").val()===userDetails.password){
                        $.cookie('userid', $("#user_id").val());
                        LoadDashboard();
                    } else {
                        alert('Invalid Password');
                    }
                } else {
                    alert('User Not Found');
                }
            }
        })
    });

    $(document).on("click", "#btnSignout", ()=>{
        $.removeCookie('userid');
        LoadPage('home.html');
    });

    $(document).on("click", "#btnNewAppointment", ()=> LoadPage('add_appointment.html'));
    $(document).on("click", "#btnCancel, #btnEditCancel", ()=> LoadDashboard());

    $(document).on("click", "#btnAdd", ()=>{
        var appointment = {
            appointment_id : $("#appointment_id").val(),
            title:$("#title").val(),
            description : $("#description").val(),
            date:$("#date").val(),
            user_id : $.cookie("userid")
        }
        $.ajax({
            method:"post",
            url:`${API_BASE_URL}/add-appointment`,
            data:appointment,
            success: ()=> {
                alert('Appointment Added');
                LoadDashboard();
            }
        })
    });

    $(document).on("click", "#btnEdit", (e)=>{
        LoadPage("edit-appointment.html");
        $.ajax({
            method :"get",
            url:`${API_BASE_URL}/appointment/${e.target.value}`,
            success:(appointment)=>{
                $("#appointment_id").val(appointment.appointment_id);
                $("#title").val(appointment.title);
                $("#description").val(appointment.description);
                $("#date").val(appointment.date.slice(0, appointment.date.indexOf("T")));
                sessionStorage.setItem("appointment_id", appointment.appointment_id);
            }
        })
    });

    $(document).on("click", "#btnSave", ()=>{
        var appointment = {
            appointment_id : $("#appointment_id").val(),
            title:$("#title").val(),
            description:$("#description").val(),
            date:$("#date").val(),
            user_id :$.cookie("userid")
        }
        $.ajax({
            method:"put",
            url:`${API_BASE_URL}/edit-appointment/${sessionStorage.getItem("appointment_id")}`,
            data : appointment,
            success:()=> {
                alert('Appointment Updated Successfully');
                LoadDashboard();
            }
        })
    });

    $(document).on("click", "#btnDelete", (e)=>{
        if(confirm('Are you sure? want to Delete?')){
            $.ajax({
                method:"delete",
                url:`${API_BASE_URL}/delete-appointment/${e.target.value}`,
                success:()=> {
                    alert('Appointment Deleted');
                    LoadDashboard();
                }
            })
        }
    });
});
