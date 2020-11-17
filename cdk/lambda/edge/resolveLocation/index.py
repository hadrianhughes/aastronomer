from geopy.geocoders import Nominatim

geolocator = Nominatim(user_agent='planets-api')

def handler(event: dict, context: dict):
    request = event['Records'][0]['cf']['request']
    uri = request['uri']

    print(request)
