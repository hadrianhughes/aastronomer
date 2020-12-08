from geo import id_from_lat_long

possible_paths = {'/visible'}

def handler(event: dict, context: dict):
    request = event['Records'][0]['cf']['request']
    uri = request['uri']

    if not uri in possible_paths:
        return { 'statusCode': 404 }

    query_string = request.get('queryStringParameters', {})

    if 'lat' in query_string and 'long' in query_string:
        lat_long_id = id_from_lat_long(query_string['lat'], query_string['long'])
        request['uri'] = request['uri'] + '/' + lat_long_id
    elif 'postcode' in query_string:
        # get lat/lon
        # convert to id
        return
    else:
        return { 'statusCode': 400, 'message': 'You must provide a lat and lon or a postcode.' }

    return request
