def handler(event: dict, context: dict):
    request = event['Records'][0]['cf']['request']
    request['uri'] = '/visible/35-356-5-6'
    return request
