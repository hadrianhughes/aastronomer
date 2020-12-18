from datetime import datetime
from common import make_response, valid_id, valid_iso_date
from astro import get_all_objects, direction_from_azimuth
from geo import lat_long_from_id


def get_visible(lat: float, long: float, time: str) -> dict:
    lat_long = (int(lat), int(long))

    results = get_all_objects(lat_long, time)

    visible_results = {obj: {
                       **pos,
                       'ordinal': direction_from_azimuth(pos['az'])}
                       for (obj, pos) in results.items()
                       if results[obj]['alt'] > 0}

    return visible_results


def handler(event: dict, context: dict) -> dict:
    path_params = event['pathParameters']
    query_params = event.get('queryStringParameters', {})

    location_id = path_params['locationID']
    time = query_params.get('t')

    if time and not valid_iso_date(time):
        return make_response(400, time + ' is not a valid ISO formatted date.')

    if not valid_id(location_id):
        return make_response(400, location_id + ' is not a valid location ID.')

    lat_long = lat_long_from_id(location_id)
    date_time = time or datetime.now(tz=None).isoformat()

    if lat_long is None:
        return make_response(400, 'The specified zone is out of bounds.')

    (lat, long) = lat_long

    return make_response(200, {
        'location_id': location_id,
        'latitude': lat,
        'longitude': long,
        'time': date_time,
        'visible_objects': get_visible(lat, long, date_time)
    }, is_json=True)
