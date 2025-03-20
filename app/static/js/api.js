document.getElementById('ubiForm').addEventListener('submit', function (event) {
    event.preventDefault();  // Evita que el formulario se envíe y la página se recargue provocando que los datos se muestren rapidamente
    generarUbicacion();
});

function generarUbicacion() {
    const mu = parseFloat(document.getElementById("mu").value);
    const sigma = parseFloat(document.getElementById("sigma").value);
    const latitude = parseFloat(document.getElementById("latitude").value);
    const longitude = parseFloat(document.getElementById("longitude").value);
    const cantCoord = parseInt(document.getElementById("cantCoord").value);
    const info = {
        mu: mu,
        sigma: sigma,
        latitude: latitude,
        longitude: longitude,
        cantCoord: cantCoord
    };
    fetch('/api', {
        method: 'POST',
        headers: {
            'Content_Type': 'application/json',
        },
        body: JSON.stringify(info),
    })
        .then(response => response.json())
        .then(data => {
            let tabla = document.getElementById('tablaLista')
            let cuerpo = document.getElementById("tbodyapi");
            cuerpo.innerHTML = "";
            Object.values(data).forEach(element => {
                Object.values(element).forEach((p, index) => {
                    let fila = document.createElement("tr");
                    let col1 = document.createElement("td");
                    col1.innerText = index + 1;
                    let col2 = document.createElement("td");
                    col2.innerText = p.Lat;
                    let col3 = document.createElement("td");
                    col3.innerText = p.Lon;
                    fila.appendChild(col1);
                    fila.appendChild(col2);
                    fila.appendChild(col3);
                    cuerpo.appendChild(fila);
                    tabla.appendChild(cuerpo);
                })
            });
            //const url = "http://127.0.0.1:5000/apiUbicaciones?mu="+mu+"&sigma="+sigma+"&lat="+latitude+"&lon="+longitude;
            //document.getElementById('urlConsulta').innerText = url;
        })
        .catch((error) => {
            console.error('Error: ', error);
        });
}