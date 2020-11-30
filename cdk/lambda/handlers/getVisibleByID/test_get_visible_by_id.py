import json
from getVisibleByID.index import handler

def make_request(location_id, time = None):
    return {
        'pathParameters': {
            'locationID': location_id
        },
        'queryStringParameters': {
            **({ 't': time } if time else {})
        }
    }


def test_success():
    response = handler(make_request('0-0-0-0'), {})
    response_body = json.loads(response['body'])

    assert response['statusCode'] == 200
    assert int(response_body['latitude']) == 90
    assert int(response_body['longitude']) == 0
    assert 'time' in response_body

    for (k, v) in response_body['visible_objects'].items():
        assert v['alt'] > 0


def test_bad_id():
    response = handler(make_request('10-20-30'), {})

    assert response['statusCode'] == 400


def test_edinburgh():
    response = handler(make_request('35-356-5-6'), {})
    response_body = json.loads(response['body'])

    assert response['statusCode'] == 200
    assert round(response_body['latitude'], 1) == 55.9
    assert round(response_body['longitude'], 1) == -3.2


def test_bad_zone():
    bad_x = handler(make_request('0-0-15-0'), {})
    assert bad_x['statusCode'] == 400

    bad_y = handler(make_request('0-0-0-15'), {})
    assert bad_y['statusCode'] == 400


def test_time():
    time = '2019-01-01'
    response = handler(make_request('0-0-0-0', time), {})
    response_body = json.loads(response['body'])

    assert list(response_body['visible_objects'].keys()) == ['uranus']
    assert response_body['visible_objects']['uranus']['ordinal'] == 'W'
