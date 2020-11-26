import json
from getVisibleByID.index import handler

def make_request(location_id):
    return {
        'pathParameters': {
            'locationID': location_id
        }
    }


def test_success():
    test_id = '10-20-30-40'

    response = handler(make_request(test_id), {})
    response_body = json.loads(response['body'])

    assert response['statusCode'] == 200
    assert response_body['latitude'] == 10.0
    assert response_body['longitude'] == 20.0

    for (k, v) in response_body['visible'].items():
        assert v['alt'] > 0


def test_bad_id():
    test_id = '10-20-30'

    response = handler(make_request(test_id), {})

    assert response['statusCode'] == 400
