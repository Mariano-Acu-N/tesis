let dataGlobal;

document.getElementById('miForm').addEventListener('submit', function (event) {
    event.preventDefault();  // Evita que el formulario se envíe y la página se recargue provocando que los datos se muestren rapidamente
    comprobar();
});


function comprobar() {
    const category = document.getElementById("categories").value;
    const radio = document.getElementById("radio").value;
    const cant = parseInt(document.getElementById("cantPoints").value);
    if (document.getElementById("capitals").value != "") {
        const city = document.getElementById("capitals").value;
        if (document.getElementById("check").checked) {
            checkbox(city, category, radio, cant);
        } else {
            noncheckbox(city, category, radio, cant);
        }
    } else if (document.getElementById('latitude').value != "" && document.getElementById('longitude') != "") {
        const lat = document.getElementById('latitude').value;
        const lon = document.getElementById('longitude').value;
        if (document.getElementById("check").checked) {
            llcheckbox(lat, lon, category, radio, cant);
        } else {
            llnoncheckbox(lat, lon, category, radio, cant)
        }
    } else if (document.getElementById("postalCode").value != "") {
        const cp = document.getElementById("postalCode").value;
        if (document.getElementById("check").checked) {
            checkbox(cp, category, radio, cant);
        } else {
            noncheckbox(cp, category, radio, cant);
        }
    }
    else {
        alert("No ingreso ubicación");
    }
}

function checkbox(city, category, radio, cant) {
    const tempmin = parseFloat(document.getElementById("tempMin").value);
    const tempmax = parseFloat(document.getElementById("tempMax").value);
    const hummin = parseFloat(document.getElementById("humMin").value);
    const hummax = parseFloat(document.getElementById("humMax").value);
    const info = {
        city: city,
        tempmin: tempmin,
        tempmax: tempmax,
        hummin: hummin,
        hummax: hummax,
        category: category,
        radio: radio,
        cant: cant
    };
    fetch('/checkbox', {
        method: 'POST',
        headers: {
            'Content_Type': 'application/json',
        },
        body: JSON.stringify(info),
    })
        .then(response => response.json())
        .then(data => {
            dataGlobal = data;
            agregarInfoTabla(data);
        })
        .catch((error) => {
            console.error('Error: ', error);
        });
}

function noncheckbox(city, category, radio, cant) {
    const info = {
        city: city,
        category: category,
        radio: radio,
        cant: cant
    };
    fetch('/noncheckbox', {
        method: 'POST',
        headers: {
            'Content_Type': 'application/json',
        },
        body: JSON.stringify(info),
    })
        .then(response => response.json())
        .then(data => {
            dataGlobal = data;
            agregarInfoTabla(data);
        })
        .catch((error) => {
            console.error('Error: ', error);
        });
}

function llcheckbox(lat, lon, category, radio, cant) {
    const tempmin = parseFloat(document.getElementById("tempMin").value);
    const tempmax = parseFloat(document.getElementById("tempMax").value);
    const hummin = parseFloat(document.getElementById("humMin").value);
    const hummax = parseFloat(document.getElementById("humMax").value);
    const info = {
        lat: lat,
        lon: lon,
        tempmin: tempmin,
        tempmax: tempmax,
        hummin: hummin,
        hummax: hummax,
        category: category,
        radio: radio,
        cant: cant
    };
    fetch('/llcheckbox', {
        method: 'POST',
        headers: {
            'Content_Type': 'application/json',
        },
        body: JSON.stringify(info),
    })
        .then(response => response.json())
        .then(data => {
            dataGlobal = data;
            agregarInfoTabla(data);
        })
        .catch((error) => {
            console.error('Error: ', error);
        });
}

function llnoncheckbox(lat, lon, category, radio, cant) {
    const info = {
        lat: lat,
        lon: lon,
        category: category,
        radio: radio,
        cant: cant
    };
    fetch('/llnoncheckbox', {
        method: 'POST',
        headers: {
            'Content_Type': 'application/json',
        },
        body: JSON.stringify(info),
    })
        .then(response => response.json())
        .then(data => {
            dataGlobal = data;
            agregarInfoTabla(data);
        })
        .catch((error) => {
            console.error('Error: ', error);
        });
}

function agregarInfoTabla(data) {
    const iframe = document.getElementById('mapaIframe');
    iframe.src = '/static/mapa.html';
    let tablaPron = document.getElementById('tablaPronostico');
    let cuerpoPron = document.getElementById("tbodyPron");
    cuerpoPron.innerHTML = "";
    let filaPron = document.createElement("tr");
    let col1Pron = document.createElement("td");
    col1Pron.innerText = parseInt(data[0].temp) + 'ºC';
    let col2Pron = document.createElement("td");
    col2Pron.innerText = parseInt(data[0].hum) + ' %';
    filaPron.appendChild(col1Pron);
    filaPron.appendChild(col2Pron);
    cuerpoPron.appendChild(filaPron);
    tablaPron.appendChild(cuerpoPron);
    let tablaUbi = document.getElementById('tablaUbicaciones');
    let cuerpo = document.getElementById("tbodyUbi");
    cuerpo.innerHTML = "";
    Object.values(data).forEach(element => {
        Object.values(element.places).forEach(coord => {
            coord.forEach(x => {
                let fila = document.createElement("tr");
                let col1 = document.createElement("td");
                col1.innerText = x.name;
                let col2 = document.createElement("td");
                col2.innerText = x.lat;
                let col3 = document.createElement("td");
                col3.innerText = x.lon;
                fila.appendChild(col1);
                fila.appendChild(col2);
                fila.appendChild(col3);
                cuerpo.appendChild(fila);
                tablaUbi.appendChild(cuerpo);
            })
        })
    })
    document.getElementById('savebtn').disabled = false;
}

document.getElementById('savebtn').addEventListener('click', async () => {
    const options = {
        types: [{
            description: 'Archivo de JSON',
            accept: {'application/json': ['.json']}
        }],
    };

    try {
        const fileHandle = await window.showSaveFilePicker(options);
        const writableStream = await fileHandle.createWritable();
        const jsonData = JSON.stringify(dataGlobal, null, 2);
        await writableStream.write(jsonData);
        await writableStream.close();
        alert('Archivo guardado con exito');
    } catch (error) {
        console.error('Error al guardar el archivo: ', error);
    }
})