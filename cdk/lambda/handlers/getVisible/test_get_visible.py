import json
from getVisible.index import handler

def make_request(lat, long):
    return {
        'pathParameters': {
            'latitude': lat,
            'longitude': long
        }
    }

def test_response():
    response = handler(make_request(50, 1), {})
    response_body = json.loads(response['body'])

    assert response['statusCode'] == 200
    assert response['headers']['Content-Type'] == 'application/json'

    for (k, v) in response_body.items():
        assert v['alt'] > 0


def test_out_of_bounds():
    low_lat = handler(make_request(-91, 1), {})
    assert low_lat['statusCode'] == 400

    low_long = handler(make_request(50, -181), {})
    assert low_long['statusCode'] == 400

    high_lat = handler(make_request(91, 1), {})
    assert high_lat['statusCode'] == 400

    high_long = handler(make_request(50, 181), {})
    assert high_long['statusCode'] == 400
