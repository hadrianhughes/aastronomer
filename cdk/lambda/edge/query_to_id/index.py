possible_paths = {'/visible'}

def handler(event: dict, context: dict):
    request = event['Records'][0]['cf']['request']
    uri = request['uri']

    if not uri in possible_paths:
        return { 'statusCode': 404 }

    query_string = request.get('queryStringParameters', {})

    return request
