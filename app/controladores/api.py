from flask import Blueprint, request, jsonify
from app.servicios.api_service import ApiService
from app.config import Config
import folium

api_bp = Blueprint('api', __name__)
b = 0
seed = 0


@api_bp.route('/checkbox', methods=['POST'])
def checkbox():
    apiser = ApiService(Config.api_base_url_combo_city, Config.api_key, Config.api_type,
                        Config.api_base_url_weather, Config.api_key_weather, Config.api_type_weather)
    info = request.get_json('info')
    citydata = apiser.buscar_combobox_ciudad(info.get('city'))
    lat = citydata['results'][0]['lat']
    lon = citydata['results'][0]['lon']
    radio = info.get('radio')
    places = apiser.scrape(info.get('category'), lat, lon, radio, info.get('cant'))
    temp = uniform(info.get('tempmin'), info.get('tempmax'))
    hum = uniform(info.get('hummin'), info.get('hummax'))
    generate_map(lat, lon, radio, places)
    data = [{'temp': temp, 'hum': hum, 'places': places}]
    return jsonify(data)

@api_bp.route('/noncheckbox', methods=['POST'])
def noncheckbox():
    apiser = ApiService(Config.api_base_url_combo_city, Config.api_key, Config.api_type,
                        Config.api_base_url_weather, Config.api_key_weather, Config.api_type_weather)
    info = request.get_json('info')
    citydata = apiser.buscar_combobox_ciudad(info.get('city'))
    lat = citydata['results'][0]['lat']
    lon = citydata['results'][0]['lon']
    radio = info.get('radio')
    places = apiser.scrape(info.get('category'), lat, lon, radio, info.get('cant'))
    cityforecast = apiser.clima(request.get_json('city'))
    temp = uniform(cityforecast['forecast']['forecastday'][0]['day']['mintemp_c'], cityforecast['forecast']['forecastday'][0]['day']['maxtemp_c'])
    hum = uniform(0, cityforecast['forecast']['forecastday'][0]['day']['avghumidity'])
    generate_map(lat, lon, radio, places)
    data = [{'temp': temp, 'hum': hum, 'places': places}]
    return jsonify(data)

@api_bp.route('/llcheckbox', methods=['POST'])
def llcheckbox():
    apiser = ApiService(Config.api_base_url_combo_city, Config.api_key, Config.api_type,
                        Config.api_base_url_weather, Config.api_key_weather, Config.api_type_weather)
    info = request.get_json('info')
    radio = info.get('radio')
    places = apiser.scrape(info.get('category'), info.get('lat'), info.get('lon'), radio, info.get('cant'))
    temp = uniform(info.get('tempmin'), info.get('tempmax'))
    hum = uniform(info.get('hummin'), info.get('hummax'))
    generate_map(info.get('lat'), info.get('lon'), radio, places)
    data = [{'temp': temp, 'hum': hum, 'places': places}]
    return jsonify(data)

@api_bp.route('/llnoncheckbox', methods=['POST'])
def llnoncheckbox():
    apiser = ApiService(Config.api_base_url_combo_city, Config.api_key, Config.api_type,
                        Config.api_base_url_weather, Config.api_key_weather, Config.api_type_weather)
    info = request.get_json('info')
    radio = info.get('radio')
    places = apiser.scrape(info.get('category'), info.get('lat'), info.get('lon'), radio, info.get('cant'))
    latlon = info.get('lat') + ", " + info.get('lon')
    cityforecast = apiser.clima(latlon)
    temp = uniform(cityforecast['forecast']['forecastday'][0]['day']['mintemp_c'], cityforecast['forecast']['forecastday'][0]['day']['maxtemp_c'])
    hum = uniform(0, cityforecast['forecast']['forecastday'][0]['day']['avghumidity'])
    generate_map(info.get('lat'), info.get('lon'), radio, places)
    data = [{'temp': temp, 'hum': hum, 'places': places}]
    return jsonify(data)

@api_bp.route('/api', methods=['POST'])
def get_message():
    info = request.get_json('info')
    i = 0
    puntos = {'Coordenadas': []}
    mapa = folium.Map(location=(info.get('latitude'), info.get('longitude')), zoom_start=17)
    folium.Marker(location=(info.get('latitude'), info.get('longitude')), icon=folium.Icon(icon="cloud", color="red"), tooltip="Usted esta aquí").add_to(mapa)
    while i < info.get('cantCoord'):
        latdelta = normal(info.get('mu'), info.get('sigma'))
        londelta = normal(info.get('mu'), info.get('sigma'))
        latitud = info.get('latitude') + latdelta
        longitud = info.get('longitude') + londelta
        puntos['Coordenadas'].append({'Lat': latitud, 'Lon': longitud})
        folium.Marker(location=(latitud, longitud), tooltip="Ubicaciones aleatorias").add_to(mapa)
        i+=1
    mapa.save("app/static/mapa.html")
    return jsonify(puntos)

#API PARA LUCIANO
@api_bp.route('/apiUbicaciones', methods=['GET'])
def mensaje():
    i = 0
    puntos = {'Coordenadas': []}
    lat = float(request.args.get('lat'))
    lon = float(request.args.get('lon'))
    while i < 4: # Puse 4 por requerimiento de Luciano
        latdelta = normal(0, 0.00024)
        londelta = normal(0, 0.00024)
        latitud = lat + latdelta
        longitud = lon + londelta
        puntos['Coordenadas'].append({'Lat': latitud, 'Lon': longitud})
        i+=1
    return jsonify(puntos)

def uniform(lim_inf, lim_sup):
    valor = lim_inf + (lim_sup - lim_inf) * generate_u()
    return valor

def normal(mu, sigma):
    i = 1
    sumu = 0
    while i <= 12:
        u = generate_u()
        sumu = sumu + u
        i += 1
    valor = sigma * (sumu - 6) + mu
    return valor

def generate_u():
    global b
    global seed
    a = 19
    c = 155
    mod = 1000
    if b == 0:
        seed = 4
        b = 1
    seed = (a * seed + c) % mod
    u = seed / 1000
    return u


def generate_map(lat, lon, radio, places):
    mapa = folium.Map(location=(lat, lon), zoom_start=17)
    folium.Circle(location=(lat,lon), radius=radio, color="crimson", fill=True, fill_color="crimson").add_to(mapa)
    folium.Marker(location=(lat, lon), icon=folium.Icon(color='red', prefix='fa', icon='male'), tooltip="Usted esta aquí").add_to(mapa)
    for place in places['Coordinates']:
        html = "<b>Nombre</b>"+"<br>"+place['name']+"<br><br>"+"<b>Dirección</b>"+"<br>"+place['address']
        iframe = folium.IFrame(html)
        popup = folium.Popup(iframe, min_width=200, max_width=200)
        folium.Marker(location=(place['lat'], place['lon']), popup=popup).add_to(mapa)
    mapa.save("app/static/mapa.html")
