def handler(event: dict, context: dict) -> dict:
    request = event['Records'][0]['cf']['request']
    uri = request['uri']

    request['uri'] = uri.replace('/api', '', 1)

    return request
