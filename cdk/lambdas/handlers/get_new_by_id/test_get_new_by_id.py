import json
from .index import handler


def make_request(location_id: str, time: str, period: int) -> dict:
    return {
        'pathParameters': {
            'locationID': location_id,
        },
        'queryStringParameters': {
            't': time,
            'period': period
        }
    }


def test_no_diff():
    request = make_request('35-356-5-6', '2020-01-01', 1)

    response = handler(request, {})

    response_body = json.loads(response['body'])

    assert response['statusCode'] == 204
    assert response_body['visible_objects'] == {}
