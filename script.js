document.addEventListener("DOMContentLoaded", function(){

    // ================= LOGIN =================
    let loginBtn = document.getElementById("loginBtn");

    if(loginBtn){
        loginBtn.addEventListener("click", function(){

            let role = document.getElementById("role").value;

            if(role === "donor"){
                window.location.href = "donor.html";
            }
            else if(role === "receiver"){
                window.location.href = "receiver.html";
            }
            else{
                alert("Please select role");
            }

        });
    }

    // If receiver page open ayithe automatically display food
    if(document.getElementById("foodList")){
        displayFood();
    }

});


// ================= LIVE LOCATION =================
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position){
            let lat = position.coords.latitude;
            let lon = position.coords.longitude;
            let link = "https://www.google.com/maps?q=" + lat + "," + lon;
            document.getElementById("location").value = link;
        });
    } else {
        alert("Geolocation not supported");
    }
}


// ================= SUBMIT FOOD =================
function submitFood(){

    let foodName = document.getElementById("foodName").value;
    let foodType = document.getElementById("foodType").value;
    let quantity = document.getElementById("quantity").value;
    let location = document.getElementById("location").value;
    let imageInput = document.getElementById("image");

    if(foodName === "" || foodType === "" || quantity === "" || location === ""){
        alert("Please fill all details");
        return;
    }

    if(!imageInput.files[0]){
        alert("Please upload image");
        return;
    }

    let reader = new FileReader();

    reader.onload = function(){

        let foodData = {
            name: foodName,
            type: foodType,
            quantity: quantity,
            location: location,
            image: reader.result
        };

        let foodList = JSON.parse(localStorage.getItem("foods")) || [];
        foodList.push(foodData);

        localStorage.setItem("foods", JSON.stringify(foodList));

        alert("Food Submitted Successfully!");

        document.getElementById("foodName").value = "";
        document.getElementById("foodType").value = "";
        document.getElementById("quantity").value = "";
        document.getElementById("location").value = "";
        document.getElementById("image").value = "";
    };

    reader.readAsDataURL(imageInput.files[0]);
}


// ================= DISPLAY FOOD =================
function displayFood(){

    let foods = JSON.parse(localStorage.getItem("foods")) || [];
    let container = document.getElementById("foodList");

    if(foods.length === 0){
        container.innerHTML = "No Food Available";
        return;
    }

    container.innerHTML = "";

    foods.forEach((food) => {
        container.innerHTML += `
        <div class="food-card">
            <img src="${food.image}" style="width:100%; height:180px; object-fit:cover; border-radius:8px;">
            <h3>${food.name}</h3>
            <p><b>Type:</b> ${food.type}</p>
            <p><b>Quantity:</b> ${food.quantity} Kg</p>
            <a href="${food.location}" target="_blank">📍 Open Location</a>
        </div>
        `;
    });
}