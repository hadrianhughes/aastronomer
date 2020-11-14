import json
from getVisible.index import get_visible_handler

test_event = {
    'pathParameters': {
        'latitude': 50,
        'longitude': 1
    }
}

def test_get_visible():
    response = get_visible_handler(test_event, {})
    response_body = json.loads(response['body'])

    assert response['statusCode'] == 200
    assert response['headers']['Content-Type'] == 'application/json'

    for (k, v) in response_body.items():
        assert v['alt'] > 0
