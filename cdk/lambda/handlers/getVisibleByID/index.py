import re
from common import make_response

def handler(event: dict, context: dict):
    params = event['pathParameters']

    location_id = params['locationID']

    id_rgx = re.compile('^\d+-\d+-\d+-\d+$')
    if not id_rgx.match(location_id):
        return make_response(400, { 'message': location_id + ' is not a valid location ID' })

    return make_response(200)
