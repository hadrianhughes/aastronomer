from common import valid_id
from geo import lat_long_from_id


def handler(event: dict, context: dict) -> dict:
    path_params = event['pathParameters']
    id_param = path_params['locationID']

    if not valid_id(id_param):
        return {'statusCode': 404, 'body': id_param + ' is not a valid ID'}

    if lat_long_from_id(id_param) is None:
        return {
            'statusCode': 404,
            'body': 'The ID ' + id_param + ' is out of range'
        }

    return {'statusCode': 200, 'body': id_param}
