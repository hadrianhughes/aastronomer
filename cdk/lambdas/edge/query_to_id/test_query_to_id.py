import json
from urllib.parse import urlencode
from .index import handler

def make_request(uri: str, queries: dict) -> dict:
    return {
        'Records': [
            {
                'cf': {
                    'request': {
                        'uri': uri,
                        'querystring': urlencode({ **queries, 'foo': 'bar' })
                    }
                }
            }
        ]
    }


def test_bad_uri():
    response = handler(make_request('/nothing', { 'lat': 0, 'long': 0 }), {})
    assert response['statusCode'] == 404


def test_success():
    response = handler(make_request('/visible', { 'lat': 0, 'long': 0 }), {})
    assert response['uri'] == '/visible/90-0-0-0'
    assert response['querystring'] == 'foo=bar'


def test_edinburgh():
    decorated_request = handler(make_request('/visible', { 'lat': 55.9, 'long': -3.2 }), {})
    assert decorated_request['uri'] == '/visible/35-356-5-6'


def test_api_prefix():
    response = handler(make_request('/api/visible', { 'lat': 0, 'long': 0 }), {})
    assert response['uri'] == '/api/visible/90-0-0-0'
    assert response['querystring'] == 'foo=bar'


def test_postcode():
    response = handler(make_request('/visible', { 'postcode': 'EH1 2NG' }), {})
    assert response['uri'] == '/visible/35-356-5-6'
