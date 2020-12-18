import dateutil.parser
import datetime
from common import make_response, valid_id, valid_iso_date
from astro import get_all_objects, direction_from_azimuth
from geo import lat_long_from_id

DEFAULT_PERIOD = 15  # minutes


def get_new(lat: float, long: float, time: str, period: int) -> dict:
    lat_long = (int(lat), int(long))

    results_now = get_all_objects(lat_long, time)

    time_datetime = dateutil.parser.isoparse(time)
    previous_time = time_datetime - datetime.timedelta(minutes=period)

    results_previous = get_all_objects(lat_long, previous_time.isoformat())
    previous_keys = results_previous.keys()

    new_keys = [k for k in results_now.keys() if k not in previous_keys]
    new_results = {k: results_now[k] for k in new_keys}

    return {obj: {
           **pos,
           'ordinal': direction_from_azimuth(pos['az'])}
           for (obj, pos) in new_results.items()}


def handler(event: dict, context: dict) -> dict:
    path_params = event['pathParameters']
    query_params = event.get('queryStringParameters', {})

    location_id = path_params['locationID']
    time = query_params.get('t')
    period = query_params.get('period', DEFAULT_PERIOD)

    if time and not valid_iso_date(time):
        return make_response(400, time + ' is not a valid ISO formatted date.')

    if not valid_id(location_id):
        return make_response(400, location_id + ' is not a valid location ID.')

    if not str(period).isnumeric():
        return make_response(400, 'The period parameter must be a number')

    lat_long = lat_long_from_id(location_id)

    if lat_long is None:
        return make_response(400, 'The specified zone is out of bounds')

    (lat, long) = lat_long
    date_time = time or datetime.now(tz=None).isoformat()

    new_results = get_new(lat, long, date_time, int(period))
    status_code = 200 if bool(new_results) else 204

    return make_response(status_code, {
        'location_id': location_id,
        'latitude': lat,
        'longitude': long,
        'time': date_time,
        'visible_objects': new_results
    }, is_json=True)
