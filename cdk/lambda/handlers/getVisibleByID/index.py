import re
from datetime import datetime
from common import make_response
from astro import get_all_objects, direction_from_azimuth
from geo import lat_long_from_id

def get_visible(lat: float, long: float):
    lat_long = (int(lat), int(long))
    date_string = datetime.now(tz=None).strftime('%Y-%m-%d %H:%M')

    results = get_all_objects(lat_long, date_string)

    visible_results = { obj: { **pos, 'ordinal': direction_from_azimuth(pos['az']) }
                        for (obj, pos) in results.items()
                        if results[obj]['alt'] > 0 }

    return visible_results


def handler(event: dict, context: dict):
    params = event['pathParameters']

    location_id = params['locationID']

    id_rgx = re.compile('^\d+-\d+-\d+-\d+$')
    if not id_rgx.match(location_id):
        return make_response(400, { 'message': location_id + ' is not a valid location ID.' })

    lat_long = lat_long_from_id(location_id)

    if lat_long == None:
        return make_response(400, { 'message': 'The specified zone is out of bounds.' })

    (lat, long) = lat_long

    return make_response(200, {
        'location_id': location_id,
        'latitude': lat,
        'longitude': long,
        'visible_objects': get_visible(lat, long)
    })
