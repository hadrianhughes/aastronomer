from urllib.parse import parse_qs, urlencode
from geo import id_from_lat_long
from geopy.geocoders import Nominatim

possible_paths = {'/visible'}


def is_valid_uri(uri: str) -> bool:
    return uri.replace('/api', '', 1) in possible_paths


def handler(event: dict, context: dict) -> dict:
    request = event['Records'][0]['cf']['request']
    uri = request['uri']
    querystring = request['querystring']

    if not is_valid_uri(uri):
        return {'statusCode': 404}

    query_params = {k: v[0] for k, v in parse_qs(querystring).items()}

    if 'lat' in query_params and 'long' in query_params:
        lat_long_id = id_from_lat_long(
            float(query_params['lat']),
            float(query_params['long'])
        )

        request['uri'] = request['uri'] + '/' + lat_long_id

        del query_params['lat']
        del query_params['long']
    elif 'postcode' in query_params:
        postcode = query_params['postcode']

        geolocator = Nominatim(user_agent='PlanetsAPI')
        location = geolocator.geocode(postcode)

        if location is None:
            return {
                'statusCode': 404,
                'message': 'The postcode ' + postcode + ' could not be found.'
            }

        lat_long_id = id_from_lat_long(location.latitude, location.longitude)
        request['uri'] = request['uri'] + '/' + lat_long_id

        del query_params['postcode']
    else:
        return {
            'statusCode': 400,
            'message': 'You must provide a lat and lon or a postcode.'
        }

    request['querystring'] = urlencode(query_params)
    return request
