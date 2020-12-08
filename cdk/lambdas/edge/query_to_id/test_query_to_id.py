import json
from urllib.parse import urlencode
from .index import handler

def make_request(uri: str, lat: float, long: float):
    return {
        'Records': [
            {
                'cf': {
                    'request': {
                        'uri': uri,
                        'querystring': urlencode({ 'lat': lat, 'long': long, 'foo': 'bar' })
                    }
                }
            }
        ]
    }


def test_bad_uri():
    response = handler(make_request('/nothing', 0, 0), {})
    assert response['statusCode'] == 404


def test_edinburgh():
    decorated_request = handler(make_request('/visible', 55.9, -3.2), {})
    assert decorated_request['uri'] == '/visible/35-356-5-6'
