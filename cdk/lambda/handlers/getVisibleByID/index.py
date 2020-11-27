import re
from datetime import datetime
from common import make_response
from astro import get_all_objects, direction_from_azimuth

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
        return make_response(400, { 'message': location_id + ' is not a valid location ID' })

    [lat, long, zone_x, zone_y] = location_id.split('-')
    lat_float = float(lat)
    long_float = float(long)

    return make_response(200, {
        'locationID': location_id,
        'latitude': lat_float,
        'longitude': long_float,
        'visible': get_visible(lat_float, long_float)
    })
