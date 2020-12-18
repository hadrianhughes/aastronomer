from common import valid_id, make_response
from geo import lat_long_from_id


def handler(event: dict, context: dict) -> dict:
    path_params = event['pathParameters']
    id_param = path_params['locationID']

    if not valid_id(id_param):
        return make_response(404, id_param + ' is not a valid ID')

    if lat_long_from_id(id_param) is None:
        return make_response(404, 'The ID ' + id_param + ' is out of range')

    return make_response(200, id_param)
