from common import valid_id


def handler(event: dict, context: dict) -> dict:
    path_params = event['pathParameters']
    id_param = path_params['id']

    if valid_id(id_param):
        return {'statusCode': 200, 'body': id_param}
    else:
        return {'statusCode': 404}
